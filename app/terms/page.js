export const metadata = { title: 'Termos de Servico - Ignis Marketplace' };

export default function TermsPage() {
  return (
    <main className="container legal">
      <h1>Termos de Servico</h1>
      <p className="muted">Ultima atualizacao: 2026-06-14</p>

      <h2>1. Aceitacao</h2>
      <p>
        Ao acessar ou publicar conteudo no Ignis Marketplace ("Servico"), voce concorda com
        estes Termos de Servico e com a Politica de Privacidade. Se nao concordar, nao utilize
        o Servico.
      </p>

      <h2>2. Natureza do Servico</h2>
      <p>
        O Servico e um catalogo/indice que lista <strong>URLs de repositorios Git</strong> de
        plugins e assets de terceiros para o IgnisEngine. O Servico <strong>nao hospeda,
        nao distribui binarios e nao executa</strong> o codigo de terceiros. O download e a
        instalacao do conteudo ocorrem diretamente a partir dos repositorios externos indicados.
      </p>

      <h2>3. Contas e identificacao</h2>
      <p>
        A autenticacao e feita via GitHub. Voce e responsavel pela atividade realizada com a sua
        conta e por manter a veracidade das informacoes enviadas.
      </p>

      <h2>4. Conteudo do usuario e responsabilidade</h2>
      <ul>
        <li>Voce declara ser titular ou ter autorizacao sobre o conteudo do repositorio enviado.</li>
        <li>
          O conteudo dos repositorios e de <strong>responsabilidade exclusiva de seus autores</strong>.
          O Servico nao garante seguranca, funcionamento, qualidade ou ausencia de codigo malicioso
          em repositorios de terceiros.
        </li>
        <li>
          E proibido enviar conteudo ilegal, malicioso (malware, stealers, etc.), que viole direitos
          de terceiros, ou que contenha material pirateado.
        </li>
      </ul>

      <h2>5. Verificacao de seguranca e moderacao</h2>
      <p>
        Submissoes passam por uma verificacao automatica (validacao de campos e analise basica do
        repositorio). Submissoes reprovadas <strong>nao sao publicadas</strong>. Os administradores
        podem remover qualquer item e <strong>banir</strong> contas que violem estes Termos, a
        qualquer momento e a seu criterio.
      </p>

      <h2>6. Isencao de garantias e limitacao de responsabilidade</h2>
      <p>
        O Servico e fornecido "no estado em que se encontra", sem garantias de qualquer tipo. Na
        extensao maxima permitida em lei, o Servico e seus mantenedores <strong>nao se
        responsabilizam</strong> por quaisquer danos diretos ou indiretos decorrentes do uso do
        Servico ou de conteudo de terceiros listado, incluindo perdas de dados ou prejuizos
        causados por software baixado de repositorios externos.
      </p>

      <h2>7. Alteracoes</h2>
      <p>Estes Termos podem ser atualizados a qualquer momento. O uso continuado implica aceitacao.</p>
    </main>
  );
}
