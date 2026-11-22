# Headplane

For a new community maintenance session, read `MAINTENANCE.zh-CN.md` (or
`MAINTENANCE.md`) and `.github/FORK_SETUP.zh-CN.md` before changing code or
publishing. Recheck live repository and release state, preserve existing user
changes, and update both handoff manuals when maintenance decisions change.

Headplane is a web UI for Headscale, the self-hosted Tailscale control server.
Three rules guide every change:

- **Simple starts.** Setup should take as little as possible, with advanced
  features opt-in.
- **No breaking changes.** Keep existing configs and setups working. When
  something has to change, give operators an upgrade step (see Releases).
- **Docs ship with the change.** A feature isn't done until its docs are.

## Layout

- `app/`: the React Router 7 app (framework mode, Vite). Server code lives in
  `app/server/`, see its `ARCHITECTURE.md`.
- `cmd/` and `internal/`: Go code. `hp_agent` is the agent, a Tailscale node
  that reads machine details the Headscale API doesn't have. `hp_ssh` is
  Browser SSH, a Tailscale client compiled to WebAssembly that runs in the
  browser. `hp_healthcheck` is the Docker healthcheck.
- `docs/`: the docs site.
- `tests/`: unit and integration tests and the container harness, see its
  `README.md`.

## Tooling

Use the Node and pnpm versions from `engines` in `package.json`.

- `pnpm run typecheck`, `pnpm run lint` and `pnpm run format`, which accept
  extra flags.
- `pnpm test:unit` and `pnpm test:integration`.
- `pnpm dev` runs the app against the Docker dev environment. Run Headscale
  commands there with `docker exec headscale headscale <command>`.

Use the `gh` CLI for issues and PRs. Issues are triaged with labels such as
Needs Triage, Needs Info, Bug and Feature, plus area labels like Agent,
Integrations and Web SSH.

## Action errors

Throw `ActionError` (`app/server/web/actions.ts`) for any state of the world an
action can run into: config, permissions, data, Headscale's version or health.
It shows its message in the form. Use it even when the UI already hides the
action, since what the UI prevents changes over time. Throw a plain `Error`
only for programmer bugs, code paths that should be impossible. Never fall back
to a silent no-op.

## Testing

Correctness is the goal. Test count is not. Every test has to earn its place,
and a change that doesn't need a new test shouldn't get one.

Run `pnpm test:unit` (about a second, no Docker) for every change. Run
`pnpm test:integration` when you touch a route, the Headscale client, the
agent, the platform integrations, or OIDC. It needs Docker.

### What earns a test

Before writing a test, name the regression that would make it fail. If you
can't name a plausible one, or the only way to break it is to rewrite the
implementation the test copies, don't write it.

Worth testing:

- Permission boundaries: which roles can call each loader and action intent.
- Parsing of untrusted input: forms, config, env vars, policies, OIDC claims,
  registration keys.
- Behavior that differs between Headscale versions (`capabilities.ts`).
- Failure and recovery: Headscale down, slow, or returning errors; agent
  crashes; bad config.
- Every fixed bug. Write the failing test first, at the lowest layer that
  reproduces the bug, and name the test for the behavior, not the issue number.

Not worth testing:

- Code that restates a table or constant (role definitions, defaults).
- Anything TypeScript already enforces.
- React Router, valibot, drizzle, or other library behavior.
- Assertions that only check for existence: `toBeDefined()`, "is an array",
  "the client is usable".
- Rendered markup, unless the markup itself is the behavior.

When you work in an area, delete tests there that don't meet this bar. That
counts as part of the change.

### Unit tests (`tests/unit/`)

Logic that doesn't touch Headscale belongs here: config, auth sessions, roles,
parsing, and form schemas. A unit test runs in milliseconds, does no network or
container IO, and uses real implementations wherever they're cheap: a
`:memory:` SQLite database, the real auth service, real role checks, and real
valibot schemas. Anything that talks to Headscale is an integration test
against the real thing. There is no fake Headscale; don't write one, and don't
stub the client.

- Don't use `vi.mock` on app modules. If code can't be tested without it, change
  the code: pass the dependency in, return a value instead of calling `exit`,
  read files at the edge. We change app code for testability; we don't contort
  tests around it.
- Use fake timers for polling, retry, and expiry logic instead of sleeping.
- When a test needs files, use `tempDir()` or `tempFile()` from
  `tests/support/temp.ts`. Don't mock `node:fs`.
- Logs only print for failing tests. Don't mock the logger to quiet them.

### Integration tests (`tests/integration/`)

Use these for anything that needs real Headscale, a real tailnet, real
containers, or a real identity provider. They're how we know Headplane works
against the versions we claim to support. Prefer a few broad, scenario-shaped
tests that drive Headplane and check what real nodes see, over many narrow ones.

- `headscale/contract.test.ts` is what Headplane relies on from Headscale's
  API, asserted through Headplane's client on every supported version. When
  Headplane starts depending on a new behavior or a version quirk (like 0.28.0
  deleting every auth key along with any user), add it there.
- `headplane/` drives routes against a real tailnet. Get the app from
  `tailnet.headplane()`: `app.signIn(role)` returns a real session cookie and
  `app.call(loader, path, { as, form, params })` runs a loader or action the
  way React Router does. Don't hand-write `context.get` switches or cast route
  arguments.
- `headplane/permissions.test.ts` calls every loader and action intent in
  `app/routes.ts` as each role. A new route is covered automatically. Only add
  it to `PUBLIC` or `MEMBER_VISIBLE` if it truly returns no tailnet data to
  those callers, and say why.
- `agent/`, `platform/` (Docker, `/proc`), and `oidc/` (Dex) cover the rest.
- Each file creates its own tailnet. Tests in a file may share it, so give
  each test its own users, tags, and names, and never assert on totals like a
  count of API keys.
- Wait for conditions with `vi.waitFor` or the harness's `waitFor`. Never sleep
  for a fixed time.

### Harness (`tests/harness/`)

All container setup goes through the harness, built on `testcontainers`.

- `createTailnet({ version, policy, headscaleConfig })` starts Headscale on its
  own Docker network, served over HTTPS with a generated certificate. Dispose it
  with `await using` or `tailnet.dispose()`.
- `tailnet.node({ name, user, tags, ssh, routes, exitNode })` starts a real
  Tailscale node that joins with a pre-auth key. `node.down()`, `node.up()`,
  `node.status()`, and `node.tailscale([...])` control it.
  `tailnet.pendingNode()` waits for interactive registration.
- `tailnet.headplane()` runs Headplane in-process against the tailnet, with a
  fresh database each call. It's built on `createTestApp()`
  (`tests/support/app.ts`).
- Supported Headscale versions and the pinned Tailscale and Dex images live only
  in `versions.ts`. Never hardcode a version in a test; use `testedVersions()`.
  Locally only the latest runs; CI sets `HP_HEADSCALE_VERSIONS=all`.
- If you need a container the harness can't create yet, add it to the harness.
  Don't start containers ad hoc in test files.
- Scenarios in `scenarios/` are declarative seed data (users, nodes, policy,
  DNS). `pnpm harness up <scenario> --headplane` keeps one running for manual
  testing, reproducing user setups, and docs screenshots. Write them to look
  like real deployments.

## Docs

The docs site in `docs/` is Fumadocs on React Router (`pnpm docs:dev`).

- Pages are Markdown, or MDX when they use components or expressions. Each
  folder's `meta.json` sets the sidebar order.
- Link between pages by site path, such as `/install/docker`.
- Version numbers (Headscale minimums, Node, pnpm) come from
  `docs/app/lib/versions.ts`. In MDX, write `{versions.headscale.minimum}`.
- Write steps in the imperative and explanations as plain description. Don't
  address the reader as "you".

## Releases

Every user-facing change adds a line to `# Next` in `CHANGELOG.md`, under
`## Changes` or `## Fixes`. Nightly users read it on the docs site, so write it
as prose for them, not as a commit summary. Prose directly under `# Next`,
above the subheadings, becomes the release preamble.

Anything an operator has to act on when upgrading, such as a new minimum
Headscale version, a renamed option or a changed requirement, also gets a line
under `## Upgrading`, above `## Changes`. Write each line as the step to take.
The docs' Upgrading page is built from these sections, so a step that only
appears in the preamble or under Changes is missing from it.

## Community fork release policy

This repository is an unofficial English/Simplified Chinese fork of tale/headplane.
Preserve LICENSE, upstream attribution and the non-official notice.

- Maintain only two long-lived branches: main follows upstream main; stable follows
  the newest published, non-prerelease upstream tag. Keep each line's native UI,
  toolchain and supported Headscale matrix. Do not create per-version release branches.
- Merge upstream history without force-pushing over translations. Review changed
  English and Chinese together, then update only the selected i18n fingerprints.
- Record upstream version/commit and acceptance status in
  .github/fork-release.json. Upgrades reset acceptance until CI has passed.
- Formal community tags use vX.Y.Z-zh, without a revision suffix. By default
  the version follows upstream. An explicitly requested community maintenance
  release records communityRelease.version, the pinned upstreamCommit and bilingual
  notes in .github/fork-release.json. Keep package.json at the actual upstream
  version. main must remain channel=development and cannot publish. Clear or
  deliberately update communityRelease when upgrading upstream; use an unused
  release version and never overwrite a published version.
- Do not use pnpm release cut in this fork. From a clean, accepted stable checkout,
  use node .github/scripts/fork-release.cjs tag and push only that new tag.
- Publishing requires successful Build (including containers), Translations and Docs push
  runs on the exact stable commit, full translations, and unused full image tags.
- Publish only the final image, with amd64/arm64 support. Test startup,
  real Headscale health, English/Chinese sign-in and authenticated access across
  the canonical compatibility matrix. Never fake Headscale.
- Publish a draft with GitHub source archives, root/archive docs, digests and checksums, then lock
  it through GitHub immutable releases. Never retarget tags, overwrite full image
  tags, clobber release attachments or delete historical published images.
- Docker full image tags use vX.Y.Z; GitHub Release/Git tags use vX.Y.Z-zh.
  Do not build or publish debug-shell images. latest/minor image aliases may move.
  Documentation hotfixes wait for the next upstream version; branch docs builds are temporary preview artifacts only.
- Documentation is read from source, previewed locally or downloaded as bilingual
  snapshots from community Releases. Branch builds only save temporary CI artifacts;
  do not deploy a hosted docs site or require hosting credentials. Keep automatic
  branch deletion enabled; remove merged PR branches.

Keep exactly five workflows: Build, Translations, Docs, Upstream sync and Release.
Release includes recovery and anonymous pull verification. Do not add duplicate
source.tar.gz attachments; preserve existing immutable release assets.

See .github/FORK_SETUP.zh-CN.md for the operational checklist and credentials.
