import { auth } from '../../../../auth';
import { getSql } from '../../../../lib/db';
import { loadCommunityQuestions } from '../../../../lib/community-data';
import { parseQuestionPayload } from '../../../../lib/community.mjs';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const result = await loadCommunityQuestions(request.url);
  if (result.offline) return Response.json({ error: 'Comunidade indisponível.' }, { status: 503 });
  return Response.json({ questions: result.rows, pagination: result.pagination });
}

export async function POST(request) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!Number.isSafeInteger(userId) || userId <= 0) return Response.json({ error: 'Faça login para publicar uma pergunta.' }, { status: 401 });
    const parsed = parseQuestionPayload(await request.json());
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
    const sql = getSql();
    const users = await sql`SELECT is_banned FROM users WHERE id=${userId}`;
    if (!users[0] || users[0].is_banned) return Response.json({ error: 'Conta sem permissão.' }, { status: 403 });
    const rows = await sql`INSERT INTO community_questions (author_id,title,body,category) VALUES (${userId},${parsed.title},${parsed.body},${parsed.category}) RETURNING id,title,category,created_at AS "createdAt"`;
    return Response.json({ ok: true, question: rows[0] }, { status: 201 });
  } catch (error) { return serviceUnavailable('community.questions.post', error); }
}
