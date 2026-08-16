import { getSql } from '../../../../lib/db';
import { auth } from '../../../../auth';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

// DELETE /api/tokens/:id -> revoga um token do proprio usuario.
export async function DELETE(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: 'Faca login.' }, { status: 401 });
  }
  try {
    const sql = getSql();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ error: 'Token invalido.' }, { status: 400 });
    }
    const rows = await sql`
      DELETE FROM api_tokens WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id`;
    if (rows.length === 0) {
      return Response.json({ error: 'Token nao encontrado.' }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return serviceUnavailable('tokens.delete', err);
  }
}
