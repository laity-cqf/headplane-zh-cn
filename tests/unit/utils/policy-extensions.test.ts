import { describe, expect, test } from "vitest";

import { parsePolicy, serializePolicy } from "~/utils/acl-policy";
import {
  parseAppCapabilities,
  readPolicyRows,
  setPolicyRows,
  withAppCapabilities,
} from "~/utils/policy-extensions";

describe("advanced policy editing", () => {
  test("editing node attributes retains mixed rules, explicit false, tests and unknown fields", () => {
    const raw = {
      acls: [],
      grants: [
        {
          src: ["*"],
          dst: ["tag:files"],
          app: { "tailscale.com/cap/drive": [{ shares: ["docs"], access: "ro" }] },
        },
      ],
      randomizeClientPort: false,
      nodeAttrs: [{ target: ["tag:files"], attr: ["drive:share"], future: { enabled: true } }],
      tests: [{ src: "100.64.0.1", accept: ["10.82.138.99:30001"] }],
      sshTests: [{ src: "alice@", dst: ["tag:files"], check: ["root"] }],
    };
    const parsed = parsePolicy(JSON.stringify(raw));
    if (!parsed.ok) throw new Error(parsed.error);
    const rows = readPolicyRows(parsed.policy, "nodeAttrs")!;
    const edited = setPolicyRows(parsed.policy, "nodeAttrs", [
      { ...rows[0], attr: ["drive:share", "magicdns-aaaa"] },
    ]);
    expect(JSON.parse(serializePolicy(edited))).toEqual({
      ...raw,
      nodeAttrs: [{ ...raw.nodeAttrs[0], attr: ["drive:share", "magicdns-aaaa"] }],
    });
    expect(JSON.parse(serializePolicy(parsed.policy))).toEqual(raw);
  });

  test("malformed extension sections cannot masquerade as empty lists", () => {
    for (const value of [null, {}, [null], ["tag:files"]]) {
      const parsed = parsePolicy(JSON.stringify({ nodeAttrs: value }));
      if (!parsed.ok) throw new Error(parsed.error);
      expect(readPolicyRows(parsed.policy, "nodeAttrs")).toBeUndefined();
      expect(JSON.parse(serializePolicy(parsed.policy)).nodeAttrs).toEqual(value);
    }
  });

  test("application grants keep structured access modes and removing app retains unrelated options", () => {
    const app = { "tailscale.com/cap/drive": [{ shares: ["docs"], access: "ro" }] };
    expect(parseAppCapabilities(JSON.stringify(app))).toEqual(app);
    expect(withAppCapabilities({ app, future: true }, {})).toEqual({ future: true });
    for (const invalid of [
      "[]",
      "null",
      '{"": []}',
      '{"tailscale.com/cap/drive": {"access":"rw"}}',
      "{",
    ]) {
      expect(parseAppCapabilities(invalid)).toBeUndefined();
    }
  });
});
