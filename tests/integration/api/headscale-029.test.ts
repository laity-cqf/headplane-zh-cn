import { RouterContextProvider } from "react-router";
import { describe, expect, test } from "vitest";

import { aclAction } from "~/routes/acls/acl-action";
import { authContext, headscaleContext, requestApiContext } from "~/server/context";
import { createHeadscale } from "~/server/headscale/api";

import { createTestAuth } from "../../unit/auth/create-auth";
import { HS_VERSIONS } from "../setup/env";
import { startHeadscale } from "../setup/start-headscale";

describe.for(HS_VERSIONS)("Headscale %s: advanced policy validation", (version) => {
  test("checks drafts and test failures without changing the live policy, with version and role guards", async () => {
    const server = await startHeadscale(version);
    const headscale = await createHeadscale({ url: server.apiUrl });
    try {
      const api = headscale.client(server.apiKey);
      const original = '{"acls":[]}';
      await api.policy.set(original);
      const { auth } = createTestAuth();
      const owner = await auth.findOrCreateUser("advanced-owner", { name: "Owner" });
      const member = await auth.findOrCreateUser("advanced-member", { name: "Member" });
      const cookie = (await auth.createOidcSession(owner, { name: "Owner" })).split(";")[0];
      const memberCookie = (await auth.createOidcSession(member, { name: "Member" })).split(";")[0];
      const context = new RouterContextProvider();
      context.set(authContext, auth);
      context.set(headscaleContext, headscale);
      context.set(requestApiContext, async (request) => ({
        principal: await auth.require(request),
        api,
      }));
      const check = (policy: string, as = cookie) =>
        aclAction({
          context,
          params: {},
          request: new Request("http://headplane.test/acls", {
            method: "PATCH",
            headers: { Cookie: as, "Accept-Language": "zh-CN" },
            body: new URLSearchParams({ action_id: "check", policy }),
          }),
        } as never);
      await expect(check("{}", memberCookie)).rejects.toMatchObject({ init: { status: 403 } });
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
      const result = await check(JSON.stringify(draft));
      if (headscale.capabilities.policyCanBeChecked) {
        expect(result.data).toMatchObject({ success: true, operation: "check" });
        const failing = { ...draft, tests: [{ src: "100.64.0.1", accept: ["10.82.138.99:22"] }] };
        expect((await check(JSON.stringify(failing))).data).toMatchObject({
          success: false,
          errorDetail: expect.stringContaining("test"),
        });
        await expect(api.policy.set(JSON.stringify(failing))).rejects.toMatchObject({
          data: { statusCode: 400 },
        });
        await expect(
          api.auth.reject("hskey-authreq-aaaaaaaaaaaaaaaaaaaaaaaa"),
        ).rejects.toMatchObject({ data: { statusCode: 404 } });
      } else {
        expect(result).toMatchObject({
          init: { status: 400 },
          data: { success: false, error: expect.stringContaining("0.29") },
        });
      }
      expect((await api.policy.get()).policy).toBe(original);
    } finally {
      await headscale.dispose();
      await server.container.stop({ remove: true, removeVolumes: true });
    }
  });
});
