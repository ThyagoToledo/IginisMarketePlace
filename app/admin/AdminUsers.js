'use client';

import { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    try {
      const params = new URLSearchParams({
        q: submittedQuery,
        status,
        page: String(page),
        limit: '25',
      });
      const res = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erro ao carregar.');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    load();
  }, [submittedQuery, status, page]);

  function search(event) {
    event.preventDefault();
    setPage(1);
    setSubmittedQuery(query.trim());
  }

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

  return (
    <div>
      <form className="admin-toolbar" onSubmit={search}>
        <label className="admin-search">
          <span className="sr-only">Buscar usuários</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            placeholder="Buscar por ID, usuário, nome ou e-mail"
          />
        </label>
        <select
          aria-label="Filtrar usuários por status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="banned">Banidos</option>
          <option value="admin">Administradores</option>
        </select>
        <button className="button button-primary" type="submit">Buscar</button>
      </form>

      {error && <div className="result-err">{error}</div>}
      {users === null && !error ? <p>Carregando…</p> : users?.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Usuário</th><th>Admin</th><th>Status</th><th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.username}</strong>{u.displayName && <small className="admin-item-author">{u.displayName}</small>}</td>
                  <td>{u.isAdmin ? 'sim' : '—'}</td>
                  <td>{u.isBanned ? `banido: ${u.banReason || 'motivo não informado'}` : 'ativo'}</td>
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
        </div>
      ) : !error && <div className="empty">Nenhum usuário encontrado.</div>}

      {pagination && (
        <div className="admin-pagination">
          <span>{pagination.total} usuário{pagination.total === 1 ? '' : 's'} · página {pagination.page} de {pagination.pages}</span>
          <div>
            <button className="btn-ghost" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</button>
            <button className="btn-ghost" type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}
