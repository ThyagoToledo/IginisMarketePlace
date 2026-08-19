'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQuestionForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/community/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await response.json();
    setBusy(false);
    if (response.ok) router.push(`/community/questions/${data.question.id}`);
    else setError(data.error || 'Não foi possível publicar a pergunta.');
  }

  return <form className="panel community-compose" onSubmit={submit}>
    <div className="discussion-header"><div><p className="eyebrow">Nova discussão</p><h2>Fazer uma pergunta</h2></div></div>
    <div className="form-grid">
      <label className="field field-full">Título<input required minLength={8} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Descreva objetivamente o problema" /></label>
      <label className="field">Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="general">Geral</option><option value="graphics">Gráficos</option><option value="scripting">Scripting</option><option value="assets">Assets</option><option value="help">Ajuda</option></select></label>
      <label className="field field-full">Pergunta<textarea required minLength={20} maxLength={10000} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Inclua contexto, o que você tentou e o resultado esperado." /></label>
    </div>
    {error && <p className="result-err">{error}</p>}
    <button className="button button-primary" disabled={busy}>{busy ? 'Publicando…' : 'Publicar pergunta'}</button>
  </form>;
}
