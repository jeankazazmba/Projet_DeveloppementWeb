import { useMemo, useState } from 'react'
import type { Order, Period } from '../operations'
import { averageBasket, paymentBreakdown, pointsIssued, popularDishes, salesSeries, serviceBreakdown, totalRevenue } from '../operations'
import { money } from '../data'
import { SalesChart, DonutChart } from '../components/charts'
import { PageHeading, Panel } from '../components/ui'

const labels: Record<Period, string> = { day: 'Aujourd’hui', week: '7 jours', month: '30 jours' }

export default function Reports({ orders, notify }: { orders: Order[]; notify: (message: string) => void }) {
  const [period, setPeriod] = useState<Period>('day')
  const series = useMemo(() => salesSeries(orders, period), [orders, period])
  const payments = paymentBreakdown(orders)
  const services = serviceBreakdown(orders)
  const revenue = series.reduce((sum, point) => sum + point.value, 0)
  const count = series.reduce((sum, point) => sum + point.count, 0)
  const best = popularDishes(orders)
  const exportCsv = () => {
    const rows = ['Période;Ventes CDF;Commandes', ...series.map(point => `${point.label};${point.value};${point.count}`)]
    const url = URL.createObjectURL(new Blob(['\uFEFF', rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `rapport-${period}-demo.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0)
    notify('Rapport CSV de démonstration téléchargé.')
  }
  return <>
    <PageHeading first="Rapports &" accent="Ventes" description="Analysez les ventes, les services et les programmes de fidélité sur des données de démonstration." action={<button className="button subtle" onClick={exportCsv}>↓ Exporter le rapport</button>} />
    <div className="segmented admin-report-period" role="group" aria-label="Période du rapport">{(['day', 'week', 'month'] as Period[]).map(value => <button key={value} className={period === value ? 'selected' : ''} aria-pressed={period === value} onClick={() => setPeriod(value)}>{labels[value]}</button>)}</div>
    <div className="metrics admin-operations-metrics"><div className="metric"><p className="metric-label">VENTES · {labels[period].toUpperCase()}</p><p className="metric-value">{money(revenue)} <small>CDF</small></p><p className="muted small">Somme des points du diagramme</p></div><div className="metric"><p className="metric-label">COMMANDES</p><p className="metric-value">{money(count)}</p><p className="muted small">Sur la période sélectionnée</p></div><div className="metric"><p className="metric-label">PANIER MOYEN DU SERVICE</p><p className="metric-value">{money(averageBasket(orders))} <small>CDF</small></p><p className="muted small">{money(totalRevenue(orders))} CDF aujourd’hui</p></div><div className="metric"><p className="metric-label">POINTS FIDÉLITÉ DU SERVICE</p><p className="metric-value">{money(pointsIssued(orders))}</p><p className="muted small">Selon les commandes terminées</p></div></div>
    <Panel title="Évolution des ventes" subtitle={period === 'day' ? 'Ventes par heure du service' : `Simulation de ventes sur ${labels[period].toLowerCase()}`}><SalesChart data={series} title={`Ventes en CDF · ${labels[period]}`} /></Panel>
    <div className="admin-report-grid"><Panel title="Répartition des paiements" subtitle="Montants du service affiché"><DonutChart data={payments.map(item => ({ name: item.name, value: item.value }))} title="Montants par moyen de paiement" totalLabel="CDF" /></Panel><Panel title="Commandes par service" subtitle="Sur place et livraison"><DonutChart data={services.map(item => ({ name: item.name, value: item.count }))} title="Commandes par service" totalLabel="commandes" /></Panel></div>
    <div className="admin-report-grid"><Panel title="Plats les plus commandés" subtitle="Classement calculé à partir des commandes du service"><ol className="top-dishes">{best.map(([name, total], index) => <li key={name}><span className="rank">{index + 1}</span><span>{name}</span><strong>{total} commandes</strong></li>)}</ol></Panel><Panel title="Fidélité & parrainage" subtitle="Indicateurs du jeu de données de démonstration"><div className="admin-program-metrics"><div><span>Points gagnés sur commandes terminées</span><strong>{money(pointsIssued(orders))} pts</strong></div><div><span>Codes de parrainage partagés</span><strong>148</strong></div><div><span>Inscriptions validées</span><strong>54</strong></div><div><span>Premières commandes des filleuls</span><strong>29</strong></div></div><div className="admin-funnel-chart"><label>Inscriptions après partage <strong>54 / 148</strong><progress value={54} max={148} /></label><label>Premières commandes après inscription <strong>29 / 54</strong><progress value={29} max={54} /></label></div></Panel></div>
    <p className="admin-demo-note">Les 7 et 30 jours utilisent un historique simulé ; les indicateurs du jour sont calculés à partir des commandes locales. Les données réelles nécessitent l’API métier.</p>
  </>
}
