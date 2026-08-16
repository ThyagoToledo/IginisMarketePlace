import { artworkStyle, TYPE_LABELS } from '../../lib/presentation';

export default function AssetArtwork({ item, index = 0, className = '' }) {
  const label = item.coverImageText || TYPE_LABELS[item.type] || 'IgnisEngine';
  return (
    <span
      className={`asset-artwork ${className}`.trim()}
      style={artworkStyle(item, index)}
      role="img"
      aria-label={`Capa gerada para ${item.name}`}
    >
      <small>IGNIS ENGINE</small>
      <strong>{label}</strong>
      <span>{item.name}</span>
    </span>
  );
}
