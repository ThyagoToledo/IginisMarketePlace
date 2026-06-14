import './globals.css';

export const metadata = {
  title: 'Ignis Marketplace',
  description: 'Catalogo de plugins e assets do IgnisEngine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
