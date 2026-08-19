export const ORGANIZATION_ROLES = Object.freeze(['owner', 'admin', 'member']);
export const ORGANIZATION_MANAGERS = Object.freeze(['owner', 'admin']);

export function normalizeOrganizationSlug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function parseOrganizationPayload(value) {
  const name = String(value?.name || '').trim();
  const slug = normalizeOrganizationSlug(value?.slug || name);
  const description = String(value?.description || '').trim();

  if (name.length < 3 || name.length > 80) {
    return { ok: false, error: 'O nome deve ter entre 3 e 80 caracteres.' };
  }
  if (slug.length < 3 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return { ok: false, error: 'O identificador deve ter entre 3 e 50 caracteres válidos.' };
  }
  if (description.length > 500) {
    return { ok: false, error: 'A descrição deve ter no máximo 500 caracteres.' };
  }
  return { ok: true, name, slug, description };
}

export function parseOrganizationId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

export function canManageOrganization(role) {
  return ORGANIZATION_MANAGERS.includes(role);
}
