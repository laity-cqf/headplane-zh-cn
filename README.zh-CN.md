# Headplane zh-CN（非官方 fork）

[会话入口与维护记录](./session/README.md)

[English](./README.md) · 简体中文

本仓库为社区维护的 [tale/headplane](https://github.com/tale/headplane) 中英双语 fork，**不是 Headplane、Headscale 或 Tailscale 的官方中文版**。保留上游 [MIT 许可证原文](./LICENSE)及原作者版权声明。

当前为 **0.8 发布线**。设备、用户、角色、账号关联、成员下载页、访问控制和编辑器、DNS、设置及浏览器 SSH，以及完整 VitePress 文档均已接入中英切换。社区维护版 [v0.8.4-zh](https://github.com/laity-cqf/headplane-zh-cn/releases/tag/v0.8.4-zh) 增加 Headscale 0.29 节点能力、应用授权、策略测试、SSH 重新认证、认证审批及生命周期／主备探测／客户端设置的可视化操作，保留 JSON/HuJSON 策略的 ACL、Grants 兼容及子网网关列表，上游基础仍为 0.8.2。发行完成后使用正式镜像 `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4`（amd64/arm64）；Grants 需要 Headscale 0.29 或更高版本。双语文档保留在仓库及 Release 快照中，不部署托管文档站。进度见[语言与维护说明](./docs/zh-CN/features/language.md)。

Headscale 是 Tailscale 控制服务器的自托管实现，默认不带 Web 界面。Headplane 为其提供设备、网络及 ACL 管理界面，参考官方 Tailscale 管理面板的功能与布局。

![Headplane 管理面板（上游英文界面截图）](./docs/assets/preview-light.png)

主要功能包括：

- 管理设备名称、所有者、密钥过期及网络路由。
- 管理 ACL、标签与用户组。
- 使用 OpenID Connect（OIDC）登录。
- 管理 DNS 和 Headscale 配置。
- 通过 Agent 查看主机详情，并使用浏览器 SSH。

## 部署

参阅[中文安装文档](./docs/zh-CN/install/index.md)。上游文档站为 [headplane.net](https://headplane.net)，其发布产物不代表本 fork 已完成发行。

## 版本

上游自 v0.6.0 起采用[语义化版本](https://semver.org/)。上游预发布构建使用 next 标签，并在发行 PR 测试期间更新。维护 fork 保留相同功能兼容范围；当前社区维护镜像使用 `v0.8.4`，上游基础为 0.8.2，另提供 `latest` 和 `0.8`，GitHub Release 标签为 `v0.8.4-zh`。后续仅发布普通正式镜像，保留 amd64/arm64。

## 贡献

欢迎提交问题与改进，参阅[贡献指南](./docs/zh-CN/CONTRIBUTING.md)。汉化问题提交至维护仓库，上游功能问题保留原来源说明。

![ACL（上游英文界面截图）](./docs/assets/acls-light.png)
![设备管理（上游英文界面截图）](./docs/assets/machine-light.png)

维护固定使用 `main`（开发）和 `stable`（最新上游正式版）。社区标签如 `v0.8.2-zh` 保留对应源码、文档与镜像摘要；升级不再新建长期版本分支。详见[发行维护指南](./session/MAINTENANCE.zh-CN.md)。

> Copyright (c) 2025 Aarnav Tale
