'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublishPage() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({
    type: 'plugin',
    name: '',
    description: '',
    version: '1.0.0',
    gitUrl: '',
    dependencies: 'None',
    coverImageText: '',
  });
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ authenticated: false }));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, acceptTerms: accept }),
      });
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (err) {
      setResult({ status: 0, data: { error: String(err) } });
    } finally {
      setBusy(false);
    }
  }

  if (me === null) {
    return <main className="container"><p>Carregando…</p></main>;
  }

  if (!me.authenticated) {
    return (
      <main className="container">
        <h1>Publicar um pacote</h1>
        <div className="empty">
          Voce precisa <strong>entrar com o GitHub</strong> para publicar.
          Use o botao no topo da pagina.
        </div>
      </main>
    );
  }

  if (me.isBanned) {
    return (
      <main className="container">
        <h1>Publicar um pacote</h1>
        <div className="empty">Sua conta foi banida do marketplace.</div>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Publicar um pacote</h1>
      <p className="muted">
        Enviamos apenas a <strong>URL do repositorio Git</strong> — nunca arquivos.
        Toda submissao passa por uma verificacao de seguranca automatica.
      </p>

      <form className="form" onSubmit={submit}>
        <label>Tipo
          <select value={form.type} onChange={(e) => update('type', e.target.value)}>
            <option value="plugin">plugin</option>
            <option value="workshop">workshop</option>
            <option value="asset">asset</option>
          </select>
        </label>
        <label>Nome
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required maxLength={80} />
        </label>
        <label>Descricao
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} maxLength={500} rows={3} />
        </label>
        <label>Versao
          <input value={form.version} onChange={(e) => update('version', e.target.value)} placeholder="1.0.0" />
        </label>
        <label>URL do repositorio Git
          <input value={form.gitUrl} onChange={(e) => update('gitUrl', e.target.value)} required placeholder="https://github.com/usuario/repo.git" />
        </label>
        <label>Dependencias
          <input value={form.dependencies} onChange={(e) => update('dependencies', e.target.value)} placeholder="None" />
        </label>
        <label>Texto da capa (curto)
          <input value={form.coverImageText} onChange={(e) => update('coverImageText', e.target.value)} maxLength={40} />
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
          <span>
            Li e concordo com os <Link href="/terms">Termos de Servico</Link> e a{' '}
            <Link href="/privacy">Politica de Privacidade</Link>, e declaro que o conteudo
            do repositorio e de minha responsabilidade.
          </span>
        </label>

        <button className="btn-gh" type="submit" disabled={busy || !accept}>
          {busy ? 'Verificando…' : 'Publicar'}
        </button>
      </form>

      {result && (
        <div className={result.status === 201 ? 'result-ok' : 'result-err'}>
          {result.status === 201 ? (
            <>
              <strong>✓ Publicado com sucesso!</strong>
              {result.data.warnings?.length > 0 && (
                <ul>{result.data.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              )}
            </>
          ) : (
            <>
              <strong>✗ {result.data.error || 'Falha ao publicar.'}</strong>
              {result.data.report?.reasons?.length > 0 && (
                <ul>{result.data.report.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
