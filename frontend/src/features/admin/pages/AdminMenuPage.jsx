import { useMemo, useState } from 'react'
import { categories } from '../mockData.js'
import { Badge, EmptyState, Notice, Panel } from '../components/AdminUi.jsx'

const blankDish = { name: '', category: categories[0], price: '', description: '', available: true, featured: false }

export default function AdminMenuPage({ dishes, setDishes }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [draft, setDraft] = useState(blankDish)
  const [notice, setNotice] = useState('')
  const rows = useMemo(() => dishes.filter((dish) => (category === 'Toutes' || dish.category === category) && `${dish.name} ${dish.description}`.toLowerCase().includes(query.toLowerCase().trim())), [category, dishes, query])

  const addDish = (event) => {
    event.preventDefault()
    if (!draft.name.trim() || Number(draft.price) <= 0) return
    setDishes((current) => [...current, { ...draft, id: crypto.randomUUID(), name: draft.name.trim(), price: Number(draft.price) }])
    setDraft(blankDish)
    setNotice('Plat ajouté à la démonstration locale. La sauvegarde serveur dépend de l’API menu.')
  }

  return <>
    <section className="admin-welcome"><p className="admin-kicker">ADM-02 · CATALOGUE</p><h1>Gestion du menu</h1><p>Créez les plats, pilotez leur disponibilité et désignez les plats du jour.</p></section>
    {notice && <Notice>{notice}</Notice>}
    <div className="admin-two-columns admin-top-aligned"><Panel title="Nouveau plat" description="Les images de plats seront reliées au stockage choisi par l’équipe."><form className="admin-form" onSubmit={addDish}><label>Nom du plat<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>Catégorie<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Prix (FCFA)<input required min="1" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} /></label><label>Description<textarea rows="3" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><button className="admin-primary-button" type="submit">Ajouter au menu</button></form></Panel><Panel title="Filtres" description="La recherche s’applique aux données locales."><label className="admin-search">Rechercher<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Plat ou description" /></label><label className="admin-search">Catégorie<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Toutes</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></Panel></div>
    <Panel title="Plats de la carte" description={`${rows.length} résultat(s) affiché(s).`}><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Plat</th><th>Catégorie</th><th>Prix</th><th>Disponibilité</th><th>Plat du jour</th></tr></thead><tbody>{rows.map((dish) => <tr key={dish.id}><td><strong>{dish.name}</strong><span>{dish.description}</span></td><td>{dish.category}</td><td>{new Intl.NumberFormat('fr-FR').format(dish.price)} FCFA</td><td><button type="button" className="admin-text-button" onClick={() => setDishes((current) => current.map((item) => item.id === dish.id ? { ...item, available: !item.available } : item))}><Badge tone={dish.available ? 'success' : 'danger'}>{dish.available ? 'Disponible' : 'Indisponible'}</Badge></button></td><td><button type="button" className="admin-text-button" onClick={() => setDishes((current) => current.map((item) => item.id === dish.id ? { ...item, featured: !item.featured } : item))}>{dish.featured ? 'Retirer' : 'Mettre en avant'}</button></td></tr>)}</tbody></table></div>{rows.length === 0 && <EmptyState />}</Panel>
  </>
}
