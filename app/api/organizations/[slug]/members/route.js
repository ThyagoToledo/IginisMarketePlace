import { auth } from '../../../../../auth';
import { getSql } from '../../../../../lib/db';
import { getOrganizationAccess, hasOrganizationRole } from '../../../../../lib/organization-access';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

async function manager(slug) {
  const session = await auth();
  const access = await getOrganizationAccess(Number(session?.user?.id), { slug });
  return hasOrganizationRole(access) ? { access, userId: Number(session.user.id) } : null;
}

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const current = await manager(slug);
    if (!current) return Response.json({ error: 'Sem permissão.' }, { status: 403 });
    const sql = getSql();
    const rows = await sql`SELECT u.id, u.username, u.display_name AS "displayName", u.avatar_url AS "avatarUrl", m.role, m.status, m.invited_at AS "invitedAt" FROM organization_members m JOIN users u ON u.id=m.user_id WHERE m.organization_id=${current.access.id} ORDER BY m.status, m.role, lower(u.username)`;
    return Response.json(rows);
  } catch (error) { return serviceUnavailable('organization.members.get', error); }
}

export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const { slug } = await params;
    const current = await manager(slug);
    if (!current) return Response.json({ error: 'Sem permissão.' }, { status: 403 });
    const body = await request.json();
    const username = String(body.username || '').trim();
    const role = ['admin', 'member'].includes(body.role) ? body.role : 'member';
    const sql = getSql();
    const users = await sql`SELECT id, is_banned FROM users WHERE lower(username)=lower(${username})`;
    if (!users[0] || users[0].is_banned) return Response.json({ error: 'Usuário não encontrado ou indisponível.' }, { status: 404 });
    if (Number(users[0].id) === current.userId) return Response.json({ error: 'Você já pertence à organização.' }, { status: 400 });
    await sql`INSERT INTO organization_members (organization_id,user_id,role,status,invited_by) VALUES (${current.access.id},${users[0].id},${role},'invited',${current.userId}) ON CONFLICT (organization_id,user_id) DO UPDATE SET role=EXCLUDED.role,status='invited',invited_by=EXCLUDED.invited_by,invited_at=now(),accepted_at=NULL`;
    return Response.json({ ok: true });
  } catch (error) { return serviceUnavailable('organization.members.post', error); }
}
