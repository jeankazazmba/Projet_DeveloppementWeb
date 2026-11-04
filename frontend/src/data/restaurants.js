export const PRIMARY_RESTAURANT_ID = 'zeduc'

export const initialRestaurants = [
  {
    id: PRIMARY_RESTAURANT_ID,
    name: 'ZeDuc-Sp@ce',
    location: 'Kinshasa, RDC · adresse exacte à confirmer',
    hours: 'Horaires à confirmer',
    description: 'Cuisine congolaise, terrasse et espace étudiant.',
    status: 'Actif',
    example: false,
  },
  {
    id: 'partenaire-demo',
    name: 'Restaurant partenaire (exemple)',
    location: 'Kinshasa, RDC · localisation à renseigner',
    hours: 'Horaires à renseigner',
    description: 'Fiche de démonstration pour préparer plusieurs établissements.',
    status: 'Exemple',
    example: true,
  },
]

const STORAGE_KEY = 'mmm-platform-restaurants-v1'
export function getRestaurants() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) && saved.length ? saved : initialRestaurants
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
  return getRestaurants().find(restaurant => restaurant.id === id) || getRestaurants()[0]
}
export function restaurantScopeKey(role) {
  return `mmm-active-restaurant-${role}`
}
