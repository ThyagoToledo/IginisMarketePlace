import { getSql } from './db';

export async function getOrganizationAccess(userId, { id = null, slug = null } = {}) {
  const normalizedUserId = Number(userId);
  if (!Number.isSafeInteger(normalizedUserId) || normalizedUserId <= 0) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT o.id, o.slug, o.name, o.description, o.is_banned AS "isBanned",
           m.role, m.status AS "membershipStatus"
    FROM organizations o
    LEFT JOIN organization_members m
      ON m.organization_id = o.id AND m.user_id = ${normalizedUserId}
    WHERE (${id}::int IS NULL OR o.id = ${id})
      AND (${slug}::text IS NULL OR lower(o.slug) = lower(${slug}))
    LIMIT 1`;
  return rows[0] || null;
}

export function hasOrganizationRole(access, roles = ['owner', 'admin']) {
  return Boolean(
    access
    && !access.isBanned
    && access.membershipStatus === 'active'
    && roles.includes(access.role)
  );
}
