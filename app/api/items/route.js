import { getSql } from '../../../lib/db';
import { auth } from '../../../auth';
import { validateSubmission } from '../../../lib/security';

export const dynamic = 'force-dynamic';

// GET /api/items            -> catalogo aprovado (de usuarios nao banidos)
// GET /api/items?type=plugin -> filtra por tipo
// GET /api/items?q=physics   -> busca
export async function GET(request) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const like = q ? `%${q}%` : null;

    let rows;
    if (type && like) {
      rows = await sql`
        SELECT i.id, i.type, i.name, i.author, i.description, i.version,
               i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText",
               i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
               u.username AS "ownerUsername", u.avatar_url AS "ownerAvatar"
        FROM items i LEFT JOIN users u ON u.id = i.author_id
        WHERE i.status = 'approved' AND COALESCE(u.is_banned, false) = false
          AND i.type = ${type}
          AND (i.name ILIKE ${like} OR i.description ILIKE ${like} OR i.author ILIKE ${like})
        ORDER BY i.downloads DESC, i.created_at DESC`;
    } else if (type) {
      rows = await sql`
        SELECT i.id, i.type, i.name, i.author, i.description, i.version,
               i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText",
               i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
               u.username AS "ownerUsername", u.avatar_url AS "ownerAvatar"
        FROM items i LEFT JOIN users u ON u.id = i.author_id
        WHERE i.status = 'approved' AND COALESCE(u.is_banned, false) = false
          AND i.type = ${type}
        ORDER BY i.downloads DESC, i.created_at DESC`;
    } else if (like) {
      rows = await sql`
        SELECT i.id, i.type, i.name, i.author, i.description, i.version,
               i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText",
               i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
               u.username AS "ownerUsername", u.avatar_url AS "ownerAvatar"
        FROM items i LEFT JOIN users u ON u.id = i.author_id
        WHERE i.status = 'approved' AND COALESCE(u.is_banned, false) = false
          AND (i.name ILIKE ${like} OR i.description ILIKE ${like} OR i.author ILIKE ${like})
        ORDER BY i.downloads DESC, i.created_at DESC`;
    } else {
      rows = await sql`
        SELECT i.id, i.type, i.name, i.author, i.description, i.version,
               i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText",
               i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
               u.username AS "ownerUsername", u.avatar_url AS "ownerAvatar"
        FROM items i LEFT JOIN users u ON u.id = i.author_id
        WHERE i.status = 'approved' AND COALESCE(u.is_banned, false) = false
        ORDER BY i.downloads DESC, i.created_at DESC`;
    }
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}

// POST /api/items -> publica um pacote.
// Exige: login (GitHub), nao estar banido, aceite dos termos, e passar no gate
// de seguranca. Vincula ao usuario dono (author_id).
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return Response.json({ error: 'Faca login com o GitHub para publicar.' }, { status: 401 });
    }

    const sql = getSql();

    // Re-checa o ban no banco (o token JWT pode estar defasado).
    const u = await sql`SELECT is_banned FROM users WHERE id = ${session.user.id}`;
    if (u.length === 0) {
      return Response.json({ error: 'Usuario nao encontrado.' }, { status: 401 });
    }
    if (u[0].is_banned) {
      return Response.json({ error: 'Conta banida do marketplace.' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.acceptTerms) {
      return Response.json(
        { error: 'Voce precisa aceitar os Termos de Servico e a Politica de Privacidade.' },
        { status: 400 }
      );
    }

    // Gate de seguranca: campos + repositorio Git.
    const report = await validateSubmission(body);
    if (!report.ok) {
      return Response.json(
        { error: 'Submissao reprovada na verificacao de seguranca.', report },
        { status: 422 }
      );
    }

    // Registra o aceite dos termos no perfil do usuario.
    await sql`UPDATE users SET accepted_terms_at = now() WHERE id = ${session.user.id}`;

    const authorName = body.author && String(body.author).trim()
      ? String(body.author).trim()
      : (session.user.login || session.user.name || 'unknown');

    const rows = await sql`
      INSERT INTO items
        (type, name, author, description, version, git_url, cover_image_text,
         dependencies, author_id, status, security_report)
      VALUES
        (${body.type}, ${String(body.name).trim()}, ${authorName},
         ${body.description || ''}, ${body.version || '1.0.0'}, ${String(body.gitUrl).trim()},
         ${body.coverImageText || ''}, ${body.dependencies || 'None'},
         ${session.user.id}, 'approved', ${JSON.stringify(report)})
      ON CONFLICT (git_url) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description,
        version = EXCLUDED.version, cover_image_text = EXCLUDED.cover_image_text,
        dependencies = EXCLUDED.dependencies, security_report = EXCLUDED.security_report
      RETURNING id, type, name, git_url AS "gitUrl", status`;

    return Response.json({ ok: true, item: rows[0], warnings: report.warnings }, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
