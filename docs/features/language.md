# Language and release-line maintenance

[简体中文](/zh-CN/features/language)

This page describes the community-maintained `laity-cqf/headplane-zh-cn` fork's **0.8 release line**, based on [tale/headplane](https://github.com/tale/headplane) 0.8.2. It is not an official Chinese release of Headplane, Headscale, or Tailscale. The upstream MIT license and original copyright notices are retained. This line keeps its original interface, VitePress documentation, configuration, permissions and compatibility requirements. It does not include the newer interface or features from `main`.

## Current scope

Language preferences, API-key sign-in and its errors, SSO configuration and sign-in notices, sign-out, shared navigation, theme labels, connection banners, copy controls, dialog buttons and shared error explanations support English and Simplified Chinese.

[Machines](/features/machines-bilingual) also supports bilingual lists, details, filters, management dialogs, validation and action results, badges and dates. Device values, commands, permissions and Headscale capability checks retain the original behavior.

[Users, roles and account linking](/features/users-bilingual) also supports bilingual account lists, creation and management dialogs, policy groups, ownership transfer, the home-page account picker and member downloads. Local form errors follow the selected language while keeping drafts; original identifiers, permissions and API diagnostics are preserved.

[Access Control and policy editors](/features/acls) now also support bilingual rules, SSH rules, hosts, tags and groups, notices, parse explanations and editor controls. Drafts and original policy values are preserved when switching languages.

[DNS](/features/dns), [Settings](/features/settings) and [Browser SSH](/features/ssh) now also support both languages. Every VitePress page has a Chinese counterpart, including installation, configuration, SSO, NixOS options, architecture and the complete historical changelog. Navigation, local search and language switching work at the root and under /0.8/. Translation and container acceptance are complete. The bilingual `v0.8.2-zh` release is published; the final image is `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.2` (amd64/arm64).

## Choose the interface language

Use the language button in the sign-in, signed-out or dashboard header. A first visit follows `Accept-Language`; supported choices are English and Simplified Chinese. Other Chinese language variants use Simplified Chinese, and unsupported languages fall back to English.

The `headplane_locale` browser cookie saves the selection for one year. Clearing it restores browser-language detection. The preference applies before and after sign-in. It does not change the account, authentication cookie, role, Headscale configuration, other browsers or the return URL. The language endpoint accepts only a single supported locale over POST and does not accept redirect destinations.

Commands, API fields, configuration keys, product names, user-provided values and original server diagnostics retain their spelling. Chinese error explanations keep the original diagnostic data visible. Application documentation buttons retain upstream reference links. Complete bilingual documentation is available as repository source, local previews and community Release snapshots; no hosted documentation site is required.

## Check and review changes

Run the release line's checks with its own Node and pnpm requirements:

```bash
pnpm i18n:check
pnpm test:unit
pnpm typecheck
pnpm docs:build
```

`i18n:check` validates only the completed files and document pairs listed in `.github/i18n/scope.json`. It also checks the actual message catalogs, placeholders, hardcoded messages and per-entry review fingerprints. Static checks are accompanied by full source/document coverage and browser review. They do **not** approve Docker runtime or publication acceptance, which have separate acceptance records and CI checks.

Review changed English and Chinese together, format first, then record only reviewed entries:

```bash
pnpm i18n:review --message login.welcome
pnpm i18n:review --file docs/features/language.md
pnpm i18n:review --file app/layout/header.tsx
pnpm i18n:check
```

Options can be repeated. Document pairs use the English path. The check never updates records; reviewing one entry does not approve others. Technical exceptions require an exact key or file and code text plus a reason. The initial `--initialize` option refuses to overwrite an existing baseline.

Static scanning cannot prove translation quality or trace every dynamic message, third-party component or remote terminal output. Check both language flows and review the actual upstream diff. Keep maintenance work on `stable` separate from `main`; merge upstream release-line updates and adapt translations to this line's behavior.

## Publication status

Translation and runtime acceptance are recorded in `.github/release-acceptance.json`. `pnpm i18n:release` now validates the completed scope; the release workflow also requires successful checks on the exact stable commit before publishing. An accepted candidate is not proof that registry publication has completed.

Release documentation builds keep the upstream root and `/0.8/` archive formats. Branch builds only save temporary Actions artifacts. Formal releases attach bilingual snapshots after acceptance; a docs-only push does not create a release or overwrite earlier attachments. Read the source, run `pnpm docs:dev` locally, or download the matching Release snapshot and serve it over HTTP. No hosted documentation site or hosting credentials are required.

## Fixed maintenance branches and release history

The community fork uses two permanent branches: `main` follows upstream development, and `stable` follows the newest published upstream stable tag. A new upstream version upgrades `stable`; it does not need a new branch. Compatibility and build tools follow the corresponding upstream version.

Community releases use tags such as `v0.8.2-zh`. Each published version retains its source, English/Chinese documentation snapshots, the final multi-architecture image digest and checksums in GitHub Releases. Docker full image tags use `vX.Y.Z`, such as `v0.8.2`; GitHub Release/Git tags retain `-zh`. Full image tags are never reused; `latest` and `0.8` may move. Future releases publish only the final image, retaining amd64/arm64. Source uses GitHub’s built-in ZIP/tar.gz archives; the duplicate custom source attachment is omitted from future releases. Versions follow upstream by default, without a revision suffix. An explicitly requested maintenance release may use a separate community patch version recorded in `.github/fork-release.json`, bound to the real upstream commit with bilingual release notes. Community 0.8.3 is based on upstream 0.8.2 and adds JSON/HuJSON ACL/Grants compatibility. Clear or rebind this override on the next upstream upgrade, and choose an unused community version if its tag is already occupied. Earlier images, tags and attachments remain unchanged. Temporary PR branches are removed after merge.

This is an unofficial community fork, not an official Chinese edition. The upstream MIT license and attribution remain intact. See `.github/FORK_SETUP.zh-CN.md` for acceptance gates and the release procedure.

The five workflows are **Build** (compilation, unit/integration tests, Nix and container runtime), **Translations**, **Docs** (root/archive previews), **Upstream sync** and **Release**. Release also handles upload recovery and anonymous image checks. Existing immutable releases and historical debug images remain available.
