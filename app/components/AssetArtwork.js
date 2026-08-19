'use client';

import { useState } from 'react';
import { artworkStyle, TYPE_LABELS } from '../../lib/presentation';

export default function AssetArtwork({ item, index = 0, className = '', showLabels = true }) {
  const [failed, setFailed] = useState(false);
  const label = item.coverImageText || TYPE_LABELS[item.type] || 'IgnisEngine';
  return (
    <span
      className={`asset-artwork ${className}`.trim()}
      style={artworkStyle(item, index)}
      role={item.coverImageUrl && !failed ? undefined : 'img'}
      aria-label={`Capa gerada para ${item.name}`}
    >
      {item.coverImageUrl && !failed && <img className="asset-cover-image" src={item.coverImageUrl} alt={`Capa de ${item.name}`} referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
      {showLabels && (!item.coverImageUrl || failed) && <><small>IGNIS ENGINE</small><strong>{label}</strong><span>{item.name}</span></>}
    </span>
  );
}
