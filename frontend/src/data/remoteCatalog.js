import { dishes as demoDishes, events as demoEvents, menuImage, offers as demoOffers, promoImage } from '../features/public/publicData.js'
import { getPublicRestaurants } from './restaurants.js'

export const demoCatalog = () => ({
  restaurants: getPublicRestaurants(), dishes: demoDishes, offers: demoOffers, events: demoEvents,
  games: [{ id: 'demo-wheel', restaurantId: 'zeduc', title: 'Roue gourmande', description: 'Démonstration disponible dans l’application étudiante.' }],
  connected: false,
})

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '')

export async function loadPublicCatalog() {
  if (!apiUrl) return null
  const response = await fetch(`${apiUrl}/api/restaurants`)
  if (!response.ok) throw new Error('Répertoire indisponible')
  const restaurants = await response.json()
  if (!Array.isArray(restaurants)) throw new Error('Répertoire invalide')
  const content = (await Promise.all(restaurants.map(async restaurant => {
    const result = await fetch(`${apiUrl}/api/restaurants/${encodeURIComponent(restaurant.id)}/content`)
    if (!result.ok) throw new Error('Contenu indisponible')
    return result.json()
  }))).flat()
  return {
    connected: true,
    restaurants: restaurants.map(item => ({ ...item, example: item.is_demo })),
    dishes: content.filter(item => item.kind === 'dish').map(item => ({ id: `api-${item.id}`, restaurantId: item.restaurant_id, name: item.title, description: item.description || '', price: item.price_cdf || 0, category: item.details?.category || 'Plats', image: item.image_url || menuImage(75), unavailable: item.details?.available === false })),
    offers: content.filter(item => item.kind === 'promotion').map(item => ({ id: item.id, restaurantId: item.restaurant_id, title: item.title, description: item.description || '', terms: item.details?.terms || 'Conditions à confirmer auprès du restaurant.', badge: item.details?.badge || 'Offre', tag: item.details?.tag || '', image: item.image_url || promoImage(74) })),
    events: content.filter(item => item.kind === 'event').map(item => ({ id: item.id, restaurantId: item.restaurant_id, title: item.title, description: item.description || '', day: item.details?.day || '—', month: item.details?.month || '', time: item.details?.time || '', place: item.details?.place || '', price: item.details?.price || '' })),
    games: content.filter(item => item.kind === 'game').map(item => ({ id: item.id, restaurantId: item.restaurant_id, title: item.title, description: item.description || '' })),
  }
}
