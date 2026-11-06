import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import EmployeeIcon from './EmployeeIcon.jsx'
import { initialClaims, initialMenu, initialOrders, orderSteps, sleepyClaims, sleepyMenu, sleepyOrders, sleepyWeeklyStats, sleepyTopDishes } from './employeeData.js'
import { ClaimsPage, MenuPage, OrdersPage, StatisticsPage } from './EmployeePages.jsx'
import { RestaurantScopeControl } from '../shared/RestaurantScope.jsx'
import { useRestaurantScope } from '../shared/useRestaurantScope.js'
import { useStaffConnection, StaffLogin, SyncBanner, staffApi, mapStaffOrder, mapStaffClaim } from '../shared/staffApi.jsx'
import '../shared/staffApi.css'
import './employee.css'
import './employee-admin-theme.css'

const logo = '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png'
const navigation = [
  { key: 'orders', path: '/employe/commandes', label: 'Commandes', icon: 'orders' },
  { key: 'menu', path: '/employe/menu', label: 'Menu', icon: 'menu' },
  { key: 'claims', path: '/employe/reclamations', label: 'Réclamations', icon: 'claims' },
  { key: 'stats', path: '/employe/statistiques', label: 'Statistiques', icon: 'stats' },
]

function useStoredState(key, initial, persist = true) {
  const [value, setValue] = useState(() => {
    if (!persist) return initial
    try {
      const saved = JSON.parse(localStorage.getItem(key))
      return Array.isArray(saved) ? saved : initial
    } catch { return initial }
  })
  useEffect(() => { if (persist) try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* La démo reste utilisable sans stockage. */ } }, [key, value, persist])
  return [value, setValue]
}

export default function EmployeeApp() {
  const demoScope = useRestaurantScope('employee')
  const connection = useStaffConnection('employee')
  if (connection.mode === 'login') return <StaffLogin role="employee" connection={connection} />
  const scope = connection.mode === 'connected' ? {
    restaurantId: connection.restaurantId, setRestaurantId: connection.setRestaurantId,
    restaurant: connection.restaurants.find(item => item.id === connection.restaurantId) || connection.restaurants[0],
    allowedRestaurants: connection.restaurants,
  } : demoScope
  return <EmployeeWorkspace key={`${connection.mode}-${scope.restaurantId}`} {...scope} connection={connection} />
}

function EmployeeWorkspace({ restaurant, restaurantId, setRestaurantId, allowedRestaurants, connection }) {
  const connected = connection.mode === 'connected'
  const location = useLocation()
  const page = location.pathname.startsWith('/employe/menu') ? 'menu' : location.pathname.startsWith('/employe/reclamations') ? 'claims' : location.pathname.startsWith('/employe/statistiques') ? 'stats' : 'orders'
  const sleepy = restaurantId === 'sleepy-hollow'
  const prefix = `mmm-employee-${restaurantId}`
  const [orders, setOrders] = useStoredState(`${prefix}-orders-v1`, connected ? [] : sleepy ? sleepyOrders : initialOrders, !connected)
  const [menu, setMenu] = useStoredState(`${prefix}-menu-v1`, connected ? [] : sleepy ? sleepyMenu : initialMenu, !connected)
  const [claims, setClaims] = useStoredState(`${prefix}-claims-v1`, connected ? [] : sleepy ? sleepyClaims : initialClaims, !connected)
  const [sync, setSync] = useState({ loading: false, error: '', lastSync: null })
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const knownOrderIds = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mon-miam-miam-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
  })
  const pending = claims.filter(claim => claim.status === 'À traiter' || claim.status === 'En cours').length
  const activeOrders = orders.filter(order => order.status !== 'Livrée').length

  useEffect(() => { document.title = `${navigation.find(item => item.key === page)?.label} · Espace employé · Mon Miam Miam` }, [page])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 4500); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => { try { localStorage.setItem('mon-miam-miam-theme', theme) } catch { /* Le thème reste actif pendant cette visite. */ } }, [theme])

  const refresh = async () => {
    if (!connected) return
    setSync(current => ({ ...current, loading: true, error: '' }))
    try {
      const base = `/staff/restaurants/${encodeURIComponent(restaurantId)}`
      const [remoteOrders, remoteContent, remoteClaims] = await Promise.all([
        staffApi(`${base}/orders?per_page=100`, connection.token), staffApi(`${base}/content`, connection.token),
        staffApi(`${base}/complaints?per_page=100`, connection.token),
      ])
      const incomingOrders = (remoteOrders.data || []).map(mapStaffOrder)
      if (knownOrderIds.current) {
        const fresh = incomingOrders.find(order => !knownOrderIds.current.has(order.id) && order.rawStatus === 'received')
        if (fresh) setNotice(`Nouvelle commande ${fresh.id} reçue dans ${restaurant.name}.`)
      }
      knownOrderIds.current = new Set(incomingOrders.map(order => order.id))
      setOrders(incomingOrders)
      setMenu(remoteContent.filter(item => item.kind === 'dish').map(item => ({ id: item.id, name: item.title,
        description: item.description || '', category: 'Plats', price: item.price_cdf || 0,
        available: Boolean(item.is_available), featured: Boolean(item.is_featured), image: item.image_url || '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png', version: item.version })))
      setClaims((remoteClaims.data || []).map(mapStaffClaim))
      setSync({ loading: false, error: '', lastSync: new Date().toISOString() })
    } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })) }
  }
  useEffect(() => {
    if (!connected) return
    let running = false
    const tick = async () => { if (running || document.visibilityState !== 'visible') return; running = true; try { await refresh() } finally { running = false } }
    void tick()
    const timer = window.setInterval(tick, 4000)
    return () => window.clearInterval(timer)
  }, [connection.token, restaurantId, connected])

  const advanceOrder = async id => {
    if (connected) {
      const order = orders.find(item => item.id === id)
      const next = ({ received: 'accepted', accepted: 'preparing', preparing: 'ready', ready: order?.service === 'Livraison' ? 'delivering' : 'served' })[order?.rawStatus]
      if (!next) return
      setSync(current => ({ ...current, loading: true, error: '' }))
      try {
        const saved = await staffApi(`/staff/orders/${encodeURIComponent(id)}/status`, connection.token,
          { method: 'PATCH', body: JSON.stringify({ status: next, expected_version: order.version }) })
        setOrders(current => current.map(item => item.id === id ? mapStaffOrder(saved) : item))
        setSync({ loading: false, error: '', lastSync: new Date().toISOString() })
      } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })) }
      return
    }
    setOrders(current => current.map(order => {
      if (order.id !== id) return order
      const next = orderSteps[orderSteps.indexOf(order.status) + 1]
      return next ? { ...order, status: next } : order
    }))
    setNotice(`Commande ${id} mise à jour dans la démo locale.`)
  }
  const updateClaim = async (id, fields) => {
    if (!connected) { setClaims(current => current.map(claim => claim.id === id ? { ...claim, ...fields } : claim)); return true }
    const claim = claims.find(item => item.id === id)
    const status = fields.status === 'En cours' ? 'prise_en_charge' : fields.status === 'Envoyée au gérant' ? 'proposition_employe' : null
    if (!claim || !status) return false
    setSync(current => ({ ...current, loading: true, error: '' }))
    try {
      const saved = await staffApi(`/staff/complaints/${encodeURIComponent(id)}/status`, connection.token,
        { method: 'PATCH', body: JSON.stringify({ status, expected_version: claim.version, ...(fields.response ? { body: fields.response } : {}) }) })
      setClaims(current => current.map(item => item.id === id ? mapStaffClaim(saved) : item))
      setSync({ loading: false, error: '', lastSync: new Date().toISOString() })
      return true
    } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })); return false }
  }
  const saveMenu = async draft => {
    if (!connected) { setMenu(draft); setNotice('Menu du service enregistré dans ce navigateur. Aucun catalogue distant n’a été modifié.'); return true }
    setSync(current => ({ ...current, loading: true, error: '' }))
    try {
      for (const item of draft) {
        const previous = menu.find(entry => entry.id === item.id)
        if (!previous) continue
        const fields = {}
        if (item.available !== previous.available) fields.is_available = item.available
        if (item.featured && !previous.featured) fields.is_featured = true
        if (Object.keys(fields).length) await staffApi(`/staff/restaurants/${encodeURIComponent(restaurantId)}/content/${item.id}/service`, connection.token,
          { method: 'PATCH', body: JSON.stringify({ ...fields, expected_version: previous.version }) })
      }
      await refresh(); setNotice('Disponibilités enregistrées par le serveur.'); return true
    } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })); return false }
  }
  const renderLinks = () => navigation.map(item => <Link key={item.key} to={item.path} className={page === item.key ? 'active' : ''} aria-current={page === item.key ? 'page' : undefined} onClick={() => { setSidebarOpen(false); setQuery('') }}><EmployeeIcon name={item.icon} size={19} /><span>{item.label}</span>{item.key === 'orders' && activeOrders > 0 && <b>{activeOrders}</b>}{item.key === 'claims' && pending > 0 && <b>{pending}</b>}</Link>)

  return <div className="employee-app" data-theme={theme}>
    <a className="employee-skip" href="#employee-main">Aller au contenu</a>
    {sidebarOpen && <button className="employee-sidebar-scrim" aria-label="Fermer la navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`employee-sidebar ${sidebarOpen ? 'open' : ''}`}><Link to="/employe" className="employee-brand" onClick={() => setSidebarOpen(false)}><img src={logo} alt="Mon Miam Miam" /><span>KINSHASA · RDC</span></Link><div className="employee-role"><strong>EMPLOYÉ</strong><small><i /> {connected ? 'Connecté' : 'Démo locale'}</small></div><nav aria-label="Navigation employé">{renderLinks()}<Link to="/catalogue-pro" onClick={() => setSidebarOpen(false)}>Catalogue partagé</Link></nav><div className="employee-sidebar-bottom"><div className="employee-profile"><span>MT</span><div><strong>{connected ? connection.profile?.name : 'Marie T.'}</strong><small>{connected ? 'Compte connecté' : 'Service du midi · Démo'}</small></div></div><Link to="/acces">Changer d’espace →</Link><Link to="/">Site public →</Link></div></aside>
    <div className="employee-shell"><header className="employee-topbar"><button className="employee-mobile-menu employee-icon-button" aria-label="Ouvrir la navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(current => !current)}><EmployeeIcon name="hamburger" size={21} /></button><Link to="/employe" className="employee-mobile-brand"><img src={logo} alt="Mon Miam Miam" /><span>Espace employé</span></Link>{page !== 'stats' && <label className="employee-global-search"><EmployeeIcon name="search" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={page === 'orders' ? 'Commande, client, plat…' : page === 'claims' ? 'Réclamation, étudiant…' : 'Rechercher un plat…'} aria-label="Rechercher dans cette page" /></label>}<RestaurantScopeControl restaurant={restaurant} restaurants={allowedRestaurants} onChange={setRestaurantId} /><div className="employee-top-actions"><span className="employee-service-chip"><i /> Service en cours</span><span className="employee-demo-chip">{connected ? 'API' : 'Démo'}</span><button type="button" className="employee-theme-toggle" aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'} aria-pressed={theme === 'light'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span></button><Link to="/employe/reclamations" className="employee-icon-button employee-alert" aria-label={`${pending} réclamations à traiter`} onClick={() => setQuery('')}><EmployeeIcon name="bell" />{pending > 0 && <b>{pending}</b>}</Link><span className="employee-top-profile"><b>{connected ? connection.profile?.name?.split(' ').map(part => part[0]).slice(0, 2).join('') : 'MT'}</b><span>{connected ? connection.profile?.name : 'Marie T.'}<small>Employée</small></span></span></div></header>
      <main id="employee-main" className="employee-main"><SyncBanner connected={connected} state={sync} onRefresh={connected ? refresh : undefined} />{page === 'orders' && <OrdersPage restaurantName={restaurant.name} orders={orders} onAdvance={advanceOrder} query={query} onNotice={setNotice} connected={connected} onRefresh={refresh} />}{page === 'menu' && <MenuPage key={`${restaurantId}-${sync.lastSync || 'start'}`} restaurantName={restaurant.name} menu={menu} onSave={saveMenu} query={query} connected={connected} />}{page === 'claims' && <ClaimsPage restaurantName={restaurant.name} claims={claims} onUpdate={updateClaim} query={query} onNotice={setNotice} connected={connected} onRefresh={refresh} />}{page === 'stats' && (connected ? <div className="employee-panel">Statistiques détaillées réservées au gérant et à l’administrateur du restaurant.</div> : <StatisticsPage restaurantName={restaurant.name} weeks={sleepy ? sleepyWeeklyStats : undefined} dishes={sleepy ? sleepyTopDishes : undefined} />)}</main>
      <footer className="employee-footer"><span>Mon Miam Miam · {restaurant.name} · {connected ? 'Connecté' : 'Démo employé'}</span><Link to="/">Site public</Link></footer>
    </div>
    <nav className="employee-bottom-nav" aria-label="Navigation employé mobile">{renderLinks()}</nav>
    {notice && <div className="employee-toast" role="status">{notice}<button aria-label="Fermer la notification" onClick={() => setNotice('')}>×</button></div>}
  </div>
}
