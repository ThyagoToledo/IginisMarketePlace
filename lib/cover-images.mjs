export function validateCoverImageUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return { ok: true, value: null };
  if (raw.length > 2048) return { ok: false, error: 'A URL da capa é muito longa.' };

  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: 'URL da capa inválida.' };
  }

  if (url.protocol !== 'https:') return { ok: false, error: 'A capa deve usar HTTPS.' };
  if (url.username || url.password) return { ok: false, error: 'A URL da capa não pode conter credenciais.' };

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.local')
    || hostname.endsWith('.internal')
    || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
    || hostname.includes(':')
  ) {
    return { ok: false, error: 'O host da capa não pode ser local ou um endereço IP.' };
  }

  return { ok: true, value: url.toString() };
}
