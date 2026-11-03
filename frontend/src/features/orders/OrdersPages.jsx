import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../cart/CartContext.jsx'
import { useDemoSession } from '../auth/DemoSession.jsx'
import DeliveryFields from '../delivery/DeliveryFields.jsx'
import { money } from '../menu/catalog.js'
import { useOrders } from './OrdersContext.jsx'

export function CheckoutPage() {
  const { rows, total, clear } = useCart()
  const { user } = useDemoSession()
  const { addOrder } = useOrders()
  const navigate = useNavigate()
  const [mode, setMode] = useState('sur-place')
  const [arrival, setArrival] = useState('')
  const [address, setAddress] = useState('')
  if (!rows.length) return <div className="site-container"><h1>Panier vide</h1><Link to="/menu">Retour au menu</Link></div>
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">VALIDATION</span><h1>Confirmer ma commande</h1><p>Le montant et la disponibilité devront être revérifiés par l’API avant toute commande réelle.</p></div><div className="site-split"><form className="site-card site-form" onSubmit={(event) => { event.preventDefault(); const order = addOrder({ rows, total, mode, arrival, address, customer: user?.name || 'Client démo' }); clear(); navigate(`/orders/${order.id}`) }}><DeliveryFields {...{ mode, setMode, arrival, setArrival, address, setAddress }} /><button className="site-button" type="submit">Créer une commande de démonstration</button></form><aside className="site-card site-summary"><h2>Récapitulatif</h2>{rows.map((row) => <p key={row.id}>{row.quantity} × {row.name}<strong>{money(row.quantity * row.price)}</strong></p>)}<hr /><p>Total indicatif <strong>{money(total)}</strong></p></aside></div></div>
}
export function OrdersPage() {
  const { orders } = useOrders()
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">MON ESPACE</span><h1>Mes commandes</h1><p>Historique de cette session de démonstration.</p></div><div className="site-stack">{orders.map((order) => <Link className="site-card site-order" to={`/orders/${order.id}`} key={order.id}><strong>{order.id}</strong><span>{order.mode === 'livraison' ? 'Livraison' : 'Sur place'}</span><span>{order.status}</span><strong>{money(order.total)}</strong></Link>)}{!orders.length && <p className="site-card">Aucune commande pour le moment. <Link to="/menu">Voir le menu</Link></p>}</div></div>
}
export function OrderDetailPage() {
  const { id } = useParams()
  const { orders, addComment } = useOrders()
  const order = orders.find((item) => item.id === id)
  const [comment, setComment] = useState(order?.comment || '')
  if (!order) return <div className="site-container"><h1>Commande introuvable</h1><Link to="/orders">Mes commandes</Link></div>
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">COMMANDE {order.id}</span><h1>Suivi de commande</h1><p>Statut : {order.status}. Le suivi réel sera actualisé par l’API.</p></div><div className="site-split"><section className="site-card"><h2>Votre sélection</h2>{order.rows.map((row) => <p key={row.id}>{row.quantity} × {row.name} — {money(row.quantity * row.price)}</p>)}<strong>Total indicatif : {money(order.total)}</strong></section><section className="site-card"><h2>{order.mode === 'livraison' ? 'Livraison' : 'Sur place'}</h2><p>{order.mode === 'livraison' ? order.address : `Heure d’arrivée : ${order.arrival}`}</p><p>Progression : en attente de confirmation du restaurant.</p><Link to="/complaints">Signaler un problème</Link></section></div>{['Servie', 'Livrée'].includes(order.status) && <form className="site-card site-form" onSubmit={(event) => { event.preventDefault(); addComment(order.id, comment.trim()) }}><label>Votre commentaire<textarea value={comment} onChange={(event) => setComment(event.target.value)} /></label><button className="site-button">Enregistrer</button></form>}</div>
}
