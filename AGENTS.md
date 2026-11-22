# Core Concepts

For a new community maintenance session, read `MAINTENANCE.zh-CN.md` (or
`MAINTENANCE.md`) and `.github/FORK_SETUP.zh-CN.md` before changing code or
publishing. Recheck live repository and release state, preserve existing user
changes, and update both handoff manuals when maintenance decisions change.

Headplane is a web application to manage Headscale, a self-hosted implementation
of the Tailscale control server. There are a few tenets that guide the entire
development of the project:

- **Simple starts**: We want to make it as easy as possible to set up and use
  Headplane, while still providing powerful features for advanced users. This
  means that we prioritize a clean and intuitive user interface, as well as
  straightforward installation and configuration processes.

- **No breaking changes**: We want to avoid making breaking changes to the
  project as much as possible. This means that we will strive to maintain
  backward compatibility and provide clear migration paths when necessary.

- **Documentation**: This is the most important part of the project, without it
  the entire project falls apart and is hard to use.

## Project Management

It's hard to manage this project easily, use the `gh` CLI when responding to
prompts to get context. Some common issue tags to keep track of include a
"Needs Triage", "Needs Info", "Bug", "Enhancement", and several other tags based
on what parts of the project are affected.

## Headplane Agent

The Headplane Agent is a lightweight component that runs on the same server as
Headplane and connects directly to the Tailnet in order to pull in details about
nodes that aren't available through the Headscale API such as versions, etc.

## WebSSH

This is an ephemeral WASM shim that runs in the browser and connects directly
to the Tailnet using Tailscale's go packages. It allows anyone to open up an
ephemeral machine in the Tailnet that directly SSHes into a target node.

## Build/Tooling

Headplane is a React Router 7 (framework mode) project built with Vite. Take
care to use our preferred PNPM version and Node version as defined in the
`engines` field of `package.json`. We also use TypeScript Go and Oxfmt for
type-checking and formatting respectively.

When typechecking, use `pnpm run typecheck`, when linting and formatting, use
the respective `lint` and `format` scripts, you can pass flags to them. You can
also run Headscale CLI commands with `docker exec headscale headscale <command>`
when the dev environment is running.

## Docs

The project has a documentation site available at the `docs/` directory built
with VitePress. The documentation is written in Markdown and can be easily
edited and extended. If making changes to staple features, please take care to
also update the documentation to reflect any changes in functionality or usage.

## Releases

Every user-facing change adds a line to the `# Next` section of `CHANGELOG.md`,
under `## Changes` or `## Fixes`. That section is what nightly users read on the
docs site, so write it as prose for them, not as a commit summary. Prose placed
directly under `# Next`, above the subheadings, becomes the release preamble.
Use it for compatibility notes and upgrade warnings.

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
