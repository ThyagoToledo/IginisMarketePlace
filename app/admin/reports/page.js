export const metadata = { title: 'Relatos — Administração' };

export default function AdminReportsPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Moderação manual</p>
        <h1>Relatos</h1>
        <p>Esta será a fila de denúncias enviadas pela comunidade.</p>
      </div>
      <section className="panel admin-wip" aria-labelledby="reports-wip-title">
        <span className="wip-badge">WIP</span>
        <h2 id="reports-wip-title">Persistência de relatos pendente</h2>
        <p className="muted">Nenhum relato é exibido ou simulado enquanto a estrutura correspondente não existir no banco.</p>
      </section>
    </>
  );
}
