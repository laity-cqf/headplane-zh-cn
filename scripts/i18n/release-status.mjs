import { readFileSync } from "node:fs";

const scope = JSON.parse(
  readFileSync(new URL("../../.github/i18n/scope.json", import.meta.url), "utf8"),
);
const release = JSON.parse(
  readFileSync(new URL("../../.github/fork-release.json", import.meta.url), "utf8"),
);
if (
  scope.version !== 1 ||
  scope.line !== release.upstream.version.split(".").slice(0, 2).join(".") ||
  scope.complete !== true ||
  !Array.isArray(scope.pending) ||
  scope.pending.length
) {
  console.error(
    "Release blocked: stable localization and publication acceptance are incomplete. See session/README.md and .github/i18n/scope.json.",
  );
  process.exitCode = 1;
}
