import { useState } from "react";

import Input from "~/components/input";
import Select from "~/components/select";
import TokenList from "~/components/token-list";
import { useI18n } from "~/i18n/provider";
import { isValidRoute } from "~/utils/acl-policy";

import EditorDialog from "./editor-dialog";

// `null` stands for exit nodes, anything else is a route prefix.
export type ApproverTarget = string | null;

interface AutoApproverDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // Absent when creating a new entry.
  target?: ApproverTarget;
  approvers?: string[];
  existingRoutes: string[];
  exitNodeApprovers: string[];
  suggestions: string[];
  onSave: (target: ApproverTarget, approvers: string[]) => void;
}

export default function AutoApproverDialog({
  isOpen,
  setIsOpen,
  target,
  approvers,
  existingRoutes,
  exitNodeApprovers,
  suggestions,
  onSave,
}: AutoApproverDialogProps) {
  const { t } = useI18n();
  const isNew = target === undefined;
  const [isExitNode, setIsExitNode] = useState(target === null);
  const [route, setRoute] = useState(target ?? "");
  const [draft, setDraft] = useState<string[]>(() => [...(approvers ?? [])]);

  const trimmedRoute = route.trim();
  const isDuplicate = trimmedRoute !== target && existingRoutes.includes(trimmedRoute);
  const routeIsInvalid = !isValidRoute(trimmedRoute) || isDuplicate;
  const isInvalid = draft.length === 0 || (!isExitNode && routeIsInvalid);

  return (
    <EditorDialog
      description={t("acls.approverDescription")}
      isDisabled={isInvalid}
      isOpen={isOpen}
      onSubmit={() => onSave(isExitNode ? null : trimmedRoute, draft)}
      setIsOpen={setIsOpen}
      title={t(isNew ? "acls.newApprover" : "acls.editApprover")}
    >
      {isNew ? (
        <Select
          items={[
            { value: "route", label: t("acls.subnetRoute") },
            { value: "exit", label: t("acls.exitNode") },
          ]}
          label={t("acls.approve")}
          onValueChange={(value) => {
            const exit = value === "exit";
            setIsExitNode(exit);
            // There is only one exit node list, so start from what is there.
            if (exit) setDraft([...exitNodeApprovers]);
          }}
          value={isExitNode ? "exit" : "route"}
        />
      ) : null}
      {isExitNode ? null : (
        <Input
          errorMessage={isDuplicate ? t("acls.duplicateRoute") : t("acls.invalidRoute")}
          invalid={trimmedRoute.length > 0 && routeIsInvalid}
          label={t("acls.route")}
          onChange={setRoute}
          placeholder="10.0.0.0/8"
          value={route}
        />
      )}
      <TokenList
        description={t("acls.approversDescription")}
        emptyText={t("acls.noApprovers")}
        label={t("acls.approvers")}
        onChange={setDraft}
        placeholder="tag:router"
        suggestions={suggestions}
        values={draft}
      />
    </EditorDialog>
  );
}
