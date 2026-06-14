import { getSql } from '../../../../lib/db';
import { auth } from '../../../../auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/users -> lista usuarios (somente admin).
export async function GET() {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
  }
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, github_id AS "githubId", username, display_name AS "displayName",
             email, avatar_url AS "avatarUrl", is_admin AS "isAdmin",
             is_banned AS "isBanned", ban_reason AS "banReason",
             created_at AS "createdAt"
      FROM users ORDER BY id`;
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
