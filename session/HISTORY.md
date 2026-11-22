# 维护记录 / Maintenance history

最新记录放在顶部。只记录实际完成和明确待办，使用 commit、PR 或 CI 链接定位细节，不复制代码或生产配置全文。重大记录提供英文摘要，完整维护规则见本目录手册。

Newest entries first. Record actual changes, validation, source references, release/deployment status and next steps. Do not include credentials or production configuration.

## 2026-11-22：会话目录、文档归并和提交工具

- **任务 / Scope**：建立 `session/` 统一入口，移动两份交接手册，集中保存后续优化记录，清理重复／失效文档并提交 GitHub。
- **实现 / Changes**：`session/README.md` 保存简短状态、文档用途及任务入口；本文件追加历史。维护手册继续保留中英两种语言。
- **清理 / Cleanup**：将旧 fork 发布说明和汉化审计方法归入手册；删除过时初次汉化进度。开发线重复的 ACL、用户、SSH 指南合并到对应正式功能页，更新导航和引用。稳定线的旧首次验收 JSON 由历史发行与真实 CI 链接代替，不再作为当前验收记录。
- **本地工具 / Tooling**：配置用户目录下的 Node 24.11.1、pnpm 10.4.0 和 gh；提交保留格式化／lint 钩子。系统 Node 20 不被强制替换，项目命令使用配套工具链。
- **本地资料 / Local material**：原有 CHANGELOG 中关于本地 Headscale／Dex 部署指南的记录属于 `ydzw/` 私有资料，不作为已发布功能说明；该信息保留在此。Git 和 Docker 构建上下文均排除 `ydzw/`。
- **验证 / Validation**：本地 main 325 项、stable 307 项单元测试通过，两条分支的翻译检查及文档构建通过。stable 完整汉化范围检查通过。本机无 Docker，集成和容器检查由本次源码提交对应的 GitHub CI 执行；查看该提交的 Checks 获取最终结果。
- **提交 / Source**：通过本记录的 Git 历史定位整理提交：`git log -3 --oneline -- session/HISTORY.md`。提交只更新维护分支，不创建新版本。
- **生产 / Production**：未操作生产服务，未改动已发行的 `v0.8.4` 镜像与附件。
- **下一步 / Next**：功能、上游版本或发行状态变化后，先更新本目录的状态与记录，再结束会话。

## 2026-11-22：完整维护手册

- `main` 提交：`0eaadb54e8288cb04dbd70b5640d1618d51802f6`；`stable` 提交：`eab8ad944b1f7ed58cec3d445439329a74ef1df0`。
- 增加两份中英文完整手册和 README／AGENTS 阅读入口，记录版本、架构差异、汉化、测试、构建、发布和恢复方法。
- 本地单元测试：main 325 项、stable 307 项通过；翻译与文档构建通过。
- main：[Build](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45021102810)、[Translations](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45021102798)、[Docs](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45021102797) 均成功。
- stable：[Build](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45021131335)、[Translations](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45021131329)、[Docs](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45021131342) 均成功。
- English: added bilingual maintenance manuals and verified both maintenance branches. Documentation changes were not republished into locked release assets.

## 2026-11-22：正式发行 v0.8.4-zh

- [Release](https://github.com/laity-cqf/headplane-zh-cn/releases/tag/v0.8.4-zh)，[完整发行验收](https://github.com/laity-cqf/headplane-zh-cn/actions/runs/45014011501) 成功。
- 发行源码 `28b94da361b005b1d8bca7d42ac0f3c1f4192a07`；真实上游基础 `0.8.2`／`05e3ee33f6d3b347013654c69186791347be8bd9`。
- 镜像 `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4`；摘要 `sha256:9cee931c497ca816e731eb36491c2efee90baa5a1bfe5e5cefdc20dc01a21533`；amd64／arm64。
- 加入 Headscale 0.29 节点能力、随机端口、应用 Grants、网络／SSH 测试和草稿校验、SSH check／环境变量转发、手动认证审批及服务器生命周期／HA／客户端设置。
- 双语说明和文档快照已附发行页，Release 不可变，匿名拉取及真实 Headscale 运行验收通过。SSH 环境转发要求 Headscale 0.29.7+ 和目标 Tailscale 1.104.4+。
- English: published the final dual-architecture image with bilingual Headscale 0.29 controls and full release acceptance. Publication does not establish the current production deployment version.

## 历史基线

- `v0.8.3-zh`：JSON／HuJSON 的 ACL、Grants、混合写法及子网网关列表；上游基础仍为 0.8.2。
- `v0.8.2-zh`：原发布线完整中英汉化。最初验收记录包含已退役调试镜像和旧工作流名称，仅作为历史证据；当前以五个工作流和精确提交验收为准。
- 账号由 `CM-Chenqf` 改为 `laity-cqf`；新链接／镜像使用新命名空间，旧不可变附件中的来源和校验和保留。
- 网络直连排查由用户暂时搁置，不自动作为当前开发任务。DERP 路径本身不能证明 UDP 被禁，不承诺面板升级会修复打洞。

## 新记录模板

```text
日期／任务：
目标分支与实际变更：
相关文件／源码提交／PR：
验证命令、结果、CI；未执行项及原因：
发行状态：未发布／处理中／已发布；标签和摘要：
生产状态：未操作／实际授权执行范围：
未解决项与下一步：
```
