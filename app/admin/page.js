import { loadAdminStats } from '../../lib/catalog';
import AdminHighlights from './AdminHighlights';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const stats = await loadAdminStats();
  return (
    <>
      <div className="page-heading"><p className="eyebrow">Operação e segurança</p><h1>Visão geral da plataforma</h1><p>Monitore o catálogo e a curadoria da Forge.</p></div>
      <section className="admin-stats">
        <div className="panel admin-stat"><span>Usuários</span><strong>{stats.offline ? '—' : stats.users}</strong></div>
        <div className="panel admin-stat"><span>Itens aprovados</span><strong>{stats.offline ? '—' : stats.approved}</strong></div>
        <div className="panel admin-stat"><span>Pendentes</span><strong>{stats.offline ? '—' : stats.pending}</strong></div>
        <div className="panel admin-stat"><span>Acessos Git</span><strong>{stats.offline ? '—' : stats.downloads.toLocaleString('pt-BR')}</strong></div>
        <div className="panel admin-stat"><span>Destaques Ignis</span><strong>{stats.offline ? '—' : stats.ignisFeatured}</strong></div>
        <div className="panel admin-stat"><span>Patrocinados</span><strong>{stats.offline ? '—' : stats.sponsoredFeatured}</strong></div>
        <div className="panel admin-stat admin-stat-wip"><span>Relatos</span><strong>WIP</strong></div>
        <div className="panel admin-stat admin-stat-wip"><span>Organizações</span><strong>WIP</strong></div>
      </section>
      {stats.offline && <div className="status-note">O banco está indisponível; as estatísticas não foram carregadas.</div>}
      <section className="panel admin-panel"><div className="discussion-header"><div><p className="eyebrow">Curadoria</p><h2>Destaques do marketplace</h2></div><span className="muted">Somente criações reais e aprovadas</span></div><AdminHighlights /></section>
    </>
  );
}
