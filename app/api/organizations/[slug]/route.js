import { auth } from '../../../../auth';
import { getSql } from '../../../../lib/db';
import { getOrganizationAccess, hasOrganizationRole } from '../../../../lib/organization-access';
import { parseOrganizationPayload } from '../../../../lib/organizations.mjs';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const sql = getSql();
    const rows = await sql`
      SELECT o.id,o.slug,o.name,o.description,o.created_at AS "createdAt",
        count(DISTINCT m.user_id)::int AS "memberCount",
        count(DISTINCT i.id)::int AS "itemCount"
      FROM organizations o
      LEFT JOIN organization_members m ON m.organization_id=o.id AND m.status='active'
      LEFT JOIN items i ON i.organization_id=o.id AND i.status='approved'
      WHERE lower(o.slug)=lower(${decodeURIComponent(slug)}) AND o.is_banned=false
      GROUP BY o.id`;
    if (!rows[0]) return Response.json({ error: 'Organização não encontrada.' }, { status: 404 });
    return Response.json(rows[0]);
  } catch (error) { return serviceUnavailable('organization.get', error); }
}

export async function PATCH(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    const { slug } = await params;
    const access = await getOrganizationAccess(userId, { slug });
    if (!hasOrganizationRole(access)) return Response.json({ error: 'Sem permissão.' }, { status: 403 });
    const parsed = parseOrganizationPayload(await request.json());
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
    const sql = getSql();
    const rows = await sql`UPDATE organizations SET slug=${parsed.slug}, name=${parsed.name}, description=${parsed.description}, updated_at=now() WHERE id=${access.id} RETURNING id, slug, name, description`;
    return Response.json({ ok: true, organization: rows[0] });
  } catch (error) {
    if (error?.code === '23505') return Response.json({ error: 'Este identificador já está em uso.' }, { status: 409 });
    return serviceUnavailable('organization.patch', error);
  }
}
