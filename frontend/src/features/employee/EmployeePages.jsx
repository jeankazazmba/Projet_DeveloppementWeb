import { useEffect, useRef, useState } from 'react'
import EmployeeIcon from './EmployeeIcon.jsx'
import { menuCategories, money, responseTemplates, topDishes, weeklyStats } from './employeeData.js'

const searchMatch = (values, query) => values.some(value => String(value ?? '').toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')))
const orderNext = { Reçue: 'En préparation', 'En préparation': 'Prête', Prête: 'Livrée' }
const orderAction = { Reçue: 'Démarrer la préparation', 'En préparation': 'Marquer prête', Prête: 'Marquer livrée' }
const orderGroups = ['Reçue', 'En préparation', 'Prête']
const claimTabs = ['Toutes', 'À traiter', 'En cours', 'Envoyée au gérant', 'Résolue', 'Rejetée']

function Heading({ title, description, action }) {
  return <div className="employee-heading"><div><span className="employee-eyebrow">ESPACE EMPLOYÉ · ZEDUC-SP@CE · KINSHASA</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function Badge({ status }) {
  const tone = status === 'Reçue' ? 'blue' : status === 'En préparation' || status === 'En cours' ? 'amber' : status === 'Prête' || status === 'Résolue' || status === 'Livrée' ? 'green' : status === 'Rejetée' ? 'red' : 'neutral'
  return <span className={`employee-badge ${tone}`}><i />{status}</span>
}

function Empty({ children }) { return <div className="employee-empty">{children}</div> }

function Metric({ label, value, detail, tone }) {
  return <div className="employee-metric"><span>{label}</span><strong>{value}</strong><small className={tone || ''}>{detail}</small></div>
}

function OrderCard({ order, onAdvance, onOpen, now }) {
  const minutes = Math.max(0, Math.round((now - new Date(order.createdAt).getTime()) / 60000))
  return <article className="employee-order-card">
    <div className="employee-card-top"><strong>{order.id}</strong><small>Il y a {minutes} min</small></div>
    <button type="button" className="employee-order-content" onClick={() => onOpen(order)} aria-label={`Voir la commande ${order.id}`}><strong>{order.customer}</strong><span>{order.service} · {order.location}</span><p>{order.items}</p></button>
    <div className="employee-card-bottom"><strong>{money(order.amount)}</strong><Badge status={order.status} /></div>
    {orderNext[order.status] && <button type="button" className={`employee-order-action ${order.status === 'Prête' ? 'primary' : ''}`} onClick={() => onAdvance(order.id)}>{orderAction[order.status]}</button>}
  </article>
}

export function OrdersPage({ orders, onAdvance, query, onNotice }) {
  const [filter, setFilter] = useState('Toutes')
  const [service, setService] = useState('Tous les services')
  const [selected, setSelected] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(timer) }, [])
  useEffect(() => {
    if (!selected) return
    const closeOnEscape = event => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected])
  const visible = orders.filter(order => (filter === 'Toutes' || order.status === filter) && (service === 'Tous les services' || order.service === service) && searchMatch([order.id, order.customer, order.items, order.location], query))
  const columns = filter === 'Toutes' ? [...orderGroups, ...(visible.some(order => order.status === 'Livrée') ? ['Livrée'] : [])] : [filter]
  return <>
    <Heading title="Gestion des commandes" description="Faites avancer chaque commande : reçue, en préparation, prête, puis livrée." action={<button className="employee-button ghost" onClick={() => { setNow(Date.now()); onNotice('Vue locale actualisée. Les commandes ne sont pas encore synchronisées avec le serveur.') }}><EmployeeIcon name="refresh" /> Actualiser</button>} />
    <div className="employee-metrics"><Metric label="Reçues" value={orders.filter(order => order.status === 'Reçue').length} detail="À prendre en charge" /><Metric label="En préparation" value={orders.filter(order => order.status === 'En préparation').length} detail="Service en cours" /><Metric label="Prêtes" value={orders.filter(order => order.status === 'Prête').length} detail="En attente de remise" /><Metric label="Livrées" value={orders.filter(order => order.status === 'Livrée').length} detail="Dans cette démo" tone="green" /></div>
    <div className="employee-panel employee-order-filters"><div className="employee-chips" role="group" aria-label="Filtrer les commandes">{['Toutes', ...orderGroups, 'Livrée'].map(status => <button type="button" key={status} className={filter === status ? 'active' : ''} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status === 'Toutes' ? 'Toutes' : status === 'Livrée' ? 'Livrées' : status === 'Prête' ? 'Prêtes' : status === 'Reçue' ? 'Reçues' : status} · {status === 'Toutes' ? orders.length : orders.filter(order => order.status === status).length}</button>)}</div><select aria-label="Type de service" value={service} onChange={event => setService(event.target.value)}><option>Tous les services</option><option>Sur place</option><option>Livraison</option></select></div>
    {visible.length ? <div className="employee-order-board">{columns.map(status => { const items = visible.filter(order => order.status === status); return <section key={status} className="employee-order-column"><h2><span className={`employee-dot ${status === 'Reçue' ? 'blue' : status === 'En préparation' ? 'amber' : 'gold'}`} />{status === 'Livrée' ? 'Livrées' : status === 'Prête' ? 'Prêtes' : status === 'Reçue' ? 'Reçues' : status}<small>{items.length}</small></h2>{items.map(order => <OrderCard key={order.id} order={order} onAdvance={onAdvance} onOpen={setSelected} now={now} />)}{!items.length && <Empty>Aucune commande dans cette colonne.</Empty>}</section> })}</div> : <Empty>Aucune commande ne correspond à la recherche.</Empty>}
    {selected && <div className="employee-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}><section className="employee-modal" role="dialog" aria-modal="true" aria-label={`Commande ${selected.id}`}><button className="employee-icon-button employee-modal-close" aria-label="Fermer" onClick={() => setSelected(null)}><EmployeeIcon name="close" /></button><span className="employee-eyebrow">DÉTAIL DE LA COMMANDE</span><h2>{selected.id}</h2><Badge status={orders.find(order => order.id === selected.id)?.status || selected.status} /><dl><div><dt>Client</dt><dd>{selected.customer}</dd></div><div><dt>Service</dt><dd>{selected.service} · {selected.location}</dd></div><div><dt>Articles</dt><dd>{selected.items}</dd></div><div><dt>Total</dt><dd>{money(selected.amount)}</dd></div></dl>{orderNext[orders.find(order => order.id === selected.id)?.status] && <button className="employee-button primary" onClick={() => { onAdvance(selected.id); setSelected(null) }}>{orderAction[orders.find(order => order.id === selected.id)?.status]}</button>}</section></div>}
  </>
}

export function MenuPage({ menu, onSave, query }) {
  const [draft, setDraft] = useState(menu)
  const [category, setCategory] = useState('Tout')
  const changed = JSON.stringify(draft) !== JSON.stringify(menu)
  const featured = draft.find(dish => dish.featured && dish.available) || draft.find(dish => dish.available)
  const visible = draft.filter(dish => (category === 'Tout' || dish.category === category) && searchMatch([dish.name, dish.category, dish.description], query))
  const feature = id => setDraft(current => current.map(dish => ({ ...dish, featured: dish.id === id })))
  const toggleAvailability = id => setDraft(current => {
    const next = current.map(dish => dish.id === id ? { ...dish, available: !dish.available, featured: dish.available ? false : dish.featured } : dish)
    if (!next.some(dish => dish.featured && dish.available)) {
      const replacement = next.find(dish => dish.available)
      if (replacement) return next.map(dish => ({ ...dish, featured: dish.id === replacement.id }))
    }
    return next
  })
  return <>
    <Heading title="Mise à jour du menu" description="Disponibilités et plat du jour pour le service en cours. Les prix sont en lecture seule." />
    {featured ? <section className="employee-panel employee-featured"><img src={featured.image} alt="" /><div><span className="employee-badge neutral">★ PLAT DU JOUR</span><h2>{featured.name}</h2><p>{featured.description}</p><strong>{money(featured.price)}</strong></div><select aria-label="Changer le plat du jour" value={featured.id} onChange={event => feature(event.target.value)}>{draft.filter(dish => dish.available).map(dish => <option key={dish.id} value={dish.id}>{dish.name}</option>)}</select></section> : <Empty>Aucun plat disponible. Réactivez un plat pour définir le plat du jour.</Empty>}
    <section className="employee-panel employee-menu-panel"><div className="employee-chips" role="group" aria-label="Catégories du menu">{menuCategories.map(item => <button type="button" key={item} className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'Tout' ? `Tout (${draft.length})` : item}</button>)}</div><div className="employee-menu-head"><span>PLAT</span><span>CATÉGORIE</span><span>PRIX (LECTURE SEULE)</span><span>DISPONIBILITÉ</span><span>PLAT DU JOUR</span></div><div className="employee-menu-list">{visible.map(dish => <article className="employee-menu-item" key={dish.id}><div className="employee-menu-name"><img src={dish.image} alt="" /><div><strong>{dish.name}</strong><small>{dish.description}</small></div></div><span className="employee-menu-category">{dish.category}</span><span className="employee-menu-price"><EmployeeIcon name="lock" size={14} />{money(dish.price)}</span><label className="employee-switch"><input type="checkbox" checked={dish.available} onChange={() => toggleAvailability(dish.id)} /><span aria-hidden="true" /><b>{dish.available ? 'Disponible' : 'Épuisé'}</b></label><button type="button" className={`employee-star ${dish.featured ? 'active' : ''}`} disabled={!dish.available} aria-label={`Définir ${dish.name} comme plat du jour`} aria-pressed={dish.featured} onClick={() => feature(dish.id)}><EmployeeIcon name="star" size={21} /></button></article>)}{!visible.length && <Empty>Aucun plat ne correspond à la recherche.</Empty>}</div></section>
    <div className="employee-save-bar"><span><i />{changed ? 'Modifications non enregistrées' : 'Aucune modification en attente'} <small>Valables dans cette démo locale</small></span><div><button className="employee-button ghost" disabled={!changed} onClick={() => setDraft(menu)}>Annuler</button><button className="employee-button primary" disabled={!changed} onClick={() => onSave(draft)}>Enregistrer</button></div></div>
  </>
}

export function ClaimsPage({ claims, onUpdate, query, onNotice }) {
  const detailRef = useRef(null)
  const [filter, setFilter] = useState('Toutes')
  const [selectedId, setSelectedId] = useState(claims[0]?.id)
  const [response, setResponse] = useState(claims[0]?.response || '')
  const [error, setError] = useState('')
  const selected = claims.find(claim => claim.id === selectedId)
  const editable = selected?.status === 'À traiter' || selected?.status === 'En cours'
  const visible = claims.filter(claim => (filter === 'Toutes' || claim.status === filter) && searchMatch([claim.id, claim.student, claim.orderId, claim.reason], query))
  const select = claim => {
    setSelectedId(claim.id)
    setResponse(claim.response || '')
    setError('')
    if (window.matchMedia('(max-width: 959px)').matches) window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const send = () => {
    if (!selected || selected.status !== 'En cours') return
    if (!response.trim()) return setError('Rédigez une réponse avant de l’envoyer au gérant.')
    onUpdate(selected.id, { status: 'Envoyée au gérant', response: response.trim() })
    onNotice('Réponse enregistrée localement pour validation. La liaison avec l’espace gérant reste à connecter.')
    setError('')
  }
  return <>
    <Heading title="Traitement des réclamations" description="Prenez en charge la demande, rédigez la réponse, puis soumettez-la au gérant." action={<button className="employee-button ghost" onClick={() => onNotice('Réclamations locales actualisées. Aucune donnée distante n’a été chargée.')}><EmployeeIcon name="refresh" /> Actualiser</button>} />
    <div className="employee-chips employee-claim-tabs" role="group" aria-label="Filtrer les réclamations">{claimTabs.map(item => <button type="button" key={item} className={filter === item ? 'active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item} <b>{item === 'Toutes' ? claims.length : claims.filter(claim => claim.status === item).length}</b></button>)}</div>
    <div className="employee-claims-layout"><section className="employee-panel employee-claim-list" aria-label="Liste des réclamations">{visible.map(claim => <button type="button" key={claim.id} className={`employee-claim-row ${selectedId === claim.id ? 'selected' : ''}`} onClick={() => select(claim)}><span><strong>{claim.id}</strong><small>{claim.received}</small></span><span><strong>{claim.student}</strong><small>{claim.orderId} · {claim.reason}</small></span><Badge status={claim.status} /></button>)}{!visible.length && <Empty>Aucune réclamation ne correspond aux filtres.</Empty>}</section><section ref={detailRef} className="employee-panel employee-claim-detail" aria-label="Détail de la réclamation">{selected ? <><div className="employee-claim-detail-top"><h2>{selected.id}</h2><Badge status={selected.status} /></div><div className="employee-claim-person"><span>{selected.student.split(' ').map(part => part[0]).join('')}</span><div><strong>{selected.student}</strong><small>{selected.location}</small></div></div><div className="employee-claim-order"><span>{selected.orderId} · {selected.reason}</span><strong>{money(selected.amount)}</strong></div><h3>MESSAGE DE L’ÉTUDIANT</h3><blockquote>« {selected.message} »</blockquote>{selected.attachment && <div className="employee-attachment">📎 {selected.attachment} · pièce jointe de la maquette</div>}<h3>SUIVI DU TRAITEMENT</h3><ol className="employee-claim-timeline"><li>Reçue par l’équipe</li><li>{selected.status === 'À traiter' ? 'En attente de prise en charge' : 'Examen par le staff'}</li><li>{selected.status === 'Envoyée au gérant' ? 'Validation du gérant en attente' : selected.status === 'Résolue' ? 'Résolue' : 'Réponse à soumettre au gérant'}</li></ol><label className="employee-response-label" htmlFor="employee-response">Votre réponse <small>{response.length} / 500 caractères</small></label><textarea id="employee-response" value={response} onChange={event => setResponse(event.target.value)} maxLength={500} disabled={!editable} placeholder="Rédigez la réponse à transmettre au gérant…" /><div className="employee-template-list">{responseTemplates.map(template => <button type="button" key={template} onClick={() => setResponse(current => `${current}${current ? ' ' : ''}${template}`.slice(0, 500))} disabled={!editable}>{template}</button>)}</div>{error && <p className="employee-error" role="alert">{error}</p>}<div className="employee-claim-actions"><button className="employee-button ghost" disabled={selected.status !== 'À traiter'} onClick={() => { onUpdate(selected.id, { status: 'En cours' }); onNotice(`Réclamation ${selected.id} prise en charge dans la démo.`) }}>Prendre en charge</button><button className="employee-button primary" disabled={selected.status !== 'En cours'} onClick={send}>Envoyer au gérant <EmployeeIcon name="arrow" /></button></div><p className="employee-footnote">La réponse officielle au client dépend de la validation du gérant.</p></> : <Empty>Sélectionnez une réclamation.</Empty>}</section></div>
  </>
}

function BarChart({ values, labels, suffix = '', highlight }) {
  const maximum = Math.max(...values, 1)
  return <div className="employee-chart" role="img" aria-label={values.map((value, index) => `${labels[index]} : ${value.toLocaleString('fr-FR')}${suffix}`).join(', ')}>{values.map((value, index) => <div className="employee-chart-column" key={labels[index]} title={`${labels[index]} : ${value.toLocaleString('fr-FR')}${suffix}`}><div className={`employee-chart-bar ${index === highlight ? 'highlight' : ''}`} style={{ height: `${Math.max(6, value / maximum * 100)}%` }} /><small>{labels[index]}</small></div>)}</div>
}

export function StatisticsPage() {
  const [week, setWeek] = useState(1)
  const stats = weeklyStats[week]
  const revenue = stats.sales.reduce((total, value) => total + value, 0)
  const maxSales = Math.max(...stats.sales)
  const share = Math.round(stats.onsite / stats.orders * 100)
  return <>
    <Heading title="Statistiques hebdomadaires" description="Ajustez le service d’après la semaine écoulée." action={<div className="employee-week-picker"><button aria-label="Semaine précédente" disabled={week === 0} onClick={() => setWeek(current => current - 1)}>‹</button><span>{stats.label}</span><button aria-label="Semaine suivante" disabled={week === weeklyStats.length - 1} onClick={() => setWeek(current => current + 1)}>›</button></div>} />
    <div className="employee-metrics"><Metric label="Ventes de la semaine" value={money(revenue)} detail="Données de démonstration" tone="green" /><Metric label="Commandes" value={stats.orders} detail={`${(stats.orders / 7).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} / jour`} /><Metric label="Panier moyen" value={money(revenue / stats.orders)} detail="Sur place et livraison" /><Metric label="Part de livraison" value={`${100 - share} %`} detail={`${stats.delivery} commandes livrées`} /></div>
    <div className="employee-stats-grid"><section className="employee-panel employee-sales-panel"><div className="employee-panel-title"><div><h2>Ventes par jour</h2><p>Total : {money(revenue)}</p></div><span>Pic : {money(maxSales)}</span></div><BarChart values={stats.sales} labels={['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']} suffix=" CDF" highlight={stats.sales.indexOf(maxSales)} /></section><section className="employee-panel employee-service-panel"><h2>Sur place contre livraison</h2><p>Répartition du volume des commandes</p><div className="employee-service-split"><span style={{ width: `${share}%` }} /><span style={{ width: `${100 - share}%` }} /></div><div className="employee-service-row"><i className="gold" /><span>Sur place</span><strong>{share} %</strong><small>{stats.onsite} commandes</small></div><div className="employee-service-row"><i /><span>Livraison</span><strong>{100 - share} %</strong><small>{stats.delivery} commandes</small></div></section><section className="employee-panel employee-top-panel"><h2>Top 5 des plats</h2><p>Plats les plus commandés cette semaine</p>{topDishes.map((dish, index) => <div className="employee-top-dish" key={dish.name}><div><b>{index + 1}</b><span>{dish.name}</span><strong>{dish.count} cmd</strong></div><i><span style={{ width: `${dish.count / topDishes[0].count * 100}%` }} /></i></div>)}</section><section className="employee-panel employee-peak-panel"><h2>Heures de pointe</h2><p>Affluence de 11 h à 21 h</p><BarChart values={stats.peak} labels={['11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h']} highlight={stats.peak.indexOf(Math.max(...stats.peak))} /></section></div>
    <p className="employee-footnote">Les chiffres présentés sont des exemples issus de la maquette Employé. La base de données commune alimentera les graphiques après intégration.</p>
  </>
}
