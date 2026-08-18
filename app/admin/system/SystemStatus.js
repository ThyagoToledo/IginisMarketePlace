'use client';

import { useEffect, useState } from 'react';

const CONFIGURATION_LABELS = {
  database: 'Conexão do banco',
  authSecret: 'Segredo da autenticação',
  githubClient: 'Cliente OAuth do GitHub',
  githubSecret: 'Segredo OAuth do GitHub',
  adminLogins: 'Lista de administradores',
};

export default function SystemStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/system', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Falha ao consultar o sistema.');
      setData(payload);
    } catch (loadError) {
      setError(loadError.message || 'Falha ao consultar o sistema.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (!data && busy) return <div className="panel admin-wip"><p>Consultando serviços…</p></div>;
  if (!data && error) return <div className="result-err">{error}</div>;
  if (!data) return null;

  return (
    <div className="system-stack">
      {error && <div className="result-err">{error}</div>}
      <section className="admin-stats system-stats">
        <div className="panel admin-stat"><span>API</span><strong className="system-value">Online</strong></div>
        <div className="panel admin-stat"><span>Banco</span><strong className={`system-value ${data.database.status === 'connected' ? 'ok' : 'warn'}`}>{data.database.status === 'connected' ? 'Conectado' : 'Indisponível'}</strong></div>
        <div className="panel admin-stat"><span>Latência do banco</span><strong className="system-value">{data.database.latencyMs === null ? '—' : `${data.database.latencyMs} ms`}</strong></div>
        <div className="panel admin-stat"><span>Ambiente</span><strong className="system-value">{data.application.environment}</strong></div>
      </section>

      <section className="panel admin-panel admin-panel-first">
        <div className="discussion-header">
          <div><p className="eyebrow">Aplicação</p><h2>Configuração</h2></div>
          <button className="btn-ghost" type="button" disabled={busy} onClick={load}>{busy ? 'Atualizando…' : 'Atualizar'}</button>
        </div>
        <div className="system-list">
          <div><span>Versão</span><strong>{data.application.version}</strong></div>
          {Object.entries(data.configuration).map(([key, configured]) => (
            <div key={key}><span>{CONFIGURATION_LABELS[key] || key}</span><strong className={configured ? 'ok' : 'warn'}>{configured ? 'Configurado' : 'Ausente'}</strong></div>
          ))}
        </div>
        <p className="system-checked">Última verificação: {new Date(data.checkedAt).toLocaleString('pt-BR')}</p>
      </section>
    </div>
  );
}
