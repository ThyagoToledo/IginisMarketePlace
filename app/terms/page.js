export const metadata = { title: 'Termos de Serviço' };

const sections = [
  ['Aceitação', <p key="accept">Ao acessar ou publicar conteúdo no Ignis Marketplace (“Serviço”), você concorda com estes Termos de Serviço e com a Política de Privacidade. Se não concordar, não utilize o Serviço.</p>],
  ['Natureza do Serviço', <p key="nature">O Serviço é um catálogo/índice que lista <strong>URLs de repositórios Git</strong> de plugins e assets de terceiros para o IgnisEngine. O Serviço <strong>não hospeda, não distribui binários e não executa</strong> o código de terceiros. O download e a instalação ocorrem diretamente a partir dos repositórios externos indicados.</p>],
  ['Contas e identificação', <p key="accounts">A autenticação é feita via GitHub. Você é responsável pela atividade realizada com a sua conta e por manter a veracidade das informações enviadas.</p>],
  ['Conteúdo do usuário e responsabilidade', <ul key="content"><li>Você declara ser titular ou ter autorização sobre o conteúdo do repositório enviado.</li><li>O conteúdo dos repositórios é de responsabilidade exclusiva de seus autores. O Serviço não garante segurança, funcionamento, qualidade ou ausência de código malicioso.</li><li>É proibido enviar conteúdo ilegal, malicioso, pirateado ou que viole direitos de terceiros.</li></ul>],
  ['Verificação de segurança e moderação', <p key="security">Submissões passam por verificação automática de campos e análise básica do repositório. Submissões reprovadas não são publicadas. Os administradores podem remover itens e banir contas que violem estes Termos.</p>],
  ['Isenção de garantias e limitação de responsabilidade', <p key="warranty">O Serviço é fornecido “no estado em que se encontra”, sem garantias. Na extensão máxima permitida em lei, o Serviço e seus mantenedores não se responsabilizam por danos decorrentes do uso de conteúdo de terceiros listado, incluindo perdas de dados ou prejuízos causados por software obtido de repositórios externos.</p>],
  ['Alterações', <p key="changes">Estes Termos podem ser atualizados a qualquer momento. O uso continuado implica aceitação.</p>],
];

export default function TermsPage() {
  return <main className="legal-page"><header className="legal-header"><p className="eyebrow">IgnisEngine Forge</p><h1>Termos de Serviço</h1><p className="muted">Última atualização: 14 de junho de 2026</p></header><article className="panel legal-card">{sections.map(([title, content]) => <section className="legal-section" key={title}><h2>{title}</h2>{content}</section>)}</article></main>;
}
