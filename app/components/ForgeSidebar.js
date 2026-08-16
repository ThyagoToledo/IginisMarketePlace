import Link from 'next/link';

const categories = [
  ['plugin', '⌘', 'Plugins'],
  ['workshop', '◈', 'Workshop'],
  ['asset', '◇', 'Arte & Assets'],
];

export default function ForgeSidebar({ activeType }) {
  return (
    <aside className="forge-sidebar">
      <div>
        <p className="eyebrow">Categorias da Forge</p>
        <h2>Recursos técnicos</h2>
      </div>
      <nav aria-label="Categorias do marketplace">
        {categories.map(([type, icon, label]) => (
          <Link key={type} href={`/?type=${type}`} className={activeType === type ? 'active' : ''}>
            <span aria-hidden="true">{icon}</span>{label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <Link className="button button-outline button-block" href="/publish">Torne-se um criador</Link>
      <Link className="sidebar-utility" href="/donate">♡ Apoie o IgnisEngine</Link>
      <Link className="sidebar-utility" href="/account">⚙ Configurações</Link>
      <a className="sidebar-utility" href="https://github.com/URSoftware/IgnisEngine/issues" target="_blank" rel="noreferrer">? Suporte</a>
    </aside>
  );
}
