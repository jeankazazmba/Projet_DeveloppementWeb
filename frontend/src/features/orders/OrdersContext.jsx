import { useState } from 'react'
import { OrdersContext } from './ordersContext.js'

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])
  const addOrder = (details) => {
    const order = { ...details, id: `DEMO-${Date.now()}`, status: 'En attente', createdAt: new Date().toISOString(), comment: '' }
    setOrders((current) => [order, ...current])
    return order
  }
  const addComment = (id, comment) => setOrders((current) => current.map((order) => order.id === id ? { ...order, comment } : order))
  return <OrdersContext.Provider value={{ orders, addOrder, addComment }}>{children}</OrdersContext.Provider>
}
