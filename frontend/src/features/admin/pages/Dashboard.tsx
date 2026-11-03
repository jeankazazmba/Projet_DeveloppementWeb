import { useState } from 'react'
import { assets } from '../design-assets'
import { money } from '../data'
import type { Page } from '../data'
import type { Order, Period } from '../operations'
import { averageBasket, paymentBreakdown, pointsIssued, popularDishes, salesSeries, serviceBreakdown, totalRevenue } from '../operations'
import { SalesChart, DonutChart } from '../components/charts'
import { Badge, Icon, Metric, Modal, PageHeading, Panel } from '../components/ui'

const a = assets.dashboard
const activity = [
  ['19:02', 'Commande MM-1048 reçue', 'Arsène K. · Livraison Résidence La Terrasse', '9 750 FCFA', 'blue'],
  ['18:55', 'Livraison MM-1045 validée', 'Validée par l’employée Marie T.', 'Livrée', 'green'],
  ['18:40', 'Réclamation RC-0033 enregistrée', 'Article manquant : Bobolo supplémentaire', 'Priorité haute', 'red'],
  ['18:22', 'Menu mis à jour', 'Ndolé royal marqué disponible en cuisine', 'Cuisine principale', 'yellow'],
  ['17:50', 'Commande MM-1042 servie', 'Sur place · Table 04', '5 500 FCFA', 'green'],
  ['17:15', 'Shift soir démarré', '4 serveurs et 3 cuisiniers pointés au badge', 'Superviseur ZS', 'gold'],
]

export default function Dashboard({ navigate, openClaims, orders }: { navigate: (page: Page) => void; openClaims: number; orders: Order[] }) {
  const [preview, setPreview] = useState(false)
  const [period, setPeriod] = useState<Period>('day')
  const series = salesSeries(orders, period)
  const payments = paymentBreakdown(orders)
  const services = serviceBreakdown(orders)
  const topDishes = popularDishes(orders)
  const peak = series.reduce((best, point) => point.value > best.value ? point : best, series[0])
  const mobileMoney = payments.filter(item => item.name.includes('Money')).reduce((sum, item) => sum + item.percent, 0)
  return <>
    <PageHeading first="Tableau de" accent="bord" description="Vue d’ensemble du service de démonstration · ZeDuc-Sp@ce, Yansoki, Douala." action={<div className="segmented period">{([['day', 'Aujourd’hui'], ['week', '7 jours'], ['month', '30 jours']] as [Period, string][]).map(([value, label]) => <button key={value} className={period === value ? 'selected' : ''} aria-pressed={period === value} onClick={() => setPeriod(value)}>{label}</button>)}<button onClick={() => setPreview(true)}><Icon src={a.imgContainer3} />Aperçu rapide</button></div>} />
    <div className="metrics dashboard-metrics">
      <Metric label="VENTES DU SERVICE" value={money(totalRevenue(orders))} unit="FCFA" note="Calculé depuis les commandes locales" icon={a.imgContainer4} tone="positive" />
      <Metric label="COMMANDES PASSÉES" value={orders.length} unit="tickets" note={`${orders.filter(order => order.status !== 'Terminée' && order.status !== 'Annulée').length} commandes à suivre`} icon={a.imgContainer6} />
      <Metric label="PANIER MOYEN" value={money(averageBasket(orders))} unit="FCFA" note="Montant moyen hors annulations" icon={a.imgContainer7} />
      <Metric label="NOUVEAUX ÉTUDIANTS" value="6" unit="inscrits" note="Donnée d’exemple · Campus et résidence" icon={a.imgContainer8}><Badge>Démo</Badge></Metric>
      <Metric label="POINTS FIDÉLITÉ DISTRIBUÉS" value={pointsIssued(orders)} unit="pts" note="Calculés sur commandes terminées" icon={a.imgContainer9} />
      <Metric label="RÉCLAMATIONS OUVERTES" value={openClaims} unit="dossiers" note="En attente d’arbitrage" icon={a.imgContainer10} tone="negative"><button className="badge yellow" onClick={() => navigate('claims')}>Action requise</button></Metric>
    </div>
    <div className="sales-grid" id="sales">
      <Panel title="Ventes du service" subtitle={period === 'day' ? 'Suivi horaire (11h00 — 21h00)' : `Historique simulé · ${period === 'week' ? '7 jours' : '30 jours'}`} className="sales-panel" action={<div className="chart-key"><span>● FCFA collectés</span><Badge>Pic : {peak.label} · {money(peak.value)} FCFA</Badge></div>}><SalesChart data={series} title={`Ventes en FCFA · ${period === 'day' ? 'aujourd’hui' : period === 'week' ? '7 jours' : '30 jours'}`} /></Panel>
      <Panel title="Commandes par service" subtitle="Sur place vs livraison campus" className="service-panel"><DonutChart data={services.map(item => ({ name: item.name, value: item.count }))} title="Répartition des commandes par service" totalLabel="commandes" /></Panel>
    </div>
    <div className="insights-grid">
      <Panel title="Moyens de paiement" subtitle="Ventilation des encaissements" action={<Icon src={a.imgContainer11} />}>{payments.map(item => <div className="payment" key={item.name}><div><strong>{item.name}</strong><span>{item.percent} %</span></div><progress value={item.value} max={Math.max(totalRevenue(orders), 1)} aria-label={`${item.name} : ${money(item.value)} FCFA`} /><small>{money(item.value)} FCFA encaissés</small></div>)}<div className="payment-total"><span>Taux Mobile Money combiné</span><strong>{mobileMoney} % du chiffre d’affaires</strong></div></Panel>
      <Panel title="Plats les plus commandés" subtitle="Top 5 calculé depuis les commandes" action={<Icon src={a.imgContainer12} />}><ol className="top-dishes">{topDishes.map(([name, total], index) => <li key={name}><span className="rank">{index + 1}</span><span>{name}</span><strong>{total} commandes</strong></li>)}</ol><button className="text-button end" onClick={() => navigate('menu')}>Gérer les ruptures de stock <Icon src={a.imgContainer13} /></button></Panel>
      <Panel title="Entonnoir du parrainage" subtitle="Exemple d’acquisition campus" action={<Icon src={a.imgContainer14} />}><div className="funnel">{[['1. Codes partagés', '148 partages', 148], ['2. Inscriptions validées', '54 inscrits', 54], ['3. Premières commandes', '29 convertis', 29]].map(([label, value, total]) => <div key={label}><div className="split"><strong>{label}</strong><span>{value}</span></div><progress value={Number(total)} max="148" aria-label={String(label)} /></div>)}</div><p className="referral-total">Bonus parrainage · données d’exemple <strong>14 500 FCFA</strong></p></Panel>
    </div>
    <Panel title="Fil d’activité du service" subtitle="Exemple chronologique des opérations du restaurant" action={<span className="live-label"><img src={a.imgEllipse} alt="" />Flux de démonstration</span>}><ol className="activity-list">{activity.map(([hour, title, description, result, tone]) => <li key={hour}><time>{hour}</time><span className={`activity-dot ${tone}`} /><strong>{title}</strong><span className="muted">{description}</span><span className="activity-result">{tone === 'red' || result === 'Livrée' ? <Badge tone={tone}>{result}</Badge> : result}</span></li>)}</ol></Panel>
    {preview && <Modal title="Aperçu rapide" onClose={() => setPreview(false)}><p className="muted">Instantané de démonstration calculé depuis les commandes locales.</p><dl className="summary"><div><dt>Ventes</dt><dd>{money(totalRevenue(orders))} FCFA</dd></div><div><dt>Commandes</dt><dd>{orders.length}</dd></div><div><dt>Réclamations à traiter</dt><dd>{openClaims}</dd></div></dl><div className="dialog-actions"><button className="button primary" onClick={() => { setPreview(false); navigate('reports') }}>Voir les rapports</button></div></Modal>}
  </>
}
