import { useEffect, useState } from "react";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Link from "~/components/link";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import TokenList from "~/components/token-list";
import { Message, useI18n } from "~/i18n/provider";
import { KNOWN_SSH_ACTIONS, type SshRule } from "~/utils/acl-policy";
import { stringList } from "~/utils/policy-extensions";

interface SshRuleDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  rule?: SshRule;
  sources: string[];
  destinations: string[];
  onSave: (rule: SshRule) => void;
  supportsCheck: boolean;
  supportsAcceptEnv: boolean;
}

const EMPTY: SshRule = { action: "accept", src: [], dst: [], users: [], extra: {} };
const SSH_USERS = ["root", "autogroup:nonroot"];

export default function SshRuleDialog({
  isOpen,
  setIsOpen,
  rule,
  sources,
  destinations,
  onSave,
  supportsCheck,
  supportsAcceptEnv,
}: SshRuleDialogProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<SshRule>(rule ?? EMPTY);

  useEffect(() => {
    if (isOpen) {
      setDraft(rule ? structuredClone(rule) : structuredClone(EMPTY));
    }
  }, [isOpen, rule]);

  const isInvalid = draft.src.length === 0 || draft.dst.length === 0 || draft.users.length === 0;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={isInvalid}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
          setIsOpen(false);
        }}
      >
        <Title>{t(rule ? "acls.editSshRule" : "acls.newSshRule")}</Title>
        <Text>
          <Message
            id="acls.sshDescription"
            values={{
              docs: (
                <Link external styled to="https://tailscale.com/kb/1193/tailscale-ssh">
                  {t("acls.sshDocs")}
                </Link>
              ),
            }}
          />
        </Text>
        <Select
          items={[
            { value: "accept", label: t("acls.acceptOption") },
            ...(supportsCheck || draft.action === "check"
              ? [{ value: "check", label: t("acls.checkOption") }]
              : []),
            // An action we do not know is listed as-is so it survives an edit.
            ...(KNOWN_SSH_ACTIONS.includes(draft.action)
              ? []
              : [
                  { value: draft.action, label: t("acls.unknownAction", { action: draft.action }) },
                ]),
          ]}
          label={t("acls.action")}
          onValueChange={(value) => setDraft({ ...draft, action: value ?? draft.action })}
          value={draft.action}
        />
        <TokenList
          description={t("acls.sshSourcesDescription")}
          emptyText={t("acls.noSources")}
          label={t("acls.sources")}
          onChange={(src) => setDraft({ ...draft, src })}
          placeholder="group:ops"
          suggestions={sources}
          values={draft.src}
        />
        <TokenList
          description={t("acls.sshDestinationsDescription")}
          emptyText={t("acls.noDestinations")}
          label={t("acls.destinations")}
          onChange={(dst) => setDraft({ ...draft, dst })}
          placeholder="tag:server"
          suggestions={destinations}
          values={draft.dst}
        />
        <TokenList
          description={t("acls.sshUsersDescription")}
          emptyText={t("acls.noSshUsers")}
          label={t("acls.sshUsers")}
          onChange={(users) => setDraft({ ...draft, users })}
          placeholder="autogroup:nonroot"
          suggestions={SSH_USERS}
          values={draft.users}
        />
        {draft.action === "check" ? (
          <Input
            description={t("acls.checkPeriodDescription")}
            label={t("acls.checkPeriod")}
            onChange={(checkPeriod) =>
              setDraft({ ...draft, checkPeriod: checkPeriod.length > 0 ? checkPeriod : undefined })
            }
            placeholder="12h"
            value={draft.checkPeriod ?? ""}
          />
        ) : null}
        {supportsAcceptEnv || "acceptEnv" in draft.extra ? (
          <TokenList
            description={t("policy29.acceptEnvDescription")}
            emptyText={t("policy29.empty")}
            label={t("policy29.acceptEnv")}
            onChange={(acceptEnv) => setDraft({ ...draft, extra: { ...draft.extra, acceptEnv } })}
            placeholder={t("policy29.acceptEnvPlaceholder")}
            suggestions={["LANG", "LC_*"]}
            values={stringList(draft.extra.acceptEnv) ?? []}
          />
        ) : null}
      </DialogPanel>
    </Dialog>
  );
}
