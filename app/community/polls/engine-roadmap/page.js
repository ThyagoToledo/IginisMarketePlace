import CommunitySidebar from '../../../components/CommunitySidebar';

export const metadata = { title: 'Enquete da comunidade — Roadmap' };

export default function PollPage() {
  return <main className="community-layout"><CommunitySidebar active="polls" /><div className="community-main"><div className="page-heading"><p className="eyebrow">Comunidade</p><h1>Enquetes</h1><p>Votações persistidas serão publicadas aqui quando o recurso estiver disponível.</p></div><div className="empty-state"><strong>Nenhuma enquete publicada.</strong><span>Resultados, votos e comentários demonstrativos foram removidos.</span></div></div></main>;
}
