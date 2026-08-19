export const ACTIVITY_KINDS = Object.freeze(['creation', 'question', 'answer']);

function utcDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function buildActivityCalendar(rows, now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());
  const byDay = new Map();
  for (const row of rows || []) {
    const day = utcDay(row.day || row.createdAt);
    const kind = String(row.kind || '');
    const count = Number(row.count || 1);
    if (!day || !ACTIVITY_KINDS.includes(kind) || !Number.isFinite(count) || count <= 0) continue;
    const current = byDay.get(day) || { creation: 0, question: 0, answer: 0, total: 0 };
    current[kind] += count;
    current.total += count;
    byDay.set(day, current);
  }

  const days = [];
  const totals = { creation: 0, question: 0, answer: 0, total: 0 };
  for (const cursor = new Date(start); cursor <= today; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.toISOString().slice(0, 10);
    const counts = byDay.get(day) || { creation: 0, question: 0, answer: 0, total: 0 };
    for (const kind of ACTIVITY_KINDS) totals[kind] += counts[kind];
    totals.total += counts.total;
    const level = counts.total === 0 ? 0 : counts.total === 1 ? 1 : counts.total === 2 ? 2 : counts.total <= 4 ? 3 : 4;
    days.push({ day, ...counts, level });
  }
  return { start: days[0]?.day, end: days.at(-1)?.day, days, totals };
}
