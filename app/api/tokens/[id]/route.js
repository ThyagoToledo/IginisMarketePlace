import { getSql } from '../../../../lib/db';
import { auth } from '../../../../auth';

export const dynamic = 'force-dynamic';

// DELETE /api/tokens/:id -> revoga um token do proprio usuario.
export async function DELETE(_request, { params }) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: 'Faca login.' }, { status: 401 });
  }
  try {
    const sql = getSql();
    const id = Number(params.id);
    const rows = await sql`
      DELETE FROM api_tokens WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id`;
    if (rows.length === 0) {
      return Response.json({ error: 'Token nao encontrado.' }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
