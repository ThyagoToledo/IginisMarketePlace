import { auth } from '../../../../../../auth';
import { getSql } from '../../../../../../lib/db';
import { parseAnswerPayload, parseCommunityId } from '../../../../../../lib/community.mjs';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../../../lib/api-errors';

export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    const { id: rawId } = await params;
    const questionId = parseCommunityId(rawId);
    if (!Number.isSafeInteger(userId) || userId <= 0) return Response.json({ error: 'Faça login para responder.' }, { status: 401 });
    if (!questionId) return Response.json({ error: 'Pergunta inválida.' }, { status: 400 });
    const parsed = parseAnswerPayload(await request.json());
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
    const sql = getSql();
    const [users, questions] = await Promise.all([
      sql`SELECT is_banned FROM users WHERE id=${userId}`,
      sql`SELECT q.id FROM community_questions q JOIN users u ON u.id=q.author_id WHERE q.id=${questionId} AND q.status='published' AND u.is_banned=false`,
    ]);
    if (!users[0] || users[0].is_banned) return Response.json({ error: 'Conta sem permissão.' }, { status: 403 });
    if (!questions[0]) return Response.json({ error: 'Pergunta não encontrada.' }, { status: 404 });
    const rows = await sql`INSERT INTO community_answers (question_id,author_id,body) VALUES (${questionId},${userId},${parsed.body}) RETURNING id,created_at AS "createdAt"`;
    return Response.json({ ok: true, answer: rows[0] }, { status: 201 });
  } catch (error) { return serviceUnavailable('community.answers.post', error); }
}
