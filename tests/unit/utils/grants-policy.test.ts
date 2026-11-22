import { expect, test } from "vitest";

import { parsePolicy, serializePolicy } from "~/utils/acl-policy";

test.each(["acls", "grants"] as const)(
  "deleting the last %s rule keeps an explicit deny-all",
  (key) => {
    const result = parsePolicy(JSON.stringify({ [key]: [{ src: ["*"], dst: ["*"], ip: ["*"] }] }));
    if (!result.ok) throw new Error(result.error);
    result.policy[key] = [];
    expect(JSON.parse(serializePolicy(result.policy))).toEqual({ [key]: [] });
  },
);

test("editing a grant keeps router selection, application capabilities and other policy sections", () => {
  const original = {
    tagOwners: { "tag:router": ["admin@"] },
    acls: [{ action: "accept", src: ["admin@"], dst: ["10.0.0.0/16:*"] }],
    grants: [
      {
        src: ["group:team"],
        dst: ["10.0.0.1"],
        ip: ["tcp:22"],
        via: ["tag:router"],
        srcPosture: ["posture:managed"],
      },
      { src: ["admin@"], dst: ["tag:router"], app: { "example.com/cap": [{ read: true }] } },
    ],
    autoApprovers: {
      routes: { "10.0.0.0/16": ["tag:router"] },
      exitNode: ["admin@"],
      "#comment": "retain",
    },
    nodeAttrs: [{ target: ["*"], attr: ["randomize-client-port"] }],
  };
  for (const locale of ["en", "zh-CN"] as const) {
    const result = parsePolicy(JSON.stringify(original), locale);
    if (!result.ok) throw new Error(result.error);
    expect(result.policy.grants[0].via).toEqual(["tag:router"]);
    result.policy.grants[0].ip = ["tcp:443"];
    expect(JSON.parse(serializePolicy(result.policy))).toEqual({
      ...original,
      grants: [{ ...original.grants[0], ip: ["tcp:443"] }, original.grants[1]],
    });
  }
});
