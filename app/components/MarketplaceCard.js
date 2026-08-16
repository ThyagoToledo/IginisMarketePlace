import Link from 'next/link';
import { TYPE_LABELS } from '../../lib/presentation';
import AssetArtwork from './AssetArtwork';

export default function MarketplaceCard({ item, index = 0 }) {
  const owner = item.ownerUsername && item.ownerUsername !== 'legacy' ? item.ownerUsername : item.author;
  return (
    <article className="asset-card">
      <Link href={`/assets/${item.id}`} className="asset-card-media">
        <AssetArtwork item={item} index={index} />
        <span className="chip">{TYPE_LABELS[item.type] || item.type}</span>
        {(item.ignisFeatured || item.sponsoredFeatured) && (
          <span className="promotion-badges">
            {item.ignisFeatured && <span>Destaque Ignis</span>}
            {item.sponsoredFeatured && <span className="sponsored">Patrocinado</span>}
          </span>
        )}
      </Link>
      <div className="asset-card-body">
        <Link href={`/assets/${item.id}`} className="asset-card-title">{item.name}</Link>
        <Link href={`/creators/${encodeURIComponent(owner)}`} className="asset-card-author">◎ {owner}</Link>
        <p>{item.description}</p>
        <div className="asset-card-meta">
          <span>v{item.version}</span>
          <span>↓ {Number(item.downloads || 0).toLocaleString('pt-BR')}</span>
        </div>
      </div>
    </article>
  );
}
