import type { Connection, Item, Space } from "../generated/prisma/client";

export type { Connection, Item, Space };

export type ItemType = "NOTE" | "FILE" | "LINK";

export type ItemWithSpace = Item & { space: Space };

export type GraphNode = {
  id: string;
  title: string;
  type: ItemType;
  spaceId: string;
  spaceName: string;
  spaceColor: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string | null;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export const ITEM_TYPE_LABEL: Record<string, string> = {
  NOTE: "Anotação",
  FILE: "Arquivo",
  LINK: "Link",
};
