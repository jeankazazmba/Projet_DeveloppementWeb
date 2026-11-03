import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../../features/cart/CartContext.jsx'
import { useDemoSession } from '../../features/auth/DemoSession.jsx'
import '../public.css'

export default function PublicLayout() {
  const { count } = useCart()
  const { user, signOut } = useDemoSession()
  return <div className="site-shell">
    <header className="site-header"><Link className="site-brand" to="/">Mon Miam Miam<small>ZeDuc-Sp@ce · Yansoki</small></Link><nav aria-label="Navigation principale"><NavLink to="/">Accueil</NavLink><NavLink to="/menu">Menu</NavLink><NavLink to="/promotions">Promotions</NavLink><NavLink to="/events">Événements</NavLink><NavLink to="/cart">Panier ({count})</NavLink>{user && <NavLink to="/account">Mon espace</NavLink>}</nav><div>{user ? <button onClick={signOut}>Déconnexion</button> : <Link className="site-pill" to="/login">Connexion</Link>}</div></header>
    <main id="site-main"><Outlet /></main>
    <footer className="site-footer"><strong>Mon Miam Miam</strong><p>ZeDuc-Sp@ce · Résidence La Terrasse, Yansoki, Douala</p><div><Link to="/menu">La carte</Link><Link to="/promotions">Promotions</Link><Link to="/events">Événements</Link></div><small>Les contenus et prix affichés ici servent à la démonstration et attendent l’API du restaurant.</small></footer>
  </div>
}
