'use client';

import { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erro ao carregar.');
        return;
      }
      setUsers(await res.json());
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBan(u) {
    const action = u.isBanned ? 'unban' : 'ban';
    let reason = 'Violacao das regras';
    if (action === 'ban') {
      reason = window.prompt('Motivo do banimento:', reason) || reason;
    }
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || 'Falha na acao.');
      return;
    }
    load();
  }

  if (error) return <div className="empty">{error}</div>;
  if (users === null) return <p>Carregando…</p>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>ID</th><th>Usuario</th><th>Admin</th><th>Status</th><th>Acao</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.username}{u.displayName ? ` (${u.displayName})` : ''}</td>
            <td>{u.isAdmin ? 'sim' : '—'}</td>
            <td>{u.isBanned ? `banido: ${u.banReason || ''}` : 'ativo'}</td>
            <td>
              {u.isAdmin ? (
                <span className="muted">protegido</span>
              ) : (
                <button className={u.isBanned ? 'btn-ghost' : 'btn-danger'} onClick={() => toggleBan(u)}>
                  {u.isBanned ? 'Desbanir' : 'Banir'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
