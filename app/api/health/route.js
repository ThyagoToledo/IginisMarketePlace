import { getSql } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// GET /api/health -> verifica se a API e o banco Neon estao online.
export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`SELECT count(*)::int AS total FROM items`;
    return Response.json({ status: 'ok', db: 'connected', items: rows[0].total });
  } catch (err) {
    return Response.json(
      { status: 'degraded', db: 'unavailable', error: String(err.message || err) },
      { status: 503 }
    );
  }
}
