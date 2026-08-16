'use client';

import { useState } from 'react';

export default function OrganizationSettings() {
  const [name, setName] = useState('URSoftware');
  const [description, setDescription] = useState('Organização mantenedora do IgnisEngine.');
  const [saved, setSaved] = useState(false);
  return <><section className="panel settings-card"><h2>Perfil da organização</h2><div className="form-grid"><label className="field">Nome público<input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} /></label><label className="field">Identificador<input value="ursoftware" disabled /></label><label className="field field-full">Descrição<textarea value={description} onChange={(event) => { setDescription(event.target.value); setSaved(false); }} /></label></div></section><section className="panel settings-card"><h2>Identidade visual</h2><div className="upload-grid"><div><span className="field">Logo</span><div className="upload-placeholder">UR<br />256 × 256</div></div><div><span className="field">Banner do perfil</span><div className="upload-placeholder">Clique para selecionar um banner<br /><small>1920 × 480 recomendado</small></div></div></div></section><section className="panel settings-card"><h2>Membros</h2><p className="muted">A organização ainda não possui um modelo persistente no banco. A identidade e a autoria dos pacotes continuam vinculadas às contas GitHub individuais.</p><table className="admin-table"><thead><tr><th>Usuário</th><th>Papel</th><th>Ações</th></tr></thead><tbody><tr><td>Thyago Toledo · @ThyagoToledo</td><td>Autor</td><td>—</td></tr><tr><td>FeronZerbana · @FeronZerbana</td><td>Autor</td><td>—</td></tr></tbody></table></section>{saved && <div className="result-ok">Alterações mantidas nesta sessão de interface. Nenhuma regra de autoria foi modificada.</div>}<button className="button button-primary" type="button" onClick={() => setSaved(true)}>Salvar alterações</button></>;
}
