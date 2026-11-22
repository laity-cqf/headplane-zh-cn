# Headscale 0.29 web management

This unofficial community fork adds forms for Headscale 0.29 management. Existing
configurations keep working, and opening a page does not enable a capability or
change the network. The additions below are maintenance-branch changes after
image `v0.8.3`; install a later release containing them when it becomes available.

## Policy capabilities and tests

Open **Access Control → Headscale 0.29 features**. Database policy mode and
permission to write policies are required to save. File-mode policies remain
read-only; the validation API can still check a draft.

| Setting               | Web control                                               | Effect                                                                                  |
| --------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `nodeAttrs`           | Add targets and capability names                          | Configure NextDNS, MagicDNS AAAA, client port randomization, and Taildrive capabilities |
| `randomizeClientPort` | Toggle the tailnet default                                | Request random client ports; this alone cannot guarantee direct connections             |
| `tests`               | Add a source, protocol, allowed/denied destination ports  | Assert the combined ACL/Grants policy behavior                                          |
| `sshTests`            | Add a source, destinations and accept/deny/check OS users | Assert SSH policy behavior without opening an SSH session                               |
| Grants `app`          | Edit capability JSON or insert a preset                   | Configure application authorization for Taildrive or peer relay                         |
| SSH `check`           | Select the action and check period                        | Require reauthentication; source nodes must be user-owned                               |
| SSH `acceptEnv`       | Add environment-variable names/patterns                   | Allow selected SSH environment variables on Headscale 0.29.7+                           |

Use **Preview rules → Validate draft on Headscale** before saving. Headscale runs
its policy parser and `tests`/`sshTests` using live users and nodes. Validation
does not persist the draft, replace the current policy, or test actual network
reachability. Save separately after the result is satisfactory. Failed assertions
are displayed with the original Headscale diagnostic and prevent saving.

Forms preserve unrelated rules and unknown fields. Structured editing rewrites
HuJSON and removes comments; use **Edit file** to retain hand-written comments.
An unrecognized section stays intact and must be corrected in the file editor.

### Taildrive and peer relay

For Taildrive, grant `drive:share` to file-serving nodes and `drive:access` to
accessing nodes with `nodeAttrs`. Add a Grant from the accessing identities to
the file-serving identities with `app` parameters such as:

```json
{
  "tailscale.com/cap/drive": [{ "shares": ["documents"], "access": "ro" }]
}
```

The Taildrive preset starts read-only; adjust the share list and access mode as
needed. Configure the actual shared directories on the file-serving Tailscale
client. A policy form cannot create filesystem shares on a remote node.

For peer relay, add the `tailscale.com/cap/relay` application capability to the
appropriate Grant and enable a relay server on a supported Tailscale client.
Forward the chosen relay UDP port when required by the network. Peer relay is
separate from DERP and from subnet-router primary/standby selection.

Headscale does not support Funnel or `nodeAttrs.ipPool`; these are not offered
as presets. Only use `acceptEnv` after upgrading SSH destination clients to
Tailscale 1.104.4 or newer, as required by the Headscale 0.29.7 release notes.

## Server settings

Open **Settings → Headscale settings** with identity/access configuration
permission. Mount `headscale.config_path` with write access to enable editing.
API-only deployments keep the server-settings form read-only.

- Set the default node key expiry, such as `180d` or `0`. It applies to future
  registrations and does not rewrite expiry on every existing device. Tagged
  nodes are exempt; client-requested or OIDC token expiry may take precedence.
- Set the ephemeral node inactivity timeout to more than `65s`.
- Set the HA probe interval to `0` to disable probing, or at least `2s`. When
  enabled, set its timeout to at least `1s` and less than the interval. Defaults
  are `10s` and `5s`. Both gateways must advertise and have approval for the
  same subnet. Probes check the control channel, not every LAN destination.
- Set the default client auto-update preference. Clients can override it;
  this does not force an immediate update.
- Enable or disable Taildrop. This is separate from Taildrive shares.

Saving writes the corresponding YAML keys. A configured Docker integration restarts Headscale. Other deployments, including
stable proc/Kubernetes integrations that only send SIGHUP, require a manual full
restart; SIGHUP does not apply these startup settings. Review the page's restart notice before saving.
Environment variables can override file values and must be changed outside
this form. Refresh stale forms before saving to avoid replacing newer settings.

## Authentication requests

Open **Settings → Authentication approvals**. Paste the full
`hskey-authreq-…` ID supplied by the requester, verify the request, then choose
**Approve request** or **Reject request**. The server reports nonexistent or
expired IDs. This requires identity/access configuration permission, and is
blocked for read-only roles and Headscale versions before 0.29.

Headscale has no API to list pending authentication sessions or retrieve the
requester's identity by ID. The page therefore cannot provide an automatic
approval queue. OIDC can continue to handle SSH check reauthentication. Register
new devices on the Machines page, where an owning user is selected; 0.29 uses
the JSON `/api/v1/auth/register` endpoint, while older servers keep their native
registration API.

Server listeners, TLS certificates, DERP/STUN listeners, public firewall rules,
client port mappings and remote shared directories still require deployment or
client configuration. The dashboard does not manage the host operating system.
