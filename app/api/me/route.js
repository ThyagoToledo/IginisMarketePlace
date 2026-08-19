import { auth } from '../../../auth';
import { getSql } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// GET /api/me -> dados do usuario logado (ou {authenticated:false}).
export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return Response.json({ authenticated: false });
  }
  const userId = Number(session.user.id);
  let organizations = [];
  if (Number.isSafeInteger(userId) && userId > 0 && !session.user.isBanned) {
    const sql = getSql();
    organizations = await sql`
      SELECT o.id, o.slug, o.name, m.role
      FROM organization_members m JOIN organizations o ON o.id = m.organization_id
      WHERE m.user_id = ${userId} AND m.status = 'active'
        AND m.role IN ('owner', 'admin') AND o.is_banned = false
      ORDER BY lower(o.name)`;
  }
  return Response.json({
    authenticated: true,
    id: session.user.id,
    name: session.user.name,
    login: session.user.login,
    avatar: session.user.image,
    isAdmin: !!session.user.isAdmin,
    isBanned: !!session.user.isBanned,
    organizations,
  });
}
