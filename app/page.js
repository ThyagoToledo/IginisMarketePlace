import { getSql } from '../lib/db';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  { type: 'plugin', title: 'Plugins' },
  { type: 'workshop', title: 'Workshop Assets' },
  { type: 'asset', title: 'Tilemaps & Art' },
];

async function loadCatalog() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, type, name, author, description, version,
             git_url AS "gitUrl", cover_image_text AS "coverImageText",
             dependencies, downloads
      FROM items
      ORDER BY downloads DESC, created_at DESC`;
    return { rows, error: null };
  } catch (err) {
    return { rows: [], error: String(err.message || err) };
  }
}

function Card({ item }) {
  return (
    <div className="card">
      <div className="thumb">{item.coverImageText || item.type}</div>
      <div className="info">
        <div className="name">
          {item.name} <span className="ver">v{item.version} · por {item.author}</span>
        </div>
        <div className="desc">{item.description}</div>
        <div className="meta">
          Git: {item.gitUrl} &nbsp;|&nbsp; Deps: {item.dependencies}
        </div>
      </div>
      <div className="downloads">
        <strong>{item.downloads}</strong>
        downloads
      </div>
    </div>
  );
}

export default async function Home() {
  const { rows, error } = await loadCatalog();

  return (
    <>
      <header>
        <h1>Ignis Marketplace</h1>
        <p>Catalogo de plugins e assets do IgnisEngine — conectado ao editor.</p>
      </header>
      <main className="container">
        {error && (
          <div className="empty">
            Banco indisponivel. Configure <code>DATABASE_URL</code> (Neon) na Vercel e
            importe <code>db/seed.csv</code>.
            <br />
            <small>{error}</small>
          </div>
        )}

        {!error && rows.length === 0 && (
          <div className="empty">
            Catalogo vazio. Rode <code>db/schema.sql</code> e importe <code>db/seed.csv</code> no Neon.
          </div>
        )}

        {SECTIONS.map((sec) => {
          const items = rows.filter((r) => r.type === sec.type);
          if (items.length === 0) return null;
          return (
            <section key={sec.type}>
              <h2 className="section-title">{sec.title}</h2>
              {items.map((it) => (
                <Card key={it.id} item={it} />
              ))}
            </section>
          );
        })}
      </main>
    </>
  );
}
