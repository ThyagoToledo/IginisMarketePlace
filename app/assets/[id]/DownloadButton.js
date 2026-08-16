'use client';

import { useState } from 'react';

export default function DownloadButton({ id, gitUrl }) {
  const [busy, setBusy] = useState(false);

  async function openRepository() {
    setBusy(true);
    try {
      await fetch(`/api/items/${id}`, { method: 'POST' });
    } finally {
      window.open(gitUrl, '_blank', 'noopener,noreferrer');
      setBusy(false);
    }
  }

  return (
    <button className="button button-primary" type="button" onClick={openRepository} disabled={busy}>
      {busy ? 'Abrindo repositório…' : 'Obter pelo repositório Git'}
    </button>
  );
}
