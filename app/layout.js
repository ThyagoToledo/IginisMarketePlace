import './globals.css';
import Link from 'next/link';
import { headers } from 'next/headers';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent';

export async function generateMetadata() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'localhost:3000';
  const protocol = requestHeaders.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = 'IgnisEngine Forge';
  const description = 'Catálogo seguro de plugins e assets para o IgnisEngine, publicado diretamente a partir de repositórios Git.';
  return {
    metadataBase,
    title: { default: title, template: '%s | IgnisEngine Forge' },
    description,
    openGraph: { title, description, images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'IgnisEngine Forge' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        {children}
        <footer className="site-footer">
          <div className="footer-brand"><strong>IgnisEngine Forge</strong><span>Feito para criadores.</span></div>
          <nav>
            <Link href="/terms">Termos de Serviço</Link>
            <Link href="/privacy">Privacidade</Link>
            <Link href="/donate">Doações</Link>
            <a href="https://github.com/URSoftware/IgnisEngine" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://github.com/URSoftware/IgnisEngine/issues" target="_blank" rel="noreferrer">Suporte</a>
          </nav>
          <span>© 2026 IgnisEngine</span>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
