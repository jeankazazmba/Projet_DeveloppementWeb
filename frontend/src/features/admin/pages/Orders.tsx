import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { money, matches } from '../data'
import type { Order, OrderStatus } from '../operations'
import { nextStatus } from '../operations'
import { Badge, Modal, PageHeading, Panel } from '../components/ui'

const statusTone: Record<OrderStatus, string> = { 'Reçue': 'yellow', 'En préparation': 'blue', 'Prête': 'green', 'En livraison': 'blue', 'Terminée': 'green', 'Annulée': 'red' }
const time = (value: string) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export default function Orders({ orders, setOrders, notify }: { orders: Order[]; setOrders: Dispatch<SetStateAction<Order[]>>; notify: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Toutes')
  const [service, setService] = useState('Tous')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const selected = orders.find(order => order.id === selectedId)
  const cancelling = orders.find(order => order.id === cancelId)
  const filtered = useMemo(() => orders.filter(order => (status === 'Toutes' || order.status === status) && (service === 'Tous' || order.service === service) && matches(`${order.id} ${order.customer} ${order.items.join(' ')} ${order.table ?? ''}`, query)).reverse(), [orders, query, status, service])
  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const changeStatus = (order: Order) => {
    const next = nextStatus(order)
    if (!next) return
    setOrders(current => current.map(item => item.id === order.id ? { ...item, status: next } : item))
    notify(`${order.id} : statut « ${next} » enregistré dans la démonstration.`)
  }
  const exportCsv = () => {
    const lines = [['Commande', 'Client', 'Heure', 'Service', 'Table', 'Montant CDF', 'Paiement', 'Statut'].join(';'), ...filtered.map(order => [order.id, order.customer, time(order.placedAt), order.service, order.table ?? '', order.amount, order.payment, order.status].join(';'))]
    const url = URL.createObjectURL(new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'commandes-demo.csv'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0)
    notify('Export CSV des commandes filtrées téléchargé.')
  }
  const pending = orders.filter(order => ['Reçue', 'En préparation'].includes(order.status)).length
  const ready = orders.filter(order => ['Prête', 'En livraison'].includes(order.status)).length
  const complete = orders.filter(order => order.status === 'Terminée').length
  return <>
    <PageHeading first="Gestion des" accent="commandes" description="Suivez les commandes du service, leur préparation et leur livraison. Données de démonstration locales." action={<button className="button subtle" onClick={exportCsv}>↓ Exporter CSV</button>} />
    <div className="metrics admin-operations-metrics"><div className="metric"><p className="metric-label">COMMANDES DU SERVICE</p><p className="metric-value">{orders.length}</p><p className="muted small">Sur place et livraison</p></div><div className="metric"><p className="metric-label">À PRÉPARER</p><p className="metric-value yellow-text">{pending}</p><p className="muted small">Reçues ou en cuisine</p></div><div className="metric"><p className="metric-label">PRÊTES / EN LIVRAISON</p><p className="metric-value gold-text">{ready}</p><p className="muted small">Dernière étape du service</p></div><div className="metric"><p className="metric-label">TERMINÉES</p><p className="metric-value green-text">{complete}</p><p className="muted small">Commandes clôturées</p></div></div>
    <Panel title="Toutes les commandes" subtitle={`${filtered.length} commande${filtered.length > 1 ? 's' : ''} dans cette sélection`} className="admin-orders-panel"><div className="admin-operation-toolbar"><label className="sr-only" htmlFor="admin-order-search">Rechercher une commande</label><input id="admin-order-search" type="search" placeholder="Numéro, client, plat ou table…" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /><label className="sr-only" htmlFor="admin-order-status">Statut</label><select id="admin-order-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>{['Toutes', 'Reçue', 'En préparation', 'Prête', 'En livraison', 'Terminée', 'Annulée'].map(option => <option key={option}>{option}</option>)}</select><label className="sr-only" htmlFor="admin-order-service">Service</label><select id="admin-order-service" value={service} onChange={event => { setService(event.target.value); setPage(1) }}>{['Tous', 'Sur place', 'Livraison'].map(option => <option key={option}>{option}</option>)}</select></div><div className="table-scroll"><table className="admin-operation-table"><thead><tr><th>Commande</th><th>Client</th><th>Heure</th><th>Service</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead><tbody>{rows.map(order => <tr key={order.id}><td><button className="text-button" onClick={() => setSelectedId(order.id)}>{order.id}</button></td><td>{order.customer}</td><td>{time(order.placedAt)}</td><td>{order.service}{order.table && <small className="muted"> · {order.table}</small>}</td><td><strong>{money(order.amount)} CDF</strong></td><td><Badge tone={statusTone[order.status]}>{order.status}</Badge></td><td><button className="button small subtle" onClick={() => setSelectedId(order.id)}>Détails</button></td></tr>)}</tbody></table></div>{!rows.length && <p className="admin-empty-message">Aucune commande ne correspond à ces filtres.</p>}<div className="admin-list-pagination"><span>Page {page} sur {totalPages}</span><div><button className="button small subtle" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button><button className="button small subtle" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Suivant</button></div></div></Panel>
    {selected && <Modal title={`Commande ${selected.id}`} subtitle={`${selected.customer} · ${time(selected.placedAt)}`} drawer onClose={() => setSelectedId(null)}><div className="admin-order-detail"><Badge tone={statusTone[selected.status]}>{selected.status}</Badge><dl><div><dt>Service</dt><dd>{selected.service}</dd></div>{selected.table && <div><dt>Table</dt><dd>{selected.table}</dd></div>}<div><dt>Moyen de paiement</dt><dd>{selected.payment}</dd></div><div><dt>Montant</dt><dd>{money(selected.amount)} CDF</dd></div></dl><h3>Articles</h3><ul>{selected.items.map(item => <li key={item}>{item}</li>)}</ul><p className="muted small">Ces données sont locales et réinitialisées au rechargement de la page.</p></div><div className="drawer-actions"><button className="button ghost" disabled={selected.status === 'Terminée' || selected.status === 'Annulée'} onClick={() => setCancelId(selected.id)}>Annuler</button><button className="button primary" disabled={!nextStatus(selected)} onClick={() => changeStatus(selected)}>{nextStatus(selected) ? `Passer à « ${nextStatus(selected)} »` : 'Commande clôturée'}</button></div></Modal>}
    {cancelling && <Modal title="Annuler cette commande ?" confirm onClose={() => setCancelId(null)}><p className="muted">La commande {cancelling.id} de {cancelling.customer} sera marquée comme annulée dans cette démonstration.</p><div className="dialog-actions"><button className="button ghost" onClick={() => setCancelId(null)}>Retour</button><button className="button danger" onClick={() => { setOrders(current => current.map(order => order.id === cancelling.id ? { ...order, status: 'Annulée' } : order)); setCancelId(null); notify(`${cancelling.id} annulée localement.`) }}>Confirmer l’annulation</button></div></Modal>}
  </>
}
