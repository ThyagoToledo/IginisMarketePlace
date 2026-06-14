export const metadata = { title: 'Privacidade e Cookies - Ignis Marketplace' };

export default function PrivacyPage() {
  return (
    <main className="container legal">
      <h1>Politica de Privacidade e Cookies</h1>
      <p className="muted">Ultima atualizacao: 2026-06-14</p>

      <h2>1. Dados que coletamos</h2>
      <p>Ao entrar com o GitHub, armazenamos os dados minimos do seu perfil publico:</p>
      <ul>
        <li>ID e nome de usuario do GitHub;</li>
        <li>nome de exibicao, e-mail (se publico) e URL do avatar;</li>
        <li>data de aceite dos termos e itens que voce publicar.</li>
      </ul>

      <h2>2. Como usamos os dados</h2>
      <p>
        Usamos esses dados para identificar voce de forma unica, atribuir a autoria dos pacotes
        publicados, aplicar a moderacao/seguranca e operar o Servico. Nao vendemos seus dados.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Utilizamos cookies <strong>essenciais</strong> para autenticacao e sessao (via GitHub /
        Auth.js). Sem eles, o login nao funciona. Guardamos tambem, no seu navegador
        (localStorage), a sua preferencia de consentimento de cookies. Nao utilizamos cookies de
        publicidade.
      </p>

      <h2>4. Terceiros</h2>
      <p>
        A autenticacao e processada pelo GitHub e a hospedagem pela Vercel, com banco de dados
        Neon. O conteudo listado reside em repositorios Git externos, sujeitos as politicas de
        seus respectivos provedores.
      </p>

      <h2>5. Seus direitos</h2>
      <p>
        Voce pode solicitar a exclusao da sua conta e dos seus dados entrando em contato com os
        administradores. Pacotes ja publicados podem ser removidos por voce (autor) ou pela
        administracao.
      </p>

      <h2>6. Contato</h2>
      <p>Duvidas sobre privacidade podem ser encaminhadas aos mantenedores do projeto no GitHub.</p>
    </main>
  );
}
