import { useRevalidator } from "react-router";

import Button from "~/components/button";
import Callout from "~/components/callout";
import Chip from "~/components/chip";
import Link from "~/components/link";
import List from "~/components/list";
import { useI18n } from "~/i18n/provider";
import type { SubnetRouteGroup } from "~/utils/subnet-routes";

export default function SubnetRoutes({
  routes,
  loaded,
}: {
  routes: SubnetRouteGroup[];
  loaded: boolean;
}) {
  const { t } = useI18n();
  const revalidator = useRevalidator();
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">{t("acls.subnetRoutes")}</h2>
          <p className="max-w-prose text-sm opacity-70">{t("acls.subnetRoutesDescription")}</p>
        </div>
        <Button
          type="button"
          disabled={revalidator.state !== "idle"}
          onClick={() => revalidator.revalidate()}
        >
          {t("acls.refreshRoutes")}
        </Button>
      </div>
      <Callout title={t("acls.haTitle")}>{t("acls.haDescription")}</Callout>
      {!loaded ? (
        <Callout title={t("acls.routesUnavailable")} variant="warning">
          {t("acls.routesRetry")}
        </Callout>
      ) : routes.length === 0 ? (
        <p className="py-6 text-center text-sm opacity-70">{t("acls.noSubnetRoutes")}</p>
      ) : (
        routes.map((group) => (
          <section className="flex flex-col gap-2" key={group.prefix}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-mono font-medium break-all">{group.prefix}</h3>
              <Chip text={t("acls.routeCandidates", { count: group.candidates })} />
            </div>
            <List>
              {group.routers.map((router) => (
                <List.Item className="flex-wrap gap-3" key={router.id}>
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-medium break-all">{router.name}</span>
                    {router.primary ? <Chip text={t("acls.primaryRouter")} /> : null}
                    <Chip text={t(router.online ? "acls.routerOnline" : "acls.routerOffline")} />
                    <Chip
                      text={t(
                        router.advertised ? "acls.routeAdvertised" : "acls.routeNotAdvertised",
                      )}
                    />
                    <Chip text={t(router.approved ? "acls.routeApproved" : "acls.routePending")} />
                    {router.tags.map((tag) => (
                      <Chip className="font-mono" key={tag} text={tag} />
                    ))}
                  </div>
                  <Link
                    className="text-accent shrink-0 text-sm hover:underline"
                    to={`/machines/${encodeURIComponent(router.id)}`}
                  >
                    {t("acls.manageRouter")}
                  </Link>
                </List.Item>
              ))}
            </List>
          </section>
        ))
      )}
    </div>
  );
}
