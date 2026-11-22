import type { ActionFunctionArgs } from "react-router";
import * as v from "valibot";

import type { Locale } from "~/i18n/locale";
import { getLocale } from "~/i18n/locale.server";
import { createTranslator } from "~/i18n/messages";
import { authContext, headscaleContext, requestApiContext } from "~/server/context";
import { isDataWithApiError } from "~/server/headscale/api/error-client";
import { ActionError, createAction } from "~/server/web/actions";
import { Capabilities } from "~/server/web/roles";
import { parsePolicy } from "~/utils/acl-policy";
import { invalid, ok } from "~/utils/form";
import { hasPolicyExtensions } from "~/utils/policy-extensions";

// Headscale prefixes policy parse errors with one of these, for HuJSON syntax
// and for the policy structure respectively.
const parseErrorPrefixes = ["parsing HuJSON:", "parsing policy from bytes:"];

function createAclAction(locale: Locale) {
  const t = createTranslator(locale);
  return createAction({
    locale,
    validationMessage: t("validation.required"),
    capability: Capabilities.write_policy,
    async setup({ request, context }) {
      const principal = await context.get(authContext).require(request);
      const { api } = await context.get(requestApiContext)(request);
      const { capabilities } = context.get(headscaleContext);
      return { principal, api, capabilities };
    },
    intents: {
      save: {
        fields: {
          policy: v.pipe(
            v.string(t("acls.validation.policy")),
            v.check((value) => value.trim().length > 0, t("acls.error.empty")),
          ),
        },
        async handler(input, { api, capabilities }) {
          const parsed = parsePolicy(input.policy, locale);
          if (!parsed.ok) {
            return invalid({ form: t("acls.error.syntax", { error: parsed.error }) });
          }

          // Older Headscale only says `unknown field "grants"`.
          const hasGrants = parsed.policy.keyOrder.includes("grants");
          if (
            (hasGrants || hasPolicyExtensions(parsed.policy)) &&
            !capabilities.policySupportsGrants
          ) {
            throw new ActionError(t("acls.error.grantsVersion"));
          }

          try {
            await api.policy.set(input.policy);
          } catch (error) {
            if (!isDataWithApiError(error)) {
              throw error;
            }

            if (error.data.rawData.includes("update is disabled")) {
              throw new ActionError(t("acls.error.readOnly"), 403);
            }

            const message = error.data.data?.message;
            const prefix = parseErrorPrefixes.find(
              (prefix) => typeof message === "string" && message.includes(prefix),
            );
            if (typeof message === "string" && prefix) {
              const detail = message.slice(message.indexOf(prefix) + prefix.length).trim();
              return invalid({
                form:
                  locale === "en"
                    ? t("acls.error.syntax", { error: detail })
                    : t("acls.error.upstreamSyntax", {
                        status: error.data.statusCode,
                        error: message,
                      }),
              });
            }

            throw error;
          }

          return ok(t("acls.success.saved"));
        },
      },
      check: {
        fields: { policy: v.pipe(v.string(), v.minLength(1)) },
        async handler(input, { api, capabilities }) {
          if (!capabilities.policyCanBeChecked) throw new ActionError(t("policy29.version"));
          const parsed = parsePolicy(input.policy, locale);
          if (!parsed.ok) return invalid({ form: t("acls.error.syntax", { error: parsed.error }) });
          try {
            await api.policy.check(input.policy);
          } catch (error) {
            if (isDataWithApiError(error) && error.data.statusCode === 400) {
              return invalid({
                form: `${t("policy29.rejected")}\n${error.data.data?.message ?? error.data.rawData}`,
              });
            }
            throw error;
          }
          return ok(t("policy29.checked"));
        },
      },
    },
  });
}

const localizedActions = {
  en: createAclAction("en"),
  "zh-CN": createAclAction("zh-CN"),
};

export const aclAction = Object.assign(
  async (args: ActionFunctionArgs) => localizedActions[await getLocale(args.request)](args),
  { intents: localizedActions.en.intents },
);
