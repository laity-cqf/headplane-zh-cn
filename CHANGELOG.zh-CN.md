# 下一版本（Next） {#next}

## 升级步骤 {#upgrading}

- 将社区镜像地址改为 `ghcr.io/laity-cqf/headplane-zh-cn`，保留原版本标签或摘要。GitHub 账号已更名，已发布镜像内容及应用数据不变。

## 变更 {#changes}

- 新增 Headscale 0.29 节点能力、随机端口、应用授权、网络／SSH 测试、认证审批及服务器生命周期／主备探测／客户端默认值的中英网页表单，支持不保存的服务器策略校验。0.29.7 起提供 SSH 环境变量转发配置。已有 v0.8.3 镜像保持不变，这些功能待新版本发布。

- 社区维护版 0.8.3 打包 JSON/HuJSON 策略的 ACL、Grants 编辑及子网网关列表，上游基础仍为 0.8.2。源码和发行清单保留真实上游版本，完整镜像标签仍不可覆盖。

- 访问控制新增按网段汇总的子网网关列表及 Headscale 返回的当前主用状态，支持 Grants、可选 via 标签及路由自动批准者的中英可视化编辑。保留显式空访问规则和应用能力，旧版 Headscale 保存前明确拒绝不支持的 Grants。

- 社区自动化精简为 5 个工作流；Docker 发行使用 `vX.Y.Z` 短标签，仅发布支持 amd64/arm64 的普通正式镜像。Release 标题仅显示标签；源码使用 GitHub 自带归档，附件继续保留双语文档、镜像摘要和校验和。

- 社区发行改用 `vX.Y.Z-zh`，不添加修订号，与上游版本对应。每个版本保留原镜像、源码和双语文档，后续修正随下一个上游版本发布。
- 社区完整镜像标签使用 `vX.Y.Z`；正式发布后仍提供 `latest`。双语文档保留源码、Release 快照、本地预览和 CI 构建产物，不再部署托管站点，也不需要文档部署凭据。
- 社区维护改用固定的 main/stable 分支及 vX.Y.Z-zh 发行标签。每个不可变发行保留源码、双语文档和镜像摘要，完整镜像版本不覆盖，升级无需新建长期分支。

- 社区维护的 0.8 分支现已支持 DNS、设置、浏览器 SSH 及完整 VitePress 文档、导航、搜索和历史更新日志的中英切换，切换语言保留表单草稿和 SSH 会话。Docker 运行及发布验收仍待完成；本次不启用镜像、发行版或文档部署。

- 社区维护的 0.8 分支现已支持访问控制及五类可视化编辑器、策略文件、差异和搜索、校验及诊断的中英切换，并附双语指南。切换语言保留草稿，策略字段、未知动作、权限及支持版本保持原样。本条记录时完整汉化及发布验收尚未完成。

- 社区维护的 0.8 分支现已支持用户、角色、所有权转移、账号关联、策略用户组和成员下载页的中英切换，并附本地化校验及指南。原认证、权限、表单字段和版本支持保持原样。本条记录时完整汉化及发布验收尚未完成。
- 社区维护的 0.8 分支现已支持设备列表、详情、筛选、管理弹窗、校验和操作提示、徽标、日期及配套指南。设备值、权限及兼容性检查保留原行为，本条记录时其余汉化仍在进行。
- 社区汉化 fork 更名为 `headplane-zh-cn`，仓库链接同步更改。README 明确非官方身份，并保留上游 MIT 许可证及来源。本条记录时汉化和发布验收尚未完成。
- 此 fork 的 0.8 线已支持登录、SSO 提示、公共导航和控件的中英切换。本条记录时其他页面和完整文档仍在适配，发布在完成适配和验收前保持关闭。

## 修复 {#fixes}

- 社区仓库链接、镜像示例、上游通知及发布自动化已改用 GitHub 新账号 `laity-cqf`。历史不可变发行仍按原始记录的所有者和校验和验收。

- 容器发行检查现按指定平台读取多架构镜像，并核对实际运行的 Node 架构。镜像上传成功但验收失败时，可通过恢复工作流验证并发布原始产物，无需重建镜像或修改版本标签。

- DNS 设置为只读时，禁用覆盖本地 DNS 的开关。

- 选择器向辅助技术暴露已翻译标签，包括 SSH 策略动作选择器。

- 用户行和 OIDC 删除提示不再嵌套段落，避免无效 HTML 和用户列表水合错误。
- 自定义表单错误对用户和辅助技术可见，设备菜单按钮保留双语可访问名称。

# 0.8.2（2026年10月22日） {#_0-8-2-october-22-2026}

本版包含重要安全更新，通过 Node.js 24.22.1 和 Go 1.27.3 防护[被攻陷的 eMudhra 中间 CA](https://emudhra.com/en/post/certificate-security-incident)。原生安装也应升级这些版本并重新构建 Agent。

## 修复 {#fixes-1}

- Docker 镜像使用 Node.js 24.22.1，Agent 使用 Go 1.27.3 构建（修复 [GHSA-jhh3-g853-mxjc](https://github.com/tale/headplane/security/advisories/GHSA-jhh3-g853-mxjc)，由 [@trouze](https://github.com/trouze) 报告）。
- 设备详情与设备列表一样要求设备读取权限。此前任何已登录用户都能通过地址直接打开。
- Agent 不再每次启动都创建新认证密钥，修复 Headscale 0.28 中重复注册设备的问题。
  - Agent 重用现有密钥，发现重复设备时会移除 Headscale 上的残留设备。
  - 增强重启与崩溃恢复能力，每 20 秒检测一次心跳以发现无响应 Agent。
  - Headplane 拒绝使用不可写的 Agent 工作目录。

---

# 0.8.1（2026年10月16日） {#_0-8-1-october-16-2026}

本版本修复在终止 HTTPS 的反向代理后运行时，操作返回 Bad Request 或 Unexpected Server Error 的问题。此前为绕过问题而重写 `Origin` 请求头的代理规则可以删除。

## 修复 {#fixes-2}

- 修复 0.8.0 后在终止 TLS 的反向代理后运行时，创建认证密钥等操作返回 Bad Request 或 Unexpected Server Error 的问题。此前作为临时措施添加的 `Origin` 重写规则可删除 (closes [#657](https://github.com/tale/headplane/issues/657), [#658](https://github.com/tale/headplane/issues/658)).
- 修复添加或取消分域 DNS 服务器后重新打开**添加 DNS 服务器**弹窗时，**限定域名**开关状态不正确的问题 (closes [#635](https://github.com/tale/headplane/issues/635)).
- 缺少 `server.base_url` 时，SSO 不再返回 Unexpected Server Error。启动时记录警告，并停用 SSO，直到配置 Headplane 公网 URL (closes [#585](https://github.com/tale/headplane/issues/585)).
- 日志说明 Headscale 请求失败原因，例如无法连接或 API 密钥被拒绝，不再输出 `[object Object]`。覆盖 API 密钥登录、SSO 后账号关联和 Agent 同步 (closes [#587](https://github.com/tale/headplane/issues/587), [#600](https://github.com/tale/headplane/issues/600)).
- 删除已关联 Headplane 账号的 Headscale 用户时会解除关联。此前账号仍指向已删除用户，显示原始 SSO ID 而非名称，也未标记为**未关联** (closes [#625](https://github.com/tale/headplane/issues/625)).

---

# 0.8.0（2026年10月13日） {#_0-8-0-october-13-2026}

从源码构建 Headplane 现在需要 Go 1.27.1 或更新版本。

## 变更 {#changes-1}

- 访问控制新增**规则**和**标签与用户组**结构化编辑器，无需编辑 HuJSON 即可修改 `acls`、`ssh`、`hosts`、`groups` 和 `tagOwners`。根据 tailnet 用户组、标签、主机别名和用户提供来源与目标建议。点击保存前不应用更改，其他内容仍可用文件编辑器。结构化编辑会移除注释，发生前会显示警告 (closes [#607](https://github.com/tale/headplane/issues/607), via [#608](https://github.com/tale/headplane/pull/608)).
- 用户页面显示所属策略用户组，可在行菜单中**编辑用户组**，需要 `write_policy` 权限。
- 设备标签弹窗会标记未在 `tagOwners` 声明的标签；Headscale 虽接受这些标签，但它们不会匹配任何规则。
- 添加 `config.oidc.jwks_endpoint`，支持手动指定 OIDC JWKs 密钥集 (via [#620](https://github.com/tale/headplane/pull/620)).
- Docker 镜像发布浮动次版本标签（例如 `0.8`），始终指向该次版本最新补丁，可在 `docker-compose.yml` 中固定次版本。

## 修复 {#fixes-3}

- 页脚在窄屏幕改为纵向排列，避免手机页面横向滚动 (closes [#648](https://github.com/tale/headplane/issues/648)).
- 预认证密钥、新设备、更改所有者及设备筛选等用户选择器按字母排序，与用户页面一致 (closes [#622](https://github.com/tale/headplane/issues/622)).
- 设备页用户、标签筛选等较长下拉菜单支持滚动，不再超出屏幕 (closes [#621](https://github.com/tale/headplane/issues/621)).
- 界面添加 DNS 记录时去除名称和值两端空白，避免此前悄然产生无法解析的记录 (closes [#647](https://github.com/tale/headplane/issues/647)).
- 修复启用 `oidc.disable_api_key_login` 时退出后几秒又自动登录的问题。退出页刷新后仍保持，并提供**重新登录**按钮 (closes [#642](https://github.com/tale/headplane/issues/642)).
- 修复重启后使用已有会话时，认证限制链接从设置中消失的问题 (closes [#645](https://github.com/tale/headplane/issues/645)).
- 修复明文 HTTP 下复制代码、属性和设备地址的问题，并在复制失败时提示 (closes [#597](https://github.com/tale/headplane/issues/597)).
- 更新 NPM 与 Go 依赖，修复安全漏洞。
- 修订过期且缺少步骤的原生安装文档 (via [#633](https://github.com/tale/headplane/pull/633)).

---

# 0.7.1（2026年8月27日） {#_0-7-1-august-27-2026}

## 变更 {#changes-2}

- **浏览器 SSH 模块改用 Tailscale 的 `tsconnect` 重构**，以减少错误并提高对后续 Tailscale 版本的兼容性。
- 新增 `integration.agent.tailscale_netns`，仅针对 Agent 允许关闭 Tailscale 套接字路由回环处理，适用于回退行为将 Headscale 连接固定到错误接口的部署。默认仍保持原行为。
- 设备菜单新增禁用/启用密钥过期操作（via [#554](https://github.com/tale/headplane/pull/554)）。Headscale 不独立保存开关状态，只保存到期时间，因此本版本重新启用过期会立即将节点标为过期。
- 支持 Docker API 1.24 及以上版本（Engine 1.12 及以上，包括 Podman 的 Docker 兼容 socket）。
- 创建或重命名用户前校验用户名，拒绝 Headscale 虽接受、但 ACL 永远无法匹配的名称 (closes [#502](https://github.com/tale/headplane/issues/502)).

## 修复 {#fixes-4}

- 修复无标签的 Headscale 构建被识别为 0.0.0 的问题。逐提交 `main-*` 和 `development` 镜像从 `/version` 返回 Go 伪版本号，现在将其视为未知版本，而非过旧版本 (via [#590](https://github.com/tale/headplane/pull/590)).
- 修复 Nix 下无法构建浏览器 SSH WASM 模块的问题 (via [#588](https://github.com/tale/headplane/pull/588)).
- 修复 `server.data_path`、`headscale.config_path`、`headscale.dns_records_path` 和 `headscale.tls_cert_path` 被静默转为小写的问题，避免含大写字母的路径指向错误位置 (closes [#612](https://github.com/tale/headplane/issues/612)).
- 修复 Agent 回退到交互式 Tailscale 登录的问题。现在使用预认证密钥启动、重启后保留状态，并在 Headscale 要求手动批准时自动批准自身 (closes [#582](https://github.com/tale/headplane/issues/582)).
- 修复预认证密钥有效期超过或等于 1000 天时的问题。数字框此前提交区域格式（`365,000`、`365 000`、`365.000`），导致 500 或有效期被截断。现在提交原始数字，服务端对无效有效期返回 400 (closes [#596](https://github.com/tale/headplane/issues/596)).

---

# 0.7.0

- 改用结构化 JSON 日志 (closes [#279](https://github.com/tale/headplane/issues/279)).
- 设备标签弹窗新增已有标签选择建议 (closes [#560](https://github.com/tale/headplane/issues/560)).
- 正确处理 Headscale 配置中的 `dns.extra_records_path` (closes [#543](https://github.com/tale/headplane/issues/543)).
- 修复 PostgreSQL 配置校验：提供 `password_file` 时不再要求 `pass` (closes [#528](https://github.com/tale/headplane/issues/528)).
- 浏览器 SSH 的 WASM DERP 探测支持自定义端口 (closes [#552](https://github.com/tale/headplane/issues/552)).
- 延长临时预认证密钥的到期窗口，并在界面显示创建错误，修复浏览器 SSH 密钥处理问题 (closes [#565](https://github.com/tale/headplane/issues/565)).
- 提交重命名前校验设备名称，修复重命名请求问题 (closes [#564](https://github.com/tale/headplane/issues/564)).
- 修复使用 `client_secret_basic` 重试 OIDC token 交换时的回退逻辑 (closes [#493](https://github.com/tale/headplane/issues/493)).
- 通过 `server.proxy_auth` 支持代理认证 (closes [#353](https://github.com/tale/headplane/issues/353)).
- 支持通过 `oidc.default_role` 为新 OIDC 用户分配默认角色，并通过 `oidc.role_claim` 读取身份提供商角色声明 (closes [#352](https://github.com/tale/headplane/issues/352)).
- 修复未配置分域 DNS 服务器时 DNS 页崩溃的问题 (closes [#570](https://github.com/tale/headplane/issues/570)).
- 用户列表显示 Headscale 显示名称，并将用户名保留为次要文字 (closes [#571](https://github.com/tale/headplane/issues/571)).
- 设备密钥注册弹窗支持注册 URL 和完整的 `hskey-authreq-...` 密钥 (closes [#579](https://github.com/tale/headplane/issues/579)).
- 修复无法通过界面向无用户的纯标签节点分配 ACL 标签的问题。标签弹窗的添加、移除按钮缺少 `type="button"`，导致本地状态更新前就提交表单，Headscale 收到未改变的标签列表。现在修改能正确发送 (closes [#574](https://github.com/tale/headplane/issues/574)).

---

# 0.7.0-beta.4（2026年5月31日） {#_0-7-0-beta-4-may-31-2026}

> 这是一个预览版本，请报告遇到的问题。

- **Headplane 现在需要 Headscale 0.27.0 或更新版本。** 不再支持 0.26.x。`/version`（0.27.0 引入）返回 404 时，记录错误并持续重试，原地升级 Headscale 后无需重启 Headplane 即可识别。
- **使用 `/version` 替代 OpenAPI 哈希检测。** 按报告版本推导能力，不再对 OpenAPI schema 取指纹，大幅简化检测并直接兼容全部受支持版本。
- **增强 Headscale 启动容错。** 即使 Headscale 不可达也能启动 Headplane，能力先采用宽松默认值，后台重试在服务响应后确定能力，避免 Docker Compose 冷启动顺序问题。
- **新增可选进程内 TLS 终止。** 设置 `server.tls_cert_path` 和 `server.tls_key_path` 后，可直接在 `server.port` 提供 HTTPS/1.1，无需反向代理。启用 TLS 时强制 `server.cookie_secure: true` 并警告，因为浏览器拒绝 HTTPS 下缺少 Secure 属性的 Cookie。进程内不支持 HTTP/2、HTTP/3，需要时在反向代理终止 (closes [#403](https://github.com/tale/headplane/issues/403)).
- **内置 Docker 健康检查自动适配 HTTP 和 HTTPS。** 启动时将包含协议、端口、基础路径的回环 URL 写入 `/tmp/headplane-listen`，`hp_healthcheck` 原样读取并探测。启用 TLS 或修改端口不再需单独调整健康检查。仅在设置 `HEADPLANE_LISTEN_FILE` 时写入文件（Dockerfile 已设置），原生部署不受影响。
- 用户页为未关联的 Headscale 用户新增重命名和删除操作，便于管理没有 Headplane 账号的用户 (closes [#525](https://github.com/tale/headplane/issues/525)).
- 新增[自定义证书颁发机构](/configuration/tls#custom-certificate-authorities)文档，通过 Node 的 `NODE_EXTRA_CA_CERTS` 为 OIDC、Headscale、Docker 等全部出站 TLS 连接信任私有或自签名 CA，替代此前重建镜像扩展系统信任库的临时方法 (closes [#313](https://github.com/tale/headplane/issues/313)).
- 修复未关联 Headplane 用户在关联、改角色、转移所有权时使用错误 ID 类型的问题。表单明确区分 `headplane_user_id` 与 `headscale_user_id`，认证层不再通过 Headscale 反查 OIDC subject。
- 修复设备注册弹窗将数字用户 ID 而非用户名传给 Headscale 的问题。`RegisterNodeRequest.user` 是由 `GetUserByName` 查找的字符串，不回退到数字 ID；此前显示名与数字 ID 不同时会注册失败 (closes [#532](https://github.com/tale/headplane/issues/532)).
- 修复 Headscale 0.27.x 预认证密钥过期操作。0.28 前的端点接收 `uint64 user`，API 层从 `key.user?.id` 读取，但调用者此前传 `{ name: user }`，导致用户字段为空。现在正确传递 Headscale 数字 ID。
- 限制弹窗内容高度并支持滚动，避免面板超出视口 (via [#556](https://github.com/tale/headplane/pull/556)).
- 修复弹窗滚动容器裁剪输入框和按钮焦点边框的问题。
- 修复设备表格最后一行提示被视口裁剪的问题，提示定位到触发器上方并保留碰撞间距 (closes [#508](https://github.com/tale/headplane/issues/508)).
- 修正文档 Docker 健康检查示例，添加必需的 `CMD` 前缀，避免反向代理误判容器不健康 (closes [#535](https://github.com/tale/headplane/issues/535)).

---

# 0.7.0-beta.3（2026年5月14日） {#_0-7-0-beta-3-may-14-2026}

> 这是一个预览版本，请报告遇到的问题。

- 修复 GHSA-vgj6-hcf2-fqf6：Headscale 节点和用户重命名 API 调用中的路径遍历及 RBAC 绕过漏洞。

---

# 0.6.3（2026年5月14日） {#_0-6-3-may-14-2026}

- 修复 GHSA-vgj6-hcf2-fqf6：Headscale 节点和用户重命名 API 调用中的路径遍历及 RBAC 绕过漏洞。

---

# 0.7.0-beta.2（2026年4月9日） {#_0-7-0-beta-2-april-9-2026}

> 这是一个预览版本，请报告遇到的问题。

- **重构用户模型，支持 Headplane 与 Headscale 账号关联。** OIDC 用户按 subject 和邮箱自动关联；无法自动关联时可在接入流程认领未关联 Headscale 用户。详情见 [SSO 文档](/features/sso) (via [#489](https://github.com/tale/headplane/pull/489)).
- **重构浏览器 SSH**，采用 [Ghostty WASM](https://restty.pages.dev) 终端，改进会话处理并支持自定义 DERP 端口，详情见[浏览器 SSH 文档](/features/ssh) (closes [#515](https://github.com/tale/headplane/issues/515), closes [#386](https://github.com/tale/headplane/issues/386)).
- **重新设计 Headplane Agent 架构**，采用周期同步和广泛缓存，自动生成临时预认证密钥（需要 Headscale 0.28 及以上）。详情见 [Agent 文档](/features/agent) (closes [#350](https://github.com/tale/headplane/issues/350), closes [#455](https://github.com/tale/headplane/issues/455)).
- **使用新 OIDC 实现替代 `openid-client`。** 修复 Google SSO 等提供商无法使用 `client_secret_basic` 的问题 (closes [#493](https://github.com/tale/headplane/issues/493), closes [#516](https://github.com/tale/headplane/issues/516)).
- **全部界面组件由 react-aria 迁移至 [Base UI](https://base-ui.com)。**
- **统一 Headscale API 密钥配置**为 `headscale.api_key`（及 `headscale.api_key_path`）。`oidc.headscale_api_key` 已弃用，目前仍作为回退读取，未来版本将移除。
- 设备列表新增用户、标签、状态和路由筛选 (via [#507](https://github.com/tale/headplane/pull/507), closes [#506](https://github.com/tale/headplane/issues/506)).
- 支持审计员自助创建预认证密钥 (via [#478](https://github.com/tale/headplane/pull/478), closes [#453](https://github.com/tale/headplane/issues/453)).
- 新增 `/settings/agent` 状态页，显示同步状态、节点数和错误。
- 设备详情新增本地端点和地址信息。
- 改进 ACL 编辑器外观，修复 CodeMirror 版本不匹配。
- 将 OIDC 头像存入数据库，避免 Cookie 容量溢出 (via [#510](https://github.com/tale/headplane/pull/510), closes [#326](https://github.com/tale/headplane/issues/326)).
- 提前检测不支持的 Docker API 版本，并显示清晰错误 (via [#497](https://github.com/tale/headplane/pull/497)).
- 修复到期时间为零值的节点未显示永不过期徽标的问题 (via [#527](https://github.com/tale/headplane/pull/527), closes [#526](https://github.com/tale/headplane/issues/526)).
- 修复首位 OIDC 登录用户未获得所有者角色的问题 (via [#480](https://github.com/tale/headplane/pull/480), closes [#266](https://github.com/tale/headplane/issues/266)).
- 登录错误改为显示表单校验提示，不再抛出服务器错误 (via [#475](https://github.com/tale/headplane/pull/475), closes [#474](https://github.com/tale/headplane/issues/474)).
- 修复 Headscale 0.28 及以上的预认证密钥过期操作 (closes [#519](https://github.com/tale/headplane/issues/519)).
- 修复 Auth0 等在用户 ID 中包含特殊字符的提供商的 OIDC subject 匹配 (closes [#428](https://github.com/tale/headplane/issues/428)).
- 修复部分代码路径未统一使用 `headscale.api_key` 的问题。
- 修复 Agent HostInfo 未按 `cache_ttl` 定期刷新 (via [#477](https://github.com/tale/headplane/pull/477), closes [#427](https://github.com/tale/headplane/issues/427)).
- 修复重启时清空 Agent 工作目录的问题。
- 修复 SSE controller 关闭后仍被使用的竞态。
- 修复生成 Cookie 密钥使用错误字节长度的问题 (via [#501](https://github.com/tale/headplane/pull/501)).
- 修复 OIDC 配置错误的故障排查链接 (via [#518](https://github.com/tale/headplane/pull/518), closes [#517](https://github.com/tale/headplane/issues/517)).
- 修复已弃用的 Nix 包属性 (via [#521](https://github.com/tale/headplane/pull/521)).
- 更新 NixOS 模块选项：移除弃用 Agent 字段，新增 `headscale.api_key_path` 和 `integration.agent.executable_path`。

---

# 0.6.2（2026年2月26日） {#_0-6-2-february-26-2026}

- **支持 Headscale 0.28.0**，包含全部 API 和数据模型变更。
- 设备列表新增搜索和列排序 (closes [#351](https://github.com/tale/headplane/issues/351)).
- 支持 Headscale 0.27.0 和 0.27.1
- 打包除原生模块外的全部 `node_modules`，减小构建产物和容器体积 (closes [#331](https://github.com/tale/headplane/issues/331)).
- 构建时可选择是否编译 SSH WASM 集成 (closes [#337](https://github.com/tale/headplane/issues/337)).
- 支持通过自定义脚本调整构建，详情见 `./build.sh --help`。
- 登录页尝试提示不正确的 Cookie 配置。
- 支持配置 `server.cookie_max_age` 和 `server.cookie_domain` (closes [#348](https://github.com/tale/headplane/issues/348)).
- 重构配置加载系统，包含以下增强：
  - 可以不使用配置文件，仅通过环境变量运行 (closes [#150](https://github.com/tale/headplane/issues/150)).
  - 从头重构敏感值文件路径加载，提高可靠性 (closes [#334](https://github.com/tale/headplane/issues/334)).
  - 增加配置加载的测试和校验
- 重构 OIDC 集成，遵循正确标准，并向用户呈现更多错误信息。
  - 弃用 `oidc.redirect_uri` 和自动回调 URL 检测，改为正确设置 `server.base_url`。
  - 显式增加 `oidc.use_pkce`，正确确定 PKCE 配置。
  - `oidc.token_endpoint_auth_method` 改为可选并尝试自动检测，检测不可用时默认 `client_secret_basic` (closes [#410](https://github.com/tale/headplane/issues/410)).
  - 新增 `oidc.enabled`，显式控制 OIDC 是否启用 (via [#463](https://github.com/tale/headplane/pull/463)).
- 移除多条过于冗长或频繁的日志。
- 更新使用的最低 Docker API，以支持最新 Docker 版本 (via [#370](https://github.com/tale/headplane/pull/370)).
- 设备标签弹窗新增可分配标签的下拉列表 (via [#362](https://github.com/tale/headplane/pull/362)).
- 修复网站图标无法正确加载的问题 (closes [#323](https://github.com/tale/headplane/issues/323)).
- 正确处理 Headscale 0.27 及以上版本拒绝无效 ACL 策略的情况 (closes [#383](https://github.com/tale/headplane/issues/383)).
- 防止设备将所有者更改为自身当前所有者 (closes [#373](https://github.com/tale/headplane/issues/373)).
- 新增 `/admin/api/info` 路由；配置 `server.info_secret` 后，该路由可公开敏感信息 (closes [#324](https://github.com/tale/headplane/issues/324)).
- 用户页面在适用时正确应用 Gravatar 头像 (closes [#405](https://github.com/tale/headplane/issues/405)).
- 设备注册密钥长度不是 24 个字符时不再允许注册 (closes [#415](https://github.com/tale/headplane/issues/415)).
- 修复应用中部分移动端 CSS 问题 (closes [#401](https://github.com/tale/headplane/issues/401)).
- 为容器添加 Docker 健康检查 (closes [#411](https://github.com/tale/headplane/issues/411)).
- 加强 `/proc` 集成校验，正确发现 Headscale PID。
- 为初次无响应的 OIDC 提供商增加延迟重试逻辑 (closes [#423](https://github.com/tale/headplane/issues/423)).
- 修复 Headscale 0.28.0-beta.1 及以上的 API 密钥登录 (closes [#429](https://github.com/tale/headplane/issues/429)).
- 修复 Headscale 0.28 及以上版本无法使用预认证密钥界面的问题。
- 支持在 Headscale 0.28 及以上创建纯标签预认证密钥 (via [#465](https://github.com/tale/headplane/pull/465)).
- Headscale 0.28 及以上不按用户筛选列出全部预认证密钥，旧版本回退到逐用户获取 (via [#466](https://github.com/tale/headplane/pull/466)).
- 修复 Headscale 0.28 及以上无用户的纯标签节点处理 (via [#467](https://github.com/tale/headplane/pull/467)).
- 适配 Headscale 0.28 移除节点所有权变更功能的变化 (via [#436](https://github.com/tale/headplane/pull/436)).
- 修复无用户名 OIDC 用户的预认证密钥不显示的问题 (via [#470](https://github.com/tale/headplane/pull/470)).
- 修复 Headscale 0.28 更长 bcrypt token 导致预认证密钥显示截断的问题 (closes [#435](https://github.com/tale/headplane/issues/435)).
- 修复 Nix systemd 服务未使用用户指定软件包的问题 (via [#454](https://github.com/tale/headplane/pull/454)).
- 界面版本改为从 Git 标签和构建参数获取，不再使用 `package.json`，修复预览及 nightly 构建版本显示错误。
- 改进无访问权限用户的页面 (via [#469](https://github.com/tale/headplane/pull/469)).

---

# 0.6.1（2025年10月12日） {#_0-6-1-october-12-2025}

- **Headplane 支持在浏览器中通过 SSH 连接设备。**
  - 这是实验性功能，需要先配置 `integration.agent`。
  - 基于运行于 WebAssembly 的 Go 程序，终端界面使用 Xterm.js。
- 开始使用位于 `/var/lib/headplane/hp_persist.db` 的新 SQLite 数据库文件。
  - 数据库不存在时自动创建。
  - 当前保存 SSH 连接详情和 Agent HostInfo。
  - 用户信息从旧数据库自动迁移。
- Docker 容器改用 distroless 镜像 (closes [#255](https://github.com/tale/headplane/issues/255)).
  - 提供以 root 运行且包含 shell 的调试镜像：`ghcr.io/tale/headplane:<version>-shell`。
- 移除分域 DNS 记录不再导致客户端无法解析整个分域 (closes [#231](https://github.com/tale/headplane/issues/231)).
- 重新提供覆盖 Headscale 本地 DNS 设置的开关 (closes [#236](https://github.com/tale/headplane/issues/236)).
- Dockerfile 优先使用交叉编译，加快构建并继续支持多架构。
- 为 Docker 镜像增加构建证明，用于验证 SLSA 来源。
- 改进 `/proc` 集成的 PID 推断准确性 (via [#219](https://github.com/tale/headplane/pull/219)).
- 未提供用户名时正确回退到邮箱 (via [#257](https://github.com/tale/headplane/pull/257)).
- 支持通过文件路径加载敏感配置值 (via [#283](https://github.com/tale/headplane/pulls/283))
  - `server.cookie_secret_path` 等选项可覆盖 `server.cookie_secret`
  - 这些路径支持插入环境变量
  - 完整参考见[文档](https://github.com/tale/headplane/blob/main/docs/Configuration.md#sensitive-values)
- 修复 Nix overlay 中 SSH 模块的构建 (via [#282](https://github.com/tale/headplane/pull/282))
- 构建流程改用 TypeScript Go 和 Rolldown Vite，提高构建及类型检查性能。
- Cookie 改用加密 JWT，保护 API 密钥机密（_GHSA-wrqq-v7qw-r5w7_）
- 设置 `oidc.profile_picture_source` 为 `gravatar` 后可使用 Gravatar 作为 OIDC 头像来源 (closes [#232](https://github.com/tale/headplane/issues/232)).
- OIDC 支持传递多种自定义参数：
  - 可覆盖 `oidc.authorization_endpoint`、`oidc.token_endpoint` 和 `oidc.userinfo_endpoint`，以支持非标准提供商或无自动发现的场景 (closes [#117](https://github.com/tale/headplane/issues/117)).
  - 通过 `oidc.scope` 自定义 scope，默认为 `openid email profile`。
  - 通过 `oidc.extra_params` 向授权端点传递任意查询参数 (closes [#197](https://github.com/tale/headplane/issues/197)).

---

# 0.6.0（2025年5月25日） {#_0-6-0-may-25-2025}

- Headplane 0.6.0 需要 **Headscale 0.26.0** 或更新版本。
  - 支持路由和预认证密钥的破坏性 API 变更 (closes [#204](https://github.com/tale/headplane/issues/204)).
  - 旧版本 Headscale 不再兼容 Headplane。

- 可以在设置界面管理 OIDC 授权限制。 (closes [#102](https://github.com/tale/headplane/issues/102))
  - 需要 **IT 管理员**或**管理员/所有者**角色，并能访问 Headscale 配置。
  - 修改会写入 Headscale 配置文件的 `oidc.allowed_{domains,groups,users}` 字段。
- 完全重构预认证密钥页面 (closes [#179](https://github.com/tale/headplane/issues/179), [#143](https://github.com/tale/headplane/issues/143)).
- Headplane Agent 作为集成提供 (closes [#65](https://github.com/tale/headplane/issues/65)).
  - Agent 作为嵌入进程与 Headplane 服务一起运行，上报主机信息和系统指标。
  - 详细说明及启用方法见配置文件的 `integrations.agent` 段。
- 将 `/admin` 请求重定向到 `/admin/`，避免 React Router 问题，也支持自定义前缀（closes [#173](https://github.com/tale/headplane/issues/173)）。
- 简化登录页，分别报告一般错误和 API 密钥不正确的问题 (closes [#186](https://github.com/tale/headplane/issues/186)).
- 重构设备操作后端，改进错误处理并提供更多信息 (closes [#185](https://github.com/tale/headplane/issues/185)).
- 设备标签显示子网路由或出口节点待批准状态，以及过期已禁用状态。
- 修复因 Headscale API 变更而将到期状态错误显示为永不过期的问题。
- 增加设备重命名校验，阻止无效提交 (closes [#192](https://github.com/tale/headplane/issues/192)).
- 未托管的非 OIDC 用户不能分配角色，因此禁用对应菜单项。
- 支持通过标签发现 Docker 容器 (via [#194](https://github.com/tale/headplane/pull/194)).
- DNS 页面支持 AAAA 记录 (closes [#189](https://github.com/tale/headplane/issues/189)).
- 支持 Headscale 配置中的 `dns.extra_records_path` (closes [#144](https://github.com/tale/headplane/issues/144)).
- `proc` 集成现在检查 `headscale serve` 命令，以收紧进程匹配（参见 [#195](https://github.com/tale/headplane/pull/195)）。
- 移除 OIDC `client_secret_path` 文件内容中的换行 (closes [#199](https://github.com/tale/headplane/issues/199)).

---

# 0.5.10（2025年4月4日） {#_0-5-10-april-4-2025}

- 修复跳过接入流程的偏好影响所有用户的问题。

---

# 0.5.9（2025年4月3日） {#_0-5-9-april-3-2025}

- 预认证密钥页过滤空用户，避免未迁移用户可能导致崩溃。
- OIDC 用户不能重命名，已禁用对应菜单项。
- 抑制含日期字段的水合错误。

---

# 0.5.8（2025年4月3日） {#_0-5-8-april-3-2025}

- 可按需跳过接入页面。
- 管理面板新增修改用户角色的界面。
- 修复集成抛错而无法正确加载的问题。
- 加载 ACL 页不再向 Headscale 数据库反复发送空更新（fixes [#151](https://github.com/tale/headplane/issues/151)）
- 在 Docker 容器中自动创建 `/var/lib/headplane`（fixes [#166](https://github.com/tale/headplane/issues/166)）
- `disable_api_key_login: true` 时，退出 OIDC 后不再自动重新登录（fixes [#149](https://github.com/tale/headplane/issues/149)）

---

# 0.5.7（2025年4月2日） {#_0-5-7-april-2-2025}

- 紧急修复静态资源未在 `/admin` 或自定义前缀下提供的问题。

---

# 0.5.6（2025年4月2日） {#_0-5-6-april-2-2025}

### 重要提示 [#important]

> 使用 Google OIDC 的部署**请尽快升级**。此前任何发现 Headplane 地址的账号都拥有 tailnet 管理权限。此变更默认不给新登录者分配权限。需要重新登录 Headplane，生成所有者账号，阻止未授权访问。

为 OIDC 实现正确的认证方式。
这是一次大型更新，采用与 Tailscale 相似的权限系统。
权限不从 OIDC 自动推导，可在界面中配置。
不同角色拥有不同能力，限制对管理面板各部分的访问。
新用户默认是 `member`，禁止访问管理界面。
没有用户时，首位用户获得不能移除的 `owner` 角色。

**变更**：

- 内部服务改用 `hono`，提高性能。
- 修复弹窗每三秒随机重新获得焦点的问题。
- 标签页失去焦点时不发送 API 请求。
- 继续放宽 Headscale 配置要求，属于持续改进的一部分。
- Headplane 配置中的未知值不再引起崩溃。
- 修复复制命令中出现多余空格的问题（fixes [#161](https://github.com/tale/headplane/issues/161)）

---

# 0.5.5（2025年3月18日） {#_0-5-5-march-18-2025}

- 紧急修复没有可用 Agent 时 Headplane 崩溃的问题

---

# 0.5.4（2025年3月18日） {#_0-5-4-march-18-2025}

- 修复 Kubernetes 文档笔误
- 处理 Headscale 未配置分域及全局 DNS 记录的情况 (via [#129](https://github.com/tale/headplane/pull/129))
- 设备注册不再检查 `mkey:` 前缀 (via [#131](https://github.com/tale/headplane/pull/131))
- 修复 OIDC 认证未使用 `user_info` 端点信息的问题。
- 可用时显示当前 OIDC 登录用户的头像。
- 重写 Agent 实现，提高磁盘利用率和性能（当时尚待推出）。
- 放宽过于严格的 Headscale 配置校验，不再要求某些可选字段。
- 删除节点后正确重定向到节点页（fixes [#137](https://github.com/tale/headplane/issues/137)）
- 支持通过 TLS 连接 Headscale，并可提供证书文件（部分修复 [#82](https://github.com/tale/headplane/issues/82)）
- 新增通过 Nix 运行 Headplane 的方式，当时尚不提供支持保证 (via [#132](https://github.com/tale/headplane/pull/132))
- 可通过配置中的 `oidc.client_secret_path` 传入 OIDC 客户端密钥（fixes [#126](https://github.com/tale/headplane/issues/126)）
- 正确处理不同区域格式的数字输入（fixes [#125](https://github.com/tale/headplane/issues/125)）

---

# 0.5.3（2025年3月1日） {#_0-5-3-march-1-2025}

- 修复 OIDC scope 配置键预期错误的问题（fixes [#111](https://github.com/tale/headplane/issues/111)）
- 为必填输入增加 ARIA 标记，并修复确认按钮（fixed [#116](https://github.com/tale/headplane/issues/116)）
- 修正文档将 Docker socket 默认值误写为 `/var/run/docker.dock` 的笔误 (via [#112](https://github.com/tale/headplane/pull/112))

---

# 0.5.2（2025年2月28日） {#_0-5-2-february-28-2025}

- 紧急修复服务端 bundle 在每次请求时重新加载的问题

---

# 0.5.1（2025年2月28日） {#_0-5-1-february-28-2025}

- 修复服务启动时整体崩溃的问题
- 修复 Docker 发布的语义化版本标签
- 修复 Kubernetes 集成未读取配置的问题

---

# 0.5（2025年2月27日） {#_0-5-february-27-2025}

> 这是一次大规模重构，包含重要的破坏性变更。
> 全部设置改用配置文件，不再使用环境变量。
> 新配置格式见 [config.example.yaml](https://github.com/laity-cqf/headplane-zh-cn/blob/stable/config.example.yaml)。

- 从头重新设计界面，改善无障碍和性能。
- 改用配置文件设置（属于破坏性变更，新格式见 [config.example.yaml](https://github.com/laity-cqf/headplane-zh-cn/blob/stable/config.example.yaml)）。
- 配置只读时仍显示选项，但禁止修改（fixes [#48](https://github.com/tale/headplane/issues/48)）
- 支持 Headscale 0.25.0，不再支持更早版本。
- 修复通过用户操作无法重命名、删除或更改节点所有者的问题（fixes [#91](https://github.com/tale/headplane/issues/91)）
- 显著简化操作内部流程，并改进错误处理。
- 更新到 `pnpm` 10 和 Node.js 22。
- 此前共用的 `public_url`、`oidc` 等设置在 Headplane 和 Headscale 中独立配置。这是较大的破坏性变更，但解决了仅希望 Tailscale 使用 Headscale OIDC、而不希望 Headplane 界面使用它的场景。
- 弃用 Docker 的 `latest` 标签，改用明确版本；nightly 构建使用 `edge`。

---

# 0.4.1（2025年1月18日） {#_0-4-1-january-18-2025}

- 紧急修复 OIDC 重定向 URI 不匹配的问题。

---

# 0.4.0（2025年1月18日） {#_0-4-0-january-18-2025}

- 从 Remix.run 切换到 React Router
- 修复部分非必填配置被标记为必填的问题（fixes [#66](https://github.com/tale/headplane/issues/66)）
- 修复通知被页脚遮挡的问题（fixes [#68](https://github.com/tale/headplane/issues/68)）
- 页脚模糊显示 Headscale URL，保护隐私
- 更新到 React Compiler 的下一稳定测试版本
- `/healthz` 改用已知端点，不再尝试无效 API 密钥
- 支持通过 `OIDC_REDIRECT_URI` 强制指定重定向 URI
- 重做 OIDC 集成，改善错误处理与配置
- Headscale 不可达时妥善处理，不再导致管理面板崩溃
- 可重复使用的预认证密钥使用后不再显示为过期（PR [#88](https://github.com/tale/headplane/pull/88)）
- 调整部分界面 CSS 问题

---

# 0.3.9（2024年12月6日） {#_0-3-9-december-6-2024}

- 修复 OIDC 校验代码中的竞态

---

# 0.3.8（2024年12月6日） {#_0-3-8-december-6-2024}

- 新增小型 HTML 页脚，展示登录页信息并链接到捐赠页面。
- 允许创建有效期超过 90 天的预认证密钥（fixes [#58](https://github.com/tale/headplane/issues/58)）
- 校验 OIDC 配置，并在通过变量或 Headscale 配置指定时按设置跳过校验（fixes [#63](https://github.com/tale/headplane/issues/63)）

---

# 0.3.7（2024年11月30日） {#_0-3-7-november-30-2024}

- 可通过 `OIDC_CLIENT_SECRET_METHOD` 自定义 OIDC token 端点认证方法（fixes [#57](https://github.com/tale/headplane/issues/57)）
- 新增 `/healthz` 端点，用于 Kubernetes 等健康检查（fixes [#59](https://github.com/tale/headplane/issues/59)）
- `HEADSCALE_URL` 指向内部地址时，可通过 `HEADSCALE_PUBLIC_URL` 指定公网地址（fixes [#60](https://github.com/tale/headplane/issues/60)）
- 修复复制设备注册命令中的笔误。

---

# 0.3.6（2024年11月20日） {#_0-3-6-november-20-2024}

- 修复选择下拉框无法滚动的问题（fixes [#53](https://github.com/tale/headplane/issues/53)）
- 新增将设备注册命令复制到剪贴板的按钮（fixes [#52](https://github.com/tale/headplane/issues/52)）

---

# 0.3.5（2024年11月8日） {#_0-3-5-november-8-2024}

- 快速修复服务端忽略环境变量的问题。
- 移除持续提示 Cookie 缺失的错误，因为退出登录后本就没有 Cookie。

---

# 0.3.4（2024年11月7日） {#_0-3-4-november-7-2024}

- 点击用户页中的设备名称可进入设备概览。
- 完全重构生产服务端，使其在 Docker 外运行更顺畅且更轻量；从 `@remix-run/serve` 切换为自定义服务端。
- 修复此前未运行类型检查而引入的多处问题。
- 改进 Docker 外运行 Headplane 的文档和支持。
- 移除分域 DNS 记录不再报错（fixes [#40](https://github.com/tale/headplane/issues/40)）
- 移除设备最后一个 ACL 标签不再报错（fixes [#41](https://github.com/tale/headplane/issues/41)）
- 界面完整支持出口节点，并重新设计设备页面（fixes [#36](https://github.com/tale/headplane/issues/36)）
- 增加基础检查，判断 Cookie 传递的 API 密钥是否无效。

---

# 0.3.3（2024年10月28日） {#_0-3-3-october-28-2024}

- 设置 `LOAD_ENV_FILE=true` 环境变量后，可从当前工作目录加载 `.env`。
- 修复区域格式错误导致非英文环境无法创建预认证密钥的问题
- 切回 CodeMirror 6，提高 ACL 编辑器性能
- 修复编辑 ACL 策略时界面内容被还原的问题（fixes [#34](https://github.com/tale/headplane/issues/34)）
- 更新到 React 19 Compiler 的下一稳定测试版本（[了解更多](https://react.dev/learn/react-compiler)）

---

# 0.3.2（2024年10月11日） {#_0-3-2-october-11-2024}

- 支持创建预认证密钥和使其过期（fixes [#22](https://github.com/tale/headplane/issues/22)）
- 修复设备注册未按预期工作的问题（fixes [#27](https://github.com/tale/headplane/issues/27)）
- 进一步移除 MagicDNS 主机名中的用户名引用（fixes [#35](https://github.com/tale/headplane/issues/35)）
- 处理 PostgreSQL 等数据库中设备过期时间为 `null` 的情况。
- 使用 `X-Forwarded-Proto` 和 `Host` 请求头构建 OIDC 回调 URL。

---

# 0.3.1（2024年10月3日） {#_0-3-1-october-3-2024}

- 修复 Docker 集成自定义 socket 路径支持的回归。
- 可在设备页使用设备密钥（`nodekey:...`）注册设备。
- 通过 `DEBUG=true` 环境变量启用调试日志。

---

# 0.3.0（2024年9月25日） {#_0-3-0-september-25-2024}

- 最低支持的 Headscale 版本提高到 0.23。
- 界面遵循 `dns.use_username_in_magic_dns` 设置。

---

# 0.2.4（2024年8月24日） {#_0-2-4-august-24-2024}

- 移除集成中的 ACL 管理，因为 Headscale 0.23-beta2 已原生支持。
- 移除不再需要的 `ACL_FILE` 环境变量。
- 新增 `COOKIE_SECURE=false` 环境变量，允许 Cookie 在非 HTTPS 下使用。
- 修复移除分域 DNS 配置时界面崩溃的问题。

---

# 0.2.3（2024年8月23日） {#_0-2-3-august-23-2024}

- 最低所需 Headscale 版本改为 0.23-beta2
- 支持 Headscale 0.23-beta1 新 API 策略模式
- 切换到 Headscale 0.23-beta2 的新 DNS 配置（fixes [#29](https://github.com/tale/headplane/issues/29)）
- 已定义 OIDC 环境变量时，不再使用配置文件中的值（fixes [#24](https://github.com/tale/headplane/issues/24)）

---

# 0.2.2（2024年8月2日） {#_0-2-2-august-2-2024}

- 新增基于 `shareProcessNamespace` 共享 PID 的 Kubernetes 集成。
- 新增显示类别、级别和时间戳的日志工具。
- 重新实现集成系统，提高容错并记录更多信息。
- 修复 /proc 集成获取到 `undefined` PID 的问题。

---

# 0.2.1（2024年7月7日） {#_0-2-1-july-7-2024}

- 支持管理 tailnet 自定义 DNS 记录。
- 可通过设备菜单更改设备 ACL 标签。
- 修复 ACL 编辑器未正确显示差异的问题。
- 修复 ACL 编辑器的放弃更改按钮无效的问题。

---

# 0.2.0（2024年6月23日） {#_0-2-0-june-23-2024}

- 修复设备页的设备下拉选项无效的问题。
- 除用户页外，也可从设备下拉菜单更改所有者。

---

# 0.1.9（2024年6月2日） {#_0-1-9-june-2-2024}

- 切换到 Monaco 编辑器，提供正确的 HuJSON 和 YAML 语法高亮。
- 设备概览使用 Magic DNS 主机名。
- 修复设备到期问题。
- 新增 `ghcr.io/tale/headplane:edge` 标签的 nightly 构建

---

# 0.1.8（2024年6月2日） {#_0-1-8-june-2-2024}

- 实现按设备 ID 显示设备概览的基础功能。
- 可能修复了禁用到期的设备时间戳处理不正确的问题。
- 用户仍拥有设备时，禁止删除用户。
- 修复时间戳错误使用 `Date` 而非 `string` 的类型问题。

---

# 0.1.7（2024年5月30日） {#_0-1-7-may-30-2024}

- 支持 `HEADSCALE_INTEGRATION` 变量，允许不使用 Docker 的高级集成。
- 修复 Headscale 配置中 `expiry` 字段可能导致崩溃的问题。
- 放宽严格配置加载器的要求，提高灵活性。
- 新增 `HEADSCALE_CONFIG_UNSTRICT`=true，回退到更宽松的配置加载器。
- Headplane 上下文改为启动时加载一次，不再延迟加载。
- 改进日志与错误传递，便于调试。

---

# 0.1.6（2024年5月22日） {#_0-1-6-may-22-2024}

- 实验性支持不使用 Docker 的高级集成。
- 修复 Docker 集成读取 `process.env.API_KEY` 而非上下文导致的崩溃。
- 修复 OIDC 流程未遵循 `ROOT_API_KEY` 导致的崩溃。

---

# 0.1.5（2024年5月20日） {#_0-1-5-may-20-2024}

- 增强配置处理，基于 Headscale 来源提供回退。
- 基于配置文件的 OIDC 支持 `client_secret_path`。
- `DISABLE_API_KEY_LOGIN` 正确处理非 true 的值。
- 为明确含义，将 `API_KEY` 更名为 `ROOT_API_KEY`，旧变量仍可使用。
- 修复按钮响应函数未被实际调用的问题，预期可修复 ACL 页面。

---

# 0.1.4（2024年5月15日） {#_0-1-4-may-15-2024}

- 可在用户页创建、重命名和删除用户。
- 可在用户之间拖动设备，更改所有权。
- 登录页正确遵循 `DISABLE_API_KEY_LOGIN` 变量。
- 修复若干可能导致弹窗使页面卡住的问题。
- 升级到 React 19 beta 以使用编译器，如引发问题可能回退。
- 升级其他依赖

---

# 0.1.3（2024年5月4日） {#_0-1-3-may-4-2024}

- 为界面采用更合适的图标集。
- 浏览器支持时使用稳定的滚动条预留空间。
- 整理页首代码，修复请求失败可能使整个应用崩溃的问题。

---

# 0.1.2（2024年5月1日） {#_0-1-2-may-1-2024}

- 支持重命名设备、使设备过期、移除设备及管理路由。
- 增加设备到期检查，并在设备表格中显示状态。
- 修复未启用 Docker 集成时仍必须设置 `HEADSCALE_CONTAINER` 才能启动的问题。
- 除使用 OIDC 认证外，不再要求提供根 `API_KEY`。
- 切换到 [React Aria](https://react-spectrum.adobe.com/react-aria/)，改善无障碍支持。
- 清理多处界面不一致及可抽象复用的重复组件。
- 为此后的新版本增加更新日志。
