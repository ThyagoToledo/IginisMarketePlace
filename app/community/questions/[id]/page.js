import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '../../../../auth';
import { loadCommunityQuestion } from '../../../../lib/community-data';
import CommunitySidebar from '../../../components/CommunitySidebar';
import AnswerForm from './AnswerForm';

export const dynamic = 'force-dynamic';
const CATEGORY_LABELS = { general: 'Geral', graphics: 'Gráficos', scripting: 'Scripting', assets: 'Assets', help: 'Ajuda' };

export async function generateMetadata({ params }) { const { id } = await params; const question = await loadCommunityQuestion(id); return question ? { title: question.title, description: question.body.slice(0, 160) } : { title: 'Pergunta não encontrada' }; }

export default async function QuestionPage({ params }) {
  const { id } = await params;
  const [question, session] = await Promise.all([loadCommunityQuestion(id), auth()]);
  if (!question) notFound();
  return <main className="community-layout"><CommunitySidebar active="questions" /><div className="community-main"><div className="community-question-layout"><div><article className="panel post-card"><div className="post-author">{question.avatarUrl ? <img className="avatar" src={question.avatarUrl} alt="" /> : <span className="avatar avatar-fallback">◎</span>}<div><Link href={`/creators/${encodeURIComponent(question.username)}`}><strong>{question.displayName || question.username}</strong></Link><div className="muted">@{question.username} · {new Date(question.createdAt).toLocaleString('pt-BR')}</div></div></div><h1>{question.title}</h1><p className="community-post-body">{question.body}</p><div className="post-votes"><span className="chip">{CATEGORY_LABELS[question.category] || question.category}</span>{Number(session?.user?.id)!==Number(question.authorId)&&<Link href={`/report?question=${question.id}`}>⚑ Reportar</Link>}</div></article><section className="discussion-list"><h2>Respostas ({question.answers.length})</h2>{question.answers.length ? question.answers.map((answer) => <article className="panel reply-card" key={answer.id}><div className="question-author">{answer.avatarUrl ? <img className="avatar" src={answer.avatarUrl} alt="" /> : <span className="avatar avatar-fallback">◎</span>}<span><Link href={`/creators/${encodeURIComponent(answer.username)}`}><strong>{answer.displayName || answer.username}</strong></Link><small>@{answer.username} · {new Date(answer.createdAt).toLocaleString('pt-BR')}</small></span></div><p className="community-post-body">{answer.body}</p>{Number(session?.user?.id)!==Number(answer.authorId)&&<small><Link href={`/report?answer=${answer.id}`}>⚑ Reportar resposta</Link></small>}</article>) : <div className="empty">Ainda não há respostas.</div>}</section>{session?.user ? <AnswerForm questionId={question.id} /> : <div className="panel answer-compose"><h2>Entre para responder</h2><p className="muted">Respostas são vinculadas ao perfil autenticado.</p></div>}</div><aside className="panel related-card"><h3>Comunidade real</h3><p className="muted">Esta discussão e suas respostas são persistidas no Neon. Nenhum contador ou participante é simulado.</p><Link className="button button-outline" href="/community/questions">Ver todas</Link></aside></div></div></main>;
}
