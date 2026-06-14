import { getSql } from '../../../../lib/db';
import { auth } from '../../../../auth';

export const dynamic = 'force-dynamic';

// GET /api/items/:id -> detalhe de um pacote
export async function GET(_request, { params }) {
  try {
    const sql = getSql();
    const id = Number(params.id);
    const rows = await sql`
      SELECT id, type, name, author, description, version,
             git_url AS "gitUrl", cover_image_text AS "coverImageText",
             dependencies, downloads, status, author_id AS "authorId",
             created_at AS "createdAt"
      FROM items WHERE id = ${id}`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}

// POST /api/items/:id -> incrementa downloads (1-click install do editor)
export async function POST(_request, { params }) {
  try {
    const sql = getSql();
    const id = Number(params.id);
    const rows = await sql`
      UPDATE items SET downloads = downloads + 1
      WHERE id = ${id} AND status = 'approved'
      RETURNING id, downloads`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}

// DELETE /api/items/:id -> remove um pacote (admin OU dono)
export async function DELETE(_request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
    }
    const sql = getSql();
    const id = Number(params.id);
    const rows = await sql`SELECT author_id FROM items WHERE id = ${id}`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    const isOwner = rows[0].author_id === session.user.id;
    if (!session.user.isAdmin && !isOwner) {
      return Response.json({ error: 'Sem permissao.' }, { status: 403 });
    }
    await sql`DELETE FROM items WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
