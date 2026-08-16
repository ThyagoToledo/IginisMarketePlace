import { auth } from '../../auth';
import AccountTokens from './AccountTokens';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="page-container">
        <div className="panel form-section"><h1>Minha conta</h1><p className="muted">Entre com o GitHub pelo botão no topo para gerenciar seus tokens.</p></div>
      </main>
    );
  }
  return (
    <main className="page-container">
      <div className="page-heading"><p className="eyebrow">Conta conectada</p><h1>Minha conta</h1></div>
      <div className="account-grid">
        <aside className="panel account-profile">
          {session.user.image ? <img className="avatar" src={session.user.image} alt="" /> : <span className="avatar avatar-fallback">◎</span>}
          <h2>{session.user.name || session.user.login}</h2>
          <p className="muted">@{session.user.login || session.user.name}</p>
          <p className="muted">Identidade vinculada ao GitHub. Seus pacotes e tokens usam esta conta como fonte de autoria.</p>
        </aside>
        <section className="panel account-content"><AccountTokens /></section>
      </div>
    </main>
  );
}
