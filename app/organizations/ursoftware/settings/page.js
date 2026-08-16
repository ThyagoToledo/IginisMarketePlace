import Link from 'next/link';
import { auth } from '../../../../auth';
import OrganizationSettings from './OrganizationSettings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Configurações da organização' };

export default async function OrganizationSettingsPage() {
  const session = await auth();
  if (!session?.user) return <main className="page-container"><div className="panel form-section"><h1>Configurações da organização</h1><p className="muted">Entre com o GitHub para acessar esta área.</p></div></main>;
  return <main className="settings-layout"><aside className="settings-sidebar"><p className="eyebrow">Organização</p><h2>URSoftware</h2><nav><Link href="/organizations/ursoftware">⌂ Perfil público</Link><a className="active" href="#">⚙ Geral</a><a href="#">◎ Membros</a><a href="#">▣ Recursos</a><a href="#">↗ Integrações</a></nav></aside><div className="settings-content"><header className="settings-head"><div><h1>Configurações da organização</h1><p className="muted">Gerencie o perfil e visualize os membros reconhecidos.</p></div></header><OrganizationSettings /></div></main>;
}
