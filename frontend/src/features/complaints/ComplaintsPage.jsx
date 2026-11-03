import { useState } from 'react'
import { useOrders } from '../orders/ordersContext.js'
export default function ComplaintsPage() {
  const { orders } = useOrders()
  const [claims, setClaims] = useState([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">ASSISTANCE</span><h1>Mes réclamations</h1><p>Décrivez le problème rencontré. Les demandes restent locales jusqu’à l’intégration de l’API.</p></div><div className="site-split"><form className="site-card site-form" onSubmit={(event) => { event.preventDefault(); setClaims((current) => [{ id: `RC-DEMO-${Date.now()}`, subject, message, orderId, status: 'En attente' }, ...current]); setSubject(''); setMessage(''); setOrderId('') }}><h2>Signaler un problème</h2><label>Commande concernée<select value={orderId} onChange={(event) => setOrderId(event.target.value)}><option value="">Sans commande</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.id}</option>)}</select></label><label>Objet<input required value={subject} onChange={(event) => setSubject(event.target.value)} /></label><label>Description<textarea required rows="5" value={message} onChange={(event) => setMessage(event.target.value)} /></label><button className="site-button">Enregistrer la réclamation de démonstration</button></form><section className="site-card"><h2>Suivi</h2>{claims.length ? claims.map((claim) => <article className="site-claim" key={claim.id}><strong>{claim.subject}</strong><p>{claim.message}</p><small>{claim.id} · {claim.status}</small></article>) : <p>Aucune réclamation dans cette session.</p>}</section></div></div>
}
