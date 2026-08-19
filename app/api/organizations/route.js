import { auth } from '../../../auth';
import { getSql } from '../../../lib/db';
import { parseOrganizationPayload } from '../../../lib/organizations.mjs';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get('q') || '').trim();
    const like = q ? `%${q}%` : null;
    const sql = getSql();
    const rows = await sql`
      SELECT o.id, o.slug, o.name, o.description, o.created_at AS "createdAt",
        count(DISTINCT m.user_id)::int AS "memberCount",
        count(DISTINCT i.id)::int AS "itemCount"
      FROM organizations o
      LEFT JOIN organization_members m ON m.organization_id = o.id AND m.status = 'active'
      LEFT JOIN items i ON i.organization_id = o.id AND i.status = 'approved'
      WHERE o.is_banned = false AND (${like}::text IS NULL OR o.name ILIKE ${like} OR o.slug ILIKE ${like})
      GROUP BY o.id ORDER BY lower(o.name) LIMIT 100`;
    return Response.json(rows);
  } catch (error) { return serviceUnavailable('organizations.get', error); }
}

export async function POST(request) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!Number.isSafeInteger(userId) || userId <= 0) return Response.json({ error: 'Faça login para criar uma organização.' }, { status: 401 });
    const sql = getSql();
    const users = await sql`SELECT is_banned FROM users WHERE id = ${userId}`;
    if (!users[0] || users[0].is_banned) return Response.json({ error: 'Conta sem permissão.' }, { status: 403 });
    const parsed = parseOrganizationPayload(await request.json());
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
    const rows = await sql`WITH created AS (INSERT INTO organizations (slug,name,description,created_by) VALUES (${parsed.slug},${parsed.name},${parsed.description},${userId}) RETURNING id,slug,name), membership AS (INSERT INTO organization_members (organization_id,user_id,role,status,invited_by,accepted_at) SELECT id,${userId},'owner','active',${userId},now() FROM created) SELECT id,slug,name FROM created`;
    const organization = rows[0];
    return Response.json({ ok: true, organization }, { status: 201 });
  } catch (error) {
    if (error?.code === '23505') return Response.json({ error: 'Este identificador já está em uso.' }, { status: 409 });
    return serviceUnavailable('organizations.post', error);
  }
}
