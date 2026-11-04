import './restaurantScope.css'

export function RestaurantScopeControl({ restaurant, restaurants, onChange, label = 'Restaurant de travail' }) {
  return <label className="restaurant-scope-control"><span>{label}</span><select aria-label={label} value={restaurant.id} onChange={event => onChange(event.target.value)}>{restaurants.map(item => <option key={item.id} value={item.id}>{item.name}{item.example ? ' · démo' : ''}</option>)}</select></label>
}

export function RestaurantEmpty({ restaurant, topic }) {
  return <div className="restaurant-empty"><strong>{topic} · {restaurant.name}</strong><p>Aucune donnée pour cet établissement dans la démonstration. Les informations apparaîtront après son raccordement à l’API.</p></div>
}
