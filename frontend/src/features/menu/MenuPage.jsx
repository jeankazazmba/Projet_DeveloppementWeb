import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext.jsx'
import { money, products } from './catalog.js'

export function ProductCard({ product }) {
  const { changeQuantity } = useCart()
  return <article className="site-product"><img src={product.image} alt="" /><div><span className="site-eyebrow">{product.daily ? 'PLAT DU JOUR · ' : ''}{product.category}</span><h3><Link to={`/menu/${product.id}`}>{product.name}</Link></h3><p>{product.description}</p><div className="site-product-bottom"><strong>{money(product.price)}</strong><button disabled={!product.available} onClick={() => changeQuantity(product.id, 1)}>{product.available ? 'Ajouter au panier' : 'Indisponible'}</button></div></div></article>
}
export default function MenuPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tout')
  const filtered = products.filter((product) => (category === 'Tout' || product.category === category) && product.name.toLowerCase().includes(query.trim().toLowerCase()))
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">LA CARTE · ZEDUC-SP@CE</span><h1>Les saveurs de Yansoki</h1><p>Spécialités camerounaises, grillades au feu de bois et boissons artisanales.</p></div><div className="site-filters"><label>Rechercher un plat<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un plat ou une boisson…" /></label><label>Catégorie<select value={category} onChange={(event) => setCategory(event.target.value)}>{['Tout', 'Plats', 'Grillades', 'Boissons'].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="site-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>{filtered.length === 0 && <p className="site-card">Aucun plat ne correspond à cette recherche.</p>}</div>
}
export function ProductDetailPage() {
  const id = location.pathname.split('/').at(-1)
  const product = products.find((item) => item.id === id)
  const { changeQuantity } = useCart()
  if (!product) return <div className="site-container"><h1>Plat introuvable</h1><Link to="/menu">Retour au menu</Link></div>
  return <div className="site-container site-detail"><img src={product.image} alt="" /><div><span className="site-eyebrow">{product.category}</span><h1>{product.name}</h1><p>{product.description}</p><strong>{money(product.price)}</strong><p>{product.available ? 'Disponible actuellement' : 'Indisponible actuellement'}</p><button className="site-button" disabled={!product.available} onClick={() => changeQuantity(product.id, 1)}>Ajouter au panier</button></div></div>
}
