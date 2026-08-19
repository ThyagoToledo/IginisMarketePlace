'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export default function OrganizationsClient() {
  const [q,setQ]=useState(''); const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{const timer=setTimeout(()=>{setLoading(true);fetch(`/api/organizations?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(data=>setRows(Array.isArray(data)?data:[])).finally(()=>setLoading(false));},200);return()=>clearTimeout(timer)},[q]);
  return <><div className="catalog-toolbar"><label className="field"><span className="sr-only">Buscar organizações</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome ou identificador"/></label><Link className="button button-primary" href="/organizations/new">Criar organização</Link></div>{loading?<div className="empty-state"><strong>Carregando organizações…</strong></div>:rows.length?<div className="organization-list">{rows.map(org=><Link className="panel organization-card" href={`/organizations/${org.slug}`} key={org.id}><span className="profile-avatar org-mini-avatar">{org.name.slice(0,2).toUpperCase()}</span><div><h2>{org.name}</h2><p className="muted">@{org.slug}</p><p>{org.description||'Sem descrição.'}</p><small>{org.memberCount} membro(s) · {org.itemCount} criação(ões)</small></div></Link>)}</div>:<div className="empty-state"><strong>Nenhuma organização encontrada.</strong><span>Crie a primeira ou tente outro termo.</span></div>}</>;
}
