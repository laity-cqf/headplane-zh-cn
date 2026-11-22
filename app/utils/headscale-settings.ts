import { isRecord } from "./policy-extensions";

export const CONTROL_SETTING_PATHS = {
  nodeExpiry: "node.expiry",
  ephemeralTimeout: "node.ephemeral.inactivity_timeout",
  haInterval: "node.routes.ha.probe_interval",
  haTimeout: "node.routes.ha.probe_timeout",
  autoUpdate: "auto_update.enabled",
  taildrop: "taildrop.enabled",
} as const;
export type ControlSettings = {
  nodeExpiry: string;
  ephemeralTimeout: string;
  haInterval: string;
  haTimeout: string;
  autoUpdate: boolean;
  taildrop: boolean;
};

const defaults: ControlSettings = {
  nodeExpiry: "0",
  ephemeralTimeout: "120s",
  haInterval: "10s",
  haTimeout: "5s",
  autoUpdate: false,
  taildrop: true,
};

export function readControlSettings(raw: unknown): ControlSettings {
  const result = { ...defaults };
  for (const field of Object.keys(CONTROL_SETTING_PATHS) as (keyof ControlSettings)[]) {
    let value: unknown = raw;
    for (const part of CONTROL_SETTING_PATHS[field].split("."))
      value = isRecord(value) ? value[part] : undefined;
    if (field === "ephemeralTimeout" && value === undefined && isRecord(raw))
      value = raw.ephemeral_node_inactivity_timeout;
    if (field === "autoUpdate" || field === "taildrop") {
      if (typeof value === "boolean" || value === "true" || value === "false")
        result[field] = value === true || value === "true";
    } else if (typeof value === "string" || typeof value === "number")
      result[field] = String(value);
  }
  return result;
}

// Go durations for timers; Headscale's node.expiry also accepts days/weeks/years.
export function durationSeconds(value: string, longUnits = false): number | undefined {
  if (value === "0") return 0;
  const units: Record<string, number> = {
    ns: 1e-9,
    us: 1e-6,
    µs: 1e-6,
    μs: 1e-6,
    ms: 1e-3,
    s: 1,
    m: 60,
    h: 3600,
  };
  if (longUnits) Object.assign(units, { d: 86400, w: 604800, y: 31536000 });
  const parts = [...value.matchAll(/(\d+(?:\.\d+)?|\.\d+)(ns|us|µs|μs|ms|s|m|h|d|w|y)/g)];
  if (!parts.length || parts.map((part) => part[0]).join("") !== value) return undefined;
  if (longUnits) {
    // prometheus/model.ParseDuration uses integer, descending units.
    const order = ["y", "w", "d", "h", "m", "s", "ms"];
    let previous = -1;
    for (const part of parts) {
      const current = order.indexOf(part[2]);
      if (!/^\d+$/.test(part[1]) || current <= previous || current < 0) return undefined;
      previous = current;
    }
  }
  let seconds = 0;
  for (const part of parts) {
    if (!(part[2] in units)) return undefined;
    seconds += Number(part[1]) * units[part[2]];
  }
  // time.Duration is a signed 64-bit number of nanoseconds.
  return Number.isFinite(seconds) && seconds <= 9223372036 ? seconds : undefined;
}

export function controlSettingsErrors(settings: ControlSettings): (keyof ControlSettings)[] {
  const errors: (keyof ControlSettings)[] = [];
  const expiry = durationSeconds(settings.nodeExpiry, true);
  const ephemeral = durationSeconds(settings.ephemeralTimeout);
  const interval = durationSeconds(settings.haInterval);
  const timeout = durationSeconds(settings.haTimeout);
  if (expiry === undefined) errors.push("nodeExpiry");
  if (ephemeral === undefined || ephemeral <= 65) errors.push("ephemeralTimeout");
  if (interval === undefined || (interval > 0 && interval < 2)) errors.push("haInterval");
  if (
    timeout === undefined ||
    (interval !== 0 && (timeout < 1 || (interval !== undefined && timeout >= interval)))
  )
    errors.push("haTimeout");
  return errors;
}
