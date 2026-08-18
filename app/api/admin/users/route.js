import { getSql } from '../../../../lib/db';
import { getCurrentAdmin } from '../../../../lib/admin';
import { serviceUnavailable } from '../../../../lib/api-errors';
import { parseAdminUsersQuery } from '../../../../lib/admin-users.mjs';

export const dynamic = 'force-dynamic';

// GET /api/admin/users?q=&status=&page=&limit= -> busca paginada (somente admin).
export async function GET(request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }
    const sql = getSql();
    const { q, status, page, limit, offset } = parseAdminUsersQuery(request.url);
    const like = q ? `%${q}%` : null;
    const numericId = Number(q);
    const exactId = /^\d+$/.test(q) && Number.isSafeInteger(numericId) && numericId <= 2147483647
      ? numericId
      : null;
    const [countRows, rows] = await Promise.all([
      sql`
        SELECT count(*)::int AS count
        FROM users
        WHERE github_id <> 0
          AND (${like}::text IS NULL OR id = ${exactId} OR username ILIKE ${like}
            OR display_name ILIKE ${like} OR email ILIKE ${like})
          AND (
            ${status}::text = 'all'
            OR (${status}::text = 'active' AND is_banned = false)
            OR (${status}::text = 'banned' AND is_banned = true)
            OR (${status}::text = 'admin' AND is_admin = true)
          )`,
      sql`
      SELECT id, github_id AS "githubId", username, display_name AS "displayName",
             email, avatar_url AS "avatarUrl", is_admin AS "isAdmin",
             is_banned AS "isBanned", ban_reason AS "banReason",
             created_at AS "createdAt"
      FROM users
      WHERE github_id <> 0
        AND (${like}::text IS NULL OR id = ${exactId} OR username ILIKE ${like}
          OR display_name ILIKE ${like} OR email ILIKE ${like})
        AND (
          ${status}::text = 'all'
          OR (${status}::text = 'active' AND is_banned = false)
          OR (${status}::text = 'banned' AND is_banned = true)
          OR (${status}::text = 'admin' AND is_admin = true)
        )
      ORDER BY id
      LIMIT ${limit} OFFSET ${offset}`,
    ]);
    const total = countRows[0]?.count || 0;
    return Response.json({
      users: rows,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    return serviceUnavailable('admin.users.get', err);
  }
}
