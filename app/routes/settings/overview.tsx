import { ArrowRight } from "lucide-react";

import Link from "~/components/link";
import PageError from "~/components/page-error";
import { useI18n } from "~/i18n/provider";
import { authContext, headscaleConfigContext } from "~/server/context";
import { Capabilities } from "~/server/web/roles";

import type { Route } from "./+types/overview";

export async function loader({ request, context }: Route.LoaderArgs) {
  const headscaleConfig = context.get(headscaleConfigContext);
  const auth = context.get(authContext);
  const principal = await auth.require(request);

  return {
    config: headscaleConfig.writable(),
    hasOidcConfig: headscaleConfig.hasOIDCConfig(),
    canConfigure: auth.can(principal, Capabilities.configure_iam),
  };
}

export default function Page({
  loaderData: { config, hasOidcConfig, canConfigure },
}: Route.ComponentProps) {
  const { t } = useI18n();
  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.title")}</h1>
        <p>{t("settings.description")}</p>
      </div>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("authKeys.title")}</h1>
        <p>
          {t("authKeys.description")}{" "}
          <Link external styled to="https://tailscale.com/kb/1085/auth-keys/">
            {t("settings.tailscaleDocs")}
          </Link>
        </p>
      </div>
      <Link to="/settings/auth-keys">
        <div className="flex items-center text-lg font-medium">
          {t("settings.manageKeys")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      {canConfigure ? (
        <>
          <Link styled to="/settings/headscale">
            {t("control.title")}
          </Link>
          <Link styled to="/settings/auth-requests">
            {t("control.auth.title")}
          </Link>
        </>
      ) : null}
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("agent.title")}</h1>
        <p>{t("agent.description")}</p>
      </div>
      <Link to="/settings/agent">
        <div className="flex items-center text-lg font-medium">
          {t("settings.agentSettings")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      {config && hasOidcConfig ? (
        <>
          <div className="flex w-full flex-col sm:w-2/3">
            <h1 className="mb-4 text-2xl font-medium">{t("restrictions.title")}</h1>
            <p>
              {t("restrictions.description")}{" "}
              <Link external styled to="https://headscale.net/stable/ref/oidc/#basic-configuration">
                {t("common.learnMore")}
              </Link>
            </p>
          </div>
          <Link to="/settings/restrictions">
            <div className="flex items-center text-lg font-medium">
              {t("settings.manageRestrictions")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </>
      ) : undefined}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useI18n();
  return <PageError error={error} page={t("settings.title")} />;
}
