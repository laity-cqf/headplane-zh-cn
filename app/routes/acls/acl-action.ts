import { data } from "react-router";

import { getLocale } from "~/i18n/locale.server";
import { createTranslator } from "~/i18n/messages";
import { authContext, headscaleContext, requestApiContext } from "~/server/context";
import { isDataWithApiError } from "~/server/headscale/api/error-client";
import { Capabilities } from "~/server/web/roles";
import { parsePolicy } from "~/utils/acl-policy";
import { hasPolicyExtensions } from "~/utils/policy-extensions";

import type { Route } from "./+types/overview";

// We only check capabilities here and assume it is writable
// If it isn't, it'll gracefully error anyways, since this means some
// fishy client manipulation is happening.
export async function aclAction({ request, context }: Route.ActionArgs) {
  const t = createTranslator(await getLocale(request));
  const auth = context.get(authContext);
  const getRequestApi = context.get(requestApiContext);

  const principal = await auth.require(request);
  const check = auth.can(principal, Capabilities.write_policy);
  if (!check) {
    throw data(t("acls.error.writeForbidden"), {
      status: 403,
    });
  }

  // Try to write to the ACL policy via the API or via config file (TODO).
  const formData = await request.formData();
  const policyData = formData.get("policy")?.toString();
  const checking = formData.get("action_id") === "check";
  if (!policyData) {
    throw data(t("acls.error.missingPolicy"), {
      status: 400,
    });
  }
  if (checking && !context.get(headscaleContext).capabilities.policyCanBeChecked) {
    return data(
      {
        success: false as const,
        error: t("policy29.version"),
        errorDetail: t("policy29.version"),
        policy: undefined,
        updatedAt: undefined,
      },
      400,
    );
  }

  // Older Headscale versions must not silently ignore grants from the raw editor.
  if (!context.get(headscaleContext).capabilities.policySupportsGrants) {
    const parsed = parsePolicy(policyData);
    if (
      parsed.ok &&
      (parsed.policy.keyOrder.includes("grants") || hasPolicyExtensions(parsed.policy))
    ) {
      return data(
        {
          success: false as const,
          error: t("acls.error.grantsUnsupported"),
          errorDetail: t("policy29.version"),
          policy: undefined,
          updatedAt: undefined,
        },
        400,
      );
    }
  }

  const { api } = await getRequestApi(request);
  try {
    if (checking) {
      await api.policy.check(policyData);
      return data({
        success: true as const,
        operation: "check" as const,
        error: undefined,
        errorDetail: undefined,
        policy: policyData,
        updatedAt: undefined,
      });
    }
    const { policy, updatedAt } = await api.policy.set(policyData);
    return data({
      success: true as const,
      operation: "save" as const,
      error: undefined,
      errorDetail: undefined,
      policy,
      updatedAt,
    });
  } catch (error) {
    if (isDataWithApiError(error)) {
      const rawData = error.data.rawData;
      // https://github.com/juanfont/headscale/blob/c4600346f9c29b514dc9725ac103efb9d0381f23/hscontrol/types/policy.go#L11
      if (rawData.includes("update is disabled")) {
        throw data(t("acls.error.notWritable"), { status: 403 });
      }

      const message =
        error.data.data != null &&
        "message" in error.data.data &&
        typeof error.data.data.message === "string"
          ? error.data.data.message
          : undefined;

      if (message == null) {
        throw error;
      }

      // Policy parse errors carry one of two prefixes (HuJSON syntax vs.
      // structural unmarshal). Headscale 0.27.0+ uses these forms; older
      // releases are no longer supported.
      if (message.includes("parsing HuJSON:")) {
        const cutIndex = message.indexOf("parsing HuJSON:");
        const trimmed = cutIndex > -1 ? message.slice(cutIndex + 16).trim() : message;

        return data(
          {
            success: false as const,
            error: t("acls.error.syntax", { error: trimmed }),
            errorDetail: trimmed,
            policy: undefined,
            updatedAt: undefined,
          },
          400,
        );
      }

      if (message.includes("parsing policy from bytes:")) {
        const cutIndex = message.indexOf("parsing policy from bytes:");
        const trimmed = cutIndex > -1 ? message.slice(cutIndex + 26).trim() : message;

        return data(
          {
            success: false as const,
            error: t("acls.error.syntax", { error: trimmed }),
            errorDetail: trimmed,
            policy: undefined,
            updatedAt: undefined,
          },
          400,
        );
      }
      // SetPolicy reports failed assertions as HTTP 500; CheckPolicy uses 400.
      if (error.data.statusCode === 400 || message.includes("test(s) failed")) {
        return data(
          {
            success: false as const,
            error: t("policy29.rejected"),
            errorDetail: message,
            policy: undefined,
            updatedAt: undefined,
          },
          400,
        );
      }
    }

    // Otherwise, this is a Headscale error that we can just propagate.
    throw error;
  }
}
