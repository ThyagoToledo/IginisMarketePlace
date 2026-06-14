import { getSql } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// Mapeia colunas snake_case do Postgres -> camelCase consumido pelo editor Java.
const SELECT = `
  id, type, name, author, description, version,
  git_url AS "gitUrl", cover_image_text AS "coverImageText",
  dependencies, downloads, created_at AS "createdAt"
`;

// GET /api/items            -> catalogo completo
// GET /api/items?type=plugin -> filtra por tipo (plugin|workshop|asset)
// GET /api/items?q=physics   -> busca por nome/descricao/autor
export async function GET(request) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');

    let rows;
    if (type && q) {
      const like = `%${q}%`;
      rows = await sql`
        SELECT ${sql.unsafe(SELECT)} FROM items
        WHERE type = ${type}
          AND (name ILIKE ${like} OR description ILIKE ${like} OR author ILIKE ${like})
        ORDER BY downloads DESC, created_at DESC`;
    } else if (type) {
      rows = await sql`
        SELECT ${sql.unsafe(SELECT)} FROM items
        WHERE type = ${type}
        ORDER BY downloads DESC, created_at DESC`;
    } else if (q) {
      const like = `%${q}%`;
      rows = await sql`
        SELECT ${sql.unsafe(SELECT)} FROM items
        WHERE name ILIKE ${like} OR description ILIKE ${like} OR author ILIKE ${like}
        ORDER BY downloads DESC, created_at DESC`;
    } else {
      rows = await sql`
        SELECT ${sql.unsafe(SELECT)} FROM items
        ORDER BY downloads DESC, created_at DESC`;
    }

    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}

// POST /api/items -> publica um pacote (apenas URL Git, nunca binario).
// body JSON: { type, name, author, description, version, gitUrl, coverImageText, dependencies }
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, name, author, gitUrl } = body;

    if (!type || !name || !author || !gitUrl) {
      return Response.json(
        { error: 'Campos obrigatorios: type, name, author, gitUrl.' },
        { status: 400 }
      );
    }
    if (!['plugin', 'workshop', 'asset'].includes(type)) {
      return Response.json({ error: 'type invalido.' }, { status: 400 });
    }

    const sql = getSql();
    const rows = await sql`
      INSERT INTO items (type, name, author, description, version, git_url, cover_image_text, dependencies)
      VALUES (
        ${type}, ${name}, ${author},
        ${body.description || ''}, ${body.version || '1.0.0'}, ${gitUrl},
        ${body.coverImageText || ''}, ${body.dependencies || 'None'}
      )
      ON CONFLICT (git_url) DO UPDATE SET
        name = EXCLUDED.name, author = EXCLUDED.author,
        description = EXCLUDED.description, version = EXCLUDED.version,
        cover_image_text = EXCLUDED.cover_image_text, dependencies = EXCLUDED.dependencies
      RETURNING ${sql.unsafe(SELECT)}`;

    return Response.json(rows[0], { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
