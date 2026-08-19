export const REPORT_TARGET_TYPES = Object.freeze(['item', 'user', 'organization']);
export const REPORT_REASONS = Object.freeze(['spam', 'harassment', 'copyright', 'inappropriate', 'other']);

export function parseReportPayload(value) {
  const targetType = String(value?.targetType || '');
  const targetId = Number(value?.targetId);
  const reason = String(value?.reason || '');
  const details = String(value?.details || '').trim();

  if (!REPORT_TARGET_TYPES.includes(targetType)) {
    return { ok: false, error: 'Tipo de alvo inválido.' };
  }
  if (!Number.isSafeInteger(targetId) || targetId <= 0 || targetId > 2147483647) {
    return { ok: false, error: 'Alvo inválido.' };
  }
  if (!REPORT_REASONS.includes(reason)) {
    return { ok: false, error: 'Motivo inválido.' };
  }
  if (details.length > 4000) {
    return { ok: false, error: 'As observações devem ter no máximo 4000 caracteres.' };
  }
  return { ok: true, targetType, targetId, reason, details };
}

export function reportTargetFromSearchParams(params) {
  for (const [queryKey, targetType] of [
    ['item', 'item'],
    ['user', 'user'],
    ['organization', 'organization'],
  ]) {
    const targetId = Number(params?.[queryKey]);
    if (Number.isSafeInteger(targetId) && targetId > 0) return { targetType, targetId };
  }
  return null;
}
