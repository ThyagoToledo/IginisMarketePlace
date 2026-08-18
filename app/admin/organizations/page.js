export const metadata = { title: 'Organizações — Administração' };

export default function AdminOrganizationsPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Estruturas da comunidade</p>
        <h1>Organizações</h1>
        <p>A formação, os membros e a moderação das organizações serão administrados aqui.</p>
      </div>
      <section className="panel admin-wip" aria-labelledby="organizations-wip-title">
        <span className="wip-badge">WIP</span>
        <h2 id="organizations-wip-title">Modelo de organizações pendente</h2>
        <p className="muted">A aplicação não cria dados temporários nem apresenta organizações fictícias antes da atualização do banco.</p>
      </section>
    </>
  );
}
