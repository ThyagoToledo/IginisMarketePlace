import SystemStatus from './SystemStatus';

export const metadata = { title: 'Sistema — Administração' };

export default function AdminSystemPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Diagnóstico somente-leitura</p>
        <h1>Sistema</h1>
        <p>Confira a disponibilidade dos serviços e a presença das configurações obrigatórias.</p>
      </div>
      <SystemStatus />
    </>
  );
}
