import { notFound,redirect } from 'next/navigation';
import { auth } from '../../../../auth';
import { getOrganizationAccess,hasOrganizationRole } from '../../../../lib/organization-access';
import OrganizationSettings from './OrganizationSettings';
export const dynamic='force-dynamic';
export default async function OrganizationSettingsPage({params}){const session=await auth();if(!session?.user)redirect('/organizations');const{slug}=await params;const access=await getOrganizationAccess(Number(session.user.id),{slug:decodeURIComponent(slug)});if(!access)notFound();if(!hasOrganizationRole(access))redirect(`/organizations/${access.slug}`);return <main className="page-container"><div className="page-heading"><p className="eyebrow">Administração da equipe</p><h1>Gerenciar {access.name}</h1></div><OrganizationSettings organization={{id:access.id,slug:access.slug,name:access.name,description:access.description}}/></main>}
