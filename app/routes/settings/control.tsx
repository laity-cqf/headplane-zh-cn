import { data, useFetcher, useLoaderData, type LoaderFunctionArgs } from "react-router";

import Button from "~/components/button";
import Input from "~/components/input";
import { useI18n } from "~/i18n/provider";
import { authContext, headscaleConfigContext, headscaleContext } from "~/server/context";
import { Capabilities } from "~/server/web/roles";
import type { ControlSettings } from "~/utils/headscale-settings";

import { createControlAction } from "./control-actions";

export const action = createControlAction(["save"]);

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = context.get(authContext);
  const principal = await auth.require(request);
  if (!auth.can(principal, Capabilities.configure_iam)) throw data(null, 403);
  const config = context.get(headscaleConfigContext);
  return {
    settings: config.getControlSettings(),
    readable: config.readable(),
    writable: config.writable(),
    supported: context.get(headscaleContext).capabilities.policySupportsGrants,
  };
}

export default function ControlSettingsPage() {
  const { t } = useI18n();
  const { settings, readable, writable, supported } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const disabled = !writable || !supported || fetcher.state !== "idle";
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-medium">{t("control.title")}</h1>
      <p>{t("control.description")}</p>
      {!supported ? <p role="status">{t("policy29.version")}</p> : null}
      {!readable || !writable ? <p role="status">{t("control.readOnly")}</p> : null}
      <fetcher.Form className="flex flex-col gap-5" key={JSON.stringify(settings)} method="post">
        <input name="intent" type="hidden" value="save" />
        <input name="baseline" type="hidden" value={JSON.stringify(settings)} />
        <fieldset className="flex flex-col gap-5" disabled={disabled}>
          {(["nodeExpiry", "ephemeralTimeout", "haInterval", "haTimeout"] as const).map((field) => (
            <Input
              defaultValue={settings[field]}
              description={t(`control.${field}Description`)}
              key={field}
              label={t(`control.${field}`)}
              name={field}
              required
            />
          ))}
          {(["autoUpdate", "taildrop"] as const).map((field) => (
            <BooleanSetting field={field} key={field} value={settings[field]} />
          ))}
          <p className="text-sm">{t("control.restartNotice")}</p>
          <Button disabled={disabled} type="submit">
            {t("control.save")}
          </Button>
        </fieldset>
      </fetcher.Form>
      {fetcher.data ? (
        <p role={fetcher.data.success ? "status" : "alert"}>
          {fetcher.data.message ?? fetcher.data.error}
        </p>
      ) : null}
    </div>
  );
}

function BooleanSetting({
  field,
  value,
}: {
  field: keyof Pick<ControlSettings, "autoUpdate" | "taildrop">;
  value: boolean;
}) {
  const { t } = useI18n();
  // Native selects submit explicit false as well as true, including without JS.
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{t(`control.${field}`)}</span>
      <select className="rounded-md border p-2" defaultValue={String(value)} name={field}>
        <option value="true">{t("common.yes")}</option>
        <option value="false">{t("common.no")}</option>
      </select>
      <span className="opacity-70">{t(`control.${field}Description`)}</span>
    </label>
  );
}
