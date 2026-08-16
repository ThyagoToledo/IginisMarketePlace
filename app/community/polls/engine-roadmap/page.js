import Link from 'next/link';
import CommunitySidebar from '../../../components/CommunitySidebar';
import Poll from './Poll';

export const metadata = { title: 'Enquete da comunidade — Roadmap' };

export default function PollPage() {
  return <main className="community-layout"><CommunitySidebar active="polls" /><div className="community-main"><div className="community-grid"><div><article className="panel post-card"><div className="post-author"><span className="avatar avatar-fallback">TT</span><div><strong>Equipe IgnisEngine</strong><div className="muted">Roadmap · publicado há 2 dias</div></div></div><h1>Qual recurso do motor deve receber prioridade?</h1><p>Queremos ouvir a comunidade sobre a próxima grande frente do IgnisEngine. O resultado desta enquete será um sinal para o planejamento, sem substituir as dependências técnicas registradas no roadmap mestre.</p><Poll /><div className="post-votes"><span>♡ 245 · 89 comentários</span><Link href="/report?source=poll">⚑ Reportar</Link></div></article><section className="discussion-list"><h2>Discussão</h2><article className="panel reply-card"><strong>PixelPusher99</strong><p>Iluminação global ajudaria muito na iteração de cenas grandes, principalmente se houver uma prévia eficiente no editor.</p><small className="muted">♡ 42 · Responder</small></article><article className="panel reply-card"><strong>LogicLoop</strong><p>Votei em navegação de IA. Uma solução nativa e robusta seria muito útil para jogos com geometrias complexas.</p><small className="muted">♡ 18 · Responder</small></article></section></div></div></div></main>;
}
