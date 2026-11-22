import { data, useFetcher, useLoaderData, type LoaderFunctionArgs } from "react-router";

import Button from "~/components/button";
import Input from "~/components/input";
import { useI18n } from "~/i18n/provider";
import { authContext, headscaleContext } from "~/server/context";
import { Capabilities } from "~/server/web/roles";

import { createControlAction } from "./control-actions";

export const action = createControlAction(["approve", "reject"]);

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = context.get(authContext);
  const principal = await auth.require(request);
  if (!auth.can(principal, Capabilities.configure_iam)) throw data(null, 403);
  return { supported: context.get(headscaleContext).capabilities.authRequestsCanBeDecided };
}

export default function AuthRequestsPage() {
  const { t } = useI18n();
  const { supported } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-medium">{t("control.auth.title")}</h1>
      <p>{t("control.auth.description")}</p>
      <p className="text-sm">{t(supported ? "control.auth.noList" : "policy29.version")}</p>
      <fetcher.Form className="flex flex-col gap-4" method="post">
        <Input
          autoComplete="off"
          description={t("control.auth.idDescription")}
          disabled={!supported}
          label={t("control.auth.id")}
          name="auth_id"
          placeholder={t("control.auth.idPlaceholder")}
          required
        />
        <div className="flex gap-3">
          <Button
            disabled={!supported || fetcher.state !== "idle"}
            name="intent"
            type="submit"
            value="approve"
          >
            {t("control.auth.approve")}
          </Button>
          <Button
            disabled={!supported || fetcher.state !== "idle"}
            name="intent"
            type="submit"
            value="reject"
          >
            {t("control.auth.reject")}
          </Button>
        </div>
      </fetcher.Form>
      {fetcher.data ? (
        <p role={fetcher.data.success ? "status" : "alert"}>
          {fetcher.data.message ?? fetcher.data.error}
        </p>
      ) : null}
    </div>
  );
}
