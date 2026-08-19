import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActivityCalendar } from '../lib/activity.mjs';
import { parseAnswerPayload, parseCommunityListQuery, parseQuestionPayload } from '../lib/community.mjs';
import { parseReportPayload } from '../lib/reports.mjs';

test('valida perguntas, respostas e filtros da comunidade', () => {
  assert.equal(parseQuestionPayload({ title: 'Como integrar física?', body: 'Estou tentando integrar um corpo rígido ao projeto.', category: 'help' }).ok, true);
  assert.equal(parseQuestionPayload({ title: 'Curta', body: 'Sem contexto suficiente.' }).ok, false);
  assert.equal(parseAnswerPayload({ body: 'Use o componente de colisão.' }).ok, true);
  assert.equal(parseAnswerPayload({ body: '' }).ok, false);
  assert.deepEqual(parseCommunityListQuery('https://forge.test/community/questions?q=%20vulkan%20&category=graphics&page=2'), { q: 'vulkan', category: 'graphics', page: 2, limit: 20, offset: 20 });
});

test('calendário agrega somente atividade real por dia e tipo', () => {
  const calendar = buildActivityCalendar([
    { day: '2026-08-17', kind: 'creation', count: 1 },
    { day: '2026-08-17', kind: 'answer', count: 2 },
    { day: '2026-08-18', kind: 'question', count: 1 },
    { day: 'invalido', kind: 'creation', count: 99 },
  ], new Date('2026-08-18T12:00:00Z'));
  assert.deepEqual(calendar.totals, { creation: 1, question: 1, answer: 2, total: 4 });
  assert.equal(calendar.days.find((day) => day.day === '2026-08-17').level, 3);
  assert.equal(calendar.days.at(-1).day, '2026-08-18');
});

test('perguntas e respostas são alvos válidos de moderação', () => {
  assert.equal(parseReportPayload({ targetType: 'question', targetId: 1, reason: 'spam' }).ok, true);
  assert.equal(parseReportPayload({ targetType: 'answer', targetId: 2, reason: 'harassment' }).ok, true);
});
