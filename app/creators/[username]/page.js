import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarketplaceCard from '../../components/MarketplaceCard';
import { loadCreator } from '../../../lib/catalog';
import { auth } from '../../../auth';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { username } = await params;
  const creator = await loadCreator(decodeURIComponent(username));
  return creator ? { title: `${creator.displayName || creator.username} — Criador`, description: `Recursos publicados por ${creator.username} na IgnisEngine Forge.` } : { title: 'Criador não encontrado' };
}

export default async function CreatorPage({ params }) {
  const { username } = await params;
  const [creator, session] = await Promise.all([
    loadCreator(decodeURIComponent(username)),
    auth(),
  ]);
  if (!creator) notFound();
  const downloads = creator.items.reduce((total, item) => total + Number(item.downloads || 0), 0);
  const isOwnProfile = Number(creator.id) === Number(session?.user?.id);

  return (
    <main className="page-container page-container-wide">
      <section className="profile-hero">
        <div className="profile-banner profile-banner-generated"><span>CRIADOR IGNIS</span></div>
        <div className="profile-identity">
          <div className="profile-avatar">{creator.avatarUrl ? <img src={creator.avatarUrl} alt="" /> : creator.username.slice(0, 2).toUpperCase()}</div>
          <div><h1>{creator.displayName || creator.username}</h1><p>@{creator.username} · Criador verificado pelo GitHub</p></div>
          <div className="profile-actions">
            <a className="button button-primary" href={`https://github.com/${encodeURIComponent(creator.username)}`} target="_blank" rel="noreferrer">Ver no GitHub</a>
            {isOwnProfile
              ? <Link className="button button-outline" href="/account">⚙ Minha conta e tokens</Link>
              : <Link className="button button-ghost" href={`/report?user=${creator.id}`}>⚑ Reportar</Link>}
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="panel stat-card"><span>Criações aprovadas</span><strong>{creator.items.length}</strong></div>
        <div className="panel stat-card"><span>Acessos aos repositórios</span><strong>{downloads.toLocaleString('pt-BR')}</strong></div>
        <div className="panel stat-card"><span>Atividade</span><div className="activity-grid" style={{ marginTop: 18 }}>{Array.from({ length: 54 }, (_, index) => <span key={index} />)}</div></div>
      </section>

      <section>
        <div className="profile-section-heading"><div><p className="eyebrow">Portfólio público</p><h2>Criações em destaque</h2></div><span className="muted">Somente itens aprovados</span></div>
        <div className="asset-grid">{creator.items.map((item, index) => <MarketplaceCard key={item.id} item={{ ...item, ownerUsername: creator.username }} index={index} />)}</div>
      </section>
    </main>
  );
}
