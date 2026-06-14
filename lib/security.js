// Gate de seguranca das submissoes do marketplace.
// Valida os campos do formulario e analisa o repositorio Git antes de publicar.
// Se qualquer checagem critica falhar, o item NAO sobe.

const ALLOWED_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org'];
const ALLOWED_TYPES = ['plugin', 'workshop', 'asset'];

// Termos obviamente maliciosos/proibidos (heuristica simples; admins moderam o resto).
const BLOCKLIST = [
  'malware', 'ransomware', 'keylogger', 'rat trojan', 'stealer',
  'token grabber', 'credit card', 'carding', 'ddos tool', 'botnet',
  'crack', 'keygen', 'cheat engine', 'aimbot', 'pirated',
];

function fail(report, reason) {
  report.ok = false;
  report.reasons.push(reason);
}

function containsBlocked(text) {
  const t = String(text || '').toLowerCase();
  return BLOCKLIST.find((w) => t.includes(w)) || null;
}

// Parseia owner/repo de uma URL de repositorio Git suportada.
export function parseRepoUrl(gitUrl) {
  let url;
  try {
    url = new URL(String(gitUrl).trim());
  } catch {
    return { error: 'URL invalida.' };
  }
  if (url.protocol !== 'https:') return { error: 'A URL do repo deve usar https.' };
  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.includes(host)) {
    return { error: `Host nao permitido (${host}). Use: ${ALLOWED_HOSTS.join(', ')}.` };
  }
  const parts = url.pathname.replace(/\.git$/, '').split('/').filter(Boolean);
  if (parts.length < 2) return { error: 'URL nao aponta para um repositorio (owner/repo).' };
  return { host, owner: parts[0], repo: parts[1] };
}

// Consulta a API publica do GitHub para confirmar que o repo existe, e publico,
// nao esta arquivado/desabilitado. (Outros hosts: so valida formato/alcancabilidade.)
async function inspectRemote(parsed, report) {
  if (parsed.host !== 'github.com') {
    report.checks.push({ name: 'repo-host', ok: true, info: parsed.host });
    return;
  }
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ignis-marketplace',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      { headers, signal: AbortSignal.timeout(8000) }
    );

    if (res.status === 404) {
      fail(report, 'Repositorio nao encontrado ou nao e publico.');
      report.checks.push({ name: 'repo-exists', ok: false });
      return;
    }
    if (res.status === 403) {
      // rate limit: nao reprova, apenas marca como nao-verificado
      report.checks.push({ name: 'repo-exists', ok: true, info: 'rate-limited (nao verificado)' });
      report.warnings.push('Nao foi possivel verificar o repo no GitHub (rate limit).');
      return;
    }
    if (!res.ok) {
      fail(report, `GitHub respondeu ${res.status} ao verificar o repo.`);
      return;
    }

    const data = await res.json();
    report.checks.push({ name: 'repo-exists', ok: true });
    if (data.private) fail(report, 'Repositorio privado nao e permitido.');
    if (data.archived) fail(report, 'Repositorio arquivado nao e permitido.');
    if (data.disabled) fail(report, 'Repositorio desabilitado nao e permitido.');

    const blocked = containsBlocked(`${data.description || ''} ${(data.topics || []).join(' ')}`);
    if (blocked) fail(report, `Conteudo do repo sinalizado: "${blocked}".`);

    report.repo = {
      stars: data.stargazers_count,
      license: data.license ? data.license.spdx_id : null,
      pushedAt: data.pushed_at,
      defaultBranch: data.default_branch,
    };
  } catch (err) {
    report.checks.push({ name: 'repo-exists', ok: true, info: 'timeout/erro (nao verificado)' });
    report.warnings.push('Verificacao do repo nao concluida (rede). Submissao segue para revisao.');
  }
}

// Valida o payload de submissao e retorna um relatorio de seguranca.
// report.ok === false => bloqueia o envio.
export async function validateSubmission(body) {
  const report = { ok: true, reasons: [], warnings: [], checks: [], repo: null };

  const type = String(body.type || '').trim();
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const version = String(body.version || '').trim();
  const gitUrl = String(body.gitUrl || '').trim();

  // Campos
  if (!ALLOWED_TYPES.includes(type)) fail(report, 'Tipo invalido (plugin, workshop ou asset).');
  if (name.length < 3 || name.length > 80) fail(report, 'Nome deve ter de 3 a 80 caracteres.');
  if (description.length > 500) fail(report, 'Descricao muito longa (max 500).');
  if (version && !/^\d+(\.\d+){0,3}([-+].+)?$/.test(version)) {
    fail(report, 'Versao em formato invalido (use algo como 1.0.0).');
  }

  // Blocklist nos campos do formulario
  const blockedField = containsBlocked(`${name} ${description}`);
  if (blockedField) fail(report, `Texto sinalizado pela moderacao: "${blockedField}".`);

  // Repo Git
  const parsed = parseRepoUrl(gitUrl);
  if (parsed.error) {
    fail(report, parsed.error);
  } else {
    report.checks.push({ name: 'repo-url', ok: true, info: `${parsed.owner}/${parsed.repo}` });
    await inspectRemote(parsed, report);
  }

  return report;
}
