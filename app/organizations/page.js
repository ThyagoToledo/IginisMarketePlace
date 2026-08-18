export const metadata = { title: 'Organizações' };

export default function OrganizationsPage() {
  return (
    <main className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Comunidade</p>
        <h1>Organizações</h1>
        <p>Este espaço reunirá equipes e suas criações publicadas na Forge.</p>
      </div>
      <section className="panel public-wip" aria-labelledby="organizations-title">
        <span className="wip-badge">WIP</span>
        <h2 id="organizations-title">Formação de organizações em desenvolvimento</h2>
        <p className="muted">Nenhuma organização fictícia é exibida. Criação, convites, membros e perfis serão liberados após a atualização do modelo de dados.</p>
        <button className="button button-primary" type="button" disabled>Criar organização</button>
      </section>
    </main>
  );
}
