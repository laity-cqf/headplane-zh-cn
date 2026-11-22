# Headplane zh-CN (unofficial fork)

[Session entry and maintenance history](./session/README.md)

This is `laity-cqf/headplane-zh-cn`, a community-maintained English and
Simplified Chinese fork of [tale/headplane](https://github.com/tale/headplane).
It is not an official Chinese release of Headplane, Headscale, or Tailscale.
The upstream [MIT license](./LICENSE) and original copyright notices are retained.

This is the **0.8 release line**. All application modules and the complete VitePress documentation support English and Simplified Chinese. Translation and container acceptance have passed. Community maintenance release `v0.8.4-zh` adds Headscale 0.29 visual controls for node capabilities, application Grants, policy tests, SSH reauthentication, authentication approvals and lifecycle/HA/client settings. JSON/HuJSON ACL/Grants editing and the subnet gateway list remain available. Its upstream base remains 0.8.2; deploy `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4` (amd64/arm64) after it is available in GitHub Releases. Grants require Headscale 0.29 or later. See [GitHub Releases](https://github.com/laity-cqf/headplane-zh-cn/releases) for source and documentation snapshots. Bilingual docs stay in the repository and Release snapshots; no hosted documentation site is deployed.
See [release-line maintenance](./docs/features/language.md) for scope and acceptance status.

[English](./README.md) · [简体中文](./README.zh-CN.md)

本仓库是基于 `tale/headplane` 的**非官方**中英双语维护分支，保留上游 MIT 许可证原文及原作者署名。0.8 界面与文档汉化已完成，翻译及容器验收已通过，正式发布结果以 GitHub Releases 为准，进度见[中文维护说明](./docs/zh-CN/features/language.md)。

Maintenance uses fixed `main` (development) and `stable` (latest stable upstream) branches.
Community tags such as `v0.8.2-zh` preserve source, documentation and image digests;
new upstream versions do not require new maintenance branches. See the [fork release guide](./session/MAINTENANCE.md).

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

Refer to the [website](https://headplane.net) for detailed installation instructions.

## Versioning

Headplane uses [semantic versioning](https://semver.org/) for its releases (since v0.6.0).
Pre-release builds are available under the `next` tag and get updated when a new release
PR is opened and actively in testing.

## Contributing

Headplane is an open-source project and contributions are welcome! If you have
any suggestions, bug reports, or feature requests, please open an issue. Also
refer to the [contributor guidelines](./docs/CONTRIBUTING.md) for more info.

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
