import { useState } from 'react'
import { getRestaurant, getRestaurants, PRIMARY_RESTAURANT_ID, restaurantScopeKey } from '../../data/restaurants.js'

export function useRestaurantScope(role, allowedIds = [PRIMARY_RESTAURANT_ID, 'partenaire-demo']) {
  const key = restaurantScopeKey(role)
  const [restaurantId, setId] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return allowedIds.includes(saved) ? saved : allowedIds[0]
    } catch { return allowedIds[0] }
  })
  const setRestaurantId = id => {
    if (!allowedIds.includes(id)) return
    setId(id)
    try { localStorage.setItem(key, id) } catch { /* Sélection gardée pour cette session. */ }
  }
  return { restaurant: getRestaurant(restaurantId), restaurantId, setRestaurantId, allowedRestaurants: getRestaurants().filter(item => allowedIds.includes(item.id)) }
}
