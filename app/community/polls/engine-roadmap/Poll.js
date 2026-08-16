'use client';

import { useState } from 'react';

const options = [
  ['Iluminação global em tempo real', 42],
  ['Navegação de IA e behavior trees', 28],
  ['Sistema de destruição por voxels', 15],
  ['Revisão do renderer mobile', 15],
];

export default function Poll() {
  const [selected, setSelected] = useState('');
  const [voted, setVoted] = useState(false);
  return <div className="poll-box"><div className="discussion-header"><h3>Vote na prioridade</h3><span className="muted">3.421 votos · encerra em 5 dias</span></div>{options.map(([label, percent]) => <div className="poll-option" key={label}><div className="poll-fill" style={{ width: voted ? `${percent}%` : 0 }} /><label><input type="radio" name="roadmap" value={label} checked={selected === label} onChange={(event) => setSelected(event.target.value)} /><span>{label}</span>{voted && <span>{percent}%</span>}</label></div>)}<div className="poll-actions"><button className="button button-primary" type="button" disabled={!selected || voted} onClick={() => setVoted(true)}>{voted ? 'Voto registrado' : 'Votar agora'}</button></div></div>;
}
