export const COMMUNITY_CATEGORIES = Object.freeze(['general', 'graphics', 'scripting', 'assets', 'help']);

export function parseQuestionPayload(value) {
  const title = String(value?.title || '').trim();
  const body = String(value?.body || '').trim();
  const category = COMMUNITY_CATEGORIES.includes(value?.category) ? value.category : 'general';
  if (title.length < 8 || title.length > 160) return { ok: false, error: 'O título deve ter entre 8 e 160 caracteres.' };
  if (body.length < 20 || body.length > 10000) return { ok: false, error: 'A pergunta deve ter entre 20 e 10.000 caracteres.' };
  return { ok: true, title, body, category };
}

export function parseAnswerPayload(value) {
  const body = String(value?.body || '').trim();
  if (body.length < 2 || body.length > 10000) return { ok: false, error: 'A resposta deve ter entre 2 e 10.000 caracteres.' };
  return { ok: true, body };
}

export function parseCommunityListQuery(input) {
  const params = input instanceof URLSearchParams ? input : new URL(String(input), 'http://localhost').searchParams;
  const q = String(params.get('q') || '').trim().slice(0, 100);
  const category = COMMUNITY_CATEGORIES.includes(params.get('category')) ? params.get('category') : null;
  const rawPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  return { q, category, page, limit: 20, offset: (page - 1) * 20 };
}

export function parseCommunityId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}
