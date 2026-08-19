import { loadCommunityQuestion } from '../../../../../lib/community-data';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { id } = await params;
  const question = await loadCommunityQuestion(id);
  if (!question) return Response.json({ error: 'Pergunta não encontrada.' }, { status: 404 });
  return Response.json(question);
}
