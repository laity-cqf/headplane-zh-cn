import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";
import { parse, stringify } from "yaml";

import { setLocale } from "~/i18n/locale.server";
import { action as syncAgent, loader as agent } from "~/routes/settings/agent";
import { authKeysAction } from "~/routes/settings/auth-keys/actions";
import { loader as keys } from "~/routes/settings/auth-keys/overview";
import { loader as settings } from "~/routes/settings/layout";
import { restrictionAction } from "~/routes/settings/restrictions/actions";
import { loader as restrictions } from "~/routes/settings/restrictions/overview";

import { createTestApp, statusOf } from "../../support/app";
import { tempFile } from "../../support/temp";

async function open(options: { noConfig?: boolean; noOidc?: boolean } = {}) {
  const configPath = await tempFile(
    "settings.yaml",
    "# Keep operator comment\n" +
      stringify({
        server_url: "https://headscale.example.com",
        custom_operator_setting: "keep original",
        ...(!options.noOidc
          ? {
              oidc: {
                issuer: "https://idp.example.com",
                client_id: "headscale",
                client_secret: "test-only-secret",
                allowed_domains: [],
                allowed_groups: [],
                allowed_users: [],
              },
            }
          : {}),
      }),
  );
  const app = await createTestApp({
    headscale: { url: "http://127.0.0.1:1", apiKey: "unused" },
    config: {
      server: { base_path: "/network/control" },
      ...(!options.noConfig ? { headscale: { config_path: configPath } } : {}),
    },
  });
  const owner = (await app.signIn("owner")).cookie;
  return {
    app,
    owner,
    configPath,
    call: (form: Record<string, string | string[]>, as = owner, locale = "zh-CN") =>
      app.call(restrictionAction, "/settings/restrictions", {
        as,
        headers: { "Accept-Language": locale },
        form,
      }),
    written: async () => parse(await readFile(configPath, "utf8")),
    async [Symbol.asyncDispose]() {
      await app.dispose();
      app.ctx.db.$client.close();
    },
  };
}

test("Chinese restriction edits preserve raw OIDC values, other YAML and empty-list semantics", async () => {
  await using fixture = await open();
  const { app, owner, call, written, configPath } = fixture;
  const entries = [
    ["domain", "allowed_domains", "example.com", "域名"],
    ["group", "allowed_groups", "team:研发", "用户组"],
    ["user", "allowed_users", "Alice@example.com", "用户"],
  ] as const;
  for (const [type, key, value, label] of entries) {
    expect(await call({ intent: "add", type, value: ` ${value} ` })).toMatchObject({
      ok: true,
      message: `${label}已添加`,
    });
    expect((await written()).oidc[key]).toEqual([value]);
    const before = await readFile(configPath, "utf8");
    expect(await call({ intent: "add", type, value })).toMatchObject({
      data: { errors: { value: `此${label}已在列表中。` } },
    });
    expect(await call({ intent: "remove", type, value: "missing" })).toMatchObject({
      data: { errors: { form: `此${label}不在列表中。` } },
    });
    expect(await readFile(configPath, "utf8")).toBe(before);
  }
  expect(await app.call(restrictions, "/settings/restrictions", { as: owner })).toMatchObject({
    access: true,
    writable: true,
    isAutoApplied: false,
    settings: { domains: ["example.com"], groups: ["team:研发"], users: ["Alice@example.com"] },
  });
  for (const [type, key, value, label] of entries) {
    expect(await call({ intent: "remove", type, value })).toMatchObject({
      ok: true,
      message: `${label}已移除`,
    });
    expect((await written()).oidc[key]).toEqual([]);
  }
  expect(await written()).toMatchObject({
    server_url: "https://headscale.example.com",
    custom_operator_setting: "keep original",
    oidc: { client_id: "headscale", client_secret: "test-only-secret" },
  });
  expect(await readFile(configPath, "utf8")).toContain("# Keep operator comment");
});

test("restriction validation keeps concurrent language choices isolated without writing invalid forms", async () => {
  await using fixture = await open();
  const { owner, call, configPath } = fixture;
  const before = await readFile(configPath, "utf8");
  const [chinese, english] = await Promise.all([
    call({ intent: "add", type: "domain", value: "https://example.com" }),
    call(
      { intent: "add", type: "domain", value: "https://example.com" },
      `${owner}; ${(await setLocale("en")).split(";")[0]}`,
    ),
  ]);
  expect(chinese).toMatchObject({ data: { errors: { value: "请输入类似 example.com 的域名。" } } });
  expect(english).toMatchObject({
    data: { errors: { value: "Enter a domain like example.com." } },
  });
  for (const [form, errors] of [
    [{ intent: "add", type: "组", value: "admins" }, { type: "请选择限制类型。" }],
    [
      { intent: "add", type: ["domain", "user"], value: "example.com" },
      { type: "请选择限制类型。" },
    ],
    [{ intent: "add", type: "user" }, { value: "请填写此字段。" }],
    [{ intent: "add", type: "group", value: " " }, { value: "请输入用户组。" }],
    [{ intent: "unknown" }, { form: "不支持此操作。" }],
  ] as const) {
    const result = await call(form as Record<string, string | string[]>);
    expect(statusOf(result)).toBe(400);
    expect(result).toMatchObject({ data: { errors } });
  }
  expect(await readFile(configPath, "utf8")).toBe(before);
});

test("Chinese settings do not grant IAM or key privileges and keep read-only guards", async () => {
  await using fixture = await open();
  const { app, call, configPath } = fixture;
  const before = await readFile(configPath, "utf8");
  for (const role of ["network_admin", "auditor", "viewer", "member"] as const) {
    const { cookie } = await app.signIn(role);
    const result = await call({ intent: "add", type: "domain", value: "blocked.test" }, cookie);
    expect(statusOf(result)).toBe(403);
    expect(result).toMatchObject({ data: { errors: { form: "没有执行此操作的权限。" } } });
  }
  const member = (await app.signIn("member")).cookie;
  expect(
    statusOf(
      await app.call(keys, "/settings/auth-keys", {
        as: member,
        headers: { "Accept-Language": "zh-CN" },
      }),
    ),
  ).toBe(403);
  const denied = await app.call(authKeysAction, "/settings/auth-keys", {
    as: member,
    headers: { "Accept-Language": "zh-CN" },
    form: { intent: "create", expiry: "90" },
  });
  expect(statusOf(denied)).toBe(403);
  expect(denied).toMatchObject({ data: { errors: { form: "没有管理认证密钥的权限。" } } });
  expect(await readFile(configPath, "utf8")).toBe(before);
  await using unavailable = await open({ noConfig: true });
  const readOnly = await unavailable.call({ intent: "add", type: "domain", value: "blocked.test" });
  expect(statusOf(readOnly)).toBe(403);
  expect(readOnly).toMatchObject({ data: { errors: { form: "Headscale 配置为只读。" } } });
});

test("auth key expiry validation rejects grouped, fractional, missing and repeated values in Chinese", async () => {
  await using fixture = await open();
  const { app, owner } = fixture;
  for (const [expiry, message] of [
    ["365,000", "请输入整数天数。"],
    ["365.000", "请输入整数天数。"],
    ["90 days", "请输入整数天数。"],
    [["90", "180"], "请输入整数天数。"],
    ["0", "有效期至少为 1 天。"],
    ["365001", "有效期最多为 365,000 天。"],
  ] as const) {
    const result = await app.call(authKeysAction, "/settings/auth-keys", {
      as: owner,
      headers: { "Accept-Language": "zh-CN" },
      form: { intent: "create", user_id: "1", expiry: expiry as string | string[] },
    });
    expect(statusOf(result)).toBe(400);
    expect(result).toMatchObject({ data: { errors: { expiry: message } } });
  }
  expect(
    await app.call(authKeysAction, "/settings/auth-keys", {
      as: owner,
      headers: { "Accept-Language": "zh-CN" },
      form: { intent: "create" },
    }),
  ).toMatchObject({ data: { errors: { expiry: "请填写此字段。" } } });
  expect(
    await app.call(authKeysAction, "/settings/auth-keys", {
      as: owner,
      headers: { "Accept-Language": "zh-CN" },
      form: { intent: "create", expiry: "90" },
    }),
  ).toMatchObject({ data: { errors: { form: "请选择用户或至少添加一个标签。" } } });
  const viewer = (await app.signIn("viewer")).cookie;
  const tagOnly = await app.call(authKeysAction, "/settings/auth-keys", {
    as: viewer,
    headers: { "Accept-Language": "zh-CN" },
    form: { intent: "create", expiry: "90", tags: "tag:blocked" },
  });
  expect(statusOf(tagOnly)).toBe(403);
  expect(tagOnly).toMatchObject({ data: { errors: { form: "只能管理自己的认证密钥。" } } });
});

test("an unavailable Headscale produces a localized auth key failure instead of success", async () => {
  await using fixture = await open();
  const result = await fixture.app.call(authKeysAction, "/settings/auth-keys", {
    as: fixture.owner,
    headers: { "Accept-Language": "zh-CN" },
    form: { intent: "create", user_id: "1", expiry: "90" },
  });
  expect(statusOf(result)).toBe(400);
  expect(result).toMatchObject({
    data: { errors: { form: "无法连接到 Headscale，请确认服务正在运行后重试。" } },
  });
});

test("disabled agent reasons follow the request language while permissions and OIDC visibility stay enforced", async () => {
  await using fixture = await open({ noOidc: true });
  const { app, owner } = fixture;
  expect(await app.call(settings, "/settings", { as: owner })).toMatchObject({
    hasRestrictions: false,
    canConfigure: true,
  });
  const noOidc = await app.call(restrictions, "/settings/restrictions", {
    as: owner,
    headers: { "Accept-Language": "zh-CN" },
  });
  expect(statusOf(noOidc)).toBe(501);
  expect(noOidc).toMatchObject({ data: "此 Headscale 实例尚未配置 OIDC。" });
  const viewer = (await app.signIn("viewer")).cookie;
  expect(await app.call(settings, "/settings", { as: viewer })).toMatchObject({
    canConfigure: false,
  });
  const [chinese, english] = await Promise.all([
    app.call(agent, "/settings/agent", { as: viewer, headers: { "Accept-Language": "zh-CN" } }),
    app.call(agent, "/settings/agent", {
      as: `${viewer}; ${(await setLocale("en")).split(";")[0]}`,
      headers: { "Accept-Language": "zh-CN" },
    }),
  ]);
  expect(chinese).toEqual({ enabled: false, reason: "配置中未启用 Agent" });
  expect(english).toEqual({ enabled: false, reason: "Agent is not enabled in the configuration" });
  expect(
    await app.call(syncAgent, "/settings/agent", {
      as: viewer,
      form: {},
      headers: { "Accept-Language": "zh-CN" },
    }),
  ).toEqual({ success: false, error: "配置中未启用 Agent" });
  const member = (await app.signIn("member")).cookie;
  expect(statusOf(await app.call(agent, "/settings/agent", { as: member }))).toBe(403);
  expect(statusOf(await app.call(syncAgent, "/settings/agent", { as: member, form: {} }))).toBe(
    403,
  );
});
