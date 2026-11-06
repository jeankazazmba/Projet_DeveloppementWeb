import { dishes as demoDishes, events as demoEvents, menuImage, offers as demoOffers, promoImage } from '../features/public/publicData.js'
import { getPublicRestaurants, PRIMARY_RESTAURANT_ID, SECONDARY_RESTAURANT_ID } from './restaurants.js'

export const demoCatalog = () => ({
  restaurants: getPublicRestaurants(),
  dishes: demoDishes.filter(item => getPublicRestaurants().some(restaurant => restaurant.id === item.restaurantId)),
  offers: demoOffers.filter(item => getPublicRestaurants().some(restaurant => restaurant.id === item.restaurantId)),
  events: demoEvents.filter(item => getPublicRestaurants().some(restaurant => restaurant.id === item.restaurantId)),
  games: [
    { id: 'khalifa-wheel', restaurantId: PRIMARY_RESTAURANT_ID, title: 'Roue gourmande', description: 'Une tentative quotidienne chez Khalifa_food.' },
    { id: 'khalifa-quiz', restaurantId: PRIMARY_RESTAURANT_ID, title: 'Quiz gourmand', description: 'Trois questions sur Khalifa_food.' },
    { id: 'khalifa-memory', restaurantId: PRIMARY_RESTAURANT_ID, title: 'Paires gourmandes', description: 'Retrouvez les paires de plats de Khalifa_food.' },
    { id: 'sleepy-wheel', restaurantId: SECONDARY_RESTAURANT_ID, title: 'Roue du soir', description: 'Une tentative quotidienne chez sleepy hollow.' },
    { id: 'sleepy-quiz', restaurantId: SECONDARY_RESTAURANT_ID, title: 'Quiz du soir', description: 'Découvrez les plats de sleepy hollow.' },
    { id: 'sleepy-memory', restaurantId: SECONDARY_RESTAURANT_ID, title: 'Paires du soir', description: 'Retrouvez les paires gourmandes de sleepy hollow.' },
  ].filter(item => getPublicRestaurants().some(restaurant => restaurant.id === item.restaurantId)),
  connected: false,
})

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '')
const normalize = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim()
const knownImage = (items, title) => items.find(item => normalize(item.name || item.title) === normalize(title))?.image
const fallbackImage = (items, title, id, imageAt) => knownImage(items, title) || imageAt((Number(id) || 0) % 6)

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
    dishes: content.filter(item => item.kind === 'dish').map(item => ({ id: `api-${item.id}`, restaurantId: item.restaurant_id, name: item.title, description: item.description || '', price: item.price_cdf || 0, category: item.category?.name || item.details?.category || 'Plats', image: item.image_url || fallbackImage(demoDishes, item.title, item.id, index => menuImage([75, 101, 129, 176, 202, 228][index])), unavailable: item.is_available === false, featured: item.is_featured === true })),
    offers: content.filter(item => item.kind === 'promotion').map(item => ({ id: item.id, restaurantId: item.restaurant_id, title: item.title, description: item.description || '', terms: item.details?.terms || 'Conditions à confirmer auprès du restaurant.', badge: item.details?.badge || 'Offre', tag: item.details?.tag || '', image: item.image_url || fallbackImage(demoOffers, item.title, item.id, index => promoImage([74, 103, 132, 161, 190, 219][index])) })),
    events: content.filter(item => item.kind === 'event').map(item => ({ id: item.id, restaurantId: item.restaurant_id, title: item.title, description: item.description || '', day: item.details?.day || '—', month: item.details?.month || '', time: item.details?.time || '', place: item.details?.place || '', price: item.details?.price || '', image: item.image_url || fallbackImage(demoEvents, item.title, item.id, index => promoImage([74, 103, 132, 161, 190, 219][index])) })),
    games: content.filter(item => item.kind === 'game').map(item => ({ id: item.id, restaurantId: item.restaurant_id, title: item.title, description: item.description || '' })),
  }
}
