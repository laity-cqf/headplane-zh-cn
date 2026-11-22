import { RouterContextProvider } from "react-router";
import { describe, expect, onTestFinished, test } from "vitest";

import { setLocale } from "~/i18n/locale.server";
import { aclAction } from "~/routes/acls/acl-action";
import { aclLoader } from "~/routes/acls/acl-loader";
import {
  authContext,
  headscaleContext,
  headscaleLiveStoreContext,
  requestApiContext,
} from "~/server/context";
import { isDataWithApiError } from "~/server/headscale/api/error-client";
import { createLiveStore, nodesResource, usersResource } from "~/server/headscale/live-store";
import { parsePolicy, serializePolicy } from "~/utils/acl-policy";

import { createTestAuth } from "../../unit/auth/create-auth";
import { getBootstrapClient, getRuntimeClient, HS_VERSIONS } from "../setup/env";

describe.for(HS_VERSIONS)(
  "Headscale %s: bilingual ACL routes",
  { concurrent: false },
  (version) => {
    test("preserves policies, permission boundaries and original syntax diagnostics in both languages", async () => {
      const api = await getRuntimeClient(version);
      const { auth } = createTestAuth();
      const owner = await auth.findOrCreateUser("acl-owner", { name: "Owner" });
      const member = await auth.findOrCreateUser("acl-member", { name: "Member" });
      const ownerCookie = (await auth.createOidcSession(owner, { name: "Owner" })).split(";")[0];
      const memberCookie = (await auth.createOidcSession(member, { name: "Member" })).split(";")[0];
      const context = new RouterContextProvider();
      const store = createLiveStore([nodesResource, usersResource]);
      onTestFinished(() => store.dispose());
      context.set(authContext, auth);
      context.set(headscaleContext, await getBootstrapClient(version));
      context.set(headscaleLiveStoreContext, store);
      context.set(requestApiContext, async (request) => ({
        principal: await auth.require(request),
        api,
      }));
      async function args(locale: "en" | "zh-CN", policy?: string, asMember = false) {
        return {
          request: new Request("http://headplane.test/acls", {
            method: policy === undefined ? "GET" : "PATCH",
            headers: {
              Cookie: `${asMember ? memberCookie : ownerCookie}; ${(await setLocale(locale)).split(";")[0]}`,
              "Accept-Language": locale === "en" ? "zh-CN" : "en",
            },
            body: policy === undefined ? undefined : new URLSearchParams({ policy }),
          }),
          context,
          params: {},
        } as never;
      }
      let original: string;
      try {
        original = (await api.policy.get()).policy;
      } catch (error) {
        // The real supported servers report an absent database policy as 500,
        // carried through the transport as 502. Do not treat arbitrary 500s as empty.
        if (
          !isDataWithApiError(error) ||
          error.data.statusCode !== 500 ||
          error.data.data?.message !== "loading ACL from database: acl policy not found"
        )
          throw error;
        original = "";
      }
      try {
        for (const locale of ["en", "zh-CN"] as const) {
          await expect(aclLoader(await args(locale, undefined, true))).rejects.toMatchObject({
            init: { status: 403 },
            data:
              locale === "en"
                ? "You do not have permission to read the ACL policy."
                : "没有读取 ACL 策略的权限。",
          });
          await expect(aclAction(await args(locale, "{}", true))).rejects.toMatchObject({
            init: { status: 403 },
            data:
              locale === "en"
                ? "You do not have permission to write to the ACL policy"
                : "没有修改 ACL 策略的权限",
          });
          await expect(aclAction(await args(locale, ""))).rejects.toMatchObject({
            init: { status: 400 },
            data:
              locale === "en"
                ? "Missing `policy` in the form data."
                : "表单数据中缺少 `policy` 字段。",
          });
          const raw =
            '{\n // preserved in the raw editor\n "hosts": {"office": "10.0.0.1/32"}, "groups": {}, "acls": [],\n "autoApprovers": {"routes": {}},\n}';
          const saved = await aclAction(await args(locale, raw));
          expect(saved.data.success).toBe(true);
          const loaded = await aclLoader(await args(locale));
          expect(loaded.access).toBe(true);
          expect(loaded.writable).toBe(true);
          expect(loaded.policy).toBe(raw);
          expect(loaded.routesLoaded).toBe(true);
          expect(loaded.canEditGrants).toBe(version.startsWith("0.29."));
          const parsed = parsePolicy(loaded.policy, locale);
          if (!parsed.ok) throw new Error(parsed.error);
          parsed.policy.hosts.branch = "10.1.0.0/16";
          const visual = serializePolicy(parsed.policy);
          expect(JSON.parse(visual).acls).toEqual([]);
          expect(visual).not.toContain("// preserved");
          await aclAction(await args(locale, visual));
          expect(JSON.parse((await api.policy.get()).policy)).toMatchObject({
            hosts: { office: "10.0.0.1/32", branch: "10.1.0.0/16" },
            autoApprovers: { routes: {} },
          });
          for (const invalid of ['{"acls": [', '{"acls": "not-a-list"}']) {
            const rejected = await aclAction(await args(locale, invalid));
            expect(rejected.init).toMatchObject({ status: 400 });
            expect(rejected.data.success).toBe(false);
            expect(rejected.data.errorDetail?.length).toBeGreaterThan(0);
            expect(rejected.data.error).toBe(
              `${locale === "en" ? "Syntax error: " : "语法错误："}${rejected.data.errorDetail}`,
            );
            expect((await api.policy.get()).policy).toBe(visual);
          }
          const grants = JSON.stringify({
            acls: [],
            grants: [{ src: ["*"], dst: ["10.82.0.0/16"], ip: ["tcp:22"] }],
          });
          const result = await aclAction(await args(locale, grants));
          if (version.startsWith("0.29.")) {
            expect(result.data.success).toBe(true);
            expect(parsePolicy((await api.policy.get()).policy)).toEqual(parsePolicy(grants));
          } else {
            expect(result.init).toMatchObject({ status: 400 });
            expect(result.data.success).toBe(false);
            expect(result.data.error).toContain("Headscale 0.29");
            expect((await api.policy.get()).policy).toBe(visual);
          }
        }
      } finally {
        await api.policy.set(original || "{}");
      }
    });
  },
);
