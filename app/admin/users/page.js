import AdminUsers from '../AdminUsers';

export const metadata = { title: 'Usuários — Administração' };

export default function AdminUsersPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Identidade GitHub</p>
        <h1>Usuários</h1>
        <p>Busque contas da plataforma e gerencie seus estados de acesso.</p>
      </div>
      <section className="panel admin-panel admin-panel-first">
        <AdminUsers />
      </section>
    </>
  );
}
