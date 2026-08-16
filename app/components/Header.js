import Link from 'next/link';
import { auth, signIn, signOut } from '../../auth';

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand"><span>IgnisEngine</span><small>Forge</small></Link>
        <form className="header-search" action="/">
          <span aria-hidden="true">⌕</span>
          <input name="q" aria-label="Buscar no marketplace" placeholder="Buscar assets, plugins, criadores..." />
        </form>
        <nav className="nav">
          <Link href="/">Marketplace</Link>
          <Link href="/community/questions/vulkan-mobile">Comunidade</Link>
          <Link href="/donate">Apoie</Link>
          <a href="https://github.com/URSoftware/IgnisEngine/tree/main/doc" target="_blank" rel="noreferrer">Docs</a>
          <Link className="button button-primary header-upload" href="/publish">Publicar</Link>
          {user?.isAdmin && <Link href="/admin">Admin</Link>}
          {user ? (
            <span className="user-box">
              <Link href="/account" aria-label="Minha conta">
                {user.image ? <img className="avatar" src={user.image} alt="" /> : <span className="avatar avatar-fallback">◎</span>}
              </Link>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button className="icon-button" type="submit" title="Sair" aria-label="Sair">↪</button>
              </form>
            </span>
          ) : (
            <form
              action={async () => {
                'use server';
                await signIn('github', { redirectTo: '/' });
              }}
            >
              <button className="button button-ghost" type="submit">Entrar com GitHub</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
