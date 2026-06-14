import Link from 'next/link';
import { auth, signIn, signOut } from '../../auth';

// Cabecalho global com estado de login (server component).
export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header>
      <div className="header-inner">
        <Link href="/" className="brand">Ignis Marketplace</Link>
        <nav className="nav">
          <Link href="/">Catalogo</Link>
          <Link href="/publish">Publicar</Link>
          {user && <Link href="/account">Conta</Link>}
          {user?.isAdmin && <Link href="/admin">Admin</Link>}
          {user ? (
            <span className="user-box">
              {user.image && <img className="avatar" src={user.image} alt="" />}
              <span className="uname">{user.login || user.name}</span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button className="btn-ghost" type="submit">Sair</button>
              </form>
            </span>
          ) : (
            <form
              action={async () => {
                'use server';
                await signIn('github', { redirectTo: '/' });
              }}
            >
              <button className="btn-gh" type="submit">Entrar com GitHub</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
