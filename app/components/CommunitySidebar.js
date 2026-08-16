import Link from 'next/link';

export default function CommunitySidebar({ active }) {
  return <aside className="community-sidebar"><h2>The Forge</h2><p>Fórum da comunidade</p><Link className="button button-primary button-block" href="/community/questions/vulkan-mobile">+ Nova publicação</Link><nav><Link className={active === 'home' ? 'active' : ''} href="/community/questions/vulkan-mobile">⌂ Início</Link><Link className={active === 'questions' ? 'active' : ''} href="/community/questions/vulkan-mobile">▣ Perguntas</Link><Link className={active === 'polls' ? 'active' : ''} href="/community/polls/engine-roadmap">▥ Enquetes</Link><Link href="/organizations/ursoftware">◎ Organizações</Link><Link href="/terms">⚖ Regras</Link></nav></aside>;
}
