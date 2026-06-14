'use client';

import { useEffect, useState } from 'react';

export default function AccountTokens() {
  const [tokens, setTokens] = useState(null);
  const [fresh, setFresh] = useState(null); // token recem-gerado (mostrado 1x)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const res = await fetch('/api/tokens');
      if (!res.ok) { setError('Erro ao carregar tokens.'); return; }
      setTokens(await res.json());
    } catch (err) { setError(String(err)); }
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    setBusy(true);
    setFresh(null);
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'editor' }),
      });
      const data = await res.json();
      if (res.status === 201) { setFresh(data.token); load(); }
      else setError(data.error || 'Falha ao gerar token.');
    } finally { setBusy(false); }
  }

  async function revoke(id) {
    if (!window.confirm('Revogar este token? O editor que o usa parara de publicar.')) return;
    await fetch(`/api/tokens/${id}`, { method: 'DELETE' });
    load();
  }

  function copy(text) {
    navigator.clipboard?.writeText(text);
  }

  return (
    <section>
      <h2 className="section-title">Tokens de publicacao (para o editor)</h2>
      <p className="muted">
        Um token permite o <strong>IgnisEngine (app desktop)</strong> publicar no marketplace em seu
        nome, sem abrir o navegador. Gere aqui, copie e cole no editor em
        <strong> Community Hub → Publicar com token</strong>.
      </p>

      <button className="btn-gh" onClick={generate} disabled={busy}>
        {busy ? 'Gerando…' : '+ Gerar novo token'}
      </button>

      {fresh && (
        <div className="result-ok" style={{ marginTop: 14 }}>
          <strong>Copie agora — este valor aparece uma unica vez:</strong>
          <div className="token-box">
            <code>{fresh}</code>
            <button className="btn-ghost" onClick={() => copy(fresh)}>Copiar</button>
          </div>
          <small>Cole no editor (Publicar com token). Se perder, gere outro.</small>
        </div>
      )}

      {error && <div className="result-err" style={{ marginTop: 14 }}>{error}</div>}

      <h3 style={{ marginTop: 24, fontSize: 15 }}>Seus tokens</h3>
      {tokens === null ? (
        <p>Carregando…</p>
      ) : tokens.length === 0 ? (
        <p className="muted">Nenhum token ainda.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Prefixo</th><th>Nome</th><th>Ultimo uso</th><th>Criado</th><th></th></tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id}>
                <td><code>{t.tokenPrefix}…</code></td>
                <td>{t.name || '—'}</td>
                <td>{t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : 'nunca'}</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td><button className="btn-danger" onClick={() => revoke(t.id)}>Revogar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
