import type { Policy } from "./acl-policy";

export const POLICY_EXTENSION_KEYS = [
  "nodeAttrs",
  "randomizeClientPort",
  "tests",
  "sshTests",
] as const;
export type PolicyRowsKey = "nodeAttrs" | "tests" | "sshTests";
export type PolicyRow = Record<string, unknown>;

export function hasPolicyExtensions(policy: Policy): boolean {
  return POLICY_EXTENSION_KEYS.some((key) => Object.hasOwn(policy.extra, key));
}

export function readPolicyRows(policy: Policy, key: PolicyRowsKey): PolicyRow[] | undefined {
  const value = policy.extra[key];
  if (value === undefined) return [];
  if (!Array.isArray(value) || !value.every(isRecord)) return undefined;
  return value;
}

export function setPolicyRows(policy: Policy, key: PolicyRowsKey, rows: PolicyRow[]): Policy {
  return { ...policy, extra: { ...policy.extra, [key]: rows } };
}

export function stringList(value: unknown): string[] | undefined {
  if (value === undefined) return [];
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

export function isRecord(value: unknown): value is PolicyRow {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Capability payloads are arbitrary JSON values, grouped in arrays by name.
// Never flatten them into strings: doing so changes Taildrive permissions.
export function parseAppCapabilities(raw: string): Record<string, unknown[]> | undefined {
  if (raw.trim() === "") return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      !Object.entries(value).every(([key, entry]) => key.trim() && Array.isArray(entry))
    ) {
      return undefined;
    }
    return value as Record<string, unknown[]>;
  } catch {
    return undefined;
  }
}

export function withAppCapabilities(extra: PolicyRow, app: Record<string, unknown[]>): PolicyRow {
  const next = { ...extra };
  if (Object.keys(app).length) next.app = app;
  else delete next.app;
  return next;
}
