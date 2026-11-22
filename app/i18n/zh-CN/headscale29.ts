export default {
  "policy29.acceptEnvPlaceholder": "例如 LANG 或 LC_*",
  "control.auth.idPlaceholder": "完整的 hskey-authreq-… ID",
  "control.writeFailed": "配置文件写入失败，请检查挂载文件的权限和 Headplane 日志。",
  "policy29.title": "Headscale 0.29 功能",
  "policy29.description":
    "配置节点能力与策略测试。修改在点击保存前均为草稿，可先交给服务器校验再应用。",
  "policy29.version": "此功能需要 Headscale 0.29 或更高版本。",
  "policy29.randomize": "随机客户端端口",
  "policy29.randomizeDescription":
    "为整个网络设置 randomizeClientPort。也可通过 randomize-client-port 节点属性单独启用。此设置不能保证建立直连。",
  "policy29.nodeAttrs": "节点能力（nodeAttrs）",
  "policy29.nodeAttrsDescription":
    "向指定节点分配字符串能力，包括 NextDNS、MagicDNS AAAA、Taildrive 与随机客户端端口。Headscale 尚不支持 Funnel、IP 地址池以及 admin/owner 目标。",
  "policy29.tests": "网络策略测试",
  "policy29.testsDescription":
    "断言某个来源可访问或不可访问的目标端口。Headscale 使用当前用户和节点同时检查 ACL 与 Grants。测试用于验证规则，不会额外授予访问权限。",
  "policy29.sshTests": "SSH 策略测试",
  "policy29.sshTestsDescription":
    "断言某个来源到目标标签或用户的系统登录账号应被允许、拒绝或要求重新验证。SSH 规则测试与网络连通性测试相互独立，不会实际发起 SSH 连接。",
  "policy29.rawRequired": "此段配置含有无法识别的结构，请在“编辑文件”中修改；原始数据会保留。",
  "policy29.empty": "暂无条目",
  "policy29.field.src": "来源",
  "policy29.field.proto": "协议（可选）",
  "policy29.field.target": "目标节点",
  "policy29.field.targetDescription":
    "支持用户、用户组、标签、主机、网段、*、autogroup:member 或 autogroup:tagged。",
  "policy29.field.attr": "节点能力",
  "policy29.field.attrDescription":
    "输入能力名称，例如 nextdns:配置ID、drive:share 或 drive:access。部分能力还需要在客户端进行配置。",
  "policy29.field.dst": "SSH 目标",
  "policy29.field.dstDescription":
    "输入不带端口的目标标签或用户，由 Headscale 校验目标选择器是否受支持。",
  "policy29.field.accept": "预期允许的访问",
  "policy29.field.acceptDescription":
    "网络测试填写带端口的目标，例如 10.82.138.99:30001；SSH 测试填写操作系统登录账号。",
  "policy29.field.deny": "预期拒绝的访问",
  "policy29.field.denyDescription": "必须保持阻断的访问。断言失败会阻止策略保存。",
  "policy29.field.check": "预期要求 SSH 重新验证的账号",
  "policy29.field.checkDescription": "填写必须通过 SSH check 规则重新验证身份的操作系统登录账号。",
  "policy29.app": "应用能力（app JSON）",
  "policy29.appDescription":
    "填写“能力名称 → JSON 参数数组”的对象，支持 Taildrive 与 Peer Relay。新建 Grant 默认不授予 IP 权限；需要网络访问时再选择协议与端口，仅含应用能力的 Grant 可留空。仍需完成相应客户端配置。",
  "policy29.taildrivePreset": "添加 Taildrive 只读预设",
  "policy29.relayPreset": "添加 Peer Relay 预设",
  "policy29.acceptEnv": "转发 SSH 环境变量",
  "policy29.acceptEnvDescription":
    "允许 LANG、LC_* 等变量名或模式。需要 Headscale 0.29.7+，且 SSH 目标节点使用 Tailscale 1.104.4+。仅转发允许目标读取的变量。",
  "policy29.check": "在 Headscale 上校验草稿",
  "policy29.checkDescription":
    "使用当前 Headscale 用户和节点检查语法，并运行 tests/sshTests；不保存、不修改网络策略。测试通过不代表实际网络一定连通。",
  "policy29.checked": "Headscale 校验通过，草稿尚未保存。",
  "policy29.rejected": "Headscale 拒绝了此策略，已保存的策略保持不变。",
  "control.title": "Headscale 设置",
  "control.description":
    "管理 Headscale 0.29 的节点生命周期、主备网关探测与客户端默认设置。页面读取挂载的配置文件；环境变量覆盖项优先生效。",
  "control.forbidden": "需要身份与访问配置权限。",
  "control.invalid": "表单不完整，或存在重复、无效字段。",
  "control.invalidSettings": "请检查以下设置及其时长限制：{fields}",
  "control.readOnly":
    "修改服务器设置需要以可写方式挂载 Headscale 配置文件。仅通过 API 连接时，仍可编辑数据库中的策略。",
  "control.stale": "页面加载后设置已发生变化，请刷新页面后再保存。",
  "control.upstream": "Headscale 未能完成操作：{message}",
  "control.nodeExpiry": "默认节点密钥有效期",
  "control.nodeExpiryDescription":
    "填写 180d 等正数时长，或填 0 表示默认不过期。适用于之后的注册，标签节点不受此限制。OIDC 令牌有效期或客户端请求可能优先生效。",
  "control.ephemeralTimeout": "临时节点离线清理时长",
  "control.ephemeralTimeoutDescription":
    "必须大于 65s，例如 30m。临时节点离线超过此时长后将被删除。",
  "control.haInterval": "主备网关探测间隔",
  "control.haIntervalDescription":
    "至少 2s，填 0 则关闭探测。仅在多台网关宣告相同子网时生效，默认 10s。",
  "control.haTimeout": "主备网关探测超时",
  "control.haTimeoutDescription":
    "开启探测时必须至少 1s，且小于探测间隔，默认 5s。探测检查控制通道响应，不代表子网内每台服务器均可访问。",
  "control.autoUpdate": "默认启用客户端自动更新",
  "control.autoUpdateDescription":
    "通过 auto_update.enabled 下发客户端默认值。客户端可以自行覆盖，不会强制立即更新。",
  "control.taildrop": "Taildrop 文件传输",
  "control.taildropDescription":
    "启用 Headscale 的 Taildrop 能力。Taildrop 与 Taildrive 是不同功能，此开关不会配置 Taildrive 共享目录。",
  "control.restartNotice":
    "保存会写入 YAML；已配置平台集成时会重启 Headscale，否则需手动重启。仅打开页面不会修改现有设置。",
  "control.save": "保存服务器设置",
  "control.saved": "设置已保存，Headscale 平台集成已应用修改。",
  "control.restartRequired": "设置已保存，请手动重启 Headscale 使其生效。",
  "control.restartFailed": "设置已保存，但重启或健康确认失败。请检查 Headscale 日志并手动重启。",
  "control.auth.title": "认证请求审批",
  "control.auth.description":
    "批准或拒绝待处理的 Headscale 认证请求，包括 SSH check 请求。新设备请在“设备”页面注册，以便选择所属用户。",
  "control.auth.noList":
    "Headscale 未提供待审批列表或请求身份查询 API。请从请求者处取得准确的请求 ID，核对请求后再批准。",
  "control.auth.id": "认证请求 ID",
  "control.auth.idDescription":
    "粘贴 Headscale 认证页面中的完整 hskey-authreq-… ID。请求不存在或已过期时会显示错误。",
  "control.auth.invalid": "请输入完整的 hskey-authreq-… 认证请求 ID。",
  "control.auth.approve": "批准请求",
  "control.auth.reject": "拒绝请求",
  "control.auth.approved": "已批准该认证请求。",
  "control.auth.rejected": "已拒绝该认证请求。",
} as const;
