import { describe, expect, test } from "vitest";

import { aclLoader } from "~/routes/acls/acl-loader";

import { createTailnet } from "../../harness/tailnet";
import { testedVersions } from "../../harness/versions";
import { waitFor } from "../../harness/wait";

describe.for(testedVersions())("Headscale %s: subnet route failover", (version) => {
  test("refreshing the route list follows Headscale's primary after a gateway goes offline", async () => {
    await using tailnet = await createTailnet({
      version,
      policy: { acls: [{ action: "accept", src: ["*"], dst: ["*:*"] }] },
    });
    const prefix = "10.40.0.0/24";
    const first = await tailnet.node({ name: "router-a", user: "routes-owner", routes: [prefix] });
    const second = await tailnet.node({ name: "router-b", user: "routes-owner", routes: [prefix] });
    await tailnet.api.nodes.approveRoutes(first.id, [prefix]);
    await tailnet.api.nodes.approveRoutes(second.id, [prefix]);
    const app = await tailnet.headplane();
    const { cookie } = await app.signIn("owner");
    const load = async () => {
      const snapshot = await app.call(aclLoader, "/acls", { as: cookie });
      expect(snapshot).toMatchObject({ routesLoaded: true });
      return snapshot as Awaited<ReturnType<typeof aclLoader>>;
    };
    const group = (snapshot: Awaited<ReturnType<typeof load>>) =>
      snapshot.subnetRoutes.find((route) => route.prefix === prefix)!;

    const initial = await waitFor(
      "one reported primary and two configured candidates",
      async () => {
        const current = group(await load());
        expect(current.candidates).toBe(2);
        expect(current.routers.filter((router) => router.primary)).toHaveLength(1);
        return current;
      },
    );
    const primary = initial.routers.find((router) => router.primary)!;
    const active = primary.id === first.id ? first : second;
    const backup = primary.id === first.id ? second : first;
    await active.down();
    await waitFor("the refreshed list to report the surviving gateway as primary", async () => {
      const current = group(await load());
      expect(current.candidates).toBe(2);
      expect(current.routers.filter((router) => router.primary).map((router) => router.id)).toEqual(
        [backup.id],
      );
      expect(current.routers.find((router) => router.id === active.id)?.online).toBe(false);
    });
    await active.up();
  });
});
