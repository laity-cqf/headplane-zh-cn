import { data, type ActionFunctionArgs } from "react-router";

import { getLocale } from "~/i18n/locale.server";
import { createTranslator } from "~/i18n/messages";
import {
  authContext,
  headscaleConfigContext,
  headscaleContext,
  integrationContext,
  requestApiContext,
} from "~/server/context";
import { headscaleErrorMessage } from "~/server/headscale/api/error-client";
import { ActionError } from "~/server/web/actions";
import { Capabilities } from "~/server/web/roles";
import {
  CONTROL_SETTING_PATHS,
  controlSettingsErrors,
  type ControlSettings,
} from "~/utils/headscale-settings";
import log from "~/utils/log";

type ControlIntent = "save" | "approve" | "reject";
export function createControlAction(intents: ControlIntent[]) {
  return Object.assign(
    async ({ request, context }: ActionFunctionArgs) => {
      const t = createTranslator(await getLocale(request));
      try {
        const auth = context.get(authContext);
        const principal = await auth.require(request);
        if (!auth.can(principal, Capabilities.configure_iam))
          throw new ActionError(t("control.forbidden"), 403);
        const headscale = context.get(headscaleContext);
        if (!headscale.capabilities.authRequestsCanBeDecided)
          throw new ActionError(t("policy29.version"));
        const form = await request.formData();
        const single = (name: string) => {
          const values = form.getAll(name);
          if (values.length !== 1 || typeof values[0] !== "string")
            throw new ActionError(t("control.invalid"));
          return values[0].trim();
        };
        const intent = single("intent");
        if (!intents.includes(intent as ControlIntent)) throw new ActionError(t("control.invalid"));
        if (intent === "approve" || intent === "reject") {
          const id = single("auth_id");
          if (!/^hskey-authreq-[A-Za-z0-9_-]{16,128}$/.test(id))
            throw new ActionError(t("control.auth.invalid"));
          const { api } = await context.get(requestApiContext)(request);
          await api.auth[intent](id);
          return data({
            success: true as const,
            message: t(intent === "approve" ? "control.auth.approved" : "control.auth.rejected"),
            error: undefined,
          });
        }
        if (intent !== "save") throw new ActionError(t("control.invalid"));
        const config = context.get(headscaleConfigContext);
        if (!config.writable()) throw new ActionError(t("control.readOnly"), 403);
        const settings: ControlSettings = {
          nodeExpiry: single("nodeExpiry"),
          ephemeralTimeout: single("ephemeralTimeout"),
          haInterval: single("haInterval"),
          haTimeout: single("haTimeout"),
          autoUpdate: false,
          taildrop: false,
        };
        for (const field of ["autoUpdate", "taildrop"] as const) {
          const value = single(field);
          if (!["true", "false"].includes(value)) throw new ActionError(t("control.invalid"));
          settings[field] = value === "true";
        }
        const errors = controlSettingsErrors(settings);
        if (errors.length)
          throw new ActionError(
            t("control.invalidSettings", {
              fields: errors.map((field) => t(`control.${field}`)).join(", "),
            }),
          );
        if (single("baseline") !== JSON.stringify(config.getControlSettings()))
          throw new ActionError(t("control.stale"), 409);
        try {
          await config.patch(
            (Object.keys(CONTROL_SETTING_PATHS) as (keyof ControlSettings)[]).map((field) => ({
              path: CONTROL_SETTING_PATHS[field],
              value: settings[field],
            })),
          );
        } catch (error) {
          log.error("config", "Failed to save Headscale control settings: %s", error);
          throw new ActionError(t("control.writeFailed"), 500);
        }
        const integration = context.get(integrationContext);
        if (integration) {
          try {
            if (!(await integration.isAvailable()))
              throw new ActionError(t("control.restartFailed"), 502);
            const applied: unknown = await integration.onConfigChange(headscale);
            if (applied === false || !(await headscale.health()))
              throw new ActionError(t("control.restartFailed"), 502);
          } catch (error) {
            log.error("config", "Failed to apply Headscale control settings: %s", error);
            throw new ActionError(t("control.restartFailed"), 502);
          }
        }
        return data({
          success: true as const,
          message: t(integration ? "control.saved" : "control.restartRequired"),
          error: undefined,
        });
      } catch (error) {
        if (error instanceof ActionError)
          return data(
            { success: false as const, message: undefined, error: error.message },
            error.status,
          );
        const upstream = headscaleErrorMessage(error, await getLocale(request));
        if (upstream)
          return data(
            {
              success: false as const,
              message: undefined,
              error: t("control.upstream", { message: upstream }),
            },
            400,
          );
        throw error;
      }
    },
    { intents },
  );
}
