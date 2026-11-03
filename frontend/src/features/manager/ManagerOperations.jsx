import { useState } from 'react'
import { money } from './managerData.js'
import ManagerIcon from './ManagerIcon.jsx'

const tableStatuses = ['Libre', 'Occupée', 'Réservée', 'Nettoyage']

function Heading({ title, description }) {
  return <div className="manager-page-heading"><div><span className="manager-eyebrow">ESPACE GÉRANT · SERVICE</span><h1>{title}</h1><p>{description}</p></div></div>
}

function Empty({ children }) {
  return <p className="manager-operations-empty" role="status">{children}</p>
}

export function TablesPage({ tables, orders, query, onSave }) {
  const [filter, setFilter] = useState('Toutes')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const visible = tables.filter(table => (filter === 'Toutes' || table.status === filter) && `${table.id} ${table.zone} ${table.orderId || ''}`.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')))
  const activeOrders = orders.filter(order => order.service === 'Sur place' && !['Terminée', 'Annulée'].includes(order.status) && !tables.some(table => table.id !== editing?.id && table.orderId === order.id))
  const open = table => { setEditing(table); setDraft({ status: table.status, orderId: table.orderId || '' }) }
  const save = event => {
    event.preventDefault()
    onSave({ ...editing, status: draft.status, orderId: draft.status === 'Occupée' ? draft.orderId || null : null })
    setEditing(null)
  }
  return <>
    <Heading title="Plan des tables" description="Suivez les places et les commandes sur place. Les changements restent locaux jusqu’à la connexion à l’API." />
    <div className="manager-metrics">{tableStatuses.map(status => <article className="manager-metric" key={status}><span>{status.toUpperCase()}</span><strong>{tables.filter(table => table.status === status).length}</strong><small>Tables du service</small></article>)}</div>
    <section className="manager-panel"><div className="manager-panel-title"><div><h2>Salle & terrasse</h2><p>{tables.length} tables · {tables.reduce((sum, table) => sum + table.seats, 0)} places</p></div></div><div className="manager-tabs" role="group" aria-label="Filtrer les tables">{['Toutes', ...tableStatuses].map(status => <button key={status} type="button" className={filter === status ? 'active' : ''} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status}</button>)}</div><div className="manager-operations-grid">{visible.map(table => <article className="manager-operation-card" key={table.id}><div className="manager-operation-card-head"><strong>Table {table.id.slice(1)}</strong><span className={`manager-status ${table.status === 'Libre' ? 'success' : table.status === 'Occupée' ? 'warning' : 'neutral'}`}><i />{table.status}</span></div><p>{table.zone} · {table.seats} places</p><small>{table.orderId ? `Commande ${table.orderId}` : 'Aucune commande liée'}</small><button type="button" className="manager-button ghost" onClick={() => open(table)}>Gérer la table</button></article>)}</div>{!visible.length && <Empty>Aucune table ne correspond aux filtres.</Empty>}</section>
    {editing && <div className="manager-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEditing(null) }}><section className="manager-modal manager-operation-modal" role="dialog" aria-modal="true" aria-label={`Gérer la table ${editing.id}`}><button type="button" className="manager-icon-button manager-modal-close" onClick={() => setEditing(null)} aria-label="Fermer"><ManagerIcon name="close" /></button><span className="manager-eyebrow">PLAN DE SALLE</span><h2>Table {editing.id.slice(1)}</h2><p className="manager-muted">{editing.zone} · {editing.seats} places</p><form onSubmit={save}><label>État<select value={draft.status} onChange={event => setDraft(current => ({ ...current, status: event.target.value }))}>{tableStatuses.map(status => <option key={status}>{status}</option>)}</select></label>{draft.status === 'Occupée' && <label>Commande liée<select value={draft.orderId} onChange={event => setDraft(current => ({ ...current, orderId: event.target.value }))}><option value="">Sans commande liée</option>{activeOrders.map(order => <option value={order.id} key={order.id}>{order.id} · {order.customer}</option>)}</select></label>}<div className="manager-operation-actions"><button type="button" className="manager-button ghost" onClick={() => setEditing(null)}>Annuler</button><button type="submit" className="manager-button primary">Enregistrer</button></div></form></section></div>}
  </>
}

export function MenuStockPage({ dishes, query, onUpdate }) {
  const [category, setCategory] = useState('Toutes')
  const categories = [...new Set(dishes.map(dish => dish.category))]
  const visible = dishes.filter(dish => (category === 'Toutes' || dish.category === category) && `${dish.name} ${dish.description}`.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')))
  return <>
    <Heading title="Menu & stocks" description="Mettez à jour la disponibilité et les plats du jour pendant le service. Le catalogue complet reste administré dans l’espace admin." />
    <div className="manager-metrics manager-metrics-three"><article className="manager-metric"><span>PLATS AU MENU</span><strong>{dishes.length}</strong><small>Catalogue de démonstration</small></article><article className="manager-metric green"><span>DISPONIBLES</span><strong>{dishes.filter(dish => dish.available).length}</strong><small>Visibles pour le service</small></article><article className="manager-metric red"><span>INDISPONIBLES</span><strong>{dishes.filter(dish => !dish.available).length}</strong><small>À réapprovisionner</small></article></div>
    <section className="manager-panel"><div className="manager-panel-title"><div><h2>Disponibilités du service</h2><p>Les changements sont enregistrés localement pour préparer le futur branchement aux plats de la base.</p></div></div><div className="manager-tabs" role="group" aria-label="Filtrer les catégories">{['Toutes', ...categories].map(item => <button key={item} type="button" className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="manager-table-scroll"><table className="manager-table"><thead><tr><th>PLAT</th><th>CATÉGORIE</th><th>PRIX</th><th>DISPONIBILITÉ</th><th>PLAT DU JOUR</th></tr></thead><tbody>{visible.map(dish => <tr key={dish.id}><td><div className="manager-operation-dish">{dish.image && <img src={dish.image} alt="" />}<span><strong>{dish.name}</strong><small>{dish.description}</small></span></div></td><td>{dish.category}</td><td>{money(dish.price)}</td><td><button type="button" className={`manager-operation-switch ${dish.available ? 'on' : ''}`} role="switch" aria-checked={dish.available} aria-label={`Disponibilité de ${dish.name}`} onClick={() => onUpdate(dish.id, { available: !dish.available })}><span /></button></td><td><button type="button" className={`manager-button ${dish.featured ? 'primary' : 'ghost'}`} aria-pressed={dish.featured} onClick={() => onUpdate(dish.id, { featured: !dish.featured })}>{dish.featured ? 'À la une' : 'Mettre à la une'}</button></td></tr>)}</tbody></table>{!visible.length && <Empty>Aucun plat ne correspond aux filtres.</Empty>}</div></section>
  </>
}
