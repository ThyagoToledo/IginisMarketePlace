import { getSql } from './db';

export async function loadCatalog({ type, q } = {}) {
  try {
    const sql = getSql();
    const normalizedType = ['plugin', 'workshop', 'asset'].includes(type) ? type : null;
    const term = String(q || '').trim();
    const like = term ? `%${term}%` : null;
    const rows = await sql`
      SELECT i.id, i.type, i.name, i.author, i.description, i.version,
             i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText", i.cover_image_url AS "coverImageUrl",
             i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
             u.username AS "ownerUsername", u.display_name AS "ownerDisplayName",
             u.avatar_url AS "ownerAvatar", o.id AS "organizationId", o.slug AS "organizationSlug",
             o.name AS "organizationName",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'ignis') AS "ignisFeatured",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'sponsored') AS "sponsoredFeatured"
      FROM items i
      LEFT JOIN users u ON u.id = i.author_id
      LEFT JOIN organizations o ON o.id = i.organization_id
      WHERE i.status = 'approved'
        AND ((i.organization_id IS NULL AND COALESCE(u.is_banned, false) = false)
          OR (i.organization_id IS NOT NULL AND COALESCE(o.is_banned, false) = false))
        AND (${normalizedType}::text IS NULL OR i.type = ${normalizedType})
        AND (${like}::text IS NULL OR (
          i.name ILIKE ${like} OR i.description ILIKE ${like} OR i.author ILIKE ${like} OR o.name ILIKE ${like}
        ))
      ORDER BY i.downloads DESC, i.created_at DESC`;
    return { rows, offline: false };
  } catch (error) {
    logCatalogError('load', error);
    return { rows: [], offline: true };
  }
}

export async function loadItem(id) {
  const itemId = Number(id);
  if (!Number.isSafeInteger(itemId) || itemId <= 0) return null;

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT i.id, i.type, i.name, i.author, i.description, i.version,
             i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText", i.cover_image_url AS "coverImageUrl",
             i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
             u.username AS "ownerUsername", u.display_name AS "ownerDisplayName",
             u.avatar_url AS "ownerAvatar", o.id AS "organizationId", o.slug AS "organizationSlug",
             o.name AS "organizationName",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'ignis') AS "ignisFeatured",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'sponsored') AS "sponsoredFeatured"
      FROM items i
      LEFT JOIN users u ON u.id = i.author_id
      LEFT JOIN organizations o ON o.id = i.organization_id
      WHERE i.id = ${itemId} AND i.status = 'approved'
        AND ((i.organization_id IS NULL AND COALESCE(u.is_banned, false) = false)
          OR (i.organization_id IS NOT NULL AND COALESCE(o.is_banned, false) = false))`;
    return rows[0] || null;
  } catch (error) {
    logCatalogError('item', error);
    return null;
  }
}

export async function loadCreator(username) {
  try {
    const sql = getSql();
    const users = await sql`
      SELECT id, username, display_name AS "displayName", avatar_url AS "avatarUrl",
             created_at AS "createdAt"
      FROM users WHERE lower(username) = lower(${username}) AND is_banned = false`;
    if (users[0]) {
      const items = await sql`
        SELECT id, type, name, author, description, version,
               git_url AS "gitUrl", cover_image_text AS "coverImageText", cover_image_url AS "coverImageUrl",
               dependencies, downloads
        FROM items WHERE author_id = ${users[0].id} AND organization_id IS NULL AND status = 'approved'
        ORDER BY downloads DESC, created_at DESC`;
      return { ...users[0], items };
    }

    const legacyItems = await sql`
      SELECT id, type, name, author, description, version,
             git_url AS "gitUrl", cover_image_text AS "coverImageText", cover_image_url AS "coverImageUrl",
             dependencies, downloads
      FROM items WHERE lower(author) = lower(${username}) AND organization_id IS NULL AND status = 'approved'
      ORDER BY downloads DESC, created_at DESC`;
    if (!legacyItems.length) return null;
    return { username, displayName: username, avatarUrl: null, items: legacyItems };
  } catch (error) {
    logCatalogError('creator', error);
    return null;
  }
}

export async function loadAdminStats() {
  try {
    const sql = getSql();
    const [users, items, downloads, promotions, reports, organizations] = await Promise.all([
      sql`SELECT count(*)::int AS count FROM users WHERE github_id <> 0`,
      sql`SELECT status, count(*)::int AS count FROM items GROUP BY status`,
      sql`SELECT COALESCE(sum(downloads), 0)::int AS count FROM items WHERE status = 'approved'`,
      sql`SELECT kind, count(*)::int AS count FROM item_promotions GROUP BY kind`,
      sql`SELECT count(*)::int AS count FROM reports WHERE status IN ('open', 'reviewing')`,
      sql`SELECT count(*)::int AS count FROM organizations WHERE is_banned = false`,
    ]);
    const byStatus = Object.fromEntries(items.map((row) => [row.status, row.count]));
    const byPromotion = Object.fromEntries(promotions.map((row) => [row.kind, row.count]));
    return {
      users: users[0]?.count || 0,
      approved: byStatus.approved || 0,
      pending: byStatus.pending || 0,
      rejected: byStatus.rejected || 0,
      downloads: downloads[0]?.count || 0,
      ignisFeatured: byPromotion.ignis || 0,
      sponsoredFeatured: byPromotion.sponsored || 0,
      reports: reports[0]?.count || 0,
      organizations: organizations[0]?.count || 0,
      offline: false,
    };
  } catch (error) {
    logCatalogError('admin-stats', error);
    return {
      users: 0, approved: 0, pending: 0, rejected: 0, downloads: 0,
      ignisFeatured: 0, sponsoredFeatured: 0, reports: 0, organizations: 0, offline: true,
    };
  }
}

function logCatalogError(operation, error) {
  console.error(`[catalog.${operation}]`, {
    name: error?.name || 'Error',
    code: error?.code || null,
  });
}
