import OrganizationsClient from './OrganizationsClient';

export const metadata = { title: 'Organizações' };

export default function OrganizationsPage() {
  return (
    <main className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Comunidade</p>
        <h1>Organizações</h1>
        <p>Equipes da comunidade e suas criações publicadas na Forge.</p>
      </div>
      <OrganizationsClient />
    </main>
  );
}
