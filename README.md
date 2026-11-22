# Headplane zh-CN (unofficial fork)

[Maintenance and session handoff](./MAINTENANCE.md) · [中文维护与会话交接](./MAINTENANCE.zh-CN.md)

[简体中文](./README.zh-CN.md) · [Bilingual fork setup](./.github/FORK_SETUP.zh-CN.md)

This is `laity-cqf/headplane-zh-cn`, a community-maintained English and
Simplified Chinese fork of [tale/headplane](https://github.com/tale/headplane).
It is not an official Chinese release of Headplane, Headscale, or Tailscale.
The upstream [MIT license](./LICENSE) and original copyright notices are retained.
The `main` branch includes English and Simplified Chinese UI and documentation.
Stable community maintenance release `v0.8.4-zh` adds Headscale 0.29 visual controls for node capabilities, application Grants, policy tests, SSH reauthentication, authentication approvals and lifecycle/HA/client settings, based on upstream 0.8.2. JSON/HuJSON ACL/Grants editing and the subnet gateway list remain available. After publication in GitHub Releases, use `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4` (amd64/arm64). Grants require Headscale 0.29 or later. Bilingual docs stay in the repository and
Release snapshots, with local previews and no hosted documentation deployment.

Maintenance uses fixed `main` (development) and `stable` (latest stable upstream) branches.
Community tags such as `v0.8.2-zh` preserve source, documentation and image digests;
new upstream versions do not require new maintenance branches. See the [fork release guide](./.github/FORK_SETUP.zh-CN.md).

> A feature-complete web UI for [Headscale](https://headscale.net)

<picture>
    <source
        media="(prefers-color-scheme: dark)"
        srcset="./docs/assets/preview-dark.png"
    >
    <source
        media="(prefers-color-scheme: light)"
        srcset="./docs/assets/preview-light.png"
    >
    <img
        alt="Preview"
        src="./docs/assets/preview-dark.png"
    >
</picture>

Headscale is the de-facto self-hosted version of Tailscale, a popular Wireguard
based VPN service. By default, it does not ship with a web UI, which is where
Headplane comes in. Headplane is a feature-complete web UI for Headscale, allowing
you to manage your nodes, networks, and ACLs with ease.

Headplane aims to replicate the functionality offered by the official Tailscale
product and dashboard, being one of the most feature complete Headscale UIs available.
These are some of the features that Headplane offers:

- Machine management, including expiry, network routing, name, and owner management
- Access Control List (ACL) and tagging configuration for ACL enforcement
- Support for OpenID Connect (OIDC) as a login provider
- The ability to edit DNS settings and automatically provision Headscale
- Configurability for Headscale's settings

## Deployment

Refer to the [upstream website](https://headplane.net) for installation instructions.
Read this fork’s [English documentation source](./docs/introduction.mdx), or run
`pnpm docs:dev` for the full bilingual preview. Published community Releases retain
versioned documentation snapshots.

## Versioning

Headplane uses [semantic versioning](https://semver.org/) for its releases (since v0.6.0).
Pre-release builds are available under the `next` tag and get updated when a new release
PR is opened and actively in testing.

## Contributing

Headplane is an open-source project and contributions are welcome! If you have
any suggestions, bug reports, or feature requests, please open an issue. Also
refer to the [contributor guidelines](./.github/CONTRIBUTING.md) for more info.

---

<picture>
    <source
        media="(prefers-color-scheme: dark)"
        srcset="./docs/assets/acls-dark.png"
    >
    <source
        media="(prefers-color-scheme: light)"
        srcset="./docs/assets/acls-light.png"
    >
    <img
        alt="ACLs"
        src="./docs/assets/acls-dark.png"
    >
</picture>

<picture>
    <source
        media="(prefers-color-scheme: dark)"
        srcset="./docs/assets/machine-dark.png"
    >
    <source
        media="(prefers-color-scheme: light)"
        srcset="./docs/assets/machine-light.png"
    >
    <img
        alt="Machine Management"
        src="./docs/assets/machine-dark.png"
    >
</picture>

> Copyright (c) 2025 Aarnav Tale
