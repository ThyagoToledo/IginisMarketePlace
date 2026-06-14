import { auth } from '../../auth';
import AccountTokens from './AccountTokens';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="container">
        <h1>Minha conta</h1>
        <div className="empty">Entre com o GitHub (botao no topo) para gerenciar seus tokens.</div>
      </main>
    );
  }
  return (
    <main className="container">
      <h1>Minha conta</h1>
      <p className="muted">Logado como <strong>{session.user.login || session.user.name}</strong>.</p>
      <AccountTokens />
    </main>
  );
}
