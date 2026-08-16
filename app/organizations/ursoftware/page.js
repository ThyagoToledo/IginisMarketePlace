import Link from 'next/link';
import { loadCatalog } from '../../../lib/catalog';
import MarketplaceCard from '../../components/MarketplaceCard';

export const metadata = { title: 'URSoftware — Organização' };
export const dynamic = 'force-dynamic';

export default async function OrganizationPage() {
  const { rows, offline } = await loadCatalog();
  const downloads = rows.reduce((total, item) => total + Number(item.downloads || 0), 0);

  return (
    <main className="page-container page-container-wide">
      <section className="profile-hero">
        <div className="profile-banner profile-banner-generated"><span>URSOFTWARE</span></div>
        <div className="profile-identity">
          <div className="profile-avatar">UR</div>
          <div><h1>URSoftware</h1><p>Organização mantenedora do IgnisEngine</p></div>
          <div className="profile-actions"><a className="button button-primary" href="https://github.com/URSoftware" target="_blank" rel="noreferrer">GitHub</a></div>
        </div>
      </section>
      {offline && <div className="status-note">Os dados do catálogo estão temporariamente indisponíveis.</div>}
      <section className="stats-grid">
        <div className="panel stat-card"><span>Recursos no catálogo</span><strong>{rows.length}</strong></div>
        <div className="panel stat-card"><span>Acessos aos repositórios</span><strong>{downloads.toLocaleString('pt-BR')}</strong></div>
        <div className="panel stat-card"><span>Stack do motor</span><strong style={{ fontSize: 24 }}>Java 17 + JavaFX</strong></div>
      </section>
      <div className="org-grid">
        <section>
          <div className="profile-section-heading"><div><p className="eyebrow">Catálogo da comunidade</p><h2>Criações publicadas</h2></div><Link href="/">Ver todas →</Link></div>
          {rows.length ? (
            <div className="asset-grid">{rows.slice(0, 3).map((item, index) => <MarketplaceCard key={item.id} item={item} index={index} />)}</div>
          ) : (
            <div className="empty">Nenhuma criação real aprovada foi publicada.</div>
          )}
        </section>
        <aside>
          <section className="panel team-card"><h3>Autores do IgnisEngine</h3><div className="team-member"><span className="avatar avatar-fallback">TT</span><div><strong>Thyago Toledo</strong><small>@ThyagoToledo</small></div></div><div className="team-member"><span className="avatar avatar-fallback">FZ</span><div><strong>FeronZerbana</strong><small>@FeronZerbana</small></div></div></section>
          <section className="panel activity-card" style={{ marginTop: 18 }}><h3>Sobre a organização</h3><p className="muted">O marketplace é um serviço independente do motor: indexa URLs Git verificadas e preserva a autoria individual de cada pacote.</p></section>
        </aside>
      </div>
    </main>
  );
}
