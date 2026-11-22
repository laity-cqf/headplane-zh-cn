# 会话入口 / Session entry

新会话先读本页和 [HISTORY.md](./HISTORY.md) 的最近记录，再按任务读取手册对应章节及受影响的源码。无需先扫描整个仓库。本文是当前状态索引，不替代对本次代码变更的检查。

Start here and read the newest history entries. Read the relevant manual sections and affected code, rather than scanning the entire repository. Keep this index and the history current after each task.

## 当前状态

- 仓库：<https://github.com/laity-cqf/headplane-zh-cn>，非官方中英双语 fork；上游为 `tale/headplane`，保留许可证及来源声明。
- 最新已核对正式版：[`v0.8.4-zh`](https://github.com/laity-cqf/headplane-zh-cn/releases/tag/v0.8.4-zh)，镜像 `ghcr.io/laity-cqf/headplane-zh-cn:v0.8.4`，支持 amd64／arm64。
- 发行源码：`28b94da361b005b1d8bca7d42ac0f3c1f4192a07`；真实上游 Headplane 基础为 `0.8.2`。社区镜像号、上游 Headplane 号和 Headscale 服务端号是三件不同的事。
- `main` 跟随开发，禁止发布；`stable` 交付正式版。`.cache/release-0.8` 是本机稳定分支的 worktree 目录，不是版本分支。
- `0.8.4` 已包含 ACL／Grants、子网网关列表及 Headscale 0.29 的节点能力、应用授权、策略测试／校验、SSH check、认证审批和服务器设置。
- 本次分支文档整理没有新建镜像，也不修改已锁定的发行附件；生产是否部署需另行核实。
- 核对日期：2026-11-22。开始工作时重新检查分支、状态及最新发行，不能一直沿用这个快照。

## 文件怎么用

| 位置                                                  | 用途／何时读取                                             |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| 本页                                                  | 当前状态、入口、常用定位；每个新会话先读                   |
| [HISTORY.md](./HISTORY.md)                            | 已做的修改、验证、待办和下一步；先读最近记录               |
| [MAINTENANCE.zh-CN.md](./MAINTENANCE.zh-CN.md)        | 中文完整维护流程；按章节读取                               |
| [MAINTENANCE.md](./MAINTENANCE.md)                    | 同一份维护流程的英文版，无需重复读两种语言                 |
| [AGENTS.md](../AGENTS.md)                             | 项目必须遵守的实现、测试和发行规则                         |
| `docs/`                                               | 安装、配置、功能、安全和贡献等用户／开发文档；只读相关主题 |
| `deploy/`（stable）                                   | 可用的 Docker Compose 部署模板                             |
| `app/server/README.md`、`ARCHITECTURE.md`（main）     | 服务端布局和设计约定；修改该区域时读取                     |
| `tests/README.md`（main）                             | 真实容器测试与 harness 使用说明                            |
| `.github/fork-release.json`、`workflows/`、`scripts/` | 机器使用的发布、同步和检查定义，不是可随意删除的说明文件   |
| `LICENSE`、README、CHANGELOG、安全／贡献说明          | 许可证、来源、入口和版本历史，保留                         |

旧维护说明、旧汉化进度和重复功能指南已经归并；历史内容仍可从 Git 历史和旧 Release 查看。`ydzw/` 是本地生产资料，不上传、不作为公开模板。

## 按任务定位

| 本次任务                | 手册章节／主要入口                                                        |
| ----------------------- | ------------------------------------------------------------------------- |
| 普通优化、修复          | 第 5～7 节；`app/routes/`、`app/utils/`、对应测试                         |
| 新增 Headscale API 能力 | 第 5～7、9 节；`app/server/headscale/api/capabilities.ts` 和 `resources/` |
| 汉化、文档更新          | 第 8 节；`app/i18n/`、文档页面、复核指纹                                  |
| 同步上游                | 第 9 节；Upstream sync PR／Issue、分支元数据                              |
| 构建、测试              | 第 10 节；当前分支 package、测试矩阵、Dockerfile                          |
| 正式发布、失败恢复      | 第 11～12 节；Release 工作流与脚本                                        |
| 配置、凭据、生产更新    | 第 13 节；先确认授权范围和实际环境                                        |

## 开始前的最小检查

在项目根目录执行，查看输出后再按需深入：

```powershell
git status --short --branch
git diff --stat
git diff --cached --stat
git worktree list
git log -3 --oneline
Get-Content .github/fork-release.json
```

只检查本次相关 CI。发布时必须重新核对最终 stable SHA 的 Build、Translations、Docs **push** 检查，不用旧记录替代。

### 本机提交工具

此前默认 Node 为 `20.18.0`，且默认 PATH 找不到 pnpm，导致项目提交钩子无法正常执行。已在用户目录 `AppData/Local/headplane-tools` 配置 Node `24.11.1`、pnpm `10.4.0` 和 gh。pnpm 入口及本机 Git 提交钩子会使用配套 Node；格式化和 lint 检查保持启用。这个本机工具选择写在 `.git/hooks/`，不提交绝对机器路径到仓库。

本机新终端需要直接执行 `node`、`gh` 等命令时，先选择项目工具链：

```powershell
$hpTools=Join-Path $env:LOCALAPPDATA 'headplane-tools/bin'
if (Test-Path (Join-Path $hpTools 'node.exe')) { $env:Path="$hpTools;$env:Path" }
node --version
pnpm --version
```

已有编辑器／Git GUI 可能仍保留旧 PATH，重新打开后再提交。其他机器按当前分支 `package.json` 安装工具，不依赖本机缓存或上述目录；不要为匹配旧 Node 而修改项目版本要求。

## 结束时记录什么

每次功能优化、升级、构建或发布后：

1. 更新本页的**当前状态**和明确的下一步，保持简短。
2. 在 `HISTORY.md` 顶部追加记录：任务、分支、实际变更、相关文件、验证、commit／PR／CI、发行／部署状态、未解决项。
3. 长期维护规则变化时，同步更新两份手册；普通小改动只追加历史，不复制整份项目说明。
4. 没做的验证写“未执行”及原因，不把合并、构建、发布、生产部署混为一谈；不写入密钥或生产配置全文。

新会话可直接使用：

```text
项目路径 E:\code\headplane。先读 AGENTS.md、session/README.md 和
session/HISTORY.md 的最近记录，再按任务查阅 session/MAINTENANCE.zh-CN.md。
保留现有改动，直接完成常规操作；不要先扫描整个项目。
本次需求：……
结束后更新 session 的状态和维护记录。
```
