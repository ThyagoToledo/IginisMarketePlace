export const metadata = { title: 'Política de Privacidade e Cookies' };

const sections = [
  ['Dados que coletamos', <div key="data"><p>Ao entrar com o GitHub, armazenamos os dados mínimos do seu perfil público:</p><ul><li>ID e nome de usuário do GitHub;</li><li>nome de exibição, e-mail (se público) e URL do avatar;</li><li>data de aceite dos termos e itens que você publicar.</li></ul></div>],
  ['Como usamos os dados', <p key="use">Usamos esses dados para identificar você de forma única, atribuir a autoria dos pacotes publicados, aplicar a moderação e operar o Serviço. Não vendemos seus dados.</p>],
  ['Cookies', <p key="cookies">Utilizamos cookies essenciais para autenticação e sessão via GitHub/Auth.js. Guardamos também, no seu navegador, a preferência de consentimento. Não utilizamos cookies de publicidade.</p>],
  ['Terceiros', <p key="third">A autenticação é processada pelo GitHub e a hospedagem pela Vercel, com banco de dados Neon. O conteúdo listado reside em repositórios Git externos, sujeitos às políticas de seus respectivos provedores.</p>],
  ['Seus direitos', <p key="rights">Você pode solicitar a exclusão da sua conta e dos seus dados entrando em contato com os administradores. Pacotes publicados podem ser removidos pelo autor ou pela administração.</p>],
  ['Contato', <p key="contact">Dúvidas sobre privacidade podem ser encaminhadas aos mantenedores do projeto no GitHub.</p>],
];

export default function PrivacyPage() {
  return <main className="legal-page"><header className="legal-header"><p className="eyebrow">Transparência e controle</p><h1>Política de Privacidade e Cookies</h1><p className="muted">Última atualização: 14 de junho de 2026</p></header><article className="panel legal-card">{sections.map(([title, content]) => <section className="legal-section" key={title}><h2>{title}</h2>{content}</section>)}</article></main>;
}
