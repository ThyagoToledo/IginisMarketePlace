import { auth } from '../../../../auth';
import { getSql } from '../../../../lib/db';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../lib/api-errors';
import { parseOrganizationId } from '../../../../lib/organizations.mjs';

export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    const { organizationId: rawId } = await params;
    const organizationId = parseOrganizationId(rawId);
    if (!Number.isSafeInteger(userId) || !organizationId) return Response.json({ error: 'Requisição inválida.' }, { status: 400 });
    const { action } = await request.json();
    const sql = getSql();
    const rows = action === 'accept'
      ? await sql`UPDATE organization_members m SET status='active',accepted_at=now() FROM organizations o WHERE m.organization_id=${organizationId} AND m.user_id=${userId} AND m.status='invited' AND o.id=m.organization_id AND o.is_banned=false RETURNING m.organization_id`
      : action === 'reject'
        ? await sql`DELETE FROM organization_members WHERE organization_id=${organizationId} AND user_id=${userId} AND status='invited' RETURNING organization_id`
        : [];
    if (!rows[0]) return Response.json({ error: 'Convite não encontrado ou ação inválida.' }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) { return serviceUnavailable('organization.invitation.post', error); }
}
