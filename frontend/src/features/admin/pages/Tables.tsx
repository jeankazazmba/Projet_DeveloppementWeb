import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Order, RestaurantTable, TableStatus } from '../operations'
import { Badge, Modal, PageHeading, Panel } from '../components/ui'

const tones: Record<TableStatus, string> = { 'Libre': 'green', 'Occupée': 'yellow', 'Réservée': 'blue', 'Nettoyage': 'neutral' }

export default function Tables({ tables, setTables, orders, notify }: { tables: RestaurantTable[]; setTables: Dispatch<SetStateAction<RestaurantTable[]>>; orders: Order[]; notify: (message: string) => void }) {
  const [filter, setFilter] = useState('Toutes')
  const [editing, setEditing] = useState<string | null>(null)
  const [draftStatus, setDraftStatus] = useState<TableStatus>('Libre')
  const [draftOrder, setDraftOrder] = useState('')
  const selected = tables.find(table => table.id === editing)
  const visible = tables.filter(table => filter === 'Toutes' || table.status === filter)
  const activeOnSite = orders.filter(order => order.service === 'Sur place' && !['Terminée', 'Annulée'].includes(order.status) && !tables.some(table => table.id !== editing && table.orderId === order.id))
  const edit = (table: RestaurantTable) => { setEditing(table.id); setDraftStatus(table.status); setDraftOrder(table.orderId ?? '') }
  const save = () => {
    if (!selected) return
    setTables(current => current.map(table => table.id === selected.id ? { ...table, status: draftStatus, orderId: draftStatus === 'Occupée' ? draftOrder || null : null } : table))
    notify(`${selected.id} : état « ${draftStatus} » enregistré localement.`)
    setEditing(null)
  }
  return <>
    <PageHeading first="Tables &" accent="Salle" description="Visualisez les places et organisez le service en salle ou sur la terrasse. Données de démonstration." />
    <div className="metrics admin-operations-metrics">{(['Libre', 'Occupée', 'Réservée', 'Nettoyage'] as TableStatus[]).map(status => <div className="metric" key={status}><p className="metric-label">{status.toUpperCase()}</p><p className="metric-value">{tables.filter(table => table.status === status).length}</p><p className="muted small">{status === 'Libre' ? 'Disponibles immédiatement' : status === 'Occupée' ? 'Service en cours' : status === 'Réservée' ? 'À accueillir' : 'À remettre en service'}</p></div>)}</div>
    <Panel title="Plan de salle" subtitle={`${tables.length} tables · ${tables.reduce((sum, table) => sum + table.seats, 0)} places au total`}><div className="admin-status-filters" role="group" aria-label="Filtrer les tables">{['Toutes', 'Libre', 'Occupée', 'Réservée', 'Nettoyage'].map(status => <button key={status} className={`button small ${filter === status ? 'primary' : 'subtle'}`} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status}</button>)}</div><div className="admin-table-grid">{visible.map(table => <article key={table.id} className={`admin-table-card status-${table.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}><div className="admin-table-card-top"><span className="admin-table-symbol" aria-hidden="true">▦</span><Badge tone={tones[table.status]}>{table.status}</Badge></div><h3>Table {table.id.slice(1)}</h3><p>{table.zone} · {table.seats} places</p><p className="admin-table-order">{table.orderId ? `Commande ${table.orderId}` : table.status === 'Réservée' ? 'Réservation locale' : 'Aucune commande associée'}</p><button className="button small subtle" onClick={() => edit(table)}>Gérer la table</button></article>)}</div>{!visible.length && <p className="admin-empty-message">Aucune table dans cette catégorie.</p>}</Panel>
    {selected && <Modal title={`Table ${selected.id.slice(1)}`} subtitle={`${selected.zone} · ${selected.seats} places`} onClose={() => setEditing(null)}><form className="form-stack" onSubmit={event => { event.preventDefault(); save() }}><label>État de la table<select value={draftStatus} onChange={event => setDraftStatus(event.target.value as TableStatus)}>{(['Libre', 'Occupée', 'Réservée', 'Nettoyage'] as TableStatus[]).map(status => <option key={status}>{status}</option>)}</select></label>{draftStatus === 'Occupée' && <label>Commande sur place (facultatif)<select value={draftOrder} onChange={event => setDraftOrder(event.target.value)}><option value="">Client sans commande liée</option>{activeOnSite.map(order => <option value={order.id} key={order.id}>{order.id} · {order.customer}</option>)}</select></label>}<p className="muted small">Les changements de table restent dans cette session de démonstration.</p><div className="dialog-actions"><button type="button" className="button ghost" onClick={() => setEditing(null)}>Annuler</button><button type="submit" className="button primary">Enregistrer</button></div></form></Modal>}
  </>
}
