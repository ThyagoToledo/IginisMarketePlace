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
      SELECT i.id, i.type, i.name, i.author, i.description, i.version,
             i.git_url AS "gitUrl", i.cover_image_text AS "coverImageText",
             i.dependencies, i.downloads,
             u.username AS "ownerUsername", u.avatar_url AS "ownerAvatar"
      FROM items i
      LEFT JOIN users u ON u.id = i.author_id
      WHERE i.status = 'approved' AND COALESCE(u.is_banned, false) = false
      ORDER BY i.downloads DESC, i.created_at DESC`;
    return { rows, error: null };
  } catch (err) {
    return { rows: [], error: String(err.message || err) };
  }
}

function Card({ item }) {
  const owner = item.ownerUsername && item.ownerUsername !== 'legacy'
    ? item.ownerUsername
    : item.author;
  return (
    <div className="card">
      <div className="thumb">{item.coverImageText || item.type}</div>
      <div className="info">
        <div className="name">
          {item.name} <span className="ver">v{item.version} · por {owner}</span>
        </div>
        <div className="desc">{item.description}</div>
        <div className="meta">Git: {item.gitUrl} &nbsp;|&nbsp; Deps: {item.dependencies}</div>
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
    <main className="container">
      {error && (
        <div className="empty">
          Banco indisponivel. Configure <code>DATABASE_URL</code> (Neon) na Vercel.
          <br />
          <small>{error}</small>
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="empty">
          Catalogo vazio. Rode a migracao SQL no Neon ou publique o primeiro pacote.
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
  );
}
