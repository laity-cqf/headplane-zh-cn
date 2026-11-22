import { readFile } from "node:fs/promises";

import { RouterContextProvider } from "react-router";
import { expect, test } from "vitest";
import { parse } from "yaml";

import { createControlAction } from "~/routes/settings/control-actions";
import {
  authContext,
  headscaleConfigContext,
  headscaleContext,
  integrationContext,
  requestApiContext,
} from "~/server/context";
import { createHeadscale } from "~/server/headscale/api";
import { loadHeadscaleConfig } from "~/server/headscale/config-loader";

import { tempFile } from "../../support/temp";
import { createTestAuth } from "../../unit/auth/create-auth";
import { HS_VERSIONS } from "../setup/env";
import { startHeadscale } from "../setup/start-headscale";

test("server settings enforce roles, reject invalid or stale forms and only patch public YAML keys", async () => {
  const server = await startHeadscale(HS_VERSIONS[HS_VERSIONS.length - 1]);
  const headscale = await createHeadscale({ url: server.apiUrl });
  try {
    const source =
      "# keep this comment\noidc:\n  client_secret: preserved-secret\nnode:\n  expiry: 180d\n";
    const path = await tempFile("config.yaml", source);
    const config = await loadHeadscaleConfig(path);
    const { auth } = createTestAuth();
    const owner = await auth.findOrCreateUser("control-owner", { name: "Owner" });
    const member = await auth.findOrCreateUser("control-member", { name: "Member" });
    const cookie = (await auth.createOidcSession(owner, { name: "Owner" })).split(";")[0];
    const memberCookie = (await auth.createOidcSession(member, { name: "Member" })).split(";")[0];
    const context = new RouterContextProvider();
    context.set(authContext, auth);
    context.set(headscaleContext, headscale);
    context.set(headscaleConfigContext, config);
    context.set(integrationContext, undefined);
    context.set(requestApiContext, async (request) => ({
      principal: await auth.require(request),
      api: headscale.client(server.apiKey),
    }));
    const action = createControlAction(["save", "approve", "reject"]);
    const initial = config.getControlSettings();
    const form = {
      ...initial,
      autoUpdate: "true",
      taildrop: "false",
      intent: "save",
      baseline: JSON.stringify(initial),
    };
    const call = (values: Record<string, unknown>, as = cookie) =>
      action({
        context,
        params: {},
        request: new Request("http://headplane.test/settings/headscale", {
          method: "POST",
          headers: { Cookie: as, "Accept-Language": "zh-CN" },
          body: new URLSearchParams(
            Object.entries(values).map(([key, value]) => [key, String(value)]),
          ),
        }),
      } as never);
    expect((await call(form, memberCookie)).init?.status).toBe(403);
    expect((await call({ ...form, haInterval: "1s" })).data.success).toBe(false);
    expect((await call({ ...form, baseline: "{}" })).init?.status).toBe(409);
    expect(await readFile(path, "utf8")).toBe(source);
    const result = await call(form);
    expect(result.data).toMatchObject({
      success: true,
      message: expect.stringContaining("手动重启"),
    });
    const written = await readFile(path, "utf8");
    expect(written).toContain("# keep this comment");
    expect(parse(written)).toMatchObject({
      oidc: { client_secret: "preserved-secret" },
      node: { expiry: "180d" },
      auto_update: { enabled: true },
      taildrop: { enabled: false },
    });
    expect((await call({ intent: "approve", auth_id: "bad-id" })).data.success).toBe(false);
    expect(
      (await call({ intent: "reject", auth_id: "hskey-authreq-aaaaaaaaaaaaaaaaaaaaaaaa" })).data,
    ).toMatchObject({ success: false, error: expect.stringContaining("pending auth") });
  } finally {
    await headscale.dispose();
    await server.container.stop({ remove: true, removeVolumes: true });
  }
});
