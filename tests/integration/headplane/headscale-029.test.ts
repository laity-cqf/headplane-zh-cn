import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { aclAction } from "~/routes/acls/acl-action";
import { action as authAction } from "~/routes/settings/auth-requests";
import { action as settingsAction, loader as settingsLoader } from "~/routes/settings/control";

import { createTailnet } from "../../harness/tailnet";
import { testedVersions } from "../../harness/versions";
import { statusOf } from "../../support/app";

describe.for(testedVersions())("Headscale %s: web management", (version) => {
  test("validates drafts and failing assertions without changing live policy and guards older servers", async () => {
    await using tailnet = await createTailnet({ version, policy: { acls: [] } });
    const app = await tailnet.headplane();
    const owner = (await app.signIn("owner")).cookie;
    const viewer = (await app.signIn("viewer")).cookie;
    const before = await tailnet.api.policy.get();
    const draft = {
      acls: [],
      grants: [{ src: ["100.64.0.1"], dst: ["10.82.138.99"], ip: ["tcp:30001"] }],
      nodeAttrs: [{ target: ["*"], attr: ["magicdns-aaaa"] }],
      randomizeClientPort: false,
      tests: [
        {
          src: "100.64.0.1",
          proto: "tcp",
          accept: ["10.82.138.99:30001"],
          deny: ["10.82.138.99:22"],
        },
      ],
    };
    const check = (policy: object, as = owner) =>
      app.call(aclAction, "/acls", {
        as,
        headers: { "Accept-Language": "zh-CN" },
        form: { intent: "check", policy: JSON.stringify(policy) },
      });
    expect(statusOf(await check(draft, viewer))).toBe(403);
    const checked = await check(draft);
    if (tailnet.headscale.capabilities.policyCanBeChecked) {
      expect(checked).toMatchObject({ ok: true, message: expect.stringContaining("尚未保存") });
      const failing = { ...draft, tests: [{ src: "100.64.0.1", accept: ["10.82.138.99:22"] }] };
      expect(statusOf(await check(failing))).toBe(400);
      expect(await check(failing)).toMatchObject({
        data: { errors: { form: expect.stringContaining("test") } },
      });
      await expect(tailnet.api.policy.set(JSON.stringify(failing))).rejects.toMatchObject({
        data: { statusCode: 400 },
      });
    } else {
      expect(statusOf(checked)).toBe(400);
      expect(checked).toMatchObject({
        data: { errors: { form: expect.stringContaining("0.29") } },
      });
    }
    expect(await tailnet.api.policy.get()).toEqual(before);
  });

  test("server setting forms preserve secrets and unrelated YAML while enforcing duration, version and role boundaries", async () => {
    await using tailnet = await createTailnet({ version });
    const app = await tailnet.headplane();
    const owner = (await app.signIn("owner")).cookie;
    const viewer = (await app.signIn("viewer")).cookie;
    const loaded = await app.call(settingsLoader, "/settings/headscale", { as: owner });
    const before = await readFile(tailnet.server.configPath, "utf8");
    expect(statusOf(loaded)).toBe(200);
    const settings = app.ctx.hs.getControlSettings();
    const values = {
      ...settings,
      autoUpdate: "true",
      taildrop: "false",
      intent: "save",
      baseline: JSON.stringify(settings),
    };
    const save = (form = values, as = owner) =>
      app.call(settingsAction, "/settings/headscale", {
        as,
        form,
        headers: { "Accept-Language": "zh-CN" },
      });
    expect(statusOf(await save(values, viewer))).toBe(403);
    expect(statusOf(await save({ ...values, haInterval: "1s" }))).toBe(400);
    expect(await readFile(tailnet.server.configPath, "utf8")).toBe(before);
    const result = await save();
    if (tailnet.headscale.capabilities.policySupportsGrants) {
      expect(result).toMatchObject({
        data: { success: true, message: expect.stringContaining("手动重启") },
      });
      const written = parse(await readFile(tailnet.server.configPath, "utf8"));
      expect(written).toMatchObject({
        auto_update: { enabled: true },
        taildrop: { enabled: false },
      });
      for (const key of ["noise", "dns", "database", "server_url"])
        expect(written[key]).toEqual(parse(before)[key]);
      expect(statusOf(await save())).toBe(409);
    } else {
      expect(statusOf(result)).toBe(400);
      expect(await readFile(tailnet.server.configPath, "utf8")).toBe(before);
    }
  });

  test("authentication decisions reject malformed IDs and expose missing requests with admin-only access", async () => {
    await using tailnet = await createTailnet({ version });
    const app = await tailnet.headplane();
    const owner = (await app.signIn("owner")).cookie;
    const viewer = (await app.signIn("viewer")).cookie;
    const decide = (intent: string, id: string, as = owner) =>
      app.call(authAction, "/settings/auth-requests", { as, form: { intent, auth_id: id } });
    const id = "hskey-authreq-aaaaaaaaaaaaaaaaaaaaaaaa";
    expect(statusOf(await decide("approve", id, viewer))).toBe(403);
    expect(statusOf(await decide("approve", "bad-id"))).toBe(400);
    expect(statusOf(await decide("reject", id))).toBe(400);
    if (tailnet.headscale.capabilities.authRequestsCanBeDecided) {
      expect(await decide("reject", id)).toMatchObject({
        data: { success: false, error: expect.stringContaining("pending auth") },
      });
      const pending = await tailnet.pendingNode({ name: "reject-pending" });
      const pendingId = pending.registerUrl.split("/register/")[1];
      expect(await decide("reject", pendingId)).toMatchObject({ data: { success: true } });
      expect((await tailnet.api.nodes.list()).some((node) => node.name === pending.name)).toBe(
        false,
      );
    }
  });

  test.skipIf(!version.startsWith("0.29."))(
    "checks SSH reauthentication and application capabilities against live nodes without applying the draft",
    async () => {
      await using tailnet = await createTailnet({
        version,
        policy: { acls: [], tagOwners: { "tag:files": ["ssh-author@"] } },
      });
      await tailnet.node({ name: "ssh-source", user: "ssh-author" });
      await tailnet.node({ name: "ssh-files", user: "ssh-author", tags: ["tag:files"], ssh: true });
      const app = await tailnet.headplane();
      const owner = (await app.signIn("owner")).cookie;
      const before = await tailnet.api.policy.get();
      const draft = {
        acls: [],
        tagOwners: { "tag:files": ["ssh-author@"] },
        grants: [
          {
            src: ["ssh-author@"],
            dst: ["tag:files"],
            app: {
              "tailscale.com/cap/drive": [{ shares: ["documents"], access: "ro" }],
              "tailscale.com/cap/relay": [],
            },
          },
        ],
        nodeAttrs: [
          { target: ["ssh-author@"], attr: ["drive:access"] },
          { target: ["tag:files"], attr: ["drive:share"] },
        ],
        ssh: [
          {
            action: "check",
            src: ["ssh-author@"],
            dst: ["tag:files"],
            users: ["root"],
            checkPeriod: "12h",
            acceptEnv: ["LANG", "LC_*"],
          },
        ],
        sshTests: [
          {
            src: "ssh-author@",
            dst: ["tag:files"],
            accept: ["root"],
            deny: ["nobody"],
            check: ["root"],
          },
        ],
      };
      const check = (policy: object) =>
        app.call(aclAction, "/acls", {
          as: owner,
          form: { intent: "check", policy: JSON.stringify(policy) },
        });
      expect(await check(draft)).toMatchObject({ ok: true });
      const failing = { ...draft, sshTests: [{ ...draft.sshTests[0], check: ["nobody"] }] };
      expect(statusOf(await check(failing))).toBe(400);
      expect(await tailnet.api.policy.get()).toEqual(before);
    },
  );
});
