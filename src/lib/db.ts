import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDB() {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export const newId = () => crypto.randomUUID();
export const nowISO = () => new Date().toISOString();

// ---------- Row types ----------

export type SpaceRow = {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SpaceWithCountRow = SpaceRow & { itemCount: number };

export type ItemRow = {
  id: string;
  type: string;
  title: string;
  content: string | null;
  url: string | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  fileMime: string | null;
  createdAt: string;
  updatedAt: string;
  spaceId: string;
};

export type ItemWithSpaceRow = ItemRow & { space: SpaceRow };

export type ConnectionRow = {
  id: string;
  label: string | null;
  createdAt: string;
  sourceId: string;
  targetId: string;
};

// ---------- Helpers ----------

async function attachSpaces(db: D1Database, items: ItemRow[]): Promise<ItemWithSpaceRow[]> {
  if (items.length === 0) return [];
  const spaceIds = [...new Set(items.map((i) => i.spaceId))];
  const placeholders = spaceIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT * FROM "Space" WHERE id IN (${placeholders})`)
    .bind(...spaceIds)
    .all<SpaceRow>();
  const spaceMap = new Map((results ?? []).map((s) => [s.id, s]));
  return items.map((i) => ({ ...i, space: spaceMap.get(i.spaceId) as SpaceRow }));
}

function likeEscape(q: string) {
  return `%${q.replace(/[%_\\]/g, (m) => "\\" + m)}%`;
}

// ---------- Spaces ----------

export async function listSpaces(db: D1Database): Promise<SpaceRow[]> {
  const { results } = await db
    .prepare(`SELECT * FROM "Space" ORDER BY "createdAt" ASC`)
    .all<SpaceRow>();
  return results ?? [];
}

export async function listSpacesWithCounts(db: D1Database): Promise<SpaceWithCountRow[]> {
  const { results } = await db
    .prepare(
      `SELECT s.*, (SELECT COUNT(*) FROM "Item" i WHERE i."spaceId" = s.id) as itemCount
       FROM "Space" s ORDER BY s."createdAt" ASC`
    )
    .all<SpaceWithCountRow>();
  return results ?? [];
}

export async function getSpaceById(db: D1Database, id: string): Promise<SpaceRow | null> {
  return db.prepare(`SELECT * FROM "Space" WHERE id = ?`).bind(id).first<SpaceRow>();
}

export async function getSpaceBySlug(db: D1Database, slug: string): Promise<SpaceRow | null> {
  return db.prepare(`SELECT * FROM "Space" WHERE slug = ?`).bind(slug).first<SpaceRow>();
}

export async function createSpace(
  db: D1Database,
  data: { name: string; slug: string; color: string; description: string | null }
): Promise<SpaceRow> {
  const id = newId();
  const now = nowISO();
  await db
    .prepare(
      `INSERT INTO "Space" (id, name, slug, color, description, "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, data.name, data.slug, data.color, data.description, now, now)
    .run();
  return { id, ...data, createdAt: now, updatedAt: now };
}

export async function updateSpace(
  db: D1Database,
  id: string,
  data: Partial<{ name: string; color: string; description: string | null }>
): Promise<SpaceRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.name !== undefined) {
    fields.push(`name = ?`);
    values.push(data.name);
  }
  if (data.color !== undefined) {
    fields.push(`color = ?`);
    values.push(data.color);
  }
  if (data.description !== undefined) {
    fields.push(`description = ?`);
    values.push(data.description);
  }
  fields.push(`"updatedAt" = ?`);
  values.push(nowISO());
  values.push(id);
  await db.prepare(`UPDATE "Space" SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return getSpaceById(db, id);
}

export async function deleteSpace(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM "Space" WHERE id = ?`).bind(id).run();
}

// ---------- Items ----------

export async function getItemById(db: D1Database, id: string): Promise<ItemRow | null> {
  return db.prepare(`SELECT * FROM "Item" WHERE id = ?`).bind(id).first<ItemRow>();
}

export async function listItems(
  db: D1Database,
  where: { spaceId?: string; type?: string } = {},
  opts: { orderByUpdatedAt?: boolean; limit?: number } = {}
): Promise<ItemWithSpaceRow[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (where.spaceId) {
    conditions.push(`"spaceId" = ?`);
    values.push(where.spaceId);
  }
  if (where.type) {
    conditions.push(`type = ?`);
    values.push(where.type);
  }
  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderSql = opts.orderByUpdatedAt ? `ORDER BY "updatedAt" DESC` : "";
  const limitSql = opts.limit ? `LIMIT ${opts.limit}` : "";
  const { results } = await db
    .prepare(`SELECT * FROM "Item" ${whereSql} ${orderSql} ${limitSql}`)
    .bind(...values)
    .all<ItemRow>();
  return attachSpaces(db, results ?? []);
}

export async function searchItems(
  db: D1Database,
  q: string,
  excludeId?: string,
  limit = 25
): Promise<ItemWithSpaceRow[]> {
  const like = likeEscape(q);
  const conditions = [
    `(title LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\' OR "fileName" LIKE ? ESCAPE '\\')`,
  ];
  const values: unknown[] = [like, like, like];
  if (excludeId) {
    conditions.push(`id != ?`);
    values.push(excludeId);
  }
  const { results } = await db
    .prepare(
      `SELECT * FROM "Item" WHERE ${conditions.join(" AND ")} ORDER BY "updatedAt" DESC LIMIT ${limit}`
    )
    .bind(...values)
    .all<ItemRow>();
  return attachSpaces(db, results ?? []);
}

export async function createItem(
  db: D1Database,
  data: {
    title: string;
    spaceId: string;
    type: string;
    content: string | null;
    url: string | null;
    fileName?: string | null;
    filePath?: string | null;
    fileSize?: number | null;
    fileMime?: string | null;
  }
): Promise<ItemWithSpaceRow> {
  const id = newId();
  const now = nowISO();
  await db
    .prepare(
      `INSERT INTO "Item" (id, type, title, content, url, "fileName", "filePath", "fileSize", "fileMime", "createdAt", "updatedAt", "spaceId")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.type,
      data.title,
      data.content ?? null,
      data.url ?? null,
      data.fileName ?? null,
      data.filePath ?? null,
      data.fileSize ?? null,
      data.fileMime ?? null,
      now,
      now,
      data.spaceId
    )
    .run();
  const row: ItemRow = {
    id,
    type: data.type,
    title: data.title,
    content: data.content ?? null,
    url: data.url ?? null,
    fileName: data.fileName ?? null,
    filePath: data.filePath ?? null,
    fileSize: data.fileSize ?? null,
    fileMime: data.fileMime ?? null,
    createdAt: now,
    updatedAt: now,
    spaceId: data.spaceId,
  };
  const [withSpace] = await attachSpaces(db, [row]);
  return withSpace;
}

export async function updateItem(
  db: D1Database,
  id: string,
  data: Partial<{ title: string; content: string | null; url: string | null; spaceId: string }>
): Promise<ItemWithSpaceRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.title !== undefined) {
    fields.push(`title = ?`);
    values.push(data.title);
  }
  if (data.content !== undefined) {
    fields.push(`content = ?`);
    values.push(data.content);
  }
  if (data.url !== undefined) {
    fields.push(`url = ?`);
    values.push(data.url);
  }
  if (data.spaceId !== undefined) {
    fields.push(`"spaceId" = ?`);
    values.push(data.spaceId);
  }
  fields.push(`"updatedAt" = ?`);
  values.push(nowISO());
  values.push(id);
  await db.prepare(`UPDATE "Item" SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const row = await getItemById(db, id);
  if (!row) return null;
  const [withSpace] = await attachSpaces(db, [row]);
  return withSpace;
}

export async function deleteItem(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM "Item" WHERE id = ?`).bind(id).run();
}

// ---------- Connections ----------

export async function findConnectionBetween(
  db: D1Database,
  a: string,
  b: string
): Promise<ConnectionRow | null> {
  return db
    .prepare(
      `SELECT * FROM "Connection"
       WHERE ("sourceId" = ? AND "targetId" = ?) OR ("sourceId" = ? AND "targetId" = ?)
       LIMIT 1`
    )
    .bind(a, b, b, a)
    .first<ConnectionRow>();
}

export async function createConnection(
  db: D1Database,
  data: { sourceId: string; targetId: string; label: string | null }
): Promise<ConnectionRow> {
  const id = newId();
  const now = nowISO();
  await db
    .prepare(
      `INSERT INTO "Connection" (id, label, "createdAt", "sourceId", "targetId") VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, data.label, now, data.sourceId, data.targetId)
    .run();
  return { id, label: data.label, createdAt: now, sourceId: data.sourceId, targetId: data.targetId };
}

export async function deleteConnection(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM "Connection" WHERE id = ?`).bind(id).run();
}

export async function listConnectionsAmongItems(
  db: D1Database,
  itemIds: string[]
): Promise<ConnectionRow[]> {
  if (itemIds.length === 0) return [];
  const placeholders = itemIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT * FROM "Connection" WHERE "sourceId" IN (${placeholders}) AND "targetId" IN (${placeholders})`
    )
    .bind(...itemIds, ...itemIds)
    .all<ConnectionRow>();
  return results ?? [];
}

export async function listConnectionsForItem(
  db: D1Database,
  itemId: string
): Promise<ConnectionRow[]> {
  const { results } = await db
    .prepare(`SELECT * FROM "Connection" WHERE "sourceId" = ? OR "targetId" = ?`)
    .bind(itemId, itemId)
    .all<ConnectionRow>();
  return results ?? [];
}

/** Retorna as conexões de um item já "achatadas": o outro item (com seu tema) + o label da conexão. */
export async function getItemConnectionsExpanded(
  db: D1Database,
  itemId: string
): Promise<{ connectionId: string; label: string | null; item: ItemWithSpaceRow }[]> {
  const conns = await listConnectionsForItem(db, itemId);
  if (conns.length === 0) return [];
  const otherIds = [...new Set(conns.map((c) => (c.sourceId === itemId ? c.targetId : c.sourceId)))];
  const placeholders = otherIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT * FROM "Item" WHERE id IN (${placeholders})`)
    .bind(...otherIds)
    .all<ItemRow>();
  const withSpaces = await attachSpaces(db, results ?? []);
  const itemsById = new Map(withSpaces.map((i) => [i.id, i]));
  return conns
    .map((c) => {
      const otherId = c.sourceId === itemId ? c.targetId : c.sourceId;
      const item = itemsById.get(otherId);
      return item ? { connectionId: c.id, label: c.label, item } : null;
    })
    .filter((c): c is { connectionId: string; label: string | null; item: ItemWithSpaceRow } => c !== null);
}
