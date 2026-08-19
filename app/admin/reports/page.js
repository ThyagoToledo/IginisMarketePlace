export const metadata = { title: 'Relatos — Administração' };
import AdminReports from './AdminReports';

export default function AdminReportsPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Moderação manual</p>
        <h1>Relatos</h1>
        <p>Fila de denúncias enviadas pela comunidade para revisão manual.</p>
      </div>
      <AdminReports />
    </>
  );
}
