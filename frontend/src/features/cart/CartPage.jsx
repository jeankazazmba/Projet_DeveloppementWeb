import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { money } from '../menu/catalog.js'

export default function CartPage() {
  const { rows, total, changeQuantity } = useCart()
  const navigate = useNavigate()
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">VOTRE COMMANDE</span><h1>Mon panier</h1><p>Vérifiez vos plats avant de choisir le mode de service.</p></div>{rows.length ? <div className="site-split"><div className="site-stack">{rows.map((row) => <article className="site-cart-row site-card" key={row.id}><img src={row.image} alt="" /><div><h2>{row.name}</h2><p>{money(row.price)} l’unité</p><button onClick={() => changeQuantity(row.id, -1)} aria-label={`Retirer un ${row.name}`}>−</button><span>{row.quantity}</span><button onClick={() => changeQuantity(row.id, 1)} aria-label={`Ajouter un ${row.name}`}>+</button></div><strong>{money(row.price * row.quantity)}</strong></article>)}</div><aside className="site-card site-summary"><h2>Récapitulatif</h2><p>Sous-total <strong>{money(total)}</strong></p><p>Livraison <span>À confirmer selon l’adresse</span></p><button className="site-button" onClick={() => navigate('/checkout')}>Continuer</button></aside></div> : <div className="site-card"><h2>Votre panier est vide</h2><p>Découvrez les plats disponibles.</p><Link className="site-button" to="/menu">Voir le menu</Link></div>}</div>
}
