import { getSql } from '../../../../lib/db';
import { auth } from '../../../../auth';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

// GET /api/items/:id -> detalhe de um pacote
export async function GET(_request, { params }) {
  try {
    const sql = getSql();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ error: 'Pacote invalido.' }, { status: 400 });
    }
    const rows = await sql`
      SELECT i.id, i.type, i.name, i.author, i.description, i.version,
             i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText",
             i.dependencies, i.downloads, i.status, i.author_id AS "authorId",
             i.created_at AS "createdAt",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'ignis') AS "ignisFeatured",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'sponsored') AS "sponsoredFeatured"
      FROM items i LEFT JOIN users u ON u.id = i.author_id
      WHERE i.id = ${id} AND i.status = 'approved'
        AND COALESCE(u.is_banned, false) = false`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return serviceUnavailable('items.detail.get', err);
  }
}

// POST /api/items/:id -> incrementa downloads (1-click install do editor)
export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;

  try {
    const sql = getSql();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ error: 'Pacote invalido.' }, { status: 400 });
    }
    const rows = await sql`
      UPDATE items i SET downloads = i.downloads + 1
      WHERE i.id = ${id} AND i.status = 'approved'
        AND NOT EXISTS (
          SELECT 1 FROM users u WHERE u.id = i.author_id AND u.is_banned = true
        )
      RETURNING i.id, i.downloads`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return serviceUnavailable('items.detail.post', err);
  }
}

// DELETE /api/items/:id -> remove um pacote (admin OU dono)
export async function DELETE(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;

  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
    }
    const sql = getSql();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const userId = Number(session.user.id);
    if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(userId) || userId <= 0) {
      return Response.json({ error: 'Requisicao invalida.' }, { status: 400 });
    }
    const [rows, users] = await Promise.all([
      sql`SELECT author_id FROM items WHERE id = ${id}`,
      sql`SELECT is_admin, is_banned FROM users WHERE id = ${userId}`,
    ]);
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    if (!users[0] || users[0].is_banned) {
      return Response.json({ error: 'Sem permissao.' }, { status: 403 });
    }
    const isOwner = Number(rows[0].author_id) === userId;
    if (!users[0].is_admin && !isOwner) {
      return Response.json({ error: 'Sem permissao.' }, { status: 403 });
    }
    await sql`DELETE FROM items WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return serviceUnavailable('items.detail.delete', err);
  }
}
