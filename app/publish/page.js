'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function PublishPage() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ type: 'plugin', name: '', description: '', version: '1.0.0', gitUrl: '', dependencies: 'None', coverImageText: '', coverImageUrl: '', organizationId: '' });
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const basicComplete = useMemo(() => form.name.trim().length >= 3 && form.description.trim().length > 0 && form.gitUrl.trim().length > 0, [form]);

  useEffect(() => {
    fetch('/api/me').then((response) => response.json()).then(setMe).catch(() => setMe({ authenticated: false }));
  }, []);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, acceptTerms: accept }),
      });
      setResult({ status: response.status, data: await response.json() });
    } catch {
      setResult({ status: 0, data: { error: 'Falha de rede ao publicar. Tente novamente.' } });
    } finally {
      setBusy(false);
    }
  }

  if (me === null) return <main className="page-container"><div className="empty-state"><strong>Preparando a área de publicação…</strong></div></main>;
  if (!me.authenticated) return <main className="page-container"><div className="page-heading"><p className="eyebrow">Forge para criadores</p><h1>Publicar novo recurso</h1></div><div className="panel form-section"><h2>Entre com sua conta GitHub</h2><p className="muted">A autoria, a moderação e os tokens do editor usam uma identidade GitHub única. Use o botão “Entrar” no topo para continuar.</p></div></main>;
  if (me.isBanned) return <main className="page-container"><div className="panel form-section"><h1>Publicação indisponível</h1><p className="muted">Sua conta está impedida de publicar no marketplace.</p></div></main>;

  return (
    <main className="page-container page-container-wide">
      <div className="page-heading"><p className="eyebrow">Forge para criadores</p><h1>Publicar novo recurso</h1><p>Liste seu pacote por meio de um repositório Git público. A Forge não recebe nem hospeda arquivos binários.</p></div>
      <form className="form-shell" onSubmit={submit}>
        <div>
          <section className="panel form-section">
            <h2>Informações gerais</h2>
            <div className="form-grid">
              <label className="field field-full">Nome do recurso *<input value={form.name} onChange={(e) => update('name', e.target.value)} required minLength={3} maxLength={80} placeholder="Ex.: Sistema de partículas 2D" /></label>
              <label className="field">Categoria *<select value={form.type} onChange={(e) => update('type', e.target.value)}><option value="plugin">Plugin</option><option value="workshop">Workshop</option><option value="asset">Arte & Asset</option></select></label>
              <label className="field">Versão *<input value={form.version} onChange={(e) => update('version', e.target.value)} required placeholder="1.0.0" /></label>
              <label className="field field-full">Descrição *<textarea value={form.description} onChange={(e) => update('description', e.target.value)} required maxLength={500} placeholder="Explique o que o recurso oferece, como funciona e para quem ele é indicado." /></label>
            </div>
          </section>

          <section className="panel form-section">
            <h2>Fonte e compatibilidade</h2>
            <div className="form-grid">
              <label className="field field-full">URL do repositório Git *<input value={form.gitUrl} onChange={(e) => update('gitUrl', e.target.value)} required placeholder="https://github.com/usuario/repositorio.git" /></label>
              <label className="field">Dependências<input value={form.dependencies} onChange={(e) => update('dependencies', e.target.value)} placeholder="None" /></label>
            </div>
          </section>

          <section className="panel form-section">
            <h2>Publicador e imagem de capa</h2>
            <p className="muted">A capa é opcional, deve usar HTTPS e continuará com a arte gerada caso não carregue.</p>
            <div className="form-grid">
              <label className="field field-full">Publicar como<select value={form.organizationId} onChange={(e) => update('organizationId', e.target.value)}><option value="">Meu perfil (@{me.login || me.name})</option>{me.organizations?.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>
              <label className="field field-full">URL HTTPS da imagem<input type="url" value={form.coverImageUrl} onChange={(e) => update('coverImageUrl', e.target.value)} maxLength={2048} placeholder="https://exemplo.com/capa.png" /></label>
              <label className="field field-full">Texto curto da capa atual<input value={form.coverImageText} onChange={(e) => update('coverImageText', e.target.value)} maxLength={40} placeholder="Physics Plugin" /></label>
            </div>
          </section>

          <section className="panel form-section">
            <h2>Responsabilidade e moderação</h2>
            <label className="check-field"><input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} /><span>Li e concordo com os <Link href="/terms">Termos de Serviço</Link> e a <Link href="/privacy">Política de Privacidade</Link>. Declaro que posso publicar este conteúdo e que o repositório é de minha responsabilidade.</span></label>
            {result && <div className={result.status === 201 ? 'result-ok' : 'result-err'}>{result.status === 201 ? <><strong>Recurso publicado com sucesso.</strong>{result.data.warnings?.map((warning) => <p key={warning}>{warning}</p>)}</> : <><strong>{result.data.error || 'Não foi possível publicar.'}</strong>{result.data.report?.reasons?.map((reason) => <p key={reason}>{reason}</p>)}</>}</div>}
          </section>
        </div>

        <aside className="panel publish-status">
          <h2>Status da publicação</h2>
          <div className="status-list">
            <div className="status-row"><span>Tipo de distribuição</span><strong className="ok">URL Git</strong></div>
            <div className="status-row"><span>Informações básicas</span><strong className={basicComplete ? 'ok' : 'warn'}>{basicComplete ? 'Pronto' : 'Pendente'}</strong></div>
            <div className="status-row"><span>Aceite legal</span><strong className={accept ? 'ok' : 'warn'}>{accept ? 'Aceito' : 'Obrigatório'}</strong></div>
            <div className="status-row"><span>Gate de segurança</span><strong>Automático</strong></div>
          </div>
          <button className="button button-ghost button-block" type="button">Salvar rascunho</button>
          <button className="button button-primary button-block" type="submit" disabled={busy || !accept || !basicComplete} style={{ marginTop: 10 }}>{busy ? 'Verificando repositório…' : 'Publicar recurso'}</button>
          <p className="muted" style={{ margin: '14px 0 0', fontSize: 12 }}>A URL deve usar HTTPS e apontar para um repositório público no GitHub, GitLab ou Bitbucket.</p>
        </aside>
      </form>
    </main>
  );
}
