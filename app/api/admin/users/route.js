import { getSql } from '../../../../lib/db';
import { getCurrentAdmin } from '../../../../lib/admin';
import { serviceUnavailable } from '../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

// GET /api/admin/users -> lista usuarios (somente admin).
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }
    const sql = getSql();
    const rows = await sql`
      SELECT id, github_id AS "githubId", username, display_name AS "displayName",
             email, avatar_url AS "avatarUrl", is_admin AS "isAdmin",
             is_banned AS "isBanned", ban_reason AS "banReason",
             created_at AS "createdAt"
      FROM users ORDER BY id`;
    return Response.json(rows);
  } catch (err) {
    return serviceUnavailable('admin.users.get', err);
  }
}
