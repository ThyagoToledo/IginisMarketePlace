import { auth } from '../../auth';
import { getCurrentAdmin } from '../../lib/admin';
import { loadAdminStats } from '../../lib/catalog';
import AdminHighlights from './AdminHighlights';
import AdminUsers from './AdminUsers';

export const dynamic = 'force-dynamic';

// Painel de administracao — restrito a ThyagoToledo e FeronZerbana (is_admin).
export default async function AdminPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <main className="page-container">
        <div className="panel form-section"><h1>Console administrativo</h1><p className="muted">Entre com o GitHub para acessar.</p></div>
      </main>
    );
  }
  let admin = null;
  try {
    admin = await getCurrentAdmin();
  } catch {
    admin = null;
  }
  if (!user.isAdmin || !admin) {
    return (
      <main className="page-container">
        <div className="panel form-section"><h1>Console administrativo</h1><p className="muted">Acesso restrito a administradores.</p></div>
      </main>
    );
  }

  const stats = await loadAdminStats();
  return (
    <main className="admin-layout">
      <aside className="admin-sidebar"><p className="eyebrow">Admin</p><h2>Console da Forge</h2><nav><span className="active">▦ Visão geral</span><span>◎ Usuários</span><span>⚑ Relatos</span><span>◇ Organizações</span><span>⚙ Sistema</span></nav></aside>
      <div className="admin-content">
        <div className="page-heading"><p className="eyebrow">Operação e segurança</p><h1>Visão geral da plataforma</h1><p>Monitore o catálogo e gerencie contas sem alterar as regras de autoria.</p></div>
        <section className="admin-stats">
          <div className="panel admin-stat"><span>Usuários</span><strong>{stats.users}</strong></div>
          <div className="panel admin-stat"><span>Itens aprovados</span><strong>{stats.approved}</strong></div>
          <div className="panel admin-stat"><span>Pendentes</span><strong>{stats.pending}</strong></div>
          <div className="panel admin-stat"><span>Acessos Git</span><strong>{stats.downloads.toLocaleString('pt-BR')}</strong></div>
          <div className="panel admin-stat"><span>Destaques Ignis</span><strong>{stats.ignisFeatured}</strong></div>
          <div className="panel admin-stat"><span>Patrocinados</span><strong>{stats.sponsoredFeatured}</strong></div>
        </section>
        {stats.offline && <div className="status-note">O banco está indisponível; as estatísticas não foram carregadas.</div>}
        <section className="panel admin-panel"><div className="discussion-header"><div><p className="eyebrow">Curadoria</p><h2>Destaques do marketplace</h2></div><span className="muted">Somente criações reais e aprovadas</span></div><AdminHighlights /></section>
        <section className="panel admin-panel"><div className="discussion-header"><div><p className="eyebrow">Identidade GitHub</p><h2>Gerenciamento de usuários</h2></div><span className="muted">Admins são protegidos</span></div><AdminUsers /></section>
      </div>
    </main>
  );
}
