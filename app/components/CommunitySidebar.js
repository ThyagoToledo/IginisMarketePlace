import Link from 'next/link';

export default function CommunitySidebar({ active }) {
  return <aside className="community-sidebar"><h2>The Forge</h2><p>Fórum da comunidade</p><Link className="button button-primary button-block" href="/community/questions#new-question">+ Nova pergunta</Link><nav><Link className={active === 'questions' ? 'active' : ''} href="/community/questions">⌂ Perguntas</Link><Link className={active === 'polls' ? 'active' : ''} href="/community/polls/engine-roadmap">▥ Enquetes</Link><Link href="/organizations">◎ Organizações</Link><Link href="/terms">⚖ Regras</Link></nav></aside>;
}
