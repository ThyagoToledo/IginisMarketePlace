import { auth } from '../../auth';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <main className="page-container">
        <div className="panel form-section">
          <h1>Console administrativo</h1>
          <p className="muted">Entre com o GitHub para acessar.</p>
        </div>
      </main>
    );
  }

  if (!user.isAdmin) {
    return (
      <main className="page-container">
        <div className="panel form-section">
          <h1>Console administrativo</h1>
          <p className="muted">Acesso restrito a administradores.</p>
        </div>
      </main>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
