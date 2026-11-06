import { initialDishes } from './data'

export type OrderStatus = 'Reçue' | 'En préparation' | 'Prête' | 'En livraison' | 'Terminée' | 'Annulée'
export type Service = 'Sur place' | 'Livraison'
export type PaymentMethod = 'Orange Money' | 'Airtel Money' | 'M-Pesa' | 'Espèces' | 'Carte bancaire'
export type Order = { id: string; customer: string; placedAt: string; service: Service; table: string | null; items: string[]; amount: number; payment: PaymentMethod; status: OrderStatus }
export type TableStatus = 'Libre' | 'Occupée' | 'Réservée' | 'Nettoyage'
export type RestaurantTable = { id: string; zone: string; seats: number; status: TableStatus; orderId: string | null }
export type Period = 'day' | 'week' | 'month'
export type ChartPoint = { label: string; value: number; count: number }

const hourlySales = [8000, 13000, 42000, 21000, 16000, 13000, 22000, 25000, 14500, 10000, 3000]
const hourlyCounts = [2, 4, 10, 8, 6, 4, 8, 8, 6, 5, 3]
const customers = ['Arsène K.', 'Clarisse M.', 'Brice K.', 'Éric T.', 'Mireille D.', 'Sarah M.', 'Boris K.', 'Aïcha B.', 'Patrick L.', 'Nadia F.']
const methods: PaymentMethod[] = ['Airtel Money', 'Airtel Money', 'Airtel Money', 'Orange Money', 'Orange Money', 'M-Pesa', 'M-Pesa', 'Espèces', 'Espèces', 'Carte bancaire']
const activeOnSiteIndexes = [56, 58, 59, 61, 63]
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

export const initialOrders: Order[] = hourlyCounts.flatMap((count, hourIndex) => {
  const before = hourlyCounts.slice(0, hourIndex).reduce((sum, value) => sum + value, 0)
  const base = Math.floor(hourlySales[hourIndex] / count / 50) * 50
  return Array.from({ length: count }, (_, offset) => {
    const index = before + offset
    const service: Service = (index * 37) % 64 < 37 ? 'Sur place' : 'Livraison'
    const status: OrderStatus = index >= 62 ? 'Reçue' : index >= 59 ? 'En préparation' : index >= 56 ? service === 'Sur place' ? 'Prête' : 'En livraison' : 'Terminée'
    const amount = offset === count - 1 ? hourlySales[hourIndex] - base * (count - 1) : base
    const dish = initialDishes[index % initialDishes.length]
    return {
      id: `MM-${String(1001 + index)}`,
      customer: customers[(index * 3) % customers.length],
      placedAt: `${today}T${String(11 + hourIndex).padStart(2, '0')}:${String(Math.round((offset + 1) * 58 / (count + 1))).padStart(2, '0')}:00`,
      service,
      table: service === 'Sur place' ? `T${String(index >= 56 ? activeOnSiteIndexes.indexOf(index) + 1 : index % 12 + 1).padStart(2, '0')}` : null,
      items: [dish.name],
      amount,
      payment: methods[index % methods.length],
      status,
    }
  })
})

export const initialTables: RestaurantTable[] = Array.from({ length: 12 }, (_, index) => {
  const status: TableStatus = index < 5 ? 'Occupée' : index < 8 ? 'Libre' : index < 10 ? 'Réservée' : 'Nettoyage'
  const activeOrder = initialOrders.findLast(order => order.table === `T${String(index + 1).padStart(2, '0')}` && order.status !== 'Terminée')
  return { id: `T${String(index + 1).padStart(2, '0')}`, zone: index < 8 ? 'Salle' : 'Terrasse', seats: index % 3 === 0 ? 6 : index % 3 === 1 ? 4 : 2, status, orderId: status === 'Occupée' ? activeOrder?.id ?? null : null }
})

export const totalRevenue = (orders: Order[]) => orders.filter(order => order.status !== 'Annulée').reduce((sum, order) => sum + order.amount, 0)
export const averageBasket = (orders: Order[]) => {
  const active = orders.filter(order => order.status !== 'Annulée')
  return active.length ? Math.round(totalRevenue(active) / active.length) : 0
}
export const pointsIssued = (orders: Order[]) => orders.filter(order => order.status === 'Terminée').reduce((sum, order) => sum + Math.floor(order.amount / 1000), 0)

export function paymentBreakdown(orders: Order[]) {
  const total = totalRevenue(orders)
  return (['Orange Money', 'Airtel Money', 'M-Pesa', 'Espèces', 'Carte bancaire'] as PaymentMethod[]).map(name => {
    const value = orders.filter(order => order.status !== 'Annulée' && order.payment === name).reduce((sum, order) => sum + order.amount, 0)
    return { name, value, percent: total ? Math.round(value / total * 100) : 0 }
  })
}

export function serviceBreakdown(orders: Order[]) {
  const active = orders.filter(order => order.status !== 'Annulée')
  return (['Sur place', 'Livraison'] as Service[]).map(name => ({ name, count: active.filter(order => order.service === name).length }))
}

export function salesSeries(orders: Order[], period: Period): ChartPoint[] {
  if (period === 'day') return Array.from({ length: 11 }, (_, index) => {
    const rows = orders.filter(order => order.status !== 'Annulée' && Number(order.placedAt.slice(11, 13)) === 11 + index)
    return { label: `${11 + index}h`, value: rows.reduce((sum, order) => sum + order.amount, 0), count: rows.length }
  })
  const days = period === 'week' ? 7 : 30
  const todayRevenue = totalRevenue(orders)
  return Array.from({ length: days }, (_, index) => {
    const offset = days - index - 1
    const factor = 0.62 + ((index * 17 + 11) % 29) / 50
    const value = offset === 0 ? todayRevenue : Math.round(todayRevenue * factor / 500) * 500
    return { label: offset ? `J-${offset}` : 'Auj.', value, count: offset ? Math.round(orders.length * factor) : orders.length }
  })
}

export function popularDishes(orders: Order[]) {
  const counts = new Map<string, number>()
  orders.filter(order => order.status !== 'Annulée').forEach(order => order.items.forEach(item => counts.set(item, (counts.get(item) ?? 0) + 1)))
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5)
}

export const nextStatus = (order: Order): OrderStatus | null => {
  if (order.status === 'Reçue') return 'En préparation'
  if (order.status === 'En préparation') return 'Prête'
  if (order.status === 'Prête') return order.service === 'Livraison' ? 'En livraison' : 'Terminée'
  if (order.status === 'En livraison') return 'Terminée'
  return null
}
