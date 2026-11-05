const money = amount => `${Number(amount || 0).toLocaleString('fr-CD')} CDF`
const number = value => Number(value || 0).toLocaleString('fr-CD')
const restaurantName = (restaurants, id) => restaurants.find(item => item.id === id)?.name || id || '—'
const date = value => value ? new Intl.DateTimeFormat('fr-CD', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kinshasa' }).format(new Date(value)) : '—'

function Card({ title, children }) {
  return <section className="platform-card"><header className="platform-card-heading"><h2>{title}</h2></header>{children}</section>
}

function Empty({ children }) {
  return <p className="platform-empty">{children}</p>
}

export function CatalogPanel({ insights, restaurants }) {
  const rows = insights.by_restaurant
  return <Card title="Publications par établissement">
    <p className="platform-help">Cette vue compte les contenus publiés. Les titres, prix, brouillons et modifications du menu restent dans l’administration du restaurant.</p>
    <div className="platform-metrics platform-metrics-small platform-metrics-single"><div><small>CONTENUS PUBLIÉS</small><strong>{number(insights.summary.published_contents)}</strong><span>Tous les établissements sélectionnés</span></div></div>
    <div className="platform-table-wrap"><table><thead><tr><th>RESTAURANT</th><th>PLATS</th><th>PROMOTIONS</th><th>ÉVÉNEMENTS</th><th>JEUX</th><th>TOTAL</th></tr></thead><tbody>
      {rows.map(row => <tr key={row.restaurant_id}><td><strong>{restaurantName(restaurants, row.restaurant_id)}</strong></td><td>{number(row.dishes)}</td><td>{number(row.promotions)}</td><td>{number(row.events)}</td><td>{number(row.games)}</td><td><strong>{number(row.published_contents)}</strong></td></tr>)}
    </tbody></table>{!rows.length && <Empty>Aucun restaurant dans ce périmètre.</Empty>}</div>
  </Card>
}

export function OrdersPanel({ insights, restaurants }) {
  return <Card title="Activité des commandes par restaurant">
    <p className="platform-help">La plateforme voit les volumes de la période. Les commandes individuelles et les données des clients sont réservées aux équipes du restaurant.</p>
    <div className="platform-metrics platform-metrics-small platform-metrics-two"><div><small>COMMANDES</small><strong>{number(insights.summary.orders)}</strong></div><div><small>VOLUME HORS ANNULATIONS</small><strong>{money(insights.summary.order_volume_cdf)}</strong><span>Ce volume ne prouve pas un encaissement.</span></div></div>
    <div className="platform-table-wrap"><table><thead><tr><th>RESTAURANT</th><th>COMMANDES</th><th>VOLUME HORS ANNULATIONS</th></tr></thead><tbody>
      {insights.by_restaurant.map(row => <tr key={row.restaurant_id}><td><strong>{restaurantName(restaurants, row.restaurant_id)}</strong></td><td>{number(row.orders)}</td><td>{money(row.order_volume_cdf)}</td></tr>)}
    </tbody></table>{!insights.by_restaurant.length && <Empty>Aucun restaurant dans ce périmètre.</Empty>}</div>
  </Card>
}

export function ComplaintsPanel({ insights, restaurants }) {
  return <Card title="Escalades vers la plateforme">
    <p className="platform-help">Seuls la référence, l’établissement, l’état et la date sont transmis ici. Le dossier et les échanges restent sous la responsabilité du restaurant.</p>
    <div className="platform-metrics platform-metrics-small platform-metrics-single"><div><small>RÉCLAMATIONS ESCALADÉES</small><strong>{number(insights.summary.escalated_complaints)}</strong></div></div>
    <div className="platform-table-wrap"><table><thead><tr><th>RÉFÉRENCE</th><th>RESTAURANT</th><th>ÉTAT</th><th>DATE</th></tr></thead><tbody>
      {insights.complaints.map(item => <tr key={item.id}><td><strong>{item.id}</strong>{item.is_demo && <small>Démo</small>}</td><td>{restaurantName(restaurants, item.restaurant_id)}</td><td>{item.status}</td><td>{date(item.created_at)}</td></tr>)}
    </tbody></table>{!insights.complaints.length && <Empty>Aucune escalade dans ce périmètre.</Empty>}</div>
    {insights.complaints.length >= 100 && <p className="platform-help">Les 100 escalades les plus récentes sont affichées ; le compteur porte sur toute la période.</p>}
  </Card>
}

export function LoyaltyPanel({ insights, restaurants }) {
  return <><div className="platform-metrics platform-metrics-small"><div><small>POINTS CRÉDITÉS</small><strong>{number(insights.summary.points_issued)}</strong></div><div><small>POINTS UTILISÉS</small><strong>{number(insights.summary.points_used)}</strong></div><div><small>PARRAINAGES</small><strong>{number(insights.summary.referrals)}</strong></div></div>
    <Card title="Programmes par restaurant"><p className="platform-help">Les soldes, mouvements et filleuls individuels restent dans le périmètre du restaurant et de l’étudiant concerné.</p>
      <div className="platform-table-wrap"><table><thead><tr><th>RESTAURANT</th><th>POINTS CRÉDITÉS</th><th>POINTS UTILISÉS</th><th>PARRAINAGES</th></tr></thead><tbody>
        {insights.by_restaurant.map(row => <tr key={row.restaurant_id}><td><strong>{restaurantName(restaurants, row.restaurant_id)}</strong></td><td>{number(row.points_issued)}</td><td>{number(row.points_used)}</td><td>{number(row.referrals)}</td></tr>)}
      </tbody></table>{!insights.by_restaurant.length && <Empty>Aucun restaurant dans ce périmètre.</Empty>}</div>
    </Card><p className="platform-note">Les taux de conversion, l’expiration et la portée des points doivent être validés avant toute modification de solde.</p></>
}
