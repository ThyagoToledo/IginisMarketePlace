import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePromotionMutation } from '../lib/promotions.mjs';
import { getDonationUrl } from '../lib/donations.mjs';

test('aceita os dois tipos de destaque e as duas acoes administrativas', () => {
  assert.deepEqual(parsePromotionMutation({ itemId: 7, kind: 'ignis', action: 'add' }), {
    ok: true, itemId: 7, kind: 'ignis', action: 'add',
  });
  assert.equal(parsePromotionMutation({ itemId: 7, kind: 'sponsored', action: 'remove' }).ok, true);
});

test('rejeita ids, tipos e acoes fora do contrato', () => {
  assert.equal(parsePromotionMutation({ itemId: 0, kind: 'ignis', action: 'add' }).ok, false);
  assert.equal(parsePromotionMutation({ itemId: 1, kind: 'pago', action: 'add' }).ok, false);
  assert.equal(parsePromotionMutation({ itemId: 1, kind: 'ignis', action: 'toggle' }).ok, false);
});

test('a pagina de doacoes aceita somente destino HTTPS', () => {
  assert.equal(getDonationUrl('https://example.com/apoie'), 'https://example.com/apoie');
  assert.equal(getDonationUrl('http://example.com/apoie'), null);
  assert.equal(getDonationUrl('javascript:alert(1)'), null);
  assert.equal(getDonationUrl('nao-e-url'), null);
});
