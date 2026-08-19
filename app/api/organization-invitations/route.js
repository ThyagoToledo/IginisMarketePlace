import { auth } from '../../../auth';
import { getSql } from '../../../lib/db';
import { serviceUnavailable } from '../../../lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!Number.isSafeInteger(userId) || userId <= 0) return Response.json({ error: 'Não autenticado.' }, { status: 401 });
    const sql = getSql();
    const rows = await sql`SELECT o.id AS "organizationId", o.slug, o.name, m.role, m.invited_at AS "invitedAt" FROM organization_members m JOIN organizations o ON o.id=m.organization_id WHERE m.user_id=${userId} AND m.status='invited' AND o.is_banned=false ORDER BY m.invited_at DESC`;
    return Response.json(rows);
  } catch (error) { return serviceUnavailable('organization.invitations.get', error); }
}
