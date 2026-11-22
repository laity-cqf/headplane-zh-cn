<div lang="zh-CN">

# 语言与发布线维护

[English](/features/language)

本页说明社区维护仓库 `laity-cqf/headplane-zh-cn` 的 **0.8 发布线**，基于上游 [tale/headplane](https://github.com/tale/headplane) 0.8.2，**不是 Headplane、Headscale 或 Tailscale 官方中文版**。保留上游 MIT 许可证原文及原作者版权声明。本发布线保留原有界面、VitePress 文档工具链、配置、权限及兼容要求，不引入 `main` 的新版界面或新功能。

## 当前范围 {#current-scope}

语言偏好、API 密钥登录及错误、SSO 配置与登录提示、退出、公共导航、主题标签、连接横幅、复制控件、弹窗按钮和公共错误说明已支持英文与简体中文。

[设备模块](/zh-CN/features/machines-bilingual)也已支持双语列表、详情、筛选、管理弹窗、校验及操作结果、徽标和日期。设备原始值、命令、权限及 Headscale 能力检查保留原有行为。

[用户、角色与账号关联](/zh-CN/features/users-bilingual)也已支持双语账号列表、创建及管理弹窗、策略用户组、所有权转移、首页关联选择器及成员下载页。本地表单错误跟随语言切换并保留草稿，原有标识符、权限及 API 诊断保持不变。

[访问控制与策略编辑器](/zh-CN/features/acls)也已接入：访问规则、SSH 规则、主机别名、标签、用户组、提示、解析说明及编辑器控件。切换语言保留草稿和策略原始值。

[DNS](/zh-CN/features/dns)、[设置](/zh-CN/features/settings)和[浏览器 SSH](/zh-CN/features/ssh)现已支持双语。全部 VitePress 页面均有中文版本，包括安装、配置、SSO、NixOS 选项、架构及完整历史更新日志；导航、本地搜索和语言切换支持根路径及 /0.8/ 归档。翻译及容器验收已完成，社区维护版 `v0.8.4-zh` 已发布，正式镜像为 `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4`（amd64/arm64）。

## 选择界面语言 {#choose-the-interface-language}

使用登录页、退出页或管理界面顶部的语言按钮。首次访问按 `Accept-Language` 选择英文或简体中文；其他中文语言变体统一使用简体中文，不支持的语言回退到英文。

`headplane_locale` 浏览器 Cookie 保存偏好一年，清除后恢复跟随浏览器语言。偏好在登录前后均有效，不更改账号、认证 Cookie、角色、Headscale 配置、其他浏览器或返回地址。语言端点只接受 POST 提交的单个受支持语言值，不接受跳转目标。

命令、API 字段、配置键、产品名、用户输入及原始服务端诊断保留原文；中文错误说明继续展示原始诊断数据。应用内文档按钮保留上游参考链接。完整双语文档可通过仓库源码、本地预览及社区 Release 快照阅读，无需部署文档站。

## 检查与复核改动 {#check-and-review-changes}

使用本发布线要求的 Node 和 pnpm 版本运行检查：

```bash
pnpm i18n:check
pnpm test:unit
pnpm typecheck
pnpm docs:build
```

`i18n:check` 只验证 `.github/i18n/scope.json` 列出的已完成文件和文档对，同时检查实际语言资源、占位符、硬编码文案及逐项复核指纹。检查结合完整源码 / 文档覆盖及浏览器复核；通过**不代表**Docker 运行或发布验收已完成，输出会单独列出待完成的发布验收。

同时核对变更后的英文与中文，先格式化，再仅记录已完成的复核项：

```bash
pnpm i18n:review --message login.welcome
pnpm i18n:review --file docs/features/language.md
pnpm i18n:review --file app/layout/header.tsx
pnpm i18n:check
```

参数可重复，文档对使用英文路径。检查命令不更新记录，复核一项也不会放行其他项目。技术例外必须有确切消息键，或确切文件及代码文本，并说明理由。初始化参数 `--initialize` 拒绝覆盖已有基线。

静态扫描不能证明译文质量，也无法追踪所有动态消息、第三方组件及远端终端输出。仍需验收两种语言流程并审阅上游实际差异。`stable` 与 `main` 分别维护；合并上游发布线更新后，按本发布线的行为调整翻译。

## 发布状态 {#publication-status}

当前验收以精确提交的 CI 和各不可变 Release 清单为准，首次发行快照仅作历史参考。`pnpm i18n:release` 现校验已完成范围；发布流程还要求 stable 精确提交的检查通过。候选版本通过验收不等于镜像仓库已完成发布。

发布线文档构建保留上游根路径及 `/0.8/` 归档格式。分支构建只保存临时 Actions 产物；正式发行验收通过后附带双语快照。单独推送文档不会创建发行版或覆盖旧附件。阅读源码、执行 `pnpm docs:dev` 本地预览，或下载对应 Release 快照并通过 HTTP 服务打开；不部署托管文档站，也不需要托管凭据。

</div>

## 固定维护分支与历史发行

社区维护仓库只保留两条长期分支：`main` 跟随上游开发，`stable` 跟随上游最新正式发行标签。上游升级后继续更新 `stable`，不为每个版本新建分支；兼容范围和构建工具随对应上游版本保持一致。

社区版本标签例如 `v0.8.2-zh`。每个已发布版本都在 GitHub Releases 保留源码、双语文档快照、正式多架构镜像的摘要和校验和。Docker 完整镜像标签使用 `vX.Y.Z`，例如 `v0.8.2`；GitHub Release/Git 标签保留 `-zh`。完整镜像标签不重复使用；`latest`、`0.8` 可以前移。后续仅发布普通正式镜像，保留 amd64/arm64。源码使用 GitHub 自带 ZIP/tar.gz，后续发行不再附加重复的源码包。默认沿用上游版本，不添加修订号。明确要求提前交付维护修正时，可在 `.github/fork-release.json` 单独记录社区补丁版本，绑定真实上游提交并附双语发行说明。社区 0.8.3 基于上游 0.8.2，增加 JSON/HuJSON 的 ACL、Grants 兼容。社区 0.8.4 在相同上游基础上增加 [Headscale 0.29 可视化操作](/features/headscale-029)。下次升级上游时清除或重新绑定此覆盖记录；若标签已占用，选择下一个未使用的社区版本。旧镜像、标签和附件保持原样。临时 PR 分支合并后自动删除。

本项目是非官方社区维护版本，完整保留上游 MIT 许可证及来源说明。验收门禁和操作步骤见仓库内的 `session/MAINTENANCE.zh-CN.md`。

工作流保留 5 个：**Build**（编译、单元/集成测试、Nix 和容器运行验收）、**Translations**、**Docs**（根路径/归档预览）、**Upstream sync** 和 **Release**。Release 同时负责上传恢复及匿名镜像检查。现有不可变发行及历史调试镜像继续保留。
