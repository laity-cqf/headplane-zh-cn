export default {
  "policy29.acceptEnvPlaceholder": "For example, LANG or LC_*",
  "control.auth.idPlaceholder": "Full hskey-authreq-… ID",
  "control.writeFailed":
    "The configuration could not be written. Check the mounted file permissions and Headplane logs.",
  "policy29.title": "Headscale 0.29 features",
  "policy29.description":
    "Configure node capabilities and policy tests. Changes remain a draft until Save; use server validation before applying them.",
  "policy29.version": "This feature requires Headscale 0.29 or newer.",
  "policy29.randomize": "Randomize client ports",
  "policy29.randomizeDescription":
    "Set randomizeClientPort for the tailnet. Individual nodes can also opt in with the randomize-client-port attribute. This does not guarantee direct connectivity.",
  "policy29.nodeAttrs": "Node capabilities (nodeAttrs)",
  "policy29.nodeAttrsDescription":
    "Grant string capabilities to selected nodes, including NextDNS, MagicDNS AAAA, Taildrive and client port randomization. Funnel, IP pools and admin/owner targets are unsupported by Headscale.",
  "policy29.tests": "Network policy tests",
  "policy29.testsDescription":
    "Assert allowed and denied destination ports for one source. Headscale evaluates both ACLs and Grants against its current users and nodes. Tests are assertions, not new access rules.",
  "policy29.sshTests": "SSH policy tests",
  "policy29.sshTestsDescription":
    "Assert accept, deny or check-mode access for login users from one source to destination tags or users. These test SSH rules separately from network access; they do not open an SSH connection.",
  "policy29.rawRequired":
    "This section has an unrecognized structure. Edit it in the policy file tab; the original data is retained.",
  "policy29.empty": "No entries",
  "policy29.field.src": "Source",
  "policy29.field.proto": "Protocol (optional)",
  "policy29.field.target": "Target nodes",
  "policy29.field.targetDescription":
    "Users, groups, tags, hosts, prefixes, *, autogroup:member or autogroup:tagged.",
  "policy29.field.attr": "Capabilities",
  "policy29.field.attrDescription":
    "Enter capability names, such as nextdns:profile-id, drive:share or drive:access. Client-side setup may also be needed.",
  "policy29.field.dst": "SSH destinations",
  "policy29.field.dstDescription":
    "Destination tags or users, without ports. Headscale validates supported destination selectors.",
  "policy29.field.accept": "Expected allowed access",
  "policy29.field.acceptDescription":
    "For network tests, enter destinations with ports (10.82.138.99:30001). For SSH tests, enter OS login users.",
  "policy29.field.deny": "Expected denied access",
  "policy29.field.denyDescription":
    "Access that must remain blocked. A failed assertion prevents the policy from being saved.",
  "policy29.field.check": "Expected SSH check access",
  "policy29.field.checkDescription":
    "OS login users that must require reauthentication through an SSH check rule.",
  "policy29.app": "Application capabilities (app JSON)",
  "policy29.appDescription":
    "Enter an object mapping capability names to arrays of JSON parameters. Supports Taildrive and peer relay. New grants start without IP permissions; select protocols/ports only when network access is needed. An app-only grant can leave them empty. Client setup is still required.",
  "policy29.taildrivePreset": "Add Taildrive read-only preset",
  "policy29.relayPreset": "Add peer relay preset",
  "policy29.acceptEnv": "Forward SSH environment variables",
  "policy29.acceptEnvDescription":
    "Allow names or patterns such as LANG and LC_*. Requires Headscale 0.29.7+ and Tailscale 1.104.4+ on SSH destination nodes. Only forward values intended for the destination.",
  "policy29.check": "Validate draft on Headscale",
  "policy29.checkDescription":
    "Validate syntax and run tests/sshTests against live Headscale users and nodes without saving or changing network policy. Passing tests does not prove real network connectivity.",
  "policy29.checked": "Headscale validation passed. The draft was not saved.",
  "policy29.rejected": "Headscale rejected the policy. The saved policy was retained.",
  "control.title": "Headscale settings",
  "control.description":
    "Manage Headscale 0.29 node lifecycle, high availability probes and client defaults. Values come from the mounted configuration file; environment variable overrides take precedence.",
  "control.forbidden": "Permission to configure identity and access is required.",
  "control.invalid": "The form is incomplete or contains repeated or invalid fields.",
  "control.invalidSettings": "Check these settings and their duration limits: {fields}",
  "control.readOnly":
    "Mount the Headscale configuration file with write access to edit server settings. API-only deployments can still edit database policies.",
  "control.stale":
    "The settings changed since this form was loaded. Reload the page before saving.",
  "control.upstream": "Headscale could not complete the operation: {message}",
  "control.nodeExpiry": "Default node key expiry",
  "control.nodeExpiryDescription":
    "Positive duration, such as 180d, or 0 for no default expiry. Applies to future registrations; tagged nodes are exempt. OIDC token expiry or client requests can take precedence.",
  "control.ephemeralTimeout": "Ephemeral node inactivity timeout",
  "control.ephemeralTimeoutDescription":
    "Duration longer than 65s, such as 30m. Offline ephemeral nodes are removed after this interval.",
  "control.haInterval": "HA gateway probe interval",
  "control.haIntervalDescription":
    "At least 2s, or 0 to disable probing. Only applies when multiple gateways advertise the same subnet. Default: 10s.",
  "control.haTimeout": "HA gateway probe timeout",
  "control.haTimeoutDescription":
    "At least 1s and shorter than the probe interval when probing is enabled. Default: 5s. This measures control-channel reachability, not reachability of every subnet server.",
  "control.autoUpdate": "Default client auto-update",
  "control.autoUpdateDescription":
    "Advertise auto_update.enabled as the client default. Clients may override this choice; this does not force an immediate update.",
  "control.taildrop": "Taildrop file transfer",
  "control.taildropDescription":
    "Enable Headscale's Taildrop capability. Taildrop and Taildrive are separate features; this does not configure Taildrive shares.",
  "control.restartNotice":
    "Saving writes the YAML configuration. A configured Docker integration restarts Headscale; otherwise restart Headscale manually, including with the stable proc/Kubernetes integrations. Opening this page does not change existing values.",
  "control.save": "Save server settings",
  "control.saved": "Settings saved and the Headscale integration applied the change.",
  "control.restartRequired": "Settings saved. Restart Headscale manually to apply them.",
  "control.restartFailed":
    "Settings were saved, but Headscale could not be restarted or verified. Check its logs and restart it manually.",
  "control.auth.title": "Authentication approvals",
  "control.auth.description":
    "Approve or reject a pending Headscale authentication request, including SSH check requests. Register a new device from the Machines page, where its owning user can be selected.",
  "control.auth.noList":
    "Headscale does not expose a pending-request list or identity lookup API. Obtain the exact request ID from the requesting user and verify the request before approving it.",
  "control.auth.id": "Authentication request ID",
  "control.auth.idDescription":
    "Paste the full hskey-authreq-… ID from the Headscale authentication page. A nonexistent or expired request returns an error.",
  "control.auth.invalid": "Enter a complete hskey-authreq-… authentication request ID.",
  "control.auth.approve": "Approve request",
  "control.auth.reject": "Reject request",
  "control.auth.approved": "The authentication request was approved.",
  "control.auth.rejected": "The authentication request was rejected.",
} as const;
