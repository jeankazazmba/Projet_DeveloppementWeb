import { useState } from 'react'
import { Badge, Notice, Panel } from '../components/AdminUi.jsx'

export default function AdminComplaintsPage({ complaints, setComplaints }) {
  const [selectedId, setSelectedId] = useState(complaints[0]?.id ?? null)
  const [notice, setNotice] = useState('')
  const selected = complaints.find((item) => item.id === selectedId)
  const tone = (status) => status === 'Résolue' || status === 'Validée' ? 'success' : status === 'Rejetée' ? 'danger' : 'gold'
  const updateStatus = (status) => {
    if (!selected) return
    setComplaints((current) => current.map((item) => item.id === selected.id ? { ...item, status, updated: 'À l’instant' } : item))
    setNotice(`Réclamation ${status.toLowerCase()} dans la démonstration locale.`)
  }

  return <>
    <section className="admin-welcome"><p className="admin-kicker">ADM-05 · SUPERVISION</p><h1>Suivi des réclamations</h1><p>Supervisez les dossiers et enregistrez une décision. La validation effective et les crédits de points doivent rester côté backend.</p></section>
    {notice && <Notice>{notice}</Notice>}
    <section className="admin-complaint-layout"><Panel title="Dossiers" description={`${complaints.length} réclamation(s) de démonstration.`}><ul className="admin-complaint-list">{complaints.map((claim) => <li key={claim.id}><button type="button" className={selectedId === claim.id ? 'is-selected' : ''} onClick={() => setSelectedId(claim.id)}><strong>{claim.id} · {claim.customer}</strong><span>{claim.subject}</span><Badge tone={tone(claim.status)}>{claim.status}</Badge></button></li>)}</ul></Panel><Panel title={selected ? `Dossier ${selected.id}` : 'Dossier'} description={selected?.updated}>{selected && <div className="admin-claim-detail"><dl className="admin-definition-list"><div><dt>Client</dt><dd>{selected.customer}</dd></div><div><dt>Motif</dt><dd>{selected.subject}</dd></div><div><dt>État actuel</dt><dd><Badge tone={tone(selected.status)}>{selected.status}</Badge></dd></div></dl><label className="admin-search">Note de supervision<textarea rows="4" value={selected.answer} onChange={(event) => setComplaints((current) => current.map((item) => item.id === selected.id ? { ...item, answer: event.target.value } : item))} placeholder="Ajoutez une note interne…" /></label><div className="admin-action-row"><button type="button" onClick={() => updateStatus('En examen')}>Mettre en examen</button><button type="button" className="admin-primary-button" onClick={() => updateStatus('Résolue')}>Marquer résolue</button><button type="button" className="admin-danger-button" onClick={() => updateStatus('Rejetée')}>Rejeter</button></div></div>}</Panel></section>
  </>
}
