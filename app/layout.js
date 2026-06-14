import './globals.css';
import Link from 'next/link';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent';

export const metadata = {
  title: 'Ignis Marketplace',
  description: 'Catalogo de plugins e assets do IgnisEngine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        {children}
        <footer className="site-footer">
          <Link href="/terms">Termos de Servico</Link>
          <span> · </span>
          <Link href="/privacy">Privacidade e Cookies</Link>
          <span> · </span>
          <a href="https://github.com/ThyagoToledo/IginisMarketePlace" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
