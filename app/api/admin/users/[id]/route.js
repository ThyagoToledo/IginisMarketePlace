import { getSql } from '../../../../../lib/db';
import { getCurrentAdmin } from '../../../../../lib/admin';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

// POST /api/admin/users/:id  body: { action: "ban"|"unban", reason? }
// Banir/desbanir um usuario (somente admin). Nao permite banir admin.
export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;

  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ error: 'Usuario invalido.' }, { status: 400 });
    }
    const body = await request.json();
    const action = body.action;
    const sql = getSql();

    const target = await sql`SELECT is_admin FROM users WHERE id = ${id}`;
    if (target.length === 0) {
      return Response.json({ error: 'Usuario nao encontrado.' }, { status: 404 });
    }
    if (target[0].is_admin) {
      return Response.json({ error: 'Nao e possivel banir um administrador.' }, { status: 400 });
    }

    if (action === 'ban') {
      const reason = String(body.reason || 'Violacao das regras').trim().slice(0, 500);
      await sql`UPDATE users SET is_banned = true, ban_reason = ${reason} WHERE id = ${id}`;
    } else if (action === 'unban') {
      await sql`UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = ${id}`;
    } else {
      return Response.json({ error: 'Acao invalida (use ban ou unban).' }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return serviceUnavailable('admin.users.post', err);
  }
}
