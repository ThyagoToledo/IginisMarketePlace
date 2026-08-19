import { auth } from '../../../../../../auth';
import { getSql } from '../../../../../../lib/db';
import { getOrganizationAccess, hasOrganizationRole } from '../../../../../../lib/organization-access';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../../../lib/api-errors';

export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const session = await auth();
    const actorId = Number(session?.user?.id);
    const { slug, userId: rawUserId } = await params;
    const userId = Number(rawUserId);
    const access = await getOrganizationAccess(actorId, { slug });
    if (!hasOrganizationRole(access) || !Number.isSafeInteger(userId)) return Response.json({ error: 'Sem permissão.' }, { status: 403 });
    const body = await request.json();
    const sql = getSql();
    const target = await sql`SELECT role FROM organization_members WHERE organization_id=${access.id} AND user_id=${userId}`;
    if (!target[0]) return Response.json({ error: 'Membro não encontrado.' }, { status: 404 });
    if (target[0].role === 'owner') return Response.json({ error: 'O proprietário não pode ser alterado ou removido.' }, { status: 400 });
    if (body.action === 'remove') await sql`DELETE FROM organization_members WHERE organization_id=${access.id} AND user_id=${userId}`;
    else if (body.action === 'role' && ['admin','member'].includes(body.role)) await sql`UPDATE organization_members SET role=${body.role} WHERE organization_id=${access.id} AND user_id=${userId}`;
    else return Response.json({ error: 'Ação inválida.' }, { status: 400 });
    return Response.json({ ok: true });
  } catch (error) { return serviceUnavailable('organization.member.post', error); }
}
