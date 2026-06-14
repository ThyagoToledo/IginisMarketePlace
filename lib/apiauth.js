import { createHash, randomBytes } from 'node:crypto';
import { getSql } from './db';
import { auth } from '../auth';

const TOKEN_PREFIX = 'ign_';

// Gera um token novo em texto puro (mostrado 1x ao usuario).
export function generateToken() {
  return TOKEN_PREFIX + randomBytes(32).toString('base64url');
}

// Hash SHA-256 (guardamos so o hash no banco).
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// Resolve o usuario autenticado a partir da sessao (web) OU de um
// "Authorization: Bearer <token>" (editor/CLI). Retorna o usuario ou null.
export async function resolveUser(request) {
  // 1) Sessao (cookie) — fluxo web
  const session = await auth();
  if (session && session.user && session.user.id) {
    return {
      id: session.user.id,
      login: session.user.login,
      name: session.user.name,
      isAdmin: !!session.user.isAdmin,
      isBanned: !!session.user.isBanned,
      via: 'session',
    };
  }

  // 2) Token Bearer — fluxo editor/CLI
  const authz = request.headers.get('authorization') || '';
  const m = authz.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;

  const token = m[1].trim();
  if (!token.startsWith(TOKEN_PREFIX)) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.username AS login, u.display_name AS name,
           u.is_admin AS "isAdmin", u.is_banned AS "isBanned", t.id AS token_id
    FROM api_tokens t JOIN users u ON u.id = t.user_id
    WHERE t.token_hash = ${hashToken(token)}`;
  if (rows.length === 0) return null;

  // Marca uso (best-effort).
  try {
    await sql`UPDATE api_tokens SET last_used_at = now() WHERE id = ${rows[0].token_id}`;
  } catch {
    /* ignore */
  }

  return {
    id: rows[0].id,
    login: rows[0].login,
    name: rows[0].name,
    isAdmin: !!rows[0].isAdmin,
    isBanned: !!rows[0].isBanned,
    via: 'token',
  };
}
