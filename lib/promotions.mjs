export const PROMOTION_KINDS = Object.freeze(['ignis', 'sponsored']);

export function parsePromotionMutation(value) {
  const itemId = Number(value?.itemId);
  const kind = String(value?.kind || '');
  const action = String(value?.action || '');

  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    return { ok: false, error: 'Criacao invalida.' };
  }
  if (!PROMOTION_KINDS.includes(kind)) {
    return { ok: false, error: 'Tipo de destaque invalido.' };
  }
  if (!['add', 'remove'].includes(action)) {
    return { ok: false, error: 'Acao invalida.' };
  }
  return { ok: true, itemId, kind, action };
}
