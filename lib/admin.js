import { auth } from '../auth';
import { getSql } from './db';

export async function getCurrentAdmin() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT id, username
    FROM users
    WHERE id = ${userId} AND is_admin = true AND is_banned = false`;
  return rows[0] || null;
}
