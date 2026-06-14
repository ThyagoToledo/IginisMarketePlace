import { getSql } from '../../../lib/db';
import { auth } from '../../../auth';
import { generateToken, hashToken } from '../../../lib/apiauth';

export const dynamic = 'force-dynamic';

// Tokens sao gerenciados apenas via sessao web (nao se cria token com token).
async function requireSession() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) return null;
  return session.user;
}

// GET /api/tokens -> lista os tokens do usuario (sem o valor secreto).
export async function GET() {
  const user = await requireSession();
  if (!user) return Response.json({ error: 'Faca login.' }, { status: 401 });
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, token_prefix AS "tokenPrefix", name,
             last_used_at AS "lastUsedAt", created_at AS "createdAt"
      FROM api_tokens WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}

// POST /api/tokens  body: { name? } -> cria um token e RETORNA o valor 1 unica vez.
export async function POST(request) {
  const user = await requireSession();
  if (!user) return Response.json({ error: 'Faca login.' }, { status: 401 });
  try {
    let name = 'editor';
    try {
      const body = await request.json();
      if (body && body.name) name = String(body.name).slice(0, 60);
    } catch {
      /* body opcional */
    }

    const token = generateToken();
    const sql = getSql();
    await sql`
      INSERT INTO api_tokens (user_id, token_hash, token_prefix, name)
      VALUES (${user.id}, ${hashToken(token)}, ${token.slice(0, 12)}, ${name})`;

    // O valor so aparece aqui — depois fica so o hash.
    return Response.json({ token, name }, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 503 });
  }
}
