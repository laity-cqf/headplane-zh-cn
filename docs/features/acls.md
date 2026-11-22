---
title: Access Control
description: Edit the Headscale ACL policy, tags and groups from the Headplane UI.
---

# Access Control

[简体中文](/zh-CN/features/acls)

This guide describes the **0.8 release line** of the unofficial `laity-cqf/headplane-zh-cn` fork, based on `tale/headplane` 0.8.2. The upstream MIT license and copyright notices are retained. This is not an official Chinese release of Headplane, Headscale or Tailscale.

Headscale stores its Access Control List (ACL) as a single HuJSON policy. The
**Access Control** page in Headplane exposes that policy in two ways: a
structured editor for the parts most people change day to day, and the raw file
editor for everything else.

## Requirements

The policy can only be written through the web UI when Headscale runs in
database policy mode:

```yaml
# Headscale config.yaml
policy:
  mode: database
```

In `file` mode the page is read-only and shows a notice explaining why. Editing
also requires the `write_policy` capability, which the `owner`, `admin` and
`network_admin` roles have.

## Rules

The **Rules** tab renders the policy as five lists:

- **Access rules** — the `acls` section. Each rule allows traffic from a set of
  sources to a set of destinations. Destinations include a port range, for
  example `tag:web:80,443`. A destination entered without one gets `:*`
  appended, since Headscale rejects a destination that has no port.
- **Grants** — the `grants` section. Destinations have no port; ports and
  protocols go in a separate field such as `tcp:443`. Optional `via` tags
  restrict which subnet routers or exit nodes handle the traffic. The list
  requires Headscale 0.29 or later; saving Grants on older versions is rejected.
  Application capabilities (`app`) are preserved and edited in the file.
- **Auto approvers** — the `autoApprovers` section. Approve routes or exit
  nodes advertised by specific users, groups or tags automatically. Approval
  does not grant clients access; use access rules or Grants for that.
- **SSH rules** — the `ssh` section, including `check` mode and its check
  period.
- **Hosts** — the `hosts` section, which names an IP address or CIDR range so
  rules can reference it.

Adding or editing an entry opens a dialog where sources and destinations are
built from chips. Every group, tag, host and Headscale user already known to
your tailnet is offered as a one-click suggestion, so rules can be written
without memorising the syntax.

## Subnet routes and automatic failover

Open **Subnet routes** to see gateways grouped by subnet, with their online,
advertisement and approval states. **Current primary** comes from Headscale's
reported primary routes. **Manage gateway** opens machine details to approve
or revoke routes using the existing permissions. Refresh fetches a new snapshot;
this page does not measure traffic or LAN health.

For automatic failover, advertise and approve the identical prefix on two or
more gateways that can reach the same LAN. For example, advertise
`10.0.0.0/16` on both `router-a` and `router-b`, approve it on both, and
keep the clients' subnet-route acceptance enabled. Headscale selects the
primary and handles failover. There is no fixed priority or load-balancing
control in this panel. Existing connections may need to reconnect after a switch.

The candidate count includes gateways that both advertise and have approval
for the prefix, including offline candidates. An online node may still have a
broken LAN connection. Test failover by taking one gateway offline and checking
access to the same internal service through the other; return it afterward.

Leave **Via** empty for ordinary failover. If an existing Grant restricts
traffic with `via`, ensure both gateways have a permitted tag; otherwise
that Grant can exclude the backup. The primary marker is the global
Headscale selection, not proof of the path used by every client.

These additions are maintenance-source changes. The immutable
`v0.8.2-zh` release and `v0.8.2` image retain their published contents;
formal images include corrections with the next upstream release.

## Tags and groups

The **Tags & Groups** tab manages the `groups` and `tagOwners` sections.

- **Groups** bundle Headscale users so rules can refer to a team. Members are
  written as `username@`, which is how Headscale references users in a policy.
- **Tags** identify machines by role rather than by owner. Each tag lists the
  users and groups allowed to assign it. The list also shows which machines
  currently carry the tag.

Tags must exist under `tagOwners` before they mean anything: assigning an
undeclared tag to a machine is allowed by Headscale, but no rule will ever match
it. The tag dialog on the **Machines** page flags such tags with a warning and
links back here.

Group membership can also be edited from the **Users** page: the row menu has an
**Edit groups** entry, and the groups a user belongs to are shown under their
name. Both surfaces write to the same `groups` section of the policy.

## Editing the file directly

The **Edit file** tab is the original CodeMirror editor over the raw policy, and
**Preview changes** shows a diff against the saved version. The structured
editors write into the same buffer, so a change made visually shows up in the
file editor and in the diff before it is saved.

Nothing is sent to Headscale until **Save** is pressed.

::: warning Comments are not preserved
HuJSON allows comments and trailing commas. Headplane reads them, but the
structured editors regenerate the policy text, which drops comments. The Rules
and Tags & Groups tabs show a notice when the loaded policy contains comments —
use the file editor if you want to keep them.
:::

Unknown top-level keys such as `nodeAttrs` and `tests` are preserved
untouched, so using the visual editor never silently drops parts of a policy
that Headplane does not model.

## Language, diagnostics and compatibility

Select English or Simplified Chinese in the dashboard header. Labels, dialogs,
permission notices, local validation, parse explanations, editor search and diff
controls follow that language. Switching languages does not submit or reset the
policy buffer or an open dialog draft. **Discard Changes** restores the saved
policy.

Policy keys, actions such as `accept` and `check`, usernames, aliases, IP
addresses, ports and duration values are never translated in the policy. Known
actions have translated display labels; unknown actions remain visible verbatim
and survive editing. Original JavaScript or Headscale parse diagnostics remain
visible alongside the localized explanation. A failed save does not replace the
saved policy.

**Preview rules** is an upstream placeholder and does not simulate network
access. Use **Edit file** for sections that have no form. Acceptance is determined by
the deployed Headscale version, not by switching the interface language. The
existing release-line integration matrix remains 0.27.0, 0.27.1, 0.28.0, 0.29.0
and 0.29.1; localization does not extend those versions' policy syntax.

If the policy cannot be parsed, the visual tabs show an explanation and the
file editor remains available for corrections. A missing file-mode policy has
a dedicated error page. Other API failures retain the original diagnostic
information. Full documentation localization and publication acceptance remain
in progress; see [language and maintenance](/features/language).
