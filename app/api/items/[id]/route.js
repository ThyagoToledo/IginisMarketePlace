import { getSql } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const SELECT = `
  id, type, name, author, description, version,
  git_url AS "gitUrl", cover_image_text AS "coverImageText",
  dependencies, downloads, created_at AS "createdAt"
`;

// GET /api/items/:id -> detalhe de um pacote
export async function GET(_request, { params }) {
  try {
    const sql = getSql();
    const id = Number(params.id);
    const rows = await sql`SELECT ${sql.unsafe(SELECT)} FROM items WHERE id = ${id}`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}

// POST /api/items/:id -> incrementa contador de downloads (1-click install do editor)
export async function POST(_request, { params }) {
  try {
    const sql = getSql();
    const id = Number(params.id);
    const rows = await sql`
      UPDATE items SET downloads = downloads + 1
      WHERE id = ${id}
      RETURNING ${sql.unsafe(SELECT)}`;
    if (rows.length === 0) {
      return Response.json({ error: 'Pacote nao encontrado.' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
