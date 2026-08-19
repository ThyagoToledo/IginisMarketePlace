import { buildActivityCalendar } from '../../../lib/activity.mjs';

const KIND_LABELS = { creation: 'criação', question: 'pergunta', answer: 'resposta' };

function dayLabel(cell) {
  const date = new Date(`${cell.day}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC', dateStyle: 'medium' });
  if (!cell.total) return `${date}: nenhuma atividade`;
  const parts = Object.entries(KIND_LABELS).filter(([kind]) => cell[kind]).map(([kind, label]) => `${cell[kind]} ${label}${cell[kind] === 1 ? '' : 's'}`);
  return `${date}: ${parts.join(', ')}`;
}

export default function ProfileActivity({ rows }) {
  const calendar = buildActivityCalendar(rows);
  return <section className="panel profile-activity" aria-labelledby="profile-activity-title">
    <div className="profile-section-heading"><div><p className="eyebrow">Últimos 12 meses</p><h2 id="profile-activity-title">Atividade na plataforma</h2></div><span className="muted">{calendar.totals.total} evento(s) real(is)</span></div>
    <div className="activity-summary" aria-label="Resumo de atividade"><span><strong>{calendar.totals.creation}</strong> criações</span><span><strong>{calendar.totals.question}</strong> perguntas</span><span><strong>{calendar.totals.answer}</strong> respostas</span></div>
    <div className="activity-chart-scroll"><div className="activity-grid" role="img" aria-label={`Calendário de atividade entre ${calendar.start} e ${calendar.end}`}>
      {calendar.days.map((cell) => <span key={cell.day} className={`activity-level-${cell.level}`} title={dayLabel(cell)} aria-label={dayLabel(cell)} />)}
    </div></div>
    <div className="activity-legend"><span>Menos</span>{[0,1,2,3,4].map((level) => <i key={level} className={`activity-level-${level}`} />)}<span>Mais</span></div>
    {!calendar.totals.total && <p className="muted activity-empty-note">Nenhuma criação, pergunta ou resposta pública foi registrada neste período.</p>}
  </section>;
}
