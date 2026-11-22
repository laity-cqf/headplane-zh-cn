import { describe, expect, test } from "vitest";

import { groupSubnetRoutes } from "~/utils/subnet-routes";

describe("subnet route candidates", () => {
  test("uses Headscale's reported primary even when online status disagrees", () => {
    const routers = groupSubnetRoutes([
      {
        id: "1",
        name: "online",
        givenName: "",
        online: true,
        tags: [],
        availableRoutes: ["10.0.0.0/24"],
        approvedRoutes: ["10.0.0.0/24"],
        subnetRoutes: [],
      },
      {
        id: "2",
        name: "reported",
        givenName: "",
        online: false,
        tags: [],
        availableRoutes: ["10.0.0.0/24"],
        approvedRoutes: ["10.0.0.0/24"],
        subnetRoutes: ["10.0.0.0/24"],
      },
    ])[0].routers;
    expect(routers.filter((router) => router.primary).map((router) => router.id)).toEqual(["2"]);
  });
  test("groups the same prefix without counting stale approvals or pending advertisements as HA candidates", () => {
    const groups = groupSubnetRoutes([
      {
        id: "1",
        name: "first",
        givenName: "",
        online: true,
        tags: [],
        availableRoutes: ["10.0.0.0/16", "10.0.0.0/16", "0.0.0.0/0"],
        subnetRoutes: ["10.0.0.0/16", "0.0.0.0/0"],
        approvedRoutes: ["10.0.0.0/16", "0.0.0.0/0"],
      },
      {
        id: "2",
        name: "second",
        givenName: "backup",
        online: false,
        tags: ["tag:router"],
        availableRoutes: ["10.0.0.0/16"],
        subnetRoutes: [],
        approvedRoutes: ["10.0.0.0/16"],
      },
      {
        id: "3",
        name: "pending",
        givenName: "",
        online: true,
        tags: [],
        availableRoutes: ["10.0.0.0/16"],
        subnetRoutes: [],
        approvedRoutes: [],
      },
      {
        id: "4",
        name: "stale",
        givenName: "",
        online: true,
        tags: [],
        availableRoutes: [],
        subnetRoutes: [],
        approvedRoutes: ["10.0.0.0/16"],
      },
      {
        id: "5",
        name: "exit",
        givenName: "",
        online: true,
        tags: [],
        availableRoutes: ["::/0"],
        subnetRoutes: [],
        approvedRoutes: ["::/0"],
      },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].prefix).toBe("10.0.0.0/16");
    expect(groups[0].candidates).toBe(2);
    expect(groups[0].routers).toEqual([
      {
        id: "1",
        name: "first",
        online: true,
        tags: [],
        advertised: true,
        approved: true,
        primary: true,
      },
      {
        id: "2",
        name: "backup",
        online: false,
        tags: ["tag:router"],
        advertised: true,
        approved: true,
        primary: false,
      },
      {
        id: "3",
        name: "pending",
        online: true,
        tags: [],
        advertised: true,
        approved: false,
        primary: false,
      },
      {
        id: "4",
        name: "stale",
        online: true,
        tags: [],
        advertised: false,
        approved: true,
        primary: false,
      },
    ]);
  });
});
