# Headplane zh-CN 双语版本维护（非官方）

`laity-cqf/headplane-zh-cn` 是 [tale/headplane](https://github.com/tale/headplane) 的社区中英双语 fork，**不是 Headplane、Headscale 或 Tailscale 官方中文版**。保留上游 `LICENSE` 原文、作者版权及来源说明。

## 账号更名后的地址

GitHub 账号已由 `CM-Chenqf` 更名为 `laity-cqf`。仓库使用 `https://github.com/laity-cqf/headplane-zh-cn`，镜像使用 `ghcr.io/laity-cqf/headplane-zh-cn`；已有部署需修改镜像命名空间，版本标签和摘要保持不变。已确认 `v0.8.2` 在新地址与原正式镜像摘要一致，支持 amd64/arm64，无需重建。

历史不可变发行附件中的旧账号、源码和文档快照保持原样，以保留原始校验和。Release 验收读取历史源码及清单时仅兼容已知旧账号，实际 API 请求和镜像拉取使用新地址；新发行仅接受新仓库身份。仓库 `origin`、工作流仓库门禁、上游提醒接收者及示例已同步更名。

## 当前状态与分支

- 双语正式版 [v0.8.2-zh](https://github.com/laity-cqf/headplane-zh-cn/releases/tag/v0.8.2-zh) 已发布并锁定。正式镜像使用 `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.2`，支持 amd64/arm64。
- 应用、服务端可见错误及完整文档支持 English / 简体中文；远端终端输出、原始诊断和配置字段保留原文。翻译检查及真实 Headscale 容器验收已通过。
- 只保留两条长期维护分支：`main` 跟随上游开发，`stable` 跟随最新已发布正式标签。新版本继续更新 `stable`，不新建长期版本分支。
- 各分支沿用对应上游功能、依赖、工具链和 Headscale 兼容矩阵。0.8 使用 VitePress、原有账号关联及访问控制编辑器；开发线使用 Fumadocs，不将新功能强行移植到旧版。
- 本地 `origin` 指向维护仓库，`upstream` 指向 `tale/headplane`。原空仓库 `laity-cqf/headscale-web-empty` 仅作历史留存。
- 双语文档保留源码、本地预览和 Release 快照；不部署托管文档站，不需要 Cloudflare 或托管凭据。

## 五个工作流

| 工作流        | 用途                                                      | 触发方式                   |
| ------------- | --------------------------------------------------------- | -------------------------- |
| Build         | 编译、单元及集成测试、Nix 检查、正式镜像双架构运行验收    | PR、main/stable 推送、手动 |
| Translations  | 语言键、文档配对和翻译复核指纹                            | PR、main/stable 推送、手动 |
| Docs          | 双语根路径及归档构建、类型检查、7 天临时预览产物          | PR、main/stable 推送、手动 |
| Upstream sync | 上游同步 PR、翻译跟踪 Issue；依赖变更时更新 Nix PNPM 哈希 | 每日、手动；依赖文件推送   |
| Release       | 正式发布、上传恢复、短镜像标签迁移和匿名拉取验收          | 新社区标签、手动           |

原独立容器检查并入 Build；文档检查及预览并入 Docs；发布恢复和公开验收并入 Release。不再运行上游专用的自动分流、标签、生命周期、过期提醒或 Pullfrog 工作流。检查和验收范围保留。

## 上游更新与汉化提醒

Upstream sync 每日北京时间约 09:27 检查上游。发现新提交或正式版本后，向固定维护分支创建合并 PR，并建立或更新分配给 `laity-cqf` 的翻译跟踪 Issue。同一提交不会反复创建 PR 或提醒；不会自动合并、发布或强推覆盖中文改动。

在 GitHub Watch 中订阅仓库或跟踪 Issue，按个人通知设置接收更新。仓库需启用 Issues、Actions 和 Actions 创建 PR 的权限。

默认使用 `GITHUB_TOKEN`。若同步包含工作流文件且 GitHub 拒绝默认令牌推送，配置限于本仓库的 `UPSTREAM_SYNC_TOKEN` Secret，授予 Contents、Pull requests、Issues、Workflows 所需写入权限。自定义令牌也用于 Nix 哈希自动提交，以便触发后续 CI；仅有默认令牌时，机器人提交不会自动触发新的工作流，发布前手动运行并核对精确提交验收。不要删除工作流同步来绕过权限错误。

将上游历史合并进维护分支，逐项检查英文和中文差异。保留手工冲突处理，不用上游提交强制覆盖汉化。同步提醒本身不代表翻译已完成。

## Docker 与版本规则

### 社区维护版 0.8.4

本次按维护者要求，单独发布社区镜像 `v0.8.4` 和 GitHub 发行 `v0.8.4-zh`。基础仍为上游 `v0.8.2`，不是上游 0.8.4，也不是官方中文版；`package.json` 保持真实上游版本。`.github/fork-release.json` 的 `communityRelease` 单独记录社区版本、对应的上游提交和双语发行说明。

更新内容：增加 Headscale 0.29 节点能力、随机端口、Taildrive／Peer Relay 应用授权、网络／SSH 测试与草稿校验、SSH check、认证审批，以及服务器生命周期、主备探测和客户端默认值的可视化设置。SSH 环境变量转发需 Headscale 0.29.7+ 和目标 Tailscale 1.104.4+。保留 0.8.3 的 JSON/HuJSON ACL、Grants 和子网网关列表。完整标签仍不可覆盖，仅发布普通 amd64/arm64 镜像。

后续同步上游时，先清除旧 `communityRelease`，或重新绑定到新上游提交。若上游版本号对应的社区镜像已发布，显式选择下一个未使用的社区补丁版本；不能覆盖历史 `v0.8.3` 或 `v0.8.4`。未记录独立社区版本时，发行工具默认沿用上游版本。

- 仓库：`ghcr.io/laity-cqf/headplane-zh-cn`。
- 后续仅构建和发布 Dockerfile 的 `final` 普通正式镜像；支持 `linux/amd64`、`linux/arm64`，不再发布调试版。
- Docker 完整标签：`vX.Y.Z`，例如 `v0.8.2`。不加 `-zh` 或修订号，完整标签不覆盖。`latest`、次版本别名 `0.8` 可随正式发行前移。
- GitHub Release/Git 标签：`vX.Y.Z-zh`，默认与上游对应，明确记录的社区维护版可使用独立补丁版本。每个完整社区版本只发布一次。Release 标题只显示标签；正文保留非官方声明和真实上游来源。
- 保留多阶段 Dockerfile、Agent、Go/WASM、健康检查、构建缓存和 provenance。镜像发布使用工作流 `GITHUB_TOKEN` 的 Packages、OIDC 和 Attestations 权限。
- 已发布的旧 `-zh` 标签、调试镜像和附件保持原样。`v0.8.2` 通过迁移指向原正式镜像的相同多架构摘要，不重新构建。

部署示例：

```yaml
image: ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4
```

## 正式发布

1. 合并最新上游正式标签到 `stable`，更新 `.github/fork-release.json` 的版本及 40 位提交；升级时先将 `publicationReady` 设为 false。
2. 完成双语翻译、文档和差异复核，保留对应上游工具链与兼容矩阵；运行本地检查和 CI。
3. Build 对普通正式镜像的 amd64/arm64 执行真实 Headscale 验收，检查平台、启动、健康、中英登录、API 密钥认证及登录后的设备页；arm64 使用 QEMU。容器矩阵从各分支标准测试定义读取，禁止伪造 Headscale。
4. 验收后设 `publicationReady=true`，适用的翻译 scope 必须完整。等待 **Build、Translations、Docs** 在同一个 `stable` 精确提交上的 push 检查全部成功。
5. 从干净且已验收的 `stable` 创建标签，仅推送该标签：

   ```bash
   node .github/scripts/fork-release.cjs tag
   # 使用命令实际输出的新标签，不重复使用已发行的 v0.8.2-zh
   git push origin refs/tags/vX.Y.Z-zh
   ```

6. Release 校验 stable、上游提交、翻译、CI 和未使用的 Docker 完整标签，再构建、上传并按摘要验收正式镜像。认证、限流、网络或服务器错误均不会被视为“镜像不存在”。`main` 的 development 通道禁止发布；禁止使用上游 `pnpm release cut` 或批量推送历史标签。
7. 先创建完整 draft、上传双语文档及摘要，再正式发布并验证 immutable 锁定。随后前移 latest/次版本别名，并匿名拉取 `vX.Y.Z` 在两个架构上运行真实 Headscale 验收。

Release 附件保留 `docs-root.tar.gz`、`docs-archive.tar.gz`、`release-manifest.json`、`SHA256SUMS`。源码使用 GitHub 自带 Source code ZIP/tar.gz；清单固定记录源码提交及源码归档 URL，后续不再上传重复的 `source.tar.gz`。历史 `v0.8.2-zh` 已锁定，原附件和校验和继续保留。GitHub 自带源码归档由平台提供，不能单独关闭。

保持 immutable releases 和合并后自动删除分支开启。不得移动已发行 Git 标签、覆盖 Docker 完整版本、使用 `--clobber` 或删除历史镜像、附件。发布后的汉化、打包与文档修正默认随下一个上游版本发行；明确要求提前交付时，按社区维护版规则使用新的未占用版本。分支文档只生成临时预览，不覆盖旧快照。

## Release 手动操作

在 Actions → Release → Run workflow 选择维护分支和操作，标签始终输入 GitHub 社区标签 `vX.Y.Z-zh`：

- `verify`：核对 immutable Release、源码 SHA、双语附件及全部校验和，匿名拉取普通正式镜像短标签，在 amd64/arm64 上验收中英访问及真实 Headscale。
- `short-tag`：为现有发行添加 `vX.Y.Z` 镜像标签；先验证不可变附件，复制原正式镜像 index 的原始字节，核对摘要及平台。目标存在且摘要相同则跳过；摘要不同或无法确认状态时停止。完成后自动执行匿名验收。
- `recover`：输入原失败 Release run ID，恢复“正式镜像已上传成功、原发布任务尚未执行”的运行。工具从维护分支读取，应用、文档和摘要仍固定到原标签及原运行。重新验收两个架构后发布完整 draft 并锁定；已有 Release/draft 时停止。不会重建或覆盖完整镜像。

失败时先检查原运行、镜像和 draft，再恢复未完成步骤。完整镜像已上传后不要盲目重跑构建；Release 已发布而别名更新失败时，只恢复别名，不重新发布。公开部署要求 GHCR 包可见性为 Public。

## 双语文档与检查

日常从仓库源码阅读；含组件页面使用 `pnpm docs:dev` 本地预览。正式快照从对应 Release 下载，解压并用静态 HTTP 服务打开；`docs-archive.tar.gz` 需挂载到版本次路径（例如 `/0.8/`），不需要运行 Headplane。GitHub/GHCR 留存依赖平台及管理员持续保留数据。

使用 `package.json` 中 engines 要求的 Node、pnpm：

```bash
pnpm install --frozen-lockfile
node --test .github/scripts/*.test.cjs
pnpm i18n:check
pnpm test:unit
pnpm typecheck
pnpm docs:build
```

路由、认证、Headscale API 等功能变化还需按 `AGENTS.md` 执行集成测试。检查翻译语义、命令及配置值后，仅复核改动项：

```bash
pnpm i18n:review --message common.dismiss
pnpm i18n:review --file docs/features/language.mdx
pnpm i18n:check
```

文档对使用当前分支英文路径（stable 使用 `.md`），参数可重复。不要全量刷新指纹绕过复核。范围及原始诊断限制见 `.github/I18N_AUDIT.zh-CN.md`。分支保护可将 Translation completeness and freshness 配为必需检查。
