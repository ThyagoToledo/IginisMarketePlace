import { getSql } from './db';
import { parseCommunityId, parseCommunityListQuery } from './community.mjs';

export async function loadCommunityQuestions(input) {
  const { q, category, page, limit, offset } = parseCommunityListQuery(input);
  const like = q ? `%${q}%` : null;
  try {
    const sql = getSql();
    const [countRows, rows] = await Promise.all([
      sql`SELECT count(*)::int AS count FROM community_questions qn JOIN users u ON u.id=qn.author_id WHERE qn.status='published' AND u.is_banned=false AND (${category}::text IS NULL OR qn.category=${category}) AND (${like}::text IS NULL OR qn.title ILIKE ${like} OR qn.body ILIKE ${like})`,
      sql`SELECT qn.id,qn.title,qn.body,qn.category,qn.created_at AS "createdAt",u.id AS "authorId",u.username,u.display_name AS "displayName",u.avatar_url AS "avatarUrl",count(a.id)::int AS "answerCount" FROM community_questions qn JOIN users u ON u.id=qn.author_id LEFT JOIN community_answers a ON a.question_id=qn.id AND a.status='published' WHERE qn.status='published' AND u.is_banned=false AND (${category}::text IS NULL OR qn.category=${category}) AND (${like}::text IS NULL OR qn.title ILIKE ${like} OR qn.body ILIKE ${like}) GROUP BY qn.id,u.id ORDER BY qn.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    ]);
    const total = countRows[0]?.count || 0;
    return { rows, pagination: { page, total, pages: Math.max(1, Math.ceil(total / limit)) }, offline: false };
  } catch (error) {
    console.error('[community.questions]', { name: error?.name || 'Error', code: error?.code || null });
    return { rows: [], pagination: { page: 1, total: 0, pages: 1 }, offline: true };
  }
}

export async function loadCommunityQuestion(value) {
  const id = parseCommunityId(value);
  if (!id) return null;
  try {
    const sql = getSql();
    const questions = await sql`SELECT qn.id,qn.title,qn.body,qn.category,qn.author_id AS "authorId",qn.created_at AS "createdAt",u.username,u.display_name AS "displayName",u.avatar_url AS "avatarUrl" FROM community_questions qn JOIN users u ON u.id=qn.author_id WHERE qn.id=${id} AND qn.status='published' AND u.is_banned=false`;
    if (!questions[0]) return null;
    const answers = await sql`SELECT a.id,a.body,a.author_id AS "authorId",a.created_at AS "createdAt",u.username,u.display_name AS "displayName",u.avatar_url AS "avatarUrl" FROM community_answers a JOIN users u ON u.id=a.author_id WHERE a.question_id=${id} AND a.status='published' AND u.is_banned=false ORDER BY a.created_at`;
    return { ...questions[0], answers };
  } catch (error) {
    console.error('[community.question]', { name: error?.name || 'Error', code: error?.code || null });
    return null;
  }
}

export async function loadProfileActivity(userId) {
  const id = parseCommunityId(userId);
  if (!id) return [];
  const sql = getSql();
  return sql`
    SELECT (created_at AT TIME ZONE 'UTC')::date::text AS day, kind, count(*)::int AS count
    FROM (
      SELECT created_at, 'creation'::text AS kind FROM items WHERE author_id=${id} AND status='approved'
      UNION ALL
      SELECT created_at, 'question'::text AS kind FROM community_questions WHERE author_id=${id} AND status='published'
      UNION ALL
      SELECT a.created_at, 'answer'::text AS kind FROM community_answers a JOIN community_questions q ON q.id=a.question_id WHERE a.author_id=${id} AND a.status='published' AND q.status='published'
    ) activity
    WHERE created_at >= now() - interval '13 months'
    GROUP BY day,kind ORDER BY day`;
}
