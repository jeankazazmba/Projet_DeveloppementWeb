import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import EmployeeIcon from './EmployeeIcon.jsx'
import { initialClaims, initialMenu, initialOrders, orderSteps } from './employeeData.js'
import { ClaimsPage, MenuPage, OrdersPage, StatisticsPage } from './EmployeePages.jsx'
import { RestaurantEmpty, RestaurantScopeControl } from '../shared/RestaurantScope.jsx'
import { useRestaurantScope } from '../shared/useRestaurantScope.js'
import './employee.css'

const logo = '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png'
const navigation = [
  { key: 'orders', path: '/employe/commandes', label: 'Commandes', icon: 'orders' },
  { key: 'menu', path: '/employe/menu', label: 'Menu', icon: 'menu' },
  { key: 'claims', path: '/employe/reclamations', label: 'Réclamations', icon: 'claims' },
  { key: 'stats', path: '/employe/statistiques', label: 'Statistiques', icon: 'stats' },
]

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key))
      return Array.isArray(saved) ? saved : initial
    } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* La démo reste utilisable sans stockage. */ } }, [key, value])
  return [value, setValue]
}

export default function EmployeeApp() {
  const scope = useRestaurantScope('employee')
  return <EmployeeWorkspace key={scope.restaurantId} {...scope} />
}

function EmployeeWorkspace({ restaurant, restaurantId, setRestaurantId, allowedRestaurants }) {
  const location = useLocation()
  const page = location.pathname.startsWith('/employe/menu') ? 'menu' : location.pathname.startsWith('/employe/reclamations') ? 'claims' : location.pathname.startsWith('/employe/statistiques') ? 'stats' : 'orders'
  const sample = restaurantId === 'zeduc'
  const prefix = sample ? 'mmm-employee' : `mmm-employee-${restaurantId}`
  const [orders, setOrders] = useStoredState(`${prefix}-orders-v1`, sample ? initialOrders : [])
  const [menu, setMenu] = useStoredState(`${prefix}-menu-v1`, sample ? initialMenu : [])
  const [claims, setClaims] = useStoredState(`${prefix}-claims-v1`, sample ? initialClaims : [])
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pending = claims.filter(claim => claim.status === 'À traiter' || claim.status === 'En cours').length
  const activeOrders = orders.filter(order => order.status !== 'Livrée').length

  useEffect(() => { document.title = `${navigation.find(item => item.key === page)?.label} · Espace employé · Mon Miam Miam` }, [page])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 4500); return () => window.clearTimeout(timer) }, [notice])

  const advanceOrder = id => {
    setOrders(current => current.map(order => {
      if (order.id !== id) return order
      const next = orderSteps[orderSteps.indexOf(order.status) + 1]
      return next ? { ...order, status: next } : order
    }))
    setNotice(`Commande ${id} mise à jour dans la démo locale.`)
  }
  const updateClaim = (id, fields) => setClaims(current => current.map(claim => claim.id === id ? { ...claim, ...fields } : claim))
  const saveMenu = draft => { setMenu(draft); setNotice('Menu du service enregistré dans ce navigateur. Aucun catalogue distant n’a été modifié.') }
  const renderLinks = () => navigation.map(item => <Link key={item.key} to={item.path} className={page === item.key ? 'active' : ''} aria-current={page === item.key ? 'page' : undefined} onClick={() => { setSidebarOpen(false); setQuery('') }}><EmployeeIcon name={item.icon} size={19} /><span>{item.label}</span>{item.key === 'orders' && activeOrders > 0 && <b>{activeOrders}</b>}{item.key === 'claims' && pending > 0 && <b>{pending}</b>}</Link>)

  return <div className="employee-app">
    <a className="employee-skip" href="#employee-main">Aller au contenu</a>
    {sidebarOpen && <button className="employee-sidebar-scrim" aria-label="Fermer la navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`employee-sidebar ${sidebarOpen ? 'open' : ''}`}><Link to="/employe" className="employee-brand" onClick={() => setSidebarOpen(false)}><img src={logo} alt="Mon Miam Miam" /><span>KINSHASA · RDC</span></Link><div className="employee-role"><strong>EMPLOYÉ</strong><small><i /> Démo locale</small></div><nav aria-label="Navigation employé">{renderLinks()}<Link to="/catalogue-pro" onClick={() => setSidebarOpen(false)}>Catalogue partagé</Link></nav><div className="employee-sidebar-bottom"><div className="employee-profile"><span>MT</span><div><strong>Marie T.</strong><small>Service du midi · Démo</small></div></div><Link to="/acces">Changer d’espace →</Link><Link to="/">Site public →</Link></div></aside>
    <div className="employee-shell"><header className="employee-topbar"><button className="employee-mobile-menu employee-icon-button" aria-label="Ouvrir la navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(current => !current)}><EmployeeIcon name="hamburger" size={21} /></button><Link to="/employe" className="employee-mobile-brand"><img src={logo} alt="Mon Miam Miam" /><span>Espace employé</span></Link>{page !== 'stats' && <label className="employee-global-search"><EmployeeIcon name="search" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={page === 'orders' ? 'Commande, client, plat…' : page === 'claims' ? 'Réclamation, étudiant…' : 'Rechercher un plat…'} aria-label="Rechercher dans cette page" /></label>}<RestaurantScopeControl restaurant={restaurant} restaurants={allowedRestaurants} onChange={setRestaurantId} /><div className="employee-top-actions"><span className="employee-service-chip"><i /> Service en cours</span><span className="employee-demo-chip">Démo</span><Link to="/employe/reclamations" className="employee-icon-button employee-alert" aria-label={`${pending} réclamations à traiter`} onClick={() => setQuery('')}><EmployeeIcon name="bell" />{pending > 0 && <b>{pending}</b>}</Link><span className="employee-top-profile"><b>MT</b><span>Marie T.<small>Employée</small></span></span></div></header>
      <main id="employee-main" className="employee-main">{page === 'orders' && <OrdersPage orders={orders} onAdvance={advanceOrder} query={query} onNotice={setNotice} />}{page === 'menu' && <MenuPage menu={menu} onSave={saveMenu} query={query} />}{page === 'claims' && <ClaimsPage claims={claims} onUpdate={updateClaim} query={query} onNotice={setNotice} />}{page === 'stats' && (sample ? <StatisticsPage /> : <RestaurantEmpty restaurant={restaurant} topic="Statistiques" />)}</main>
      <footer className="employee-footer"><span>Mon Miam Miam · ZeDuc-Sp@ce · Démo employé</span><Link to="/">Site public</Link></footer>
    </div>
    <nav className="employee-bottom-nav" aria-label="Navigation employé mobile">{renderLinks()}</nav>
    {notice && <div className="employee-toast" role="status">{notice}<button aria-label="Fermer la notification" onClick={() => setNotice('')}>×</button></div>}
  </div>
}
