import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRestaurants, saveRestaurants } from '../../data/restaurants.js'
import { getDemoAudit, getDemoInsights, getDemoUsers, recordDemoAudit, saveDemoUsers } from './platformDemo.js'
import { platformApiBase, platformRequest } from './platformApi.js'
import PlatformIcon from './PlatformIcon.jsx'
import { AccountsPanel, AuditPanel, OverviewPanel, RestaurantsPanel } from './PlatformPanels.jsx'
import { CatalogPanel, ComplaintsPanel, LoyaltyPanel, OrdersPanel } from './PlatformNetworkPanels.jsx'
import PlatformInvitationsPanel from './PlatformInvitationsPanel.jsx'
import PlatformProfilePanel from './PlatformProfilePanel.jsx'
import './platform.css'

const logo = '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png'
const nav = [
  { id: 'overview', label: 'Vue d’ensemble', icon: 'dashboard', group: 'Pilotage', description: 'Suivez l’activité de ZeDuc-Sp@ce et de ses restaurants.' },
  { id: 'restaurants', label: 'Restaurants', icon: 'restaurant', group: 'Pilotage', description: 'Créez et gérez les établissements de la plateforme.' },
  { id: 'accounts', label: 'Accès responsables', icon: 'team', group: 'Pilotage', description: 'Attribuez les accès des administrateurs de restaurant.' },
  { id: 'invitations', label: 'Admins plateforme', icon: 'team', group: 'Pilotage', description: 'Invitez les administrateurs de ZeDuc-Sp@ce.' },
  { id: 'catalog', label: 'Publications', icon: 'catalog', group: 'Supervision', description: 'Suivez les volumes de contenus publiés par établissement.' },
  { id: 'orders', label: 'Activité des commandes', icon: 'orders', group: 'Supervision', description: 'Comparez les volumes de commandes entre les restaurants.' },
  { id: 'complaints', label: 'Escalades', icon: 'claims', group: 'Supervision', description: 'Repérez les dossiers transmis à la plateforme.' },
  { id: 'loyalty', label: 'Programmes', icon: 'loyalty', group: 'Supervision', description: 'Consultez les totaux de fidélité et parrainage.' },
  { id: 'audit', label: 'Journal d’audit', icon: 'audit', group: 'Traçabilité', description: 'Retrouvez les actions sensibles effectuées sur la plateforme.' },
  { id: 'profile', label: 'Mon compte', icon: 'team', group: 'Compte', description: 'Consultez votre identité et sécurisez votre accès.' },
]
const emptyInsights = { summary: { orders: 0, order_volume_cdf: 0, escalated_complaints: 0, points_issued: 0, points_used: 0, referrals: 0, published_contents: 0 }, by_restaurant: [], complaints: [], trends: [], has_demo_rows: false }
const statusKey = restaurant => restaurant.status === 'Actif' || restaurant.status === 'Exemple' || restaurant.status === 'active' ? 'active' : restaurant.status === 'Suspendu' || restaurant.status === 'suspended' ? 'suspended' : 'draft'
const demoStatus = value => value === 'active' ? 'Actif' : value === 'suspended' ? 'Suspendu' : 'Brouillon'
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function PlatformAdminApp() {
  const [mode, setMode] = useState(null)
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invitationToken, setInvitationToken] = useState(() => window.location.hash.startsWith('#invitation=') ? window.location.hash.slice(12) : '')
  const [registration, setRegistration] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [tab, setTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [restaurantFilter, setRestaurantFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [users, setUsers] = useState([])
  const [audit, setAudit] = useState([])
  const [invitations, setInvitations] = useState([])
  const [invitationLink, setInvitationLink] = useState('')
  const [insights, setInsights] = useState(emptyInsights)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('mon-miam-miam-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' } })

  useEffect(() => { try { localStorage.setItem('mon-miam-miam-theme', theme) } catch { /* Le thème reste actif pour cette visite. */ } }, [theme])
  useEffect(() => { document.title = `${nav.find(item => item.id === tab)?.label || 'Plateforme'} · ZeDuc-Sp@ce` }, [tab])
  useEffect(() => {
    if (!sidebarOpen) return
    const close = event => { if (event.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [sidebarOpen])

  const refreshDemo = useCallback(() => {
    setRestaurants(getRestaurants())
    setUsers(getDemoUsers())
    setAudit(getDemoAudit().filter(item => !restaurantFilter || item.restaurant_id === restaurantFilter))
    setInvitations([])
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
      const [list, accounts, report, log, pendingInvitations] = await Promise.all([
        platformRequest('/platform/restaurants', session.token),
        platformRequest('/platform/users', session.token),
        platformRequest(`/platform/insights${query.size ? `?${query}` : ''}`, session.token),
        platformRequest(`/platform/audit${auditQuery}`, session.token),
        platformRequest('/platform/invitations', session.token),
      ])
      setRestaurants(list); setUsers(accounts); setInsights(report); setAudit(log); setInvitations(pendingInvitations)
    } catch (reason) {
      setRestaurants([]); setUsers([]); setInsights(emptyInsights); setAudit([]); setInvitations([])
      if (reason.status === 401 || reason.status === 403) { setSession(null); setMode(null) }
      setError(reason.message)
    }
    finally { setLoading(false) }
  }, [session, restaurantFilter, from, to])
  useEffect(() => {
    const timer = window.setTimeout(() => { if (mode === 'demo') refreshDemo(); else if (mode === 'connected') void refreshConnected() }, 0)
    return () => window.clearTimeout(timer)
  }, [mode, refreshDemo, refreshConnected])

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
  const register = async event => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await platformRequest('/platform/register', null, { method: 'POST', body: JSON.stringify({ ...registration, token: invitationToken }) })
      setSession(result); setMode('connected'); setInvitationToken(''); setRegistration({ name: '', email: '', password: '', password_confirmation: '' }); window.history.replaceState(null, '', '/plateforme')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  const logout = async () => {
    if (session) await platformRequest('/logout', session.token, { method: 'POST' }).catch(() => {})
    setMode(null); setSession(null); setRestaurants([]); setUsers([]); setInsights(emptyInsights); setAudit([]); setInvitations([]); setInvitationLink(''); setRestaurantFilter(''); setTab('overview'); setSidebarOpen(false)
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

  const createInvitation = async emailAddress => {
    setBusy(true); setError(''); setInvitationLink('')
    try {
      const result = await platformRequest('/platform/invitations', session.token, { method: 'POST', body: JSON.stringify({ email: emailAddress }) })
      setInvitationLink(`${window.location.origin}/plateforme#invitation=${result.token}`)
      await refreshConnected()
      setNotice('Invitation créée. Copiez le lien avant de quitter cette page.')
      return true
    } catch (reason) { setError(reason.message); return false }
    finally { setBusy(false) }
  }
  const revokeInvitation = id => mutate(
    () => platformRequest(`/platform/invitations/${id}`, session.token, { method: 'DELETE' }),
    () => {},
    'Invitation révoquée.',
  )
  const changePassword = async draft => {
    setBusy(true); setError(''); setNotice('')
    try {
      await platformRequest('/platform/me/password', session.token, { method: 'PUT', body: JSON.stringify(draft) })
      setNotice('Mot de passe modifié. Les autres sessions ont été déconnectées.')
      return true
    } catch (reason) { setError(reason.message); return false }
    finally { setBusy(false) }
  }

  const context = { restaurants, users, audit, insights, invitations, invitationLink, restaurantFilter, mode, busy, statusKey, onCreateRestaurant: createRestaurant, onUpdateRestaurant: updateRestaurant, onCreateUser: createUser, onAssignUser: assignUser, onRevokeUser: revokeUser, onSetUserActive: setUserActive, onInvite: createInvitation, onRevoke: revokeInvitation, onTab: setTab }
  const currentPage = nav.find(item => item.id === tab) || nav[0]
  const escalatedCount = insights.summary.escalated_complaints

  if (!mode) return <div className="platform-app" data-theme={theme}><main className="platform-gateway">
    <img src={logo} alt="Mon Miam Miam" />
    <span className="platform-kicker">ZEDUC-SP@CE · ADMINISTRATION</span>
    <h1>{invitationToken ? 'Créer votre compte plateforme' : 'Administration de la plateforme'}</h1>
    <p>{invitationToken ? 'Cette inscription nécessite une invitation émise par un administrateur de ZeDuc-Sp@ce.' : 'Connectez-vous avec un compte administrateur de plateforme pour gérer les établissements et leurs accès.'}</p>
    {invitationToken ? <form className="platform-login" onSubmit={register}>
      <label>Nom complet<input required autoComplete="name" value={registration.name} onChange={event => setRegistration({ ...registration, name: event.target.value })} /></label>
      <label>Adresse e-mail invitée<input type="email" required autoComplete="email" value={registration.email} onChange={event => setRegistration({ ...registration, email: event.target.value })} /></label>
      <label>Mot de passe<input type="password" minLength={12} required autoComplete="new-password" value={registration.password} onChange={event => setRegistration({ ...registration, password: event.target.value })} /></label>
      <label>Confirmer le mot de passe<input type="password" minLength={12} required autoComplete="new-password" value={registration.password_confirmation} onChange={event => setRegistration({ ...registration, password_confirmation: event.target.value })} /></label>
      <button className="platform-primary" disabled={busy || !platformApiBase}>Créer le compte</button>
    </form> : <>
      {platformApiBase && <form className="platform-login" onSubmit={login}>
        <label>Adresse e-mail<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
        <button className="platform-primary" disabled={busy}>Se connecter</button>
      </form>}
      <button className="platform-demo-entry" onClick={enterDemo}>Explorer la démonstration →</button>
    </>}
    {!platformApiBase && <p className="platform-note">API non configurée : renseignez VITE_API_URL pour la connexion réelle.</p>}
    {error && <p className="platform-error" role="alert">{error}</p>}
    <Link to="/acces">← Choisir un autre espace</Link>
  </main></div>

  return <div className="platform-app" data-theme={theme}>
    <a className="platform-skip" href="#platform-main">Aller au contenu</a>
    {sidebarOpen && <button className="platform-sidebar-shade" type="button" aria-label="Fermer la navigation" onClick={() => setSidebarOpen(false)} />}
    <aside id="platform-navigation" className={`platform-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
      <Link className="platform-brand" to="/"><img src={logo} alt="Mon Miam Miam" /><span>ZeDuc-Sp@ce</span></Link>
      <div className="platform-role"><span>ADMIN PLATEFORME</span><small>{mode === 'demo' ? 'Démonstration locale' : session?.user?.name}</small></div>
      <nav aria-label="Navigation plateforme">{nav.map((item, index) => <div key={item.id}>
        {(index === 0 || nav[index - 1].group !== item.group) && <p className="platform-nav-heading">{item.group}</p>}
        <button type="button" className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => { setTab(item.id); setSidebarOpen(false) }}><PlatformIcon name={item.icon} />{item.label}{item.id === 'complaints' && escalatedCount > 0 && <b className="platform-nav-count">{escalatedCount}</b>}</button>
      </div>)}</nav>
      <div className="platform-sidebar-bottom"><Link to="/acces">Choisir un autre rôle <PlatformIcon name="arrow" size={16} /></Link><button type="button" onClick={logout}><PlatformIcon name="logout" size={17} /> Quitter cet espace</button></div>
      <div className="platform-sidebar-profile"><span className="platform-avatar">AP</span><span><strong>Administration</strong><small>ZeDuc-Sp@ce</small></span></div>
    </aside>
    <div className="platform-workspace"><header className="platform-topbar">
      <button type="button" className="platform-mobile-menu" aria-label={sidebarOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'} aria-expanded={sidebarOpen} aria-controls="platform-navigation" onClick={() => setSidebarOpen(value => !value)}><PlatformIcon name={sidebarOpen ? 'close' : 'menu'} /></button>
      <div className="platform-top-context"><span className={`platform-live-dot ${mode === 'demo' ? 'is-demo' : ''}`} aria-hidden="true" />{mode === 'demo' ? 'Démonstration plateforme' : 'Administration connectée'}</div>
      <div className="platform-top-actions"><label>Restaurant<select value={restaurantFilter} onChange={event => setRestaurantFilter(event.target.value)}><option value="">Tous les restaurants</option>{restaurants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className="platform-mode" title={mode === 'demo' ? 'Données locales de démonstration' : 'Données du serveur'}>{mode === 'demo' ? 'Démo' : 'Connecté'}</span><button type="button" className="platform-theme" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'} aria-pressed={theme === 'light'}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span></button><button type="button" className="platform-notification" onClick={() => setTab('complaints')} aria-label={`Voir ${escalatedCount} réclamation${escalatedCount > 1 ? 's' : ''} escaladée${escalatedCount > 1 ? 's' : ''}`}><PlatformIcon name="bell" size={19} />{escalatedCount > 0 && <b>{escalatedCount}</b>}</button><span className="platform-top-profile"><span className="platform-avatar">AP</span><span>Admin</span></span></div>
    </header>
      <main id="platform-main" className="platform-main" tabIndex={-1}>
        <div className="platform-page-heading"><div><span className="platform-kicker">ZEDUC-SP@CE · {currentPage.group.toUpperCase()}</span><h1>{currentPage.label}</h1><p>{currentPage.description}</p></div>{tab === 'overview' && <button type="button" className="platform-primary" onClick={() => setTab('restaurants')}><PlatformIcon name="restaurant" size={18} /> Gérer les restaurants</button>}</div>
        <div className="platform-intro"><p>{mode === 'demo' ? 'Aperçu local : les comptes, commandes et chiffres ci-dessous ne sont pas synchronisés avec le serveur.' : insights.has_demo_rows ? 'Données serveur incluant des lignes de démonstration clairement marquées.' : 'Données serveur · accès réservé à l’administration plateforme.'}</p>{loading && <span>Actualisation…</span>}</div>{['overview', 'orders', 'complaints', 'loyalty'].includes(tab) && <div className="platform-period"><label>Du <input type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} /></label><label>Au <input type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} /></label>{(from || to) && <button onClick={() => { setFrom(''); setTo('') }}>Effacer les dates</button>}</div>}
        {error && <p className="platform-error" role="alert">{error}</p>}{notice && <p className="platform-notice" role="status">{notice}</p>}
        {tab === 'overview' && <OverviewPanel {...context} />}
        {tab === 'restaurants' && <RestaurantsPanel {...context} />}
        {tab === 'accounts' && <AccountsPanel {...context} />}
        {tab === 'invitations' && <PlatformInvitationsPanel {...context} />}
        {tab === 'catalog' && <CatalogPanel {...context} />}
        {tab === 'orders' && <OrdersPanel {...context} />}
        {tab === 'complaints' && <ComplaintsPanel {...context} />}
        {tab === 'loyalty' && <LoyaltyPanel {...context} />}
        {tab === 'audit' && <AuditPanel {...context} />}
        {tab === 'profile' && <PlatformProfilePanel user={session?.user} mode={mode} busy={busy} onPasswordChange={changePassword} />}
      </main><footer className="platform-footer">© ZeDuc-Sp@ce · Mon Miam Miam <span>{mode === 'demo' ? 'Mode démonstration' : 'Administration connectée'}</span></footer></div>
  </div>
}
