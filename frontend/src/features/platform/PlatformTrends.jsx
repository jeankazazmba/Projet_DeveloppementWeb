const money = amount => `${Number(amount || 0).toLocaleString('fr-CD')} CDF`

export default function PlatformTrends({ trends = [] }) {
  const max = Math.max(1, ...trends.map(item => Number(item.orders || 0)))
  return <section className="platform-card platform-trends">
    <header className="platform-card-heading"><h2>Tendance du réseau · six derniers mois</h2></header>
    <p className="platform-help">Commandes regroupées par mois à l’heure de Kinshasa. Les valeurs suivent les filtres de restaurant et de période.</p>
    <div className="platform-trends-bars" role="img" aria-label={trends.map(item => `${item.month} : ${item.orders} commandes, ${money(item.order_volume_cdf)}`).join(' ; ')}>
      {trends.map(item => <div className="platform-trends-month" key={item.month} title={`${item.month} · ${item.orders} commandes · ${money(item.order_volume_cdf)}`}><strong>{item.orders}</strong><div className="platform-trends-track"><span style={{ height: `${Math.max(item.orders ? 5 : 0, Number(item.orders || 0) / max * 100)}%` }} /></div><small>{item.month.slice(5)}/{item.month.slice(2, 4)}</small></div>)}
    </div>
    <details className="platform-trends-details"><summary>Voir les données mensuelles</summary><div className="platform-table-wrap"><table><thead><tr><th>MOIS</th><th>COMMANDES</th><th>VOLUME CDF</th></tr></thead><tbody>{trends.map(item => <tr key={item.month}><td>{item.month}</td><td>{item.orders}</td><td>{money(item.order_volume_cdf)}</td></tr>)}</tbody></table></div></details>
  </section>
}
