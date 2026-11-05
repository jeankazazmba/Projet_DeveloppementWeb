import { getRestaurants, PRIMARY_RESTAURANT_ID, SECONDARY_RESTAURANT_ID } from '../../data/restaurants.js'

const USERS_KEY = 'mmm-platform-users-v1'
const AUDIT_KEY = 'mmm-platform-audit-v1'
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const assignment = id => ({ id, pivot: { role: 'admin' } })
const initialUsers = [
  { id: 'demo-admin-khalifa', name: 'Responsable Khalifa', email: 'admin@khalifa-food.example', is_active: true, restaurants: [assignment(PRIMARY_RESTAURANT_ID)] },
  { id: 'demo-admin-sleepy', name: 'Responsable Sleepy', email: 'admin@sleepy-hollow.example', is_active: true, restaurants: [assignment(SECONDARY_RESTAURANT_ID)] },
  { id: 'demo-platform', name: 'Administration plateforme', email: 'plateforme@zeduc-space.example', is_active: true, is_platform_admin: true, restaurants: [] },
]

export const getDemoUsers = () => {
  const saved = read(USERS_KEY, initialUsers)
  return (Array.isArray(saved) ? saved : initialUsers).filter(user => user.is_platform_admin || user.restaurants?.some(item => item.pivot?.role === 'admin'))
}
export const saveDemoUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users))
export const getDemoAudit = () => read(AUDIT_KEY, []).filter(item => !item.action?.startsWith('content.'))
export function recordDemoAudit(action, targetType, targetId, restaurantId, reason = '') {
  const next = [{ id: `demo-log-${Date.now()}`, actor_name: 'Admin plateforme · démo', action, target_type: targetType, target_id: String(targetId), restaurant_id: restaurantId || null, reason, created_at: new Date().toISOString() }, ...getDemoAudit()].slice(0, 100)
  localStorage.setItem(AUDIT_KEY, JSON.stringify(next))
  return next
}

// Les exemples de supervision ne contiennent aucun dossier, commande ou solde individuel.
const sample = {
  [PRIMARY_RESTAURANT_ID]: { orders: 24, order_volume_cdf: 112000, escalated_complaints: 2, dishes: 9, promotions: 6, events: 3, games: 3, points_issued: 42, points_used: 15, referrals: 1 },
  [SECONDARY_RESTAURANT_ID]: { orders: 8, order_volume_cdf: 35000, escalated_complaints: 1, dishes: 4, promotions: 2, events: 1, games: 3, points_issued: 8, points_used: 0, referrals: 1 },
}
const sampleEscalations = [
  { id: 'ESC-K-01', restaurant_id: PRIMARY_RESTAURANT_ID, status: 'En attente', is_demo: true },
  { id: 'ESC-K-02', restaurant_id: PRIMARY_RESTAURANT_ID, status: 'En examen', is_demo: true },
  { id: 'ESC-S-01', restaurant_id: SECONDARY_RESTAURANT_ID, status: 'En attente', is_demo: true },
]
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0)

export function getDemoInsights({ restaurantId = '', from = '', to = '' } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  const inPeriod = (!from || from <= today) && (!to || to >= today)
  const byRestaurant = getRestaurants().filter(item => !restaurantId || item.id === restaurantId).map(item => {
    const values = sample[item.id] || {}
    const published = ['dishes', 'promotions', 'events', 'games'].reduce((total, key) => total + Number(values[key] || 0), 0)
    return {
      restaurant_id: item.id,
      orders: inPeriod ? values.orders || 0 : 0,
      order_volume_cdf: inPeriod ? values.order_volume_cdf || 0 : 0,
      escalated_complaints: inPeriod ? values.escalated_complaints || 0 : 0,
      dishes: values.dishes || 0,
      promotions: values.promotions || 0,
      events: values.events || 0,
      games: values.games || 0,
      published_contents: published,
      points_issued: inPeriod ? values.points_issued || 0 : 0,
      points_used: inPeriod ? values.points_used || 0 : 0,
      referrals: inPeriod ? values.referrals || 0 : 0,
    }
  })
  const complaints = inPeriod ? sampleEscalations.filter(item => !restaurantId || item.restaurant_id === restaurantId).map(item => ({ ...item, created_at: `${today}T12:00:00Z` })) : []
  return {
    summary: { orders: sum(byRestaurant, 'orders'), order_volume_cdf: sum(byRestaurant, 'order_volume_cdf'), escalated_complaints: sum(byRestaurant, 'escalated_complaints'), points_issued: sum(byRestaurant, 'points_issued'), points_used: sum(byRestaurant, 'points_used'), referrals: sum(byRestaurant, 'referrals'), published_contents: sum(byRestaurant, 'published_contents') },
    by_restaurant: byRestaurant,
    complaints,
    has_demo_rows: true,
  }
}
