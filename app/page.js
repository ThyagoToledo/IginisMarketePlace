import Link from 'next/link';
import { loadCatalog } from '../lib/catalog';
import MarketplaceCard from './components/MarketplaceCard';
import ForgeSidebar from './components/ForgeSidebar';
import AssetArtwork from './components/AssetArtwork';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const query = await searchParams;
  const type = ['plugin', 'workshop', 'asset'].includes(query?.type) ? query.type : null;
  const q = String(query?.q || '').trim();
  const { rows, offline } = await loadCatalog({ type, q });
  const ignisFeatured = rows.filter((item) => item.ignisFeatured);
  const sponsoredFeatured = rows.filter((item) => item.sponsoredFeatured);
  const hero = ignisFeatured[0];
  const showHighlights = !q && !type;

  return (
    <main className="marketplace-layout">
      <ForgeSidebar activeType={type} />
      <div className="marketplace-content">
        {offline && <div className="status-note">O catálogo está temporariamente indisponível. Nenhuma criação de exemplo é exibida.</div>}

        {hero && showHighlights && (
          <section className="marketplace-hero">
            <AssetArtwork item={hero} className="marketplace-hero-artwork" showLabels={false} />
            <div>
              <span className="hero-kicker">Destaque do Ignis</span>
              <h1>{hero.name}</h1>
              <p>{hero.description}</p>
              <Link className="button button-primary" href={`/assets/${hero.id}`}>Ver criação <span>→</span></Link>
            </div>
          </section>
        )}

        {showHighlights && ignisFeatured.length > 0 && (
          <FeaturedShelf title="Destaques do Ignis" eyebrow="Seleção dos desenvolvedores" items={ignisFeatured} />
        )}

        {showHighlights && sponsoredFeatured.length > 0 && (
          <FeaturedShelf title="Destaques patrocinados" eyebrow="Apoio à comunidade" items={sponsoredFeatured} sponsored />
        )}

        <section className="catalog-section">
          <div className="catalog-toolbar">
            <div>
              <p className="eyebrow">{q ? 'Resultado da busca' : 'Catálogo real'}</p>
              <h2>{q ? `Resultados para “${q}”` : type ? 'Criações filtradas' : 'Todas as criações'}</h2>
            </div>
            <span className="catalog-source">Dados publicados no Neon</span>
          </div>
          {rows.length ? (
            <div className="asset-grid">
              {rows.map((item, index) => <MarketplaceCard key={item.id} item={item} index={index} />)}
            </div>
          ) : (
            <div className="empty-state"><strong>Nenhum recurso encontrado.</strong><span>Tente outro termo ou remova o filtro atual.</span></div>
          )}
        </section>
      </div>
    </main>
  );
}

function FeaturedShelf({ title, eyebrow, items, sponsored = false }) {
  return (
    <section className={`catalog-section featured-shelf${sponsored ? ' sponsored-shelf' : ''}`}>
      <div className="catalog-toolbar">
        <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
        {sponsored && <Link href="/donate">Como apoiar</Link>}
      </div>
      <div className="asset-grid">
        {items.map((item, index) => <MarketplaceCard key={item.id} item={item} index={index} />)}
      </div>
    </section>
  );
}
