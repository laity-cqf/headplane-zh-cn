import type { Machine } from "~/types";

type RouterNode = Pick<
  Machine,
  | "id"
  | "name"
  | "givenName"
  | "online"
  | "tags"
  | "availableRoutes"
  | "approvedRoutes"
  | "subnetRoutes"
>;

export interface SubnetRouteGroup {
  prefix: string;
  // Configured candidates, not a claim about current health or primary status.
  candidates: number;
  routers: {
    id: string;
    name: string;
    online: boolean;
    tags: string[];
    advertised: boolean;
    approved: boolean;
    primary: boolean;
  }[];
}

export function groupSubnetRoutes(nodes: RouterNode[]): SubnetRouteGroup[] {
  const groups = new Map<string, SubnetRouteGroup>();
  for (const node of nodes) {
    const advertised = new Set(node.availableRoutes);
    const approved = new Set(node.approvedRoutes);
    const primary = new Set(node.subnetRoutes);
    for (const prefix of new Set([...advertised, ...approved])) {
      if (prefix === "0.0.0.0/0" || prefix === "::/0") continue;
      const group = groups.get(prefix) ?? { prefix, candidates: 0, routers: [] };
      group.routers.push({
        id: node.id,
        name: node.givenName || node.name,
        online: node.online,
        tags: node.tags,
        advertised: advertised.has(prefix),
        approved: approved.has(prefix),
        primary: primary.has(prefix),
      });
      if (advertised.has(prefix) && approved.has(prefix)) group.candidates++;
      groups.set(prefix, group);
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.prefix.localeCompare(b.prefix));
}
