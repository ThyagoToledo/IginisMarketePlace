import { getSql } from '../../../../../lib/db';
import { auth } from '../../../../../auth';

export const dynamic = 'force-dynamic';

// POST /api/admin/users/:id  body: { action: "ban"|"unban", reason? }
// Banir/desbanir um usuario (somente admin). Nao permite banir admin.
export async function POST(request, { params }) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
  }
  try {
    const id = Number(params.id);
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
      await sql`UPDATE users SET is_banned = true, ban_reason = ${body.reason || 'Violacao das regras'} WHERE id = ${id}`;
    } else if (action === 'unban') {
      await sql`UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = ${id}`;
    } else {
      return Response.json({ error: 'Acao invalida (use ban ou unban).' }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
