import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadItem } from '../../../lib/catalog';
import { TYPE_LABELS } from '../../../lib/presentation';
import AssetArtwork from '../../components/AssetArtwork';
import DownloadButton from './DownloadButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await loadItem(id);
  if (!item) return { title: 'Recurso não encontrado' };
  return {
    title: item.name,
    description: item.description,
    openGraph: { title: item.name, description: item.description, images: item.coverImageUrl ? [item.coverImageUrl] : [] },
    twitter: { title: item.name, description: item.description, images: item.coverImageUrl ? [item.coverImageUrl] : [] },
  };
}

export default async function AssetPage({ params }) {
  const { id } = await params;
  const item = await loadItem(id);
  if (!item) notFound();
  const owner = item.ownerUsername && item.ownerUsername !== 'legacy' ? item.ownerUsername : item.author;
  const publisherName = item.organizationName || item.ownerDisplayName || owner;
  const publisherHref = item.organizationSlug ? `/organizations/${encodeURIComponent(item.organizationSlug)}` : `/creators/${encodeURIComponent(owner)}`;

  return (
    <main className="page-container">
      <div className="breadcrumbs"><Link href="/">Marketplace</Link><span>›</span><span>{TYPE_LABELS[item.type]}</span><span>›</span><span>{item.name}</span></div>
      <div className="detail-grid">
        <section className="detail-gallery">
          <div className="detail-main-image"><AssetArtwork item={item} className="detail-main-artwork" /></div>
        </section>

        <aside className="detail-sidebar">
          <section className="panel detail-buy">
            <div><span className="chip">{TYPE_LABELS[item.type] || item.type}</span></div>
            <h1>{item.name}</h1>
            <DownloadButton id={item.id} gitUrl={item.gitUrl} />
            <div className="detail-actions">
              <button className="button button-ghost" type="button">♡ Salvar</button>
              <Link className="button button-ghost" href={`/report?item=${item.id}`}>⚑ Reportar</Link>
            </div>
            <div className="detail-facts">
              <span>✓ Repositório público verificado</span>
              <span>◫ Compatível com IgnisEngine v{item.version}</span>
              <span>↓ {Number(item.downloads || 0).toLocaleString('pt-BR')} acessos ao repositório</span>
            </div>
          </section>
          <section className="panel creator-summary">
            <h3>{item.organizationSlug ? 'Organização publicadora' : 'Criador'}</h3>
            <div className="creator-line">
              {item.ownerAvatar ? <img className="avatar" src={item.ownerAvatar} alt="" /> : <span className="avatar avatar-fallback">◎</span>}
              <div><strong>{publisherName}</strong><small>@{item.organizationSlug || owner}</small></div>
              <Link className="button button-outline" href={publisherHref}>Ver perfil</Link>
            </div>
          </section>
        </aside>
      </div>

      <div className="detail-content">
        <section className="panel detail-copy">
          <h2>Sobre este recurso</h2>
          <p>{item.description}</p>
          <p>Este item é distribuído pelo autor a partir do repositório Git indicado. A Forge cataloga, valida metadados e encaminha o acesso; nenhum binário é hospedado pelo marketplace.</p>
          <h3>Antes de instalar</h3>
          <ul>
            <li>Revise a licença e as instruções no repositório do autor.</li>
            <li>Confira a versão e as dependências declaradas.</li>
            <li>Use o sandbox e as permissões do IgnisEngine ao avaliar plugins de terceiros.</li>
          </ul>
        </section>
        <div>
          <section className="panel technical-panel">
            <h3>Detalhes técnicos</h3>
            <div className="technical-list">
              <div><span>Versão</span><span>{item.version}</span></div>
              <div><span>Dependências</span><span>{item.dependencies || 'None'}</span></div>
              <div><span>Distribuição</span><span>Git externo</span></div>
              <div><span>Status</span><span>Aprovado</span></div>
            </div>
          </section>
          <section className="panel integration-panel" style={{ marginTop: 18 }}>
            <h3>Integração rápida</h3>
            <pre className="code-block">{`# Clone em uma pasta segura\ngit clone ${item.gitUrl}\n\n# Revise README e licença\n# antes de adicionar ao projeto`}</pre>
          </section>
        </div>
      </div>

      <section className="panel discussion-panel">
        <div className="discussion-header"><h2>Suporte e discussões</h2><span className="muted">GitHub como fonte pública</span></div>
        <p className="muted">Dúvidas, problemas e contribuições permanecem no repositório do criador, junto do código e do histórico real do pacote.</p>
        <a className="button button-outline" href={item.gitUrl} target="_blank" rel="noreferrer">Abrir repositório</a>
      </section>
    </main>
  );
}
