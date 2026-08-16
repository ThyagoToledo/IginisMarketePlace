import Link from 'next/link';
import { getDonationUrl } from '../../lib/donations.mjs';

export const metadata = {
  title: 'Apoie o IgnisEngine',
  description: 'Ajude a manter o IgnisEngine e sua comunidade de criadores.',
};

const GITHUB_URL = 'https://github.com/URSoftware/IgnisEngine';

export default function DonatePage() {
  const donationUrl = getDonationUrl(process.env.NEXT_PUBLIC_DONATION_URL);

  return (
    <main className="donation-page">
      <section className="donation-hero">
        <div>
          <p className="eyebrow">Código aberto, comunidade forte</p>
          <h1>Ajude o IgnisEngine a continuar evoluindo.</h1>
          <p>As doações apoiam infraestrutura, documentação, manutenção do motor e o trabalho necessário para manter a Forge segura e disponível.</p>
          <div className="donation-actions">
            {donationUrl ? (
              <a className="button button-primary" href={donationUrl} target="_blank" rel="noreferrer">Fazer uma doação</a>
            ) : (
              <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">Acompanhar canais oficiais</a>
            )}
            <Link className="button button-ghost" href="/">Explorar a Forge</Link>
          </div>
          {!donationUrl && <small>O canal de pagamento ainda não foi configurado. O link será publicado aqui quando estiver disponível.</small>}
        </div>
        <div className="donation-emblem" aria-hidden="true"><span>IGNIS</span><strong>♡</strong><small>OPEN SOURCE</small></div>
      </section>

      <section className="support-grid">
        <article className="panel support-card"><span>01</span><h2>Infraestrutura</h2><p>Banco, hospedagem e serviços que mantêm o marketplace acessível à comunidade.</p></article>
        <article className="panel support-card"><span>02</span><h2>Desenvolvimento</h2><p>Correções, novas ferramentas do motor e integração segura com o ecossistema.</p></article>
        <article className="panel support-card"><span>03</span><h2>Documentação</h2><p>Guias e exemplos que reduzem a distância entre uma ideia e um jogo funcionando.</p></article>
      </section>

      <section className="panel sponsored-explainer">
        <div><p className="eyebrow">Destaques patrocinados</p><h2>Reconhecimento com curadoria</h2></div>
        <div>
          <p>Criadores que apoiam o projeto podem ter uma criação aprovada indicada como destaque patrocinado. A inclusão e a remoção são feitas manualmente pelos administradores.</p>
          <p>A doação não compra aprovação, não contorna a análise de segurança e não garante permanência. Toda criação continua sujeita aos mesmos termos e regras do catálogo.</p>
          <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">Falar com os mantenedores →</a>
        </div>
      </section>
    </main>
  );
}
