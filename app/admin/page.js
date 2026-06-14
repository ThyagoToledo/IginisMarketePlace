import { auth } from '../../auth';
import AdminUsers from './AdminUsers';

export const dynamic = 'force-dynamic';

// Painel de administracao — restrito a ThyagoToledo e FeronZerbana (is_admin).
export default async function AdminPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <main className="container">
        <h1>Admin</h1>
        <div className="empty">Entre com o GitHub para acessar.</div>
      </main>
    );
  }
  if (!user.isAdmin) {
    return (
      <main className="container">
        <h1>Admin</h1>
        <div className="empty">Acesso restrito a administradores.</div>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Painel Admin</h1>
      <p className="muted">Gerencie usuarios do marketplace.</p>
      <AdminUsers />
    </main>
  );
}
