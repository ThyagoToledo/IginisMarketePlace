import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCoverImageUrl } from '../lib/cover-images.mjs';
import { normalizeOrganizationSlug, parseOrganizationPayload, canManageOrganization } from '../lib/organizations.mjs';
import { parseReportPayload, reportTargetFromSearchParams } from '../lib/reports.mjs';

test('capas aceitam HTTPS público e rejeitam destinos locais', () => {
  assert.equal(validateCoverImageUrl('https://cdn.example.com/capa.png').ok, true);
  assert.equal(validateCoverImageUrl('').value, null);
  assert.equal(validateCoverImageUrl('http://cdn.example.com/capa.png').ok, false);
  assert.equal(validateCoverImageUrl('https://localhost/capa.png').ok, false);
  assert.equal(validateCoverImageUrl('https://127.0.0.1/capa.png').ok, false);
});

test('organizações normalizam slug e restringem gestão por papel', () => {
  assert.equal(normalizeOrganizationSlug('Equipe Fênix!'), 'equipe-fenix');
  assert.equal(parseOrganizationPayload({ name: 'Equipe Fênix', description: '' }).ok, true);
  assert.equal(parseOrganizationPayload({ name: 'x' }).ok, false);
  assert.equal(canManageOrganization('owner'), true);
  assert.equal(canManageOrganization('admin'), true);
  assert.equal(canManageOrganization('member'), false);
});

test('relatos validam alvo, motivo e limite de detalhes', () => {
  assert.equal(parseReportPayload({ targetType: 'item', targetId: 1, reason: 'spam', details: '' }).ok, true);
  assert.equal(parseReportPayload({ targetType: 'comment', targetId: 1, reason: 'spam' }).ok, false);
  assert.equal(parseReportPayload({ targetType: 'user', targetId: 1, reason: 'unknown' }).ok, false);
  assert.deepEqual(reportTargetFromSearchParams({ organization: '42' }), { targetType: 'organization', targetId: 42 });
});
