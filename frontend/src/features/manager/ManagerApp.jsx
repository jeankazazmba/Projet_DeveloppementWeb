import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { initialDishes } from '../admin/data'
import { sleepyDishes } from '../admin/sleepyData'
import { initialClaims, initialEmployees, initialOrders, initialTables, rights, sleepyClaims, sleepyEmployees, sleepyOrders, sleepyTables, sleepyStats, sleepyPopularDishes, sleepyPreviewCouriers } from './managerData.js'
import ManagerIcon from './ManagerIcon.jsx'
import { ClaimsPage, DashboardPage, StatisticsPage, TeamPage } from './ManagerPages.jsx'
import { MenuStockPage, TablesPage } from './ManagerOperations.jsx'
import ManagerDeliveryMap from './ManagerDeliveryMap.jsx'
import { RestaurantScopeControl } from '../shared/RestaurantScope.jsx'
import { useRestaurantScope } from '../shared/useRestaurantScope.js'
import { useStaffConnection, StaffLogin, SyncBanner, staffApi, mapStaffOrder, mapStaffClaim } from '../shared/staffApi.jsx'
import '../shared/staffApi.css'
import './manager.css'
import './manager-admin-theme.css'

const logo = '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png'
const liveDot = '/assets/figma/dashboard-imgEllipse.svg'
const readSaved = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const navigation = [
  { key: 'dashboard', label: 'Supervision en direct', path: '/gerant', icon: '/assets/figma/dashboard-imgIcon.svg' },
  { key: 'team', label: 'Équipe', path: '/gerant/equipe', icon: '/assets/figma/dashboard-imgIcon5.svg' },
  { key: 'tables', label: 'Plan des tables', path: '/gerant/tables', icon: '/assets/figma/dashboard-imgIcon2.svg' },
  { key: 'delivery', label: 'Suivi des livreurs', path: '/gerant/livraisons', icon: null },
  { key: 'menu', label: 'Menu & Stocks', path: '/gerant/menu', icon: '/assets/figma/dashboard-imgIcon3.svg' },
  { key: 'statistics', label: 'Statistiques', path: '/gerant/statistiques', icon: '/assets/figma/dashboard-imgIcon4.svg' },
  { key: 'claims', label: 'Réclamations', path: '/gerant/reclamations', icon: '/assets/figma/dashboard-imgIcon6.svg' },
]

function EmployeeDrawer({ employee, employees, onClose, onSave, connected }) {
  const isEditing = Boolean(employee)
  const firstInput = useRef(null)
  const [name, setName] = useState(employee?.name || '')
  const [email, setEmail] = useState(employee?.email || '')
  const [phone, setPhone] = useState(employee?.phone || '')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(employee?.status || 'Actif')
  const [permissions, setPermissions] = useState(employee?.rights || ['orders'])
  const [error, setError] = useState('')
  useEffect(() => {
    firstInput.current?.focus()
    const escape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [onClose])
  const togglePermission = key => setPermissions(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key])
  const generatePassword = () => setPassword(`Miam${Math.random().toString(36).slice(2, 8)}!${Math.floor(Math.random() * 90 + 10)}`)
  const submit = event => {
    event.preventDefault()
    if (!name.trim() || !email.includes('@') || (!connected && phone.replace(/\D/g, '').length < 8)) return setError('Renseignez un nom, un e-mail valide et un téléphone valide.')
    if (employees.some(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.id !== employee?.id)) return setError('Cette adresse e-mail est déjà utilisée dans la démo.')
    if (!connected && !permissions.length) return setError('Sélectionnez au moins un droit d’accès.')
    if (connected && !isEditing && password.length < 12) return setError('Le mot de passe doit contenir au moins 12 caractères.')
    onSave({ id: employee?.id || `e-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password, status, lastLogin: employee?.lastLogin || 'Jamais connecté', rights: permissions })
  }
  return <div className="manager-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="manager-drawer" role="dialog" aria-modal="true" aria-labelledby="manager-employee-title">
      <div className="manager-drawer-header"><div><h2 id="manager-employee-title">{isEditing ? 'Modifier un employé' : 'Nouvel employé'}</h2><p>Renseignez les informations et attribuez les permissions.</p></div><button type="button" className="manager-icon-button" onClick={onClose} aria-label="Fermer"><ManagerIcon name="close" /></button></div>
      <form onSubmit={submit} className="manager-drawer-form">
        <label>Nom complet <span>*</span><input ref={firstInput} value={name} onChange={event => setName(event.target.value)} placeholder="Patrick Mboma" required /></label>
        <label>Adresse e-mail <span>*</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="p.mboma@zeduc-space.cd" required /></label>
        <label>Téléphone {!connected && <span>*</span>}<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="699 42 18 90" required={!connected} disabled={connected} /></label>
        {!isEditing && <label>Mot de passe temporaire <div className="manager-inline-field"><input type="text" value={password} onChange={event => setPassword(event.target.value)} placeholder="Générer un mot de passe" /><button type="button" className="manager-button ghost" onClick={generatePassword}>Générer</button></div><small>{connected ? 'Transmis au serveur pour créer le compte. À communiquer à l’employé de manière sécurisée.' : 'En mode démo, ce mot de passe n’est ni enregistré ni transmis.'}</small></label>}
        {isEditing && <label>Statut<select value={status} onChange={event => setStatus(event.target.value)}><option>Actif</option><option>Suspendu</option></select></label>}
        <div className="manager-form-section"><h3>Droits d’accès</h3><p>{connected ? 'Les droits fins ne sont pas modifiables par cette API.' : 'Sélectionnez les modules autorisés pour ce compte'}</p>{rights.map(right => <label key={right.key} className="manager-check-row"><input type="checkbox" checked={permissions.includes(right.key)} onChange={() => togglePermission(right.key)} disabled={connected} /><span><strong>{right.title}</strong><small>{right.detail}</small></span></label>)}</div>
        {error && <p className="manager-form-error" role="alert">{error}</p>}
        <div className="manager-drawer-actions"><button type="button" className="manager-button ghost" onClick={onClose}>Annuler</button><button type="submit" className="manager-button primary">{isEditing ? 'Enregistrer' : connected ? 'Créer sur le serveur' : 'Créer le compte démo'}</button></div>
      </form>
    </section>
  </div>
}

export default function ManagerApp() {
  const demoScope = useRestaurantScope('manager')
  const connection = useStaffConnection('manager')
  if (connection.mode === 'login') return <StaffLogin role="manager" connection={connection} />
  const scope = connection.mode === 'connected' ? {
    restaurantId: connection.restaurantId, setRestaurantId: connection.setRestaurantId,
    restaurant: connection.restaurants.find(item => item.id === connection.restaurantId) || connection.restaurants[0],
    allowedRestaurants: connection.restaurants,
  } : demoScope
  return <ManagerWorkspace key={`${connection.mode}-${scope.restaurantId}`} {...scope} connection={connection} />
}

function ManagerWorkspace({ restaurant, restaurantId, setRestaurantId, allowedRestaurants, connection }) {
  const connected = connection.mode === 'connected'
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const page = pathname.startsWith('/gerant/equipe') ? 'team' : pathname.startsWith('/gerant/tables') ? 'tables' : pathname.startsWith('/gerant/livraisons') ? 'delivery' : pathname.startsWith('/gerant/menu') ? 'menu' : pathname.startsWith('/gerant/statistiques') ? 'statistics' : pathname.startsWith('/gerant/reclamations') ? 'claims' : 'dashboard'
  const sleepy = restaurantId === 'sleepy-hollow'
  const storagePrefix = `mmm-manager-${restaurantId}`
  const [employees, setEmployees] = useState(() => connected ? [] : readSaved(`${storagePrefix}-employees-v1`, sleepy ? sleepyEmployees : initialEmployees))
  const [claims, setClaims] = useState(() => connected ? [] : readSaved(`${storagePrefix}-claims-v1`, sleepy ? sleepyClaims : initialClaims))
  const [orders, setOrders] = useState(connected ? [] : sleepy ? sleepyOrders : initialOrders)
  const [tables, setTables] = useState(() => connected ? [] : readSaved(`${storagePrefix}-tables-v1`, sleepy ? sleepyTables : initialTables))
  const [dishes, setDishes] = useState(() => connected ? [] : readSaved(`${storagePrefix}-dishes-v1`, sleepy ? sleepyDishes : initialDishes))
  const [statistics, setStatistics] = useState(null)
  const [couriers, setCouriers] = useState([])
  const [deliveryChoice, setDeliveryChoice] = useState({})
  const [sync, setSync] = useState({ loading: false, error: '', lastSync: null })
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mon-miam-miam-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
  })
  const drawerOpen = pathname === '/gerant/equipe/nouveau' || editor !== null
  const selectedEmployee = editor && editor !== 'new' ? employees.find(item => item.id === editor) : null
  useEffect(() => { if (!connected) localStorage.setItem(`${storagePrefix}-employees-v1`, JSON.stringify(employees)) }, [employees, storagePrefix, connected])
  useEffect(() => { if (!connected) localStorage.setItem(`${storagePrefix}-claims-v1`, JSON.stringify(claims)) }, [claims, storagePrefix, connected])
  useEffect(() => { if (!connected) localStorage.setItem(`${storagePrefix}-tables-v1`, JSON.stringify(tables)) }, [tables, storagePrefix, connected])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 4500); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => { try { localStorage.setItem('mon-miam-miam-theme', theme) } catch { /* Le thème reste actif pendant cette visite. */ } }, [theme])
  useEffect(() => { document.title = `${navigation.find(item => item.key === page)?.label} · Mon Miam Miam` }, [page])
  const refresh = async () => {
    if (!connected) return
    setSync(current => ({ ...current, loading: true, error: '' }))
    try {
      const base = `/staff/restaurants/${encodeURIComponent(restaurantId)}`
      const [remoteOrders, remoteClaims, members, remoteTables, content, report] = await Promise.all([
        staffApi(`${base}/orders?per_page=100`, connection.token), staffApi(`${base}/complaints?per_page=100`, connection.token),
        staffApi(`${base}/members?per_page=100`, connection.token), staffApi(`${base}/tables`, connection.token),
        staffApi(`${base}/content`, connection.token), staffApi(`${base}/statistics`, connection.token),
      ])
      setOrders((remoteOrders.data || []).map(item => ({ ...mapStaffOrder(item), employee: '—' })))
      setClaims((remoteClaims.data || []).map(item => ({ ...mapStaffClaim(item),
        status: ({ proposition_employe: 'À valider', validation_gerant: 'Validée', prise_en_charge: 'En cours' })[item.status] || mapStaffClaim(item).status,
        elapsed: new Date(item.created_at).toLocaleString('fr-CD'), item: '—',
        proposal: item.messages?.find(message => message.kind === 'employee_proposal')?.body || '—', proposedBy: 'Équipe', proposedAt: '—', gesture: 'Aucun geste' })))
      setEmployees((members.data || []).map(member => ({ id: member.id, name: member.name, email: member.email,
        phone: '—', status: member.is_active ? 'Actif' : 'Suspendu', lastLogin: '—', rights: ['orders', 'menu', 'claims'], version: member.version })))
      setTables(remoteTables.map(table => ({ id: table.code || `T${table.id}`, apiId: table.id, zone: table.zone || 'Salle',
        seats: table.capacity, status: table.is_active ? 'Libre' : 'Nettoyage', orderId: null, version: table.version })))
      setDishes(content.filter(item => item.kind === 'dish').map(item => ({ id: item.id, name: item.title, description: '',
        category: 'Plats', price: item.price_cdf || 0, available: Boolean(item.is_available), featured: Boolean(item.is_featured), image: item.image_url })))
      setStatistics(report)
      const deliveries = (remoteOrders.data || []).filter(item => item.service === 'delivery' && item.delivery_assignee_id)
      const positions = await Promise.all(deliveries.map(async order => {
        try { const tracking = await staffApi(`${base}/orders/${encodeURIComponent(order.id)}/tracking`, connection.token); return { order, position: tracking.position } }
        catch { return { order, position: null } }
      }))
      setCouriers(positions.filter(item => item.position).map(({ order, position }) => ({
        id: `${order.id}-${order.delivery_assignee_id}`,
        name: (members.data || []).find(member => member.id === order.delivery_assignee_id)?.name || 'Livreur affecté',
        status: 'En livraison', orderId: order.id, latitude: Number(position.latitude), longitude: Number(position.longitude),
        updatedAt: position.recorded_at,
      })))
      setSync({ loading: false, error: '', lastSync: new Date().toISOString() })
    } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })) }
  }
  useEffect(() => { if (!connected) return; let running = false; const tick = async () => { if (running || document.visibilityState !== 'visible') return; running = true; try { await refresh() } finally { running = false } }; void tick(); const timer = window.setInterval(tick, 5000); return () => window.clearInterval(timer) }, [connected, restaurantId, connection.token])
  const go = path => { navigate(path); setSidebarOpen(false) }
  const closeDrawer = () => { setEditor(null); if (pathname === '/gerant/equipe/nouveau') navigate('/gerant/equipe') }
  const saveEmployee = async employee => {
    if (connected) {
      setSync(current => ({ ...current, loading: true, error: '' }))
      try {
        const base = `/staff/restaurants/${encodeURIComponent(restaurantId)}/members`
        if (selectedEmployee) {
          if (employee.name !== selectedEmployee.name || employee.email !== selectedEmployee.email) throw new Error('Le nom et l’e-mail ne sont pas modifiables depuis ce formulaire connecté.')
          await staffApi(`${base}/${employee.id}/status`, connection.token, { method: 'PATCH', body: JSON.stringify({
            is_active: employee.status === 'Actif', reason: employee.status === 'Suspendu' ? 'Suspension par le gérant' : undefined,
            expected_version: selectedEmployee.version,
          }) })
        } else {
          if (!employee.password || employee.password.length < 12) throw new Error('Mot de passe temporaire de 12 caractères minimum requis.')
          await staffApi(base, connection.token, { method: 'POST', body: JSON.stringify({
            name: employee.name, email: employee.email, password: employee.password,
            password_confirmation: employee.password, role: 'employee',
          }) })
        }
        await refresh(); setNotice('Équipe mise à jour par le serveur.'); closeDrawer(); return
      } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })); return }
    }
    setEmployees(current => current.some(item => item.id === employee.id) ? current.map(item => item.id === employee.id ? employee : item) : [employee, ...current])
    setNotice(`${employee.name} ${selectedEmployee ? 'modifié' : 'ajouté'} dans la démo. Aucun compte réel n’a été créé.`)
    closeDrawer()
  }
  const decideClaim = async (id, status, note) => {
    if (connected) {
      const claim = claims.find(item => item.id === id)
      setSync(current => ({ ...current, loading: true, error: '' }))
      try {
        await staffApi(`/staff/complaints/${encodeURIComponent(id)}/status`, connection.token,
          { method: 'PATCH', body: JSON.stringify({ status: status === 'Validée' ? 'validation_gerant' : 'prise_en_charge',
            expected_version: claim.version, ...(status === 'Rejetée' ? { reason: note } : {}) }) })
        await refresh(); setNotice('Validation enregistrée par le serveur.'); return true
      } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })); return false }
    }
    setClaims(current => current.map(claim => claim.id === id ? { ...claim, status, note } : claim))
    setNotice(`Réclamation ${id} ${status.toLowerCase()} dans la démo. Aucune réponse n’a été envoyée au client.`)
  }
  const saveTable = table => {
    if (connected) { setSync(current => ({ ...current, error: 'Le statut manuel des tables n’a pas encore de route API. Utilisez les affectations de commande.' })); return }
    setTables(current => current.map(item => item.id === table.id ? table : item))
    setNotice(`Table ${table.id.slice(1)} mise à jour dans la démo. Aucun service distant n’a été modifié.`)
  }
  const assignDelivery = async order => {
    const employeeId = Number(deliveryChoice[order.id])
    if (!employeeId) { setSync(current => ({ ...current, error: 'Choisissez un employé affecté à ce restaurant.' })); return }
    setSync(current => ({ ...current, loading: true, error: '' }))
    try {
      await staffApi(`/staff/orders/${encodeURIComponent(order.id)}/delivery-assignment`, connection.token,
        { method: 'PUT', body: JSON.stringify({ employee_id: employeeId, expected_version: order.version }) })
      await refresh(); setNotice('Livreur affecté par le serveur.')
    } catch (error) { setSync(current => ({ ...current, loading: false, error: error.message })) }
  }
  const openClaims = claims.filter(claim => claim.status === 'À valider').length
  return <div className="manager-app" data-theme={theme}>
    <a className="manager-skip" href="#manager-main">Aller au contenu</a>
    <button type="button" className="manager-mobile-menu manager-icon-button" onClick={() => setSidebarOpen(current => !current)} aria-expanded={sidebarOpen} aria-label="Afficher la navigation"><ManagerIcon name="menu" /></button>
    {sidebarOpen && <button type="button" className="manager-sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Fermer la navigation" />}
    <aside className={`manager-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <Link to="/gerant" className="manager-brand" onClick={() => setSidebarOpen(false)} aria-label="Mon Miam Miam — espace gérant"><img src={logo} alt="Mon Miam Miam ZeDuc-Sp@ce" /><span>KINSHASA • RDC</span></Link>
      <div className="manager-role-line"><span className="manager-role-tag">GÉRANT</span><span className="manager-live-label"><img src={liveDot} alt="" />{connected ? 'Connecté' : 'Démo active'}</span></div>
      <nav aria-label="Espace gérant" className="manager-nav">{navigation.map(item => <Link key={item.key} to={item.path} className={page === item.key ? 'active' : ''} aria-current={page === item.key ? 'page' : undefined} onClick={() => setSidebarOpen(false)}>{item.icon ? <img className="manager-nav-icon" src={item.icon} alt="" /> : <ManagerIcon name="delivery" />}<span>{item.label}</span>{item.key === 'claims' && openClaims > 0 && <b>{openClaims}</b>}</Link>)}<Link to="/catalogue-pro" onClick={() => setSidebarOpen(false)}><ManagerIcon name="menu" /><span>Catalogue partagé</span></Link></nav>
      <div className="manager-sidebar-profile"><span className="manager-avatar">GE</span><span><strong>Gérant</strong><small>{restaurant.name}</small></span></div>
    </aside>
    <div className="manager-shell"><header className="manager-topbar"><form onSubmit={event => { event.preventDefault(); if (page === 'statistics') go('/gerant') }} className="manager-global-search"><img src="/assets/figma/dashboard-imgIconSearch.svg" alt="" /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Rechercher" placeholder="Commande, employé, réclamation..." /></form><RestaurantScopeControl restaurant={restaurant} restaurants={allowedRestaurants} onChange={setRestaurantId} /><div className="manager-topbar-actions"><span className="manager-demo-chip" title="Données du restaurant">{connected ? 'API' : 'Démo'}</span><span className="manager-service-chip"><img src={liveDot} alt="" /> {connected ? 'Service connecté' : 'Service démo'}</span><button type="button" className="manager-theme-toggle" aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'} aria-pressed={theme === 'light'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span></button><button type="button" className="manager-icon-button manager-notification-button" onClick={() => go('/gerant/reclamations')} aria-label={`${openClaims} réclamations à valider`}><img src="/assets/figma/dashboard-imgIconBell.svg" alt="" />{openClaims > 0 && <b>{openClaims}</b>}</button><span className="manager-top-profile"><span className="manager-avatar">GE</span><span>Gérant</span></span></div></header>
      <main id="manager-main" className="manager-main"><SyncBanner connected={connected} state={sync} onRefresh={connected ? refresh : undefined} />
        {page === 'dashboard' && <DashboardPage orders={orders} claims={claims} query={query} onNotice={setNotice} onNavigate={go} connected={connected} onRefresh={refresh} statsSource={connected ? { day: { revenue: statistics?.orders?.completed_volume_cdf || 0, sales: (statistics?.orders?.completed_daily || []).map(item => Number(item.orders)), labels: (statistics?.orders?.completed_daily || []).map(item => item.day.slice(5)) } } : sleepy ? sleepyStats : undefined} restaurantName={restaurant.name} />}
        {page === 'team' && <TeamPage employees={employees} query={query} onAdd={() => go('/gerant/equipe/nouveau')} onEdit={employee => setEditor(employee.id)} connected={connected} />}
        {page === 'tables' && <TablesPage tables={tables} orders={orders} query={query} onSave={saveTable} />}
        {page === 'delivery' && <><ManagerDeliveryMap couriers={connected ? couriers : sleepy ? sleepyPreviewCouriers : undefined} isDemo={!connected} />{connected && <section className="manager-panel"><div className="manager-panel-title"><div><h2>Affectations de livraison</h2><p>La position apparaît sur la carte lorsqu’un employé affecté la transmet.</p></div></div><div className="manager-table-scroll"><table className="manager-table"><thead><tr><th>COMMANDE</th><th>STATUT</th><th>LIVREUR</th><th>ACTION</th></tr></thead><tbody>{orders.filter(order => order.service === 'Livraison' && ['received', 'accepted', 'preparing', 'ready'].includes(order.rawStatus)).map(order => <tr key={order.id}><td>{order.id}</td><td>{order.status}</td><td><select aria-label={`Livreur de ${order.id}`} value={deliveryChoice[order.id] || order.deliveryAssigneeId || ''} onChange={event => setDeliveryChoice(current => ({ ...current, [order.id]: event.target.value }))}><option value="">Choisir un employé</option>{employees.filter(item => item.status === 'Actif').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td><td><button className="manager-button ghost" disabled={sync.loading} onClick={() => assignDelivery(order)}>Affecter sur le serveur</button></td></tr>)}</tbody></table></div></section>}</>}
        {page === 'menu' && <MenuStockPage dishes={dishes} query={query} />}
        {page === 'statistics' && (connected ? <section className="manager-panel"><div className="manager-panel-title"><h2>Statistiques · {restaurant.name}</h2></div><div className="manager-metrics"><article className="manager-metric"><span>COMMANDES SERVIES/LIVRÉES</span><strong>{statistics?.orders?.completed ?? '—'}</strong></article><article className="manager-metric"><span>VOLUME SERVI/LIVRÉ CDF</span><strong>{statistics?.orders?.completed_volume_cdf?.toLocaleString('fr-CD') ?? '—'}</strong></article><article className="manager-metric"><span>POINTS ÉMIS</span><strong>{statistics?.loyalty?.points_issued ?? '—'}</strong></article><article className="manager-metric"><span>PARRAINAGES</span><strong>{statistics?.referrals?.total ?? '—'}</strong></article></div><h3>Services terminés par jour</h3><div className="manager-table-scroll"><table className="manager-table"><thead><tr><th>JOUR</th><th>COMMANDES</th><th>VOLUME SERVI/LIVRÉ CDF</th></tr></thead><tbody>{(statistics?.orders?.completed_daily || []).map(item => <tr key={item.day}><td>{item.day}</td><td>{item.orders}</td><td>{Number(item.volume_cdf).toLocaleString('fr-CD')}</td></tr>)}</tbody></table></div></section> : <StatisticsPage onNotice={setNotice} statsSource={sleepy ? sleepyStats : undefined} dishes={sleepy ? sleepyPopularDishes : undefined} restaurantName={restaurant.name} />)}
        {page === 'claims' && <ClaimsPage claims={claims} query={query} onDecide={decideClaim} connected={connected} />}
      </main>
      <footer className="manager-footer"><img src={logo} alt="" /><span>© Mon Miam Miam · ZeDuc-Sp@ce, Kinshasa, RDC · adresse exacte à confirmer</span><Link to="/">Site public</Link><span>Mode démo</span></footer>
    </div>
    {drawerOpen && <EmployeeDrawer key={selectedEmployee?.id || 'new'} employee={selectedEmployee} employees={employees} onClose={closeDrawer} onSave={saveEmployee} connected={connected} />}
    {notice && <div className="manager-toast" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fermer">×</button></div>}
  </div>
}
