import OrganizationCreateForm from './OrganizationCreateForm';
export const metadata={title:'Criar organização'};
export default function NewOrganizationPage(){return <main className="page-container"><div className="page-heading"><p className="eyebrow">Nova equipe</p><h1>Criar organização</h1><p>Você será o proprietário e poderá convidar membros após a criação.</p></div><OrganizationCreateForm/></main>}
