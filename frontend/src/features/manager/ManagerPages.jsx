import { useEffect, useMemo, useState } from 'react'
import { AreaChart, LoyaltyBars, ReferralFunnel, ServiceDonut } from './ManagerCharts.jsx'
import { gestures, money, popularDishes, rights, stats } from './managerData.js'
import ManagerIcon from './ManagerIcon.jsx'

const includes = (value, query) => String(value ?? '').toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr'))
const elapsed = (date, now) => Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000))

function Heading({ eyebrow, title, description, action }) {
  const words = title.split(' ')
  const accent = words.pop()
  return <div className="manager-page-heading"><div><span className="manager-eyebrow">{eyebrow}</span><h1>{words.length > 0 && `${words.join(' ')} `}<span>{accent}</span></h1><p>{description}</p></div>{action}</div>
}

function Metric({ label, value, detail, tone = 'gold' }) {
  return <article className={`manager-metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function Status({ value }) {
  const kind = value === 'Actif' || value === 'Prête' || value === 'Validée' ? 'success' : value === 'Suspendu' || value === 'Rejetée' ? 'danger' : value === 'À valider' || value === 'En préparation' ? 'warning' : 'neutral'
  return <span className={`manager-status ${kind}`}><i />{value}</span>
}

function Empty({ message }) { return <div className="manager-empty">{message}</div> }

export function DashboardPage({ orders, claims, query, onNotice, onNavigate, statsSource = stats, restaurantName = 'Khalifa_food' }) {
  const [status, setStatus] = useState('Toutes')
  const [service, setService] = useState('Tous')
  const [selected, setSelected] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(timer) }, [])
  const visible = useMemo(() => orders.filter(order => (status === 'Toutes' || order.status === status) && (service === 'Tous' || order.service === service) && [order.id, order.customer, order.employee, order.location, order.status].some(value => includes(value, query))), [orders, status, service, query])
  const pending = claims.filter(claim => claim.status === 'À valider').length
  const alerts = restaurantName === 'sleepy hollow' ? orders.filter(order => order.status !== 'Prête').map(order => ({ type: 'warning', title: `Commande ${order.id} à suivre`, description: `${order.customer} · ${order.status}`, action: 'Voir la commande', onClick: () => setSelected(order) })) : [
    { type: 'danger', title: `Commande prête depuis ${elapsed(orders.find(order => order.id === 'MM-1044')?.createdAt, now)} min`, description: 'MM-1044 · Livraison campus de Kinshasa', action: 'Voir la commande', onClick: () => setSelected(orders.find(order => order.id === 'MM-1044')) },
    { type: 'warning', title: 'Livraison à surveiller', description: `MM-1048 · En préparation depuis ${elapsed(orders.find(order => order.id === 'MM-1048')?.createdAt, now)} min`, action: 'Voir la commande', onClick: () => setSelected(orders.find(order => order.id === 'MM-1048')) },
    { type: 'neutral', title: 'Rupture de stock signalée', description: 'Boisson Bissap 50 cl · contrôle requis', action: 'Prendre note', onClick: () => onNotice('Rupture de stock signalée dans la maquette. Gestion des stocks non connectée.') },
  ]
  return <>
    <Heading eyebrow={`ESPACE GÉRANT · ${restaurantName.toUpperCase()}`} title="Supervision en direct" description="Suivez les commandes et les points d’attention du service en cours." action={<button className="manager-button ghost" type="button" onClick={() => { setNow(Date.now()); onNotice('Vue locale actualisée. Les données de démonstration ne changent pas automatiquement.') }}><ManagerIcon name="refresh" /> Actualiser</button>} />
    <div className="manager-metrics"><Metric label="COMMANDES EN COURS" value={orders.length} detail={`${orders.filter(order => order.status === 'Reçue').length} reçues · ${orders.filter(order => order.status === 'En préparation').length} en préparation · ${orders.filter(order => order.status === 'Prête').length} prêtes`} /><Metric label="TEMPS MOYEN DE PRÉPARATION" value="14 min" detail="Objectif : moins de 20 min" /><Metric label="CHIFFRE D’AFFAIRES DU JOUR" value={money(statsSource.day.revenue)} detail="Données de maquette" /><Metric label="RÉCLAMATIONS OUVERTES" value={pending} detail="En attente de validation" tone={pending ? 'red' : 'green'} /></div>
    <div className="manager-content-grid"><section className="manager-panel manager-orders-panel"><div className="manager-panel-title"><div><h2>Commandes en cours <span>{orders.length}</span></h2><p>Dernière actualisation : {new Date(now).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p></div><div className="manager-filters"><select value={service} onChange={event => setService(event.target.value)} aria-label="Type de service"><option>Tous</option><option>Sur place</option><option>Livraison</option></select></div></div><div className="manager-tabs" role="group" aria-label="Filtrer par état">{['Toutes', 'Reçue', 'En préparation', 'Prête'].map(option => <button key={option} type="button" className={status === option ? 'active' : ''} onClick={() => setStatus(option)}>{option}</button>)}</div><div className="manager-table-scroll"><table className="manager-table"><thead><tr><th>COMMANDE</th><th>CLIENT / SERVICE</th><th>EMPLOYÉ</th><th>STATUT</th><th>ATTENTE</th><th></th></tr></thead><tbody>{visible.map(order => <tr key={order.id}><td><strong>{order.id}</strong><small>{money(order.amount)}</small></td><td><strong>{order.customer}</strong><small>{order.service} · {order.location}</small></td><td>{order.employee}</td><td><Status value={order.status} /></td><td>{elapsed(order.createdAt, now)} min</td><td><button type="button" className="manager-table-action" onClick={() => setSelected(order)} aria-label={`Détails de ${order.id}`}><ManagerIcon name="chevron" /></button></td></tr>)}</tbody></table>{visible.length === 0 && <Empty message="Aucune commande ne correspond aux filtres." />}</div></section><aside className="manager-panel manager-alerts"><div className="manager-panel-title"><div><h2>Alertes & priorités</h2><p>Points d’attention du service</p></div><span className="manager-count">{alerts.length}</span></div>{alerts.map(alert => <article className={`manager-alert ${alert.type}`} key={alert.title}><span className="manager-alert-dot" /><div><h3>{alert.title}</h3><p>{alert.description}</p><button type="button" onClick={alert.onClick}>{alert.action} →</button></div></article>)}<button type="button" className="manager-link-action" onClick={() => onNavigate('/gerant/reclamations')}>Voir les réclamations <ManagerIcon name="chevron" /></button></aside></div>
    <section className="manager-panel manager-chart-panel"><div className="manager-panel-title"><div><h2>Activité des commandes</h2><p>Volume horaire du service · données de maquette</p></div><span className="manager-chart-period">Aujourd’hui</span></div><AreaChart values={statsSource.day.sales} labels={statsSource.day.labels} suffix=" commandes" /></section>
    {selected && <div className="manager-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}><section className="manager-modal" role="dialog" aria-modal="true" aria-label={`Commande ${selected.id}`}><button type="button" className="manager-icon-button manager-modal-close" onClick={() => setSelected(null)} aria-label="Fermer"><ManagerIcon name="close" /></button><span className="manager-eyebrow">DÉTAIL DE LA COMMANDE</span><h2>{selected.id}</h2><dl><div><dt>Client</dt><dd>{selected.customer}</dd></div><div><dt>Service</dt><dd>{selected.service} · {selected.location}</dd></div><div><dt>Employé</dt><dd>{selected.employee}</dd></div><div><dt>Montant</dt><dd>{money(selected.amount)}</dd></div><div><dt>Attente</dt><dd>{elapsed(selected.createdAt, now)} min</dd></div><div><dt>Statut</dt><dd><Status value={selected.status} /></dd></div></dl><p className="manager-muted">Les actions de commande nécessitent l’API du projet commun.</p><button type="button" className="manager-button primary" onClick={() => setSelected(null)}>Fermer</button></section></div>}
  </>
}

export function TeamPage({ employees, query, onAdd, onEdit }) {
  const [filter, setFilter] = useState('Tous')
  const visible = employees.filter(employee => (filter === 'Tous' || employee.status === filter) && [employee.name, employee.email, employee.phone, employee.status].some(value => includes(value, query)))
  const active = employees.filter(employee => employee.status === 'Actif').length
  return <>
    <Heading eyebrow="ESPACE GÉRANT · PERSONNEL" title="Équipe" description="Gérez les comptes des employés et leurs accès aux modules du restaurant." action={<button type="button" className="manager-button primary" onClick={onAdd}><ManagerIcon name="plus" /> Ajouter un employé</button>} />
    <div className="manager-metrics manager-metrics-three"><Metric label="EMPLOYÉS AU TOTAL" value={employees.length} detail="Comptes enregistrés localement" /><Metric label="COMPTES ACTIFS" value={active} detail="Accès autorisé" tone="green" /><Metric label="COMPTES SUSPENDUS" value={employees.length - active} detail="Accès à réviser" tone="red" /></div>
    <section className="manager-panel"><div className="manager-panel-title"><div><h2>Membres de l’équipe</h2><p>{visible.length} résultat{visible.length > 1 ? 's' : ''}</p></div><select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filtrer les employés"><option>Tous</option><option>Actif</option><option>Suspendu</option></select></div><div className="manager-table-scroll"><table className="manager-table manager-team-table"><thead><tr><th>EMPLOYÉ</th><th>TÉLÉPHONE</th><th>STATUT</th><th>DERNIÈRE CONNEXION</th><th>DROITS</th><th>ACTIONS</th></tr></thead><tbody>{visible.map(employee => <tr key={employee.id}><td><div className="manager-person"><span className="manager-person-avatar">{employee.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span><span><strong>{employee.name}</strong><small>{employee.email}</small></span></div></td><td>{employee.phone}</td><td><Status value={employee.status} /></td><td>{employee.lastLogin}</td><td><span className="manager-rights-preview">{employee.rights.length === rights.length ? 'Tous les droits' : employee.rights.map(key => rights.find(right => right.key === key)?.title.replace(' (temporaire)', '')).join(', ')}</span></td><td><button type="button" className="manager-table-action" onClick={() => onEdit(employee)} aria-label={`Modifier ${employee.name}`}><ManagerIcon name="edit" /> Modifier</button></td></tr>)}</tbody></table>{visible.length === 0 && <Empty message="Aucun employé ne correspond à la recherche." />}</div></section>
    <p className="manager-footnote">Les comptes et les changements sont conservés dans ce navigateur à titre de démonstration. L’authentification réelle dépend du backend commun.</p>
  </>
}

function exportStatsCsv(period, data, dishes) {
  const lines = [['Indicateur', 'Valeur'], ['Période', data.label], ['Chiffre d’affaires (CDF)', data.revenue], ['Commandes', data.orders], ['Nouveaux étudiants', data.students], ['Points distribués', data.points], ['Points utilisés', data.usedPoints], ['Commandes sur place', data.onsite], ['Livraisons', data.delivery], ...popularDishes.map(dish => [`Plat : ${dish.name} (portions)`, dish.portions])]
  const csv = '\uFEFF' + lines.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `mon-miam-miam-gerant-${period}.csv`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function StatisticsPage({ onNotice, statsSource = stats, dishes = popularDishes, restaurantName = 'Khalifa_food' }) {
  const [period, setPeriod] = useState('month')
  const data = statsSource[period]
  return <>
    <Heading eyebrow={`ESPACE GÉRANT · ${restaurantName.toUpperCase()} · RAPPORTS`} title="Statistiques" description="Ventes, fidélité et performance du restaurant sur la période sélectionnée." action={<div className="manager-heading-actions"><div className="manager-segmented" role="group" aria-label="Période statistique">{[['day', 'Aujourd’hui'], ['week', '7 jours'], ['month', '30 jours']].map(([key, label]) => <button type="button" key={key} className={period === key ? 'active' : ''} onClick={() => setPeriod(key)}>{label}</button>)}</div><button type="button" className="manager-button ghost" onClick={() => { exportStatsCsv(period, data, dishes); onNotice('Export CSV créé à partir des données de démonstration.') }}><ManagerIcon name="download" /> Exporter CSV</button></div>} />
    <div className="manager-metrics"><Metric label="CHIFFRE D’AFFAIRES" value={money(data.revenue)} detail={data.label} /><Metric label="COMMANDES" value={data.orders} detail="Sur place et livraison" /><Metric label="NOUVEAUX ÉTUDIANTS" value={data.students} detail="Données de maquette" tone="green" /><Metric label="POINTS FIDÉLITÉ" value={data.points.toLocaleString('fr-FR')} detail={`${data.usedPoints} points utilisés`} /></div>
    <div className="manager-stats-grid"><section className="manager-panel manager-stats-sales"><div className="manager-panel-title"><div><h2>Évolution des ventes</h2><p>Activité sur {data.label.toLocaleLowerCase('fr')}</p></div><strong>{money(data.revenue)}</strong></div><AreaChart values={data.sales} labels={data.labels} suffix=" k CDF" /></section><section className="manager-panel"><div className="manager-panel-title"><div><h2>Fidélité MIAM</h2><p>Points distribués et utilisés</p></div></div><LoyaltyBars issued={data.issued} used={data.used} /></section><section className="manager-panel"><div className="manager-panel-title"><div><h2>Parrainage</h2><p>De l’invitation à la première commande</p></div></div><ReferralFunnel values={data.referrals} /></section><section className="manager-panel"><div className="manager-panel-title"><div><h2>Type de service</h2><p>Répartition des commandes</p></div></div><ServiceDonut onsite={data.onsite} delivery={data.delivery} /></section></div>
    <section className="manager-panel manager-popular"><div className="manager-panel-title"><div><h2>Plats les plus populaires</h2><p>Classement des ventes · maquette</p></div></div><div className="manager-table-scroll"><table className="manager-table"><thead><tr><th>RANG</th><th>PLAT</th><th>PORTIONS VENDUES</th><th>CHIFFRE D’AFFAIRES</th></tr></thead><tbody>{dishes.map((dish, index) => <tr key={dish.name}><td><span className="manager-rank">{String(index + 1).padStart(2, '0')}</span></td><td><strong>{dish.name}</strong></td><td>{dish.portions}</td><td>{money(dish.revenue)}</td></tr>)}</tbody></table></div></section>
    <p className="manager-footnote">Ces indicateurs sont issus des maquettes Gérant. Ils seront alimentés par le backend lors de son intégration.</p>
  </>
}

export function ClaimsPage({ claims, query, onDecide }) {
  const [filter, setFilter] = useState('À valider')
  const [selectedId, setSelectedId] = useState(claims[0]?.id)
  const [gesture, setGesture] = useState(claims[0]?.gesture || gestures[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const selected = claims.find(claim => claim.id === selectedId)
  const visible = claims.filter(claim => (filter === 'Toutes' || claim.status === filter) && [claim.id, claim.student, claim.orderId, claim.reason].some(value => includes(value, query)))
  const select = claim => { setSelectedId(claim.id); setGesture(claim.gesture || gestures[0]); setNote(claim.note || ''); setError('') }
  const decide = status => {
    if (!selected) return
    if (status === 'Rejetée' && !note.trim()) { setError('Précisez pourquoi la réclamation est rejetée ou renvoyée à l’employé.'); return }
    onDecide(selected.id, status, gesture, note.trim())
    setError('')
  }
  return <>
    <Heading eyebrow="ESPACE GÉRANT · QUALITÉ DE SERVICE" title="Réclamations" description="Examinez les réponses proposées par l’équipe et décidez du geste commercial." />
    <div className="manager-metrics manager-metrics-three"><Metric label="EN ATTENTE DE VALIDATION" value={claims.filter(claim => claim.status === 'À valider').length} detail="Action requise" tone="red" /><Metric label="VALIDÉES" value={14 + claims.filter(claim => claim.status === 'Validée').length} detail="14 dans la maquette initiale" tone="green" /><Metric label="REJETÉES" value={3 + claims.filter(claim => claim.status === 'Rejetée').length} detail="3 dans la maquette initiale" /></div>
    <div className="manager-claims-grid"><section className="manager-panel manager-claims-list"><div className="manager-panel-title"><div><h2>À examiner</h2><p>{visible.length} réclamation{visible.length > 1 ? 's' : ''}</p></div></div><div className="manager-tabs" role="group" aria-label="Filtrer les réclamations">{['À valider', 'Validée', 'Rejetée', 'Toutes'].map(option => <button type="button" className={filter === option ? 'active' : ''} key={option} onClick={() => setFilter(option)}>{option}</button>)}</div><div className="manager-claim-items">{visible.map(claim => <button type="button" className={`manager-claim-item ${selectedId === claim.id ? 'selected' : ''}`} key={claim.id} onClick={() => select(claim)}><span className="manager-claim-row"><strong>{claim.id}</strong><Status value={claim.status} /></span><strong>{claim.reason}</strong><span>{claim.student} · {claim.orderId}</span><small>{claim.elapsed} · {money(claim.amount)}</small></button>)}{visible.length === 0 && <Empty message="Aucune réclamation dans ce filtre." />}</div></section><section className="manager-panel manager-claim-detail">{selected ? <><div className="manager-panel-title"><div><span className="manager-eyebrow">DOSSIER {selected.id}</span><h2>{selected.reason}</h2><p>{selected.student} · {selected.location}</p></div><Status value={selected.status} /></div><div className="manager-claim-meta"><div><span>COMMANDE</span><strong>{selected.orderId}</strong></div><div><span>MONTANT</span><strong>{money(selected.amount)}</strong></div><div><span>ARTICLE</span><strong>{selected.item}</strong></div></div><div className="manager-claim-block"><h3>Message de l’étudiant</h3><p>{selected.message}</p>{selected.attachment && <span className="manager-attachment">▧ {selected.attachment}</span>}</div><div className="manager-claim-block manager-proposal"><div><h3>Réponse proposée</h3><small>{selected.proposedBy} · {selected.proposedAt}</small></div><p>{selected.proposal}</p></div><div className="manager-claim-form"><h3>Geste commercial</h3><p>Choisissez la compensation proposée au client.</p><div className="manager-gesture-grid">{gestures.map(option => <label key={option} className={gesture === option ? 'selected' : ''}><input type="radio" name="claim-gesture" value={option} checked={gesture === option} onChange={() => setGesture(option)} />{option}</label>)}</div><label className="manager-note-label">Note de décision<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Ajoutez une note pour l’équipe…" rows="3" /></label>{error && <p className="manager-form-error" role="alert">{error}</p>}{selected.status === 'À valider' ? <div className="manager-decision-actions"><button type="button" className="manager-button ghost" onClick={() => decide('Rejetée')}>Rejeter / demander correction</button><button type="button" className="manager-button primary" onClick={() => decide('Validée')}>Valider (démo)</button></div> : <p className="manager-decision-saved">Décision locale : {selected.status}{selected.note ? ` · ${selected.note}` : ''}</p>}</div></> : <Empty message="Sélectionnez une réclamation pour afficher son dossier." />}</section></div>
    <p className="manager-footnote">Les décisions sont enregistrées dans ce navigateur uniquement. Aucun client n’est contacté et aucun avoir réel n’est créé.</p>
  </>
}
