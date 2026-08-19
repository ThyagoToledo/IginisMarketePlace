import { getSql } from '../../../lib/db';
import { resolveUser } from '../../../lib/apiauth';
import { validateSubmission } from '../../../lib/security';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../lib/api-errors';
import { validateCoverImageUrl } from '../../../lib/cover-images.mjs';
import { getOrganizationAccess, hasOrganizationRole } from '../../../lib/organization-access';
import { parseOrganizationId } from '../../../lib/organizations.mjs';

export const dynamic = 'force-dynamic';

// GET /api/items            -> catalogo aprovado (de usuarios nao banidos)
// GET /api/items?type=plugin -> filtra por tipo
// GET /api/items?q=physics   -> busca
export async function GET(request) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get('type');
    const type = ['plugin', 'workshop', 'asset'].includes(requestedType) ? requestedType : null;
    const term = String(searchParams.get('q') || '').trim();
    const like = term ? `%${term}%` : null;

    const rows = await sql`
      SELECT i.id, i.type, i.name, i.author, i.description, i.version,
             i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText", i.cover_image_url AS "coverImageUrl",
             i.dependencies, i.downloads, i.status, i.created_at AS "createdAt",
             u.username AS "ownerUsername", u.avatar_url AS "ownerAvatar",
             o.slug AS "organizationSlug", o.name AS "organizationName",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'ignis') AS "ignisFeatured",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'sponsored') AS "sponsoredFeatured"
      FROM items i LEFT JOIN users u ON u.id = i.author_id
      LEFT JOIN organizations o ON o.id = i.organization_id
      WHERE i.status = 'approved'
        AND ((i.organization_id IS NULL AND COALESCE(u.is_banned, false) = false)
          OR (i.organization_id IS NOT NULL AND COALESCE(o.is_banned, false) = false))
        AND (${type}::text IS NULL OR i.type = ${type})
        AND (${like}::text IS NULL OR (
          i.name ILIKE ${like} OR i.description ILIKE ${like} OR i.author ILIKE ${like} OR o.name ILIKE ${like}
        ))
      ORDER BY i.downloads DESC, i.created_at DESC`;
    return Response.json(rows);
  } catch (err) {
    return serviceUnavailable('items.get', err);
  }
}

// POST /api/items -> publica um pacote.
// Exige: login (GitHub), nao estar banido, aceite dos termos, e passar no gate
// de seguranca. Vincula ao usuario dono (author_id).
export async function POST(request) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;

  try {
    // Aceita sessao web (cookie) OU token Bearer (editor/CLI).
    const user = await resolveUser(request);
    if (!user) {
      return Response.json(
        { error: 'Nao autenticado. Faca login com GitHub ou envie um token valido.' },
        { status: 401 }
      );
    }

    const sql = getSql();

    // Re-checa o ban no banco (fonte da verdade).
    const u = await sql`SELECT is_banned FROM users WHERE id = ${user.id}`;
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

    const cover = validateCoverImageUrl(body.coverImageUrl);
    if (!cover.ok) return Response.json({ error: cover.error }, { status: 400 });
    const organizationId = body.organizationId ? parseOrganizationId(body.organizationId) : null;
    if (body.organizationId && !organizationId) {
      return Response.json({ error: 'Organização inválida.' }, { status: 400 });
    }
    if (organizationId) {
      const access = await getOrganizationAccess(user.id, { id: organizationId });
      if (!hasOrganizationRole(access)) {
        return Response.json({ error: 'Você precisa ser proprietário ou administrador ativo da organização.' }, { status: 403 });
      }
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
    await sql`UPDATE users SET accepted_terms_at = now() WHERE id = ${user.id}`;

    const authorName = body.author && String(body.author).trim()
      ? String(body.author).trim()
      : (user.login || user.name || 'unknown');

    const rows = await sql`
      INSERT INTO items
        (type, name, author, description, version, git_url, cover_image_text, cover_image_url,
         dependencies, author_id, organization_id, status, security_report)
      VALUES
        (${body.type}, ${String(body.name).trim()}, ${authorName},
         ${body.description || ''}, ${body.version || '1.0.0'}, ${String(body.gitUrl).trim()},
         ${body.coverImageText || ''}, ${cover.value}, ${body.dependencies || 'None'},
         ${user.id}, ${organizationId}, 'approved', ${JSON.stringify(report)})
      ON CONFLICT (git_url) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description,
        version = EXCLUDED.version, cover_image_text = EXCLUDED.cover_image_text,
        cover_image_url = EXCLUDED.cover_image_url, organization_id = EXCLUDED.organization_id,
        dependencies = EXCLUDED.dependencies, security_report = EXCLUDED.security_report
      WHERE items.author_id = EXCLUDED.author_id
      RETURNING id, type, name, git_url AS "gitUrl", status`;

    if (!rows[0]) {
      return Response.json(
        { error: 'Este repositorio ja pertence a outro criador.' },
        { status: 409 }
      );
    }

    return Response.json({ ok: true, item: rows[0], warnings: report.warnings }, { status: 201 });
  } catch (err) {
    return serviceUnavailable('items.post', err);
  }
}
