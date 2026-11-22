import { useState } from "react";

import Input from "~/components/input";
import TableList from "~/components/list";
import Switch from "~/components/switch";
import TokenList from "~/components/token-list";
import { useI18n } from "~/i18n/provider";
import type { Policy } from "~/utils/acl-policy";
import {
  readPolicyRows,
  setPolicyRows,
  stringList,
  type PolicyRow,
  type PolicyRowsKey,
} from "~/utils/policy-extensions";

import EditorDialog from "../dialogs/editor-dialog";
import { Empty, RowActions, Section } from "./editor-section";

const sections = ["nodeAttrs", "tests", "sshTests"] as const;
const attrs = [
  "magicdns-aaaa",
  "disable-relay-server",
  "disable-captive-portal-detection",
  "randomize-client-port",
  "drive:share",
  "drive:access",
  "nextdns:no-device-info",
];

const fields = {
  nodeAttrs: ["target", "attr"],
  tests: ["src", "proto", "accept", "deny"],
  sshTests: ["src", "dst", "accept", "deny", "check"],
} as const;
type Field = (typeof fields)[PolicyRowsKey][number];

function editable(row: PolicyRow, section: PolicyRowsKey) {
  return fields[section].every((field) =>
    field === "src" || field === "proto"
      ? row[field] === undefined || typeof row[field] === "string"
      : stringList(row[field]) !== undefined,
  );
}

export default function ExtensionsEditor({
  policy,
  onChange,
  isDisabled,
  supported,
  sources,
  destinations,
}: {
  policy: Policy;
  onChange: (policy: Policy) => void;
  isDisabled: boolean;
  supported: boolean;
  sources: string[];
  destinations: string[];
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<{ section: PolicyRowsKey; index: number | null } | null>(
    null,
  );
  const disabled = isDisabled || !supported;
  const randomized = policy.extra.randomizeClientPort;
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm">{t(supported ? "policy29.description" : "policy29.version")}</p>
      <label className="flex items-center justify-between gap-4">
        <span>
          <span className="block font-medium">{t("policy29.randomize")}</span>
          <span className="text-sm opacity-70">{t("policy29.randomizeDescription")}</span>
        </span>
        <Switch
          checked={randomized === true}
          disabled={disabled || (randomized !== undefined && typeof randomized !== "boolean")}
          label={t("policy29.randomize")}
          onCheckedChange={(value) =>
            onChange({ ...policy, extra: { ...policy.extra, randomizeClientPort: value } })
          }
        />
      </label>
      {sections.map((section) => {
        const rows = readPolicyRows(policy, section);
        return (
          <Section
            description={t(`policy29.${section}Description`)}
            isDisabled={disabled || !rows}
            key={section}
            onAdd={() => setEditing({ section, index: null })}
            title={t(`policy29.${section}`)}
          >
            {!rows ? (
              <Empty text={t("policy29.rawRequired")} />
            ) : rows.length === 0 ? (
              <Empty text={t("policy29.empty")} />
            ) : (
              rows.map((row, index) => (
                <TableList.Item className="gap-4" key={index}>
                  <pre className="min-w-0 overflow-x-auto font-mono text-xs break-all whitespace-pre-wrap">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                  <RowActions
                    isDisabled={disabled || !editable(row, section)}
                    onDelete={() =>
                      onChange(
                        setPolicyRows(
                          policy,
                          section,
                          rows.filter((_, i) => i !== index),
                        ),
                      )
                    }
                    onEdit={() => setEditing({ section, index })}
                  />
                </TableList.Item>
              ))
            )}
          </Section>
        );
      })}
      {editing && (
        <ExtensionDialog
          destinations={destinations}
          key={`${editing.section}-${editing.index}`}
          onClose={() => setEditing(null)}
          onSave={(row) => {
            const rows = [...(readPolicyRows(policy, editing.section) ?? [])];
            if (editing.index === null) rows.push(row);
            else rows[editing.index] = row;
            onChange(setPolicyRows(policy, editing.section, rows));
          }}
          row={
            editing.index === null ? {} : readPolicyRows(policy, editing.section)![editing.index]
          }
          section={editing.section}
          sources={sources}
        />
      )}
    </div>
  );
}

function ExtensionDialog({
  row,
  section,
  sources,
  destinations,
  onSave,
  onClose,
}: {
  row: PolicyRow;
  section: PolicyRowsKey;
  sources: string[];
  destinations: string[];
  onSave: (row: PolicyRow) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<PolicyRow>(() => structuredClone(row));
  const list = (field: Field) => stringList(draft[field]) ?? [];
  const valid =
    section === "nodeAttrs"
      ? list("target").length > 0 && list("attr").length > 0
      : typeof draft.src === "string" &&
        draft.src.trim().length > 0 &&
        (section !== "sshTests" || list("dst").length > 0) &&
        list("accept").length +
          list("deny").length +
          (section === "sshTests" ? list("check").length : 0) >
          0;

  return (
    <EditorDialog
      submitLabel={t("common.done")}
      description={t(`policy29.${section}Description`)}
      isDisabled={!valid}
      isOpen
      onSubmit={() => onSave(draft)}
      setIsOpen={(open) => {
        if (!open) onClose();
      }}
      title={t(`policy29.${section}`)}
    >
      {fields[section].map((field) =>
        field === "src" || field === "proto" ? (
          <Input
            key={field}
            label={t(`policy29.field.${field}`)}
            onChange={(value) => {
              const next = { ...draft };
              if (value.trim()) next[field] = value;
              else delete next[field];
              setDraft(next);
            }}
            placeholder={field === "src" ? "alice@" : "tcp"}
            value={typeof draft[field] === "string" ? draft[field] : ""}
          />
        ) : (
          <TokenList
            description={t(`policy29.field.${field}Description`)}
            emptyText={t("policy29.empty")}
            key={field}
            label={t(`policy29.field.${field}`)}
            onChange={(values) => setDraft({ ...draft, [field]: values })}
            placeholder={
              field === "attr"
                ? "drive:access"
                : section === "tests"
                  ? "10.82.138.99:30001"
                  : field === "target" || field === "dst"
                    ? "tag:server"
                    : "root"
            }
            suggestions={
              field === "attr"
                ? attrs
                : field === "target"
                  ? sources.filter(
                      (source) =>
                        !["autogroup:admin", "autogroup:owner", "autogroup:danger-all"].includes(
                          source,
                        ),
                    )
                  : field === "dst"
                    ? destinations.filter((destination) => destination.startsWith("tag:"))
                    : []
            }
            values={list(field)}
          />
        ),
      )}
    </EditorDialog>
  );
}
