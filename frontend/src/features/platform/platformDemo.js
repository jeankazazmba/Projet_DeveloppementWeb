import { initialOrders } from '../admin/operations'
import { initialClaims } from '../admin/data'
import { sleepyOrders, sleepyClaims } from '../admin/sleepyData'
import { dishes, offers, events } from '../public/publicData.js'
import { getRestaurants, PRIMARY_RESTAURANT_ID, SECONDARY_RESTAURANT_ID } from '../../data/restaurants.js'

const USERS_KEY = 'mmm-platform-users-v1'
const AUDIT_KEY = 'mmm-platform-audit-v1'
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const assignment = (restaurantId, role) => ({ id: restaurantId, pivot: { role } })
const initialUsers = [
  { id: 'demo-u1', name: 'Marie T.', email: 'marie.t@zeduc-space.cd', is_active: true, restaurants: [assignment(PRIMARY_RESTAURANT_ID, 'employee')] },
  { id: 'demo-u2', name: 'Jean-Paul D.', email: 'jp.gerant@zeduc-space.cd', is_active: true, restaurants: [assignment(PRIMARY_RESTAURANT_ID, 'manager')] },
  { id: 'demo-u3', name: 'Patrick M.', email: 'patrick@sleepy-hollow.cd', is_active: true, restaurants: [assignment(SECONDARY_RESTAURANT_ID, 'employee')] },
  { id: 'demo-u4', name: 'Nadia L.', email: 'nadia@sleepy-hollow.cd', is_active: true, restaurants: [assignment(SECONDARY_RESTAURANT_ID, 'admin')] },
]

export const getDemoUsers = () => read(USERS_KEY, initialUsers)
export const saveDemoUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users))
export const getDemoAudit = () => read(AUDIT_KEY, [])
export function recordDemoAudit(action, targetType, targetId, restaurantId, reason = '') {
  const next = [{ id: `demo-log-${Date.now()}`, actor_name: 'Admin plateforme · démo', action, target_type: targetType, target_id: String(targetId), restaurant_id: restaurantId || null, reason, created_at: new Date().toISOString() }, ...getDemoAudit()].slice(0, 100)
  localStorage.setItem(AUDIT_KEY, JSON.stringify(next))
  return next
}

const demoOrders = [
  ...initialOrders.map(order => ({ ...order, restaurant_id: PRIMARY_RESTAURANT_ID, amount_cdf: order.amount, customer_name: order.customer, created_at: order.placedAt, is_demo: true })),
  ...sleepyOrders.map(order => ({ ...order, restaurant_id: SECONDARY_RESTAURANT_ID, amount_cdf: order.amount, customer_name: order.customer, created_at: order.placedAt, is_demo: true })),
]
const demoComplaints = [
  ...initialClaims.map(claim => ({ ...claim, restaurant_id: PRIMARY_RESTAURANT_ID, student_name: claim.student, order_id: claim.order, escalated: ['En attente', 'En examen'].includes(claim.status), created_at: new Date().toISOString(), is_demo: true })),
  ...sleepyClaims.map(claim => ({ ...claim, restaurant_id: SECONDARY_RESTAURANT_ID, student_name: claim.student, order_id: claim.order, escalated: true, created_at: new Date().toISOString(), is_demo: true })),
]
const demoLoyalty = [
  { id: 'lm-1', restaurant_id: PRIMARY_RESTAURANT_ID, points: 42, reason: 'Commande de démonstration', reference: 'MM-1048', created_at: new Date().toISOString(), is_demo: true },
  { id: 'lm-2', restaurant_id: PRIMARY_RESTAURANT_ID, points: -15, reason: 'Remise de démonstration', reference: 'MM-1045', created_at: new Date().toISOString(), is_demo: true },
  { id: 'lm-3', restaurant_id: SECONDARY_RESTAURANT_ID, points: 8, reason: 'Commande de démonstration', reference: 'SH-2001', created_at: new Date().toISOString(), is_demo: true },
]
const demoReferrals = [
  { id: 'rf-1', restaurant_id: PRIMARY_RESTAURANT_ID, status: 'en attente', rewarded_points: 0, created_at: new Date().toISOString(), is_demo: true },
  { id: 'rf-2', restaurant_id: SECONDARY_RESTAURANT_ID, status: 'validé', rewarded_points: 15, created_at: new Date().toISOString(), is_demo: true },
]
const demoContents = [
  ...dishes.map(item => ({ id: `dish-${item.id}`, restaurant_id: item.restaurantId, kind: 'dish', title: item.name, description: item.description, is_published: true })),
  ...offers.map(item => ({ id: `promotion-${item.title}`, restaurant_id: item.restaurantId, kind: 'promotion', title: item.title, description: item.description, is_published: true })),
  ...events.map(item => ({ id: `event-${item.title}`, restaurant_id: item.restaurantId, kind: 'event', title: item.title, description: item.description, is_published: true })),
  { id: 'game-khalifa', restaurant_id: PRIMARY_RESTAURANT_ID, kind: 'game', title: 'Roue gourmande', description: 'Jeu du restaurant.', is_published: true },
  { id: 'game-sleepy', restaurant_id: SECONDARY_RESTAURANT_ID, kind: 'game', title: 'Quiz du soir', description: 'Jeu du restaurant.', is_published: true },
]

export function getDemoInsights({ restaurantId = '', from = '', to = '' } = {}) {
  const filter = rows => rows.filter(row => (!restaurantId || row.restaurant_id === restaurantId) && (!from || row.created_at?.slice(0, 10) >= from) && (!to || row.created_at?.slice(0, 10) <= to))
  const orders = filter(demoOrders)
  const complaints = filter(demoComplaints).filter(item => item.escalated)
  const loyalty = filter(demoLoyalty)
  const referrals = filter(demoReferrals)
  const contents = demoContents.filter(item => !restaurantId || item.restaurant_id === restaurantId)
  const byRestaurant = getRestaurants().map(restaurant => ({ restaurant_id: restaurant.id, orders: orders.filter(item => item.restaurant_id === restaurant.id).length, order_volume_cdf: orders.filter(item => item.restaurant_id === restaurant.id && item.status !== 'Annulée').reduce((sum, item) => sum + item.amount_cdf, 0) }))
  return {
    summary: { orders: orders.length, order_volume_cdf: orders.filter(item => item.status !== 'Annulée').reduce((sum, item) => sum + item.amount_cdf, 0), escalated_complaints: complaints.length, points_issued: loyalty.filter(item => item.points > 0).reduce((sum, item) => sum + item.points, 0), points_used: -loyalty.filter(item => item.points < 0).reduce((sum, item) => sum + item.points, 0), referrals: referrals.length, published_contents: contents.filter(item => item.is_published).length },
    by_restaurant: byRestaurant, orders, complaints, loyalty, referrals, contents, has_demo_rows: true,
  }
}
