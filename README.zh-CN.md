# Headplane 中文维护版（非官方）

[English](./README.md) · [双语版本维护与部署](./.github/FORK_SETUP.zh-CN.md)

维护固定使用 `main`（开发）和 `stable`（最新上游正式版）。社区标签如 `v0.8.2-zh` 保留对应源码、文档与镜像摘要；升级不再新建长期版本分支。详见[发行维护指南](./.github/FORK_SETUP.zh-CN.md)。

> 为 [Headscale](https://headscale.net) 提供功能完整的 Web 管理界面。

本仓库 `laity-cqf/headplane-zh-cn` 是基于上游 [tale/headplane](https://github.com/tale/headplane) 的社区中英双语维护分支，**不是 Headplane、Headscale 或 Tailscale 的官方中文版**。保留上游 [MIT 许可证](./LICENSE)原文及原作者版权声明。

`main` 已包含中英文界面及文档源码；社区维护版 `v0.8.4-zh` 基于上游 0.8.2，增加 Headscale 0.29 节点能力、应用授权、策略测试、SSH 重新认证、认证审批及生命周期／主备探测／客户端设置的可视化操作，保留 JSON/HuJSON 的 ACL、Grants 兼容及子网网关列表；发行完成后使用正式镜像 `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4`（amd64/arm64），Grants 需要 Headscale 0.29 或更高版本，双语文档保留在仓库及 Release 快照中，不部署托管文档站。`stable` 已完成语言基础、登录、公共界面、设备、用户、角色、账号关联和成员下载页，以及访问控制的五类可视化编辑器、文件编辑、差异预览及诊断，并配有对应双语指南；现已补齐 DNS、设置（预授权密钥、认证限制和 Agent）、浏览器 SSH，以及完整 VitePress 双语文档、导航、搜索和历史更新日志。语言切换保留表单草稿与 SSH 会话；翻译及容器验收已通过，stable 的实际发行结果以 GitHub Releases 为准。部署前核实[维护指南](./.github/FORK_SETUP.zh-CN.md)中的实际发布状态。

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/preview-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./docs/assets/preview-light.png">
    <img alt="Headplane 预览，上游英文界面截图" src="./docs/assets/preview-dark.png">
</picture>

Headscale 是 Tailscale 控制服务器的自托管实现。Tailscale 是基于 WireGuard 的 VPN 服务。Headscale 默认不提供 Web 界面，Headplane 为它补充了可视化管理，支持管理设备、网络和 ACL。

Headplane 的目标是提供与 Tailscale 产品和管理面板相近的管理能力，包括：

- 设备管理：过期时间、网络路由、名称和所有者。
- 访问控制列表（ACL）及用于访问控制的标签配置。
- 通过 OpenID Connect（OIDC）登录。
- 修改 DNS 设置并自动应用 Headscale 配置。
- 管理 Headscale 的相关设置。

## 部署

详细安装流程也可参考[上游网站](https://headplane.net)。本仓库的中文文档源码从[简介](./docs/introduction.zh-CN.mdx)、[快速开始](./docs/quickstart.zh-CN.mdx)和[安装](./docs/install/index.zh-CN.mdx)开始。部分页面使用 MDX 组件，需构建文档站才能完整显示。

```bash
pnpm install --frozen-lockfile
pnpm docs:dev
```

本地工具版本以 `package.json` 的 `engines` 为准。文档页顶部的 **中文** / **EN** 切换页面语言；应用顶部的 **简体中文** / **English** 切换管理界面语言。两者分别由 URL 和浏览器 Cookie 管理。

## 版本

上游自 v0.6.0 起使用[语义化版本](https://semver.org/)。本仓库沿用上游各分支的功能与兼容范围，不因汉化改变 Headscale 支持要求。

上游 README 将测试中的预发布构建描述为 `next` 标签。维护仓库仅在完成验收并按发布流程推送新标签后发布自己的镜像；本仓库不提供 `next` 镜像。当前社区维护镜像使用 `v0.8.4`，上游基础为 0.8.2，另提供 `latest` 和 `0.8`，GitHub Release 标签为 `v0.8.4-zh`；镜像架构和发布流程见[维护指南](./.github/FORK_SETUP.zh-CN.md)。

## 参与贡献

欢迎通过 Issue 提交缺陷报告和功能建议，通过 PR 提交代码、翻译或文档修改。上游规则见[贡献指南](./.github/CONTRIBUTING.md)，本仓库开发与测试要求见 [AGENTS.md](./AGENTS.md)。翻译维护方式见[语言与维护说明](./docs/features/language.zh-CN.mdx)。

---

以下为上游英文界面截图，中文界面的功能与权限规则保持一致。

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/acls-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./docs/assets/acls-light.png">
    <img alt="ACL 管理，上游英文界面截图" src="./docs/assets/acls-dark.png">
</picture>

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/machine-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./docs/assets/machine-light.png">
    <img alt="设备管理，上游英文界面截图" src="./docs/assets/machine-dark.png">
</picture>

> Copyright (c) 2025 Aarnav Tale
