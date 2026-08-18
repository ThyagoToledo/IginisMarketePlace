'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVIGATION = [
  { href: '/admin', label: 'Visão geral', icon: '▦' },
  { href: '/admin/users', label: 'Usuários', icon: '◎' },
  { href: '/admin/reports', label: 'Relatos', icon: '⚑' },
  { href: '/admin/organizations', label: 'Organizações', icon: '◇' },
  { href: '/admin/system', label: 'Sistema', icon: '⚙' },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <p className="eyebrow">Admin</p>
        <h2>Console da Forge</h2>
        <nav aria-label="Navegação administrativa">
          {NAVIGATION.map((item) => {
            const active = item.href === '/admin'
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} className={active ? 'active' : ''} href={item.href}>
                <span aria-hidden="true">{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="admin-content">{children}</div>
    </main>
  );
}
