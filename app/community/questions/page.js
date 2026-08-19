import Link from 'next/link';
import { auth } from '../../../auth';
import { loadCommunityQuestions } from '../../../lib/community-data';
import CommunitySidebar from '../../components/CommunitySidebar';
import NewQuestionForm from './NewQuestionForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Perguntas da comunidade' };

const CATEGORY_LABELS = { general: 'Geral', graphics: 'Gráficos', scripting: 'Scripting', assets: 'Assets', help: 'Ajuda' };

export default async function QuestionsPage({ searchParams }) {
  const query = await searchParams;
  const [result, session] = await Promise.all([loadCommunityQuestions(new URLSearchParams(query || {})), auth()]);
  return <main className="community-layout"><CommunitySidebar active="questions" /><div className="community-main community-feed">
    <div className="page-heading"><p className="eyebrow">The Forge</p><h1>Perguntas da comunidade</h1><p>Discussões publicadas por usuários reais e vinculadas aos respectivos perfis.</p></div>
    {result.offline && <div className="status-note">A comunidade está temporariamente indisponível.</div>}
    <form className="community-search" action="/community/questions"><input className="input" name="q" defaultValue={query?.q || ''} placeholder="Buscar perguntas" /><select className="input" name="category" defaultValue={query?.category || ''}><option value="">Todas as categorias</option>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="button button-outline">Buscar</button></form>
    <section className="question-feed" aria-label="Perguntas publicadas">{result.rows.length ? result.rows.map((question) => <article className="panel question-card" key={question.id}><div className="question-card-main"><div className="question-author">{question.avatarUrl ? <img className="avatar" src={question.avatarUrl} alt="" /> : <span className="avatar avatar-fallback">◎</span>}<span><Link href={`/creators/${encodeURIComponent(question.username)}`}>{question.displayName || question.username}</Link><small>@{question.username} · {new Date(question.createdAt).toLocaleDateString('pt-BR')}</small></span></div><Link className="question-title" href={`/community/questions/${question.id}`}>{question.title}</Link><p>{question.body}</p><span className="chip">{CATEGORY_LABELS[question.category] || question.category}</span></div><div className="question-answer-count"><strong>{question.answerCount}</strong><span>resposta(s)</span></div></article>) : <div className="empty-state"><strong>Nenhuma pergunta publicada.</strong><span>Seja a primeira pessoa a iniciar uma discussão real.</span></div>}</section>
    {result.pagination.pages > 1 && <nav className="admin-pagination"><span>Página {result.pagination.page} de {result.pagination.pages}</span><div>{result.pagination.page > 1 && <Link className="button button-ghost" href={`/community/questions?page=${result.pagination.page - 1}`}>Anterior</Link>}{result.pagination.page < result.pagination.pages && <Link className="button button-ghost" href={`/community/questions?page=${result.pagination.page + 1}`}>Próxima</Link>}</div></nav>}
    <section id="new-question" className="community-compose-section">{session?.user ? <NewQuestionForm /> : <div className="panel community-compose"><h2>Entre para perguntar</h2><p className="muted">Use sua conta GitHub para vincular a pergunta ao seu perfil e à atividade pública.</p></div>}</section>
  </div></main>;
}
