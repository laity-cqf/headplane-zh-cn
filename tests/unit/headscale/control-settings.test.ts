import { expect, test } from "vitest";

import {
  controlSettingsErrors,
  durationSeconds,
  readControlSettings,
} from "~/utils/headscale-settings";

test("HA durations that prevent Headscale starting are rejected, while disabled probing is allowed", () => {
  const defaults = readControlSettings({});
  expect(controlSettingsErrors(defaults)).toEqual([]);
  for (const [field, value] of [
    ["haInterval", "1s"],
    ["haTimeout", "10s"],
    ["ephemeralTimeout", "65s"],
    ["nodeExpiry", "-1h"],
  ] as const) {
    expect(controlSettingsErrors({ ...defaults, [field]: value })).toContain(field);
  }
  expect(controlSettingsErrors({ ...defaults, haInterval: "0", haTimeout: "0" })).toEqual([]);
  expect(durationSeconds("1h30m")).toBe(5400);
  expect(durationSeconds("180d", true)).toBe(15552000);
  for (const invalid of ["0.5h", "1s1m", "1h1h", "1ns"])
    expect(durationSeconds(invalid, true)).toBeUndefined();
  expect(readControlSettings({ ephemeral_node_inactivity_timeout: "2h" }).ephemeralTimeout).toBe(
    "2h",
  );
  for (const invalid of ["1d", "Infinity", "1s garbage", "9999999999h", "", "1e3s"])
    expect(durationSeconds(invalid)).toBeUndefined();
});

test("the settings view reads only public settings and retains explicit false and zero values", () => {
  expect(
    readControlSettings({
      node: { expiry: 0, routes: { ha: { probe_interval: 0, probe_timeout: "1s" } } },
      taildrop: { enabled: "false" },
      oidc: { client_secret: "secret" },
    }),
  ).toEqual({
    nodeExpiry: "0",
    ephemeralTimeout: "30m",
    haInterval: "0",
    haTimeout: "1s",
    autoUpdate: false,
    taildrop: false,
  });
});
