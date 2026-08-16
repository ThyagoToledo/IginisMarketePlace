'use client';

import { useEffect, useState } from 'react';

const KINDS = [
  ['ignis', 'Ignis'],
  ['sponsored', 'Patrocinado'],
];

export default function AdminHighlights() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [pendingKey, setPendingKey] = useState(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch('/api/admin/highlights', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao carregar destaques.');
      setItems(data);
    } catch (loadError) {
      setError(loadError.message || 'Erro ao carregar destaques.');
    }
  }

  useEffect(() => { load(); }, []);

  async function toggle(item, kind) {
    const activeField = kind === 'ignis' ? 'ignisFeatured' : 'sponsoredFeatured';
    const pending = `${item.id}:${kind}`;
    setPendingKey(pending);
    setError(null);
    try {
      const response = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          kind,
          action: item[activeField] ? 'remove' : 'add',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao alterar destaque.');
      await load();
    } catch (mutationError) {
      setError(mutationError.message || 'Falha ao alterar destaque.');
    } finally {
      setPendingKey(null);
    }
  }

  if (items === null && !error) return <p>Carregando criações…</p>;

  return (
    <div>
      {error && <div className="result-err">{error}</div>}
      {items?.length ? (
        <table className="admin-table">
          <thead><tr><th>Criação</th><th>Tipo</th><th>Destaque do Ignis</th><th>Patrocinado</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong><small className="admin-item-author">por {item.author}</small></td>
                <td>{item.type}</td>
                {KINDS.map(([kind, label]) => {
                  const active = kind === 'ignis' ? item.ignisFeatured : item.sponsoredFeatured;
                  const pending = pendingKey === `${item.id}:${kind}`;
                  return (
                    <td key={kind}>
                      <button
                        className={active ? 'btn-danger' : 'btn-ghost'}
                        disabled={pending}
                        onClick={() => toggle(item, kind)}
                      >
                        {pending ? 'Salvando…' : active ? `Remover ${label}` : `Adicionar ${label}`}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty">Nenhuma criação real aprovada está disponível.</div>
      )}
    </div>
  );
}
