export const PLATFORM_NAME = 'ZeDuc-Sp@ce'
export const PRIMARY_RESTAURANT_ID = 'khalifa-food'
export const SECONDARY_RESTAURANT_ID = 'sleepy-hollow'

export const normalizeRestaurantId = id => id === 'zeduc' ? PRIMARY_RESTAURANT_ID : id === 'partenaire-demo' ? SECONDARY_RESTAURANT_ID : id

export const initialRestaurants = [
  {
    id: PRIMARY_RESTAURANT_ID,
    name: 'Khalifa_food',
    location: 'Kinshasa, RDC · adresse à confirmer',
    hours: 'Horaires de démonstration · 11h–21h',
    description: 'Cuisine généreuse et plats chauds pour les étudiants.',
    status: 'Actif',
    example: true,
  },
  {
    id: SECONDARY_RESTAURANT_ID,
    name: 'sleepy hollow',
    location: 'Kinshasa, RDC · adresse à confirmer',
    hours: 'Horaires de démonstration · 12h–22h',
    description: 'Pause gourmande, grillades et boissons fraîches.',
    status: 'Actif',
    example: true,
  },
]

const STORAGE_KEY = 'mmm-platform-restaurants-v1'
export function getRestaurants() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved) || !saved.length) return initialRestaurants
    const migrated = saved.map(item => {
      const id = normalizeRestaurantId(item.id)
      const demo = initialRestaurants.find(restaurant => restaurant.id === id)
      return demo ? { ...item, ...demo, id, status: item.id === id ? item.status : 'Actif' } : item
    })
    const unique = new Map(migrated.map(item => [item.id, item]))
    return [...initialRestaurants.filter(item => !unique.has(item.id)), ...unique.values()]
  } catch {
    return initialRestaurants
  }
}
export function getPublicRestaurants() {
  return getRestaurants().filter(item => item.status === 'Actif' || item.status === 'Exemple')
}
export function saveRestaurants(restaurants) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants))
  window.dispatchEvent(new Event('mmm:restaurants-changed'))
}
export function getRestaurant(id) {
  return getRestaurants().find(restaurant => restaurant.id === normalizeRestaurantId(id)) || getRestaurants()[0]
}
export function restaurantScopeKey(role) {
  return `mmm-active-restaurant-${role}`
}
