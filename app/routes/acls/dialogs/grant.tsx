import { useState } from "react";

import Button from "~/components/button";
import Link from "~/components/link";
import TokenList from "~/components/token-list";
import { Message, useI18n } from "~/i18n/provider";
import { isValidTagName, type Grant } from "~/utils/acl-policy";
import { parseAppCapabilities, withAppCapabilities } from "~/utils/policy-extensions";

import JsonField from "../components/json-field";
import EditorDialog from "./editor-dialog";

interface GrantDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  grant?: Grant;
  sources: string[];
  destinations: string[];
  onSave: (grant: Grant) => void;
}

const EMPTY: Grant = { src: [], dst: [], ip: ["*"], via: [], extra: {} };
const IP_SUGGESTIONS = ["*", "tcp:22", "tcp:80", "tcp:443", "udp:53", "icmp"];

export default function GrantDialog({
  isOpen,
  setIsOpen,
  grant,
  sources,
  destinations,
  onSave,
}: GrantDialogProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<Grant>(() => structuredClone(grant ?? EMPTY));
  const [appText, setAppText] = useState(() => JSON.stringify(grant?.extra.app ?? {}, null, 2));
  const app = parseAppCapabilities(appText);

  // A grant that only carries app capabilities has no `ip`.
  const isInvalid =
    draft.src.length === 0 ||
    draft.dst.length === 0 ||
    app === undefined ||
    (draft.ip.length === 0 && Object.keys(app ?? {}).length === 0);

  return (
    <EditorDialog
      description={
        <Message
          id="acls.grantDescription"
          values={{
            docs: (
              <Link external styled to="https://tailscale.com/kb/1324/grants">
                {t("acls.grantsGuide")}
              </Link>
            ),
          }}
        />
      }
      isDisabled={isInvalid}
      isOpen={isOpen}
      onSubmit={() => {
        if (app) onSave({ ...draft, extra: withAppCapabilities(draft.extra, app) });
      }}
      setIsOpen={setIsOpen}
      title={t(grant ? "acls.editGrant" : "acls.newGrant")}
    >
      <TokenList
        description={t("acls.sourcesDescription")}
        emptyText={t("acls.noSources")}
        label={t("acls.sources")}
        onChange={(src) => setDraft({ ...draft, src })}
        placeholder="group:eng"
        suggestions={sources}
        values={draft.src}
      />
      <TokenList
        description={t("acls.grantDestinationsDescription")}
        emptyText={t("acls.noDestinations")}
        label={t("acls.destinations")}
        onChange={(dst) => setDraft({ ...draft, dst })}
        placeholder="tag:web"
        suggestions={destinations}
        values={draft.dst}
      />
      <TokenList
        description={t("acls.portsDescription")}
        emptyText={t("acls.noPorts")}
        label={t("acls.ports")}
        onChange={(ip) => setDraft({ ...draft, ip })}
        placeholder="tcp:443"
        suggestions={IP_SUGGESTIONS}
        values={draft.ip}
      />
      <TokenList
        description={t("acls.viaDescription")}
        emptyText={t("acls.noVia")}
        label={t("acls.viaField")}
        onChange={(via) => setDraft({ ...draft, via })}
        placeholder="tag:router"
        suggestions={sources.filter((source) => source.startsWith("tag:"))}
        validate={isValidTagName}
        values={draft.via}
      />
      <JsonField
        description={t("policy29.appDescription")}
        invalid={app === undefined}
        label={t("policy29.app")}
        onChange={setAppText}
        value={appText}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={app === undefined}
          onClick={() =>
            setAppText(
              JSON.stringify(
                { ...app, "tailscale.com/cap/drive": [{ shares: ["*"], access: "ro" }] },
                null,
                2,
              ),
            )
          }
          type="button"
        >
          {t("policy29.taildrivePreset")}
        </Button>
        <Button
          disabled={app === undefined}
          onClick={() =>
            setAppText(JSON.stringify({ ...app, "tailscale.com/cap/relay": [] }, null, 2))
          }
          type="button"
        >
          {t("policy29.relayPreset")}
        </Button>
      </div>
    </EditorDialog>
  );
}
