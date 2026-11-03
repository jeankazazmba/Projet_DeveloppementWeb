import { useMemo, useState } from 'react'
import { products } from '../menu/catalog.js'
import { CartContext } from './cartContext.js'

export function CartProvider({ children }) {
  const [quantities, setQuantities] = useState({})
  const changeQuantity = (id, amount) => setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }))
  const rows = useMemo(() => products.filter((product) => quantities[product.id] > 0).map((product) => ({ ...product, quantity: quantities[product.id] })), [quantities])
  const total = rows.reduce((sum, row) => sum + row.price * row.quantity, 0)
  return <CartContext.Provider value={{ rows, total, count: rows.reduce((sum, row) => sum + row.quantity, 0), changeQuantity, clear: () => setQuantities({}) }}>{children}</CartContext.Provider>
}
