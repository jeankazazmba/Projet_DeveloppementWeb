import { useMemo, useState } from 'react'
import { Badge, EmptyState, Notice, Panel } from '../components/AdminUi.jsx'

const blankCampaign = { title: '', type: 'Promotion', status: 'Brouillon', start: '', end: '', description: '' }

export default function AdminPromotionsPage({ promotions, setPromotions }) {
  const [filter, setFilter] = useState('Toutes')
  const [draft, setDraft] = useState(blankCampaign)
  const [notice, setNotice] = useState('')
  const displayedPromotions = useMemo(() => promotions.filter((item) => filter === 'Toutes' || item.status === filter), [filter, promotions])
  const addCampaign = (event) => {
    event.preventDefault()
    if (!draft.title.trim() || !draft.start || !draft.end) return
    setPromotions((current) => [...current, { ...draft, id: crypto.randomUUID(), title: draft.title.trim() }])
    setDraft(blankCampaign)
    setNotice('Affiche créée dans la démonstration locale. La publication réelle attend l’API campagnes.')
  }
  const tone = (status) => status === 'Active' ? 'success' : status === 'Brouillon' ? 'neutral' : 'gold'

  return <>
    <section className="admin-welcome"><p className="admin-kicker">ADM-04 · DIFFUSION</p><h1>Promotions & événements</h1><p>Préparez les campagnes, les affiches d’événements et les communications de mini-jeux. Les règles de participation restent à définir par le métier.</p></section>
    {notice && <Notice>{notice}</Notice>}
    <div className="admin-two-columns admin-top-aligned"><Panel title="Créer une affiche" description="Le chargement et le stockage du visuel seront reliés au backend."><form className="admin-form" onSubmit={addCampaign}><label>Titre<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}><option>Promotion</option><option>Événement</option><option>Jeu concours</option></select></label><div className="admin-form-grid"><label>Début<input required type="date" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} /></label><label>Fin<input required min={draft.start || undefined} type="date" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} /></label></div><label>Description<textarea rows="3" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><button type="submit" className="admin-primary-button">Enregistrer en brouillon</button></form></Panel><Panel title="Diffusion" description="Aucune publication réelle ne sera envoyée sans endpoint validé."><label className="admin-search">Filtrer par état<select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Toutes</option><option>Active</option><option>Programmée</option><option>Brouillon</option></select></label><p className="admin-help">Les règles de remises, de mini-jeux et de participation doivent être validées côté serveur.</p></Panel></div>
    <section className="admin-card-grid">{displayedPromotions.map((promotion) => <article className="admin-campaign-card" key={promotion.id}><header><Badge tone={tone(promotion.status)}>{promotion.status}</Badge><span>{promotion.type}</span></header><h2>{promotion.title}</h2><p>{promotion.description}</p><footer><span>{promotion.start} → {promotion.end}</span><button type="button" className="admin-text-button" onClick={() => setPromotions((current) => current.map((item) => item.id === promotion.id ? { ...item, status: item.status === 'Active' ? 'Brouillon' : 'Active' } : item))}>{promotion.status === 'Active' ? 'Retirer la diffusion' : 'Activer'}</button></footer></article>)}</section>
    {displayedPromotions.length === 0 && <EmptyState />}
  </>
}
