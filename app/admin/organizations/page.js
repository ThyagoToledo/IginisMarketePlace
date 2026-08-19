export const metadata = { title: 'Organizações — Administração' };
import AdminOrganizations from './AdminOrganizations';

export default function AdminOrganizationsPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Estruturas da comunidade</p>
        <h1>Organizações</h1>
        <p>Formação, membros e estado de moderação das organizações.</p>
      </div>
      <AdminOrganizations />
    </>
  );
}
