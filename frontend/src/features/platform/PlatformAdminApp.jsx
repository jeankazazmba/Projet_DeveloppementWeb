import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRestaurants, saveRestaurants } from '../../data/restaurants.js'
import { getDemoAudit, getDemoInsights, getDemoUsers, recordDemoAudit, saveDemoUsers } from './platformDemo.js'
import { platformApiBase, platformRequest } from './platformApi.js'
import { AccountsPanel, AuditPanel, CatalogPanel, ComplaintsPanel, LoyaltyPanel, OrdersPanel, OverviewPanel, RestaurantsPanel } from './PlatformPanels.jsx'
import './platform.css'

const logo = '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png'
const nav = [
  { id: 'overview', label: 'Vue d’ensemble', icon: '▦' },
  { id: 'restaurants', label: 'Restaurants', icon: '⌂' },
  { id: 'accounts', label: 'Comptes & accès', icon: '♙' },
  { id: 'catalog', label: 'Contenus publiés', icon: '▤' },
  { id: 'orders', label: 'Commandes', icon: '◫' },
  { id: 'complaints', label: 'Réclamations', icon: '◇' },
  { id: 'loyalty', label: 'Fidélité & parrainage', icon: '☆' },
  { id: 'audit', label: 'Journal d’audit', icon: '◷' },
]
const emptyInsights = { summary: { orders: 0, order_volume_cdf: 0, escalated_complaints: 0, points_issued: 0, points_used: 0, referrals: 0, published_contents: 0 }, by_restaurant: [], orders: [], complaints: [], loyalty: [], referrals: [], contents: [], has_demo_rows: false }
const statusKey = restaurant => restaurant.status === 'Actif' || restaurant.status === 'Exemple' || restaurant.status === 'active' ? 'active' : restaurant.status === 'Suspendu' || restaurant.status === 'suspended' ? 'suspended' : 'draft'
const demoStatus = value => value === 'active' ? 'Actif' : value === 'suspended' ? 'Suspendu' : 'Brouillon'
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function PlatformAdminApp() {
  const [mode, setMode] = useState(null)
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('overview')
  const [restaurantFilter, setRestaurantFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [users, setUsers] = useState([])
  const [audit, setAudit] = useState([])
  const [insights, setInsights] = useState(emptyInsights)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('mon-miam-miam-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' } })

  useEffect(() => { try { localStorage.setItem('mon-miam-miam-theme', theme) } catch { /* Le thème reste actif pour cette visite. */ } }, [theme])
  useEffect(() => { document.title = `${nav.find(item => item.id === tab)?.label || 'Plateforme'} · ZeDuc-Sp@ce` }, [tab])

  const refreshDemo = useCallback(() => {
    setRestaurants(getRestaurants())
    setUsers(getDemoUsers())
    setAudit(getDemoAudit().filter(item => !restaurantFilter || item.restaurant_id === restaurantFilter))
    setInsights(getDemoInsights({ restaurantId: restaurantFilter, from, to }))
  }, [restaurantFilter, from, to])
  const refreshConnected = useCallback(async () => {
    if (!session) return
    setLoading(true); setError('')
    try {
      const query = new URLSearchParams()
      if (restaurantFilter) query.set('restaurant_id', restaurantFilter)
      if (from) query.set('from', from)
      if (to) query.set('to', to)
      const auditQuery = restaurantFilter ? `?restaurant_id=${encodeURIComponent(restaurantFilter)}` : ''
      const [list, accounts, report, log] = await Promise.all([
        platformRequest('/platform/restaurants', session.token),
        platformRequest('/platform/users', session.token),
        platformRequest(`/platform/insights${query.size ? `?${query}` : ''}`, session.token),
        platformRequest(`/platform/audit${auditQuery}`, session.token),
      ])
      setRestaurants(list); setUsers(accounts); setInsights(report); setAudit(log)
    } catch (reason) {
      setRestaurants([]); setUsers([]); setInsights(emptyInsights); setAudit([])
      if (reason.status === 401 || reason.status === 403) { setSession(null); setMode(null) }
      setError(reason.message)
    }
    finally { setLoading(false) }
  }, [session, restaurantFilter, from, to])
  useEffect(() => { if (mode === 'demo') refreshDemo(); else if (mode === 'connected') void refreshConnected() }, [mode, refreshDemo, refreshConnected])

  const login = async event => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await platformRequest('/login', null, { method: 'POST', body: JSON.stringify({ email, password }) })
      if (!result.user?.is_platform_admin) {
        await platformRequest('/logout', result.token, { method: 'POST' }).catch(() => {})
        throw new Error('Ce compte n’a pas le rôle administrateur de plateforme.')
      }
      setSession(result); setMode('connected'); setPassword('')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  const enterDemo = () => { setError(''); setSession(null); setMode('demo'); setTab('overview') }
  const logout = async () => {
    if (session) await platformRequest('/logout', session.token, { method: 'POST' }).catch(() => {})
    setMode(null); setSession(null); setRestaurants([]); setUsers([]); setInsights(emptyInsights); setAudit([]); setRestaurantFilter(''); setTab('overview')
  }
  const mutate = async (connectedAction, demoAction, success) => {
    setBusy(true); setError(''); setNotice('')
    try {
      if (mode === 'connected') { await connectedAction(); await refreshConnected() }
      else { demoAction(); refreshDemo() }
      setNotice(success)
      return true
    } catch (reason) { setError(reason.message); return false }
    finally { setBusy(false) }
  }
  const createRestaurant = draft => {
    const id = slug(draft.name)
    if (!id) { setError('Renseignez un nom valide.'); return Promise.resolve(false) }
    return mutate(
      () => platformRequest('/platform/restaurants', session.token, { method: 'POST', body: JSON.stringify({ id, ...draft }) }),
      () => { if (restaurants.some(item => item.id === id)) throw new Error('Cet identifiant existe déjà.'); saveRestaurants([...restaurants, { id, ...draft, status: 'Brouillon', example: true }]); recordDemoAudit('restaurant.created', 'restaurant', id, id) },
      'Restaurant créé en brouillon.',
    )
  }
  const updateRestaurant = (id, draft, reason = '') => mutate(
    () => platformRequest(`/platform/restaurants/${encodeURIComponent(id)}`, session.token, { method: 'PATCH', body: JSON.stringify({ ...draft, reason }) }),
    () => { const next = restaurants.map(item => item.id === id ? { ...item, ...draft, status: draft.status ? demoStatus(draft.status) : item.status } : item); saveRestaurants(next); recordDemoAudit('restaurant.updated', 'restaurant', id, id, reason) },
    'Fiche du restaurant mise à jour.',
  )
  const createUser = draft => mutate(
    () => platformRequest('/platform/users', session.token, { method: 'POST', body: JSON.stringify({ name: draft.name, email: draft.email, password: draft.password, role: draft.role, restaurant_id: draft.restaurantId }) }),
    () => { if (users.some(item => item.email.toLowerCase() === draft.email.toLowerCase())) throw new Error('Cette adresse existe déjà.'); const id = `demo-u-${Date.now()}`; saveDemoUsers([...users, { id, name: draft.name, email: draft.email, is_active: true, restaurants: [{ id: draft.restaurantId, pivot: { role: draft.role } }] }]); recordDemoAudit('user.created', 'user', id, draft.restaurantId) },
    mode === 'demo' ? 'Compte ajouté à la démonstration. Aucun accès réel créé.' : 'Compte créé et affecté.',
  )
  const assignUser = (userId, restaurantId, role) => mutate(
    () => platformRequest(`/platform/restaurants/${encodeURIComponent(restaurantId)}/members/${encodeURIComponent(userId)}`, session.token, { method: 'PUT', body: JSON.stringify({ role }) }),
    () => { saveDemoUsers(users.map(user => user.id === userId ? { ...user, restaurants: [...user.restaurants.filter(item => item.id !== restaurantId), { id: restaurantId, pivot: { role } }] } : user)); recordDemoAudit('assignment.saved', 'user', userId, restaurantId) },
    'Affectation enregistrée.',
  )
  const revokeUser = (userId, restaurantId) => mutate(
    () => platformRequest(`/platform/restaurants/${encodeURIComponent(restaurantId)}/members/${encodeURIComponent(userId)}`, session.token, { method: 'DELETE' }),
    () => { saveDemoUsers(users.map(user => user.id === userId ? { ...user, restaurants: user.restaurants.filter(item => item.id !== restaurantId) } : user)); recordDemoAudit('assignment.revoked', 'user', userId, restaurantId) },
    'Affectation retirée.',
  )
  const setUserActive = (userId, isActive, reason) => mutate(
    () => platformRequest(`/platform/users/${encodeURIComponent(userId)}`, session.token, { method: 'PATCH', body: JSON.stringify({ is_active: isActive, reason }) }),
    () => { saveDemoUsers(users.map(user => user.id === userId ? { ...user, is_active: isActive } : user)); recordDemoAudit('user.status_changed', 'user', userId, null, reason) },
    isActive ? 'Compte réactivé.' : 'Compte suspendu.',
  )

  const context = { restaurants, users, audit, insights, restaurantFilter, mode, busy, statusKey, onCreateRestaurant: createRestaurant, onUpdateRestaurant: updateRestaurant, onCreateUser: createUser, onAssignUser: assignUser, onRevokeUser: revokeUser, onSetUserActive: setUserActive, onTab: setTab }

  if (!mode) return <div className="platform-app" data-theme={theme}><main className="platform-gateway"><img src={logo} alt="Mon Miam Miam" /><span className="platform-kicker">ZEDUC-SP@CE · ADMINISTRATION</span><h1>Administration de la plateforme</h1><p>Connectez-vous avec un compte administrateur de plateforme pour gérer les établissements et leurs accès.</p>{platformApiBase && <form className="platform-login" onSubmit={login}><label>Adresse e-mail<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label><label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label><button className="platform-primary" disabled={busy}>Se connecter</button></form>}{!platformApiBase && <p className="platform-note">API non configurée : renseignez VITE_API_URL pour la connexion réelle.</p>}<button className="platform-demo-entry" onClick={enterDemo}>Explorer la démonstration →</button>{error && <p className="platform-error" role="alert">{error}</p>}<Link to="/acces">← Choisir un autre espace</Link></main></div>

  return <div className="platform-app" data-theme={theme}>
    <a className="platform-skip" href="#platform-main">Aller au contenu</a>
    <aside className="platform-sidebar"><Link className="platform-brand" to="/"><img src={logo} alt="Mon Miam Miam" /><span>ZeDuc-Sp@ce<small>PLATEFORME</small></span></Link><div className="platform-role">ADMIN PLATEFORME <small>{mode === 'demo' ? 'Démonstration locale' : session?.user?.name}</small></div><nav aria-label="Navigation plateforme">{nav.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}><span className="platform-nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav><div className="platform-sidebar-bottom"><Link to="/admin">Administration restaurant ↗</Link><Link to="/catalogue-pro">Catalogue partagé ↗</Link><button onClick={logout}>Quitter cet espace</button></div></aside>
    <div className="platform-workspace"><header className="platform-topbar"><div><span className="platform-kicker">ESPACE ADMINISTRATEUR · ZEDUC-SP@CE</span><h1>{nav.find(item => item.id === tab)?.label}</h1></div><div className="platform-top-actions"><label>Restaurant<select value={restaurantFilter} onChange={event => setRestaurantFilter(event.target.value)}><option value="">Tous les restaurants</option>{restaurants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className="platform-mode" title={mode === 'demo' ? 'Données locales de démonstration' : 'Données du serveur'}>{mode === 'demo' ? 'DÉMO' : 'API'}</span><button className="platform-theme" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}>{theme === 'dark' ? '☀' : '☾'}</button></div></header>
      <main id="platform-main" className="platform-main"><div className="platform-intro"><p>{mode === 'demo' ? 'Aperçu local : les comptes, commandes et chiffres ci-dessous ne sont pas synchronisés avec le serveur.' : insights.has_demo_rows ? 'Données serveur incluant des lignes de démonstration clairement marquées.' : 'Données serveur · accès réservé à l’administration plateforme.'}</p>{loading && <span>Actualisation…</span>}</div>{['overview', 'orders', 'complaints', 'loyalty'].includes(tab) && <div className="platform-period"><label>Du <input type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} /></label><label>Au <input type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} /></label>{(from || to) && <button onClick={() => { setFrom(''); setTo('') }}>Effacer les dates</button>}</div>}
        {error && <p className="platform-error" role="alert">{error}</p>}{notice && <p className="platform-notice" role="status">{notice}</p>}
        {tab === 'overview' && <OverviewPanel {...context} />}
        {tab === 'restaurants' && <RestaurantsPanel {...context} />}
        {tab === 'accounts' && <AccountsPanel {...context} />}
        {tab === 'catalog' && <CatalogPanel {...context} />}
        {tab === 'orders' && <OrdersPanel {...context} />}
        {tab === 'complaints' && <ComplaintsPanel {...context} />}
        {tab === 'loyalty' && <LoyaltyPanel {...context} />}
        {tab === 'audit' && <AuditPanel {...context} />}
      </main><footer className="platform-footer">© ZeDuc-Sp@ce · Mon Miam Miam <span>{mode === 'demo' ? 'Mode démonstration' : 'Administration connectée'}</span></footer></div>
  </div>
}
