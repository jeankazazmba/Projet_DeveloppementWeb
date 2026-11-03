import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { initialClaims, initialEmployees, initialOrders, rights } from './managerData.js'
import ManagerIcon from './ManagerIcon.jsx'
import { ClaimsPage, DashboardPage, StatisticsPage, TeamPage } from './ManagerPages.jsx'
import './manager.css'

const logo = '/figma-manager/logo.svg'
const readSaved = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const navigation = [
  { key: 'dashboard', label: 'Supervision en direct', path: '/gerant', icon: 'dashboard' },
  { key: 'team', label: 'Équipe', path: '/gerant/equipe', icon: 'team' },
  { key: 'statistics', label: 'Statistiques', path: '/gerant/statistiques', icon: 'stats' },
  { key: 'claims', label: 'Réclamations', path: '/gerant/reclamations', icon: 'claims' },
]

function EmployeeDrawer({ employee, employees, onClose, onSave }) {
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
    if (!name.trim() || !email.includes('@') || phone.replace(/\D/g, '').length < 8) return setError('Renseignez un nom, un e-mail valide et un téléphone valide.')
    if (employees.some(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.id !== employee?.id)) return setError('Cette adresse e-mail est déjà utilisée dans la démo.')
    if (!permissions.length) return setError('Sélectionnez au moins un droit d’accès.')
    onSave({ id: employee?.id || `e-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), status, lastLogin: employee?.lastLogin || 'Jamais connecté', rights: permissions })
  }
  return <div className="manager-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="manager-drawer" role="dialog" aria-modal="true" aria-labelledby="manager-employee-title">
      <div className="manager-drawer-header"><div><h2 id="manager-employee-title">{isEditing ? 'Modifier un employé' : 'Nouvel employé'}</h2><p>Renseignez les informations et attribuez les permissions.</p></div><button type="button" className="manager-icon-button" onClick={onClose} aria-label="Fermer"><ManagerIcon name="close" /></button></div>
      <form onSubmit={submit} className="manager-drawer-form">
        <label>Nom complet <span>*</span><input ref={firstInput} value={name} onChange={event => setName(event.target.value)} placeholder="Patrick Mboma" required /></label>
        <label>Adresse e-mail <span>*</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="p.mboma@zeduc-space.cm" required /></label>
        <label>Téléphone <span>*</span><input type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="699 42 18 90" required /></label>
        {!isEditing && <label>Mot de passe temporaire <div className="manager-inline-field"><input type="text" value={password} onChange={event => setPassword(event.target.value)} placeholder="Générer un mot de passe" /><button type="button" className="manager-button ghost" onClick={generatePassword}>Générer</button></div><small>En mode démo, ce mot de passe n’est ni enregistré ni transmis.</small></label>}
        {isEditing && <label>Statut<select value={status} onChange={event => setStatus(event.target.value)}><option>Actif</option><option>Suspendu</option></select></label>}
        <div className="manager-form-section"><h3>Droits d’accès</h3><p>Sélectionnez les modules autorisés pour ce compte</p>{rights.map(right => <label key={right.key} className="manager-check-row"><input type="checkbox" checked={permissions.includes(right.key)} onChange={() => togglePermission(right.key)} /><span><strong>{right.title}</strong><small>{right.detail}</small></span></label>)}</div>
        {error && <p className="manager-form-error" role="alert">{error}</p>}
        <div className="manager-drawer-actions"><button type="button" className="manager-button ghost" onClick={onClose}>Annuler</button><button type="submit" className="manager-button primary">{isEditing ? 'Enregistrer' : 'Créer le compte démo'}</button></div>
      </form>
    </section>
  </div>
}

export default function ManagerApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const page = pathname.startsWith('/gerant/equipe') ? 'team' : pathname.startsWith('/gerant/statistiques') ? 'statistics' : pathname.startsWith('/gerant/reclamations') ? 'claims' : 'dashboard'
  const [employees, setEmployees] = useState(() => readSaved('mmm-manager-employees-v1', initialEmployees))
  const [claims, setClaims] = useState(() => readSaved('mmm-manager-claims-v1', initialClaims))
  const [orders] = useState(initialOrders)
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const drawerOpen = pathname === '/gerant/equipe/nouveau' || editor !== null
  const selectedEmployee = editor && editor !== 'new' ? employees.find(item => item.id === editor) : null
  useEffect(() => { localStorage.setItem('mmm-manager-employees-v1', JSON.stringify(employees)) }, [employees])
  useEffect(() => { localStorage.setItem('mmm-manager-claims-v1', JSON.stringify(claims)) }, [claims])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 4500); return () => window.clearTimeout(timer) }, [notice])
  const go = path => { navigate(path); setSidebarOpen(false) }
  const closeDrawer = () => { setEditor(null); if (pathname === '/gerant/equipe/nouveau') navigate('/gerant/equipe') }
  const saveEmployee = employee => {
    setEmployees(current => current.some(item => item.id === employee.id) ? current.map(item => item.id === employee.id ? employee : item) : [employee, ...current])
    setNotice(`${employee.name} ${selectedEmployee ? 'modifié' : 'ajouté'} dans la démo. Aucun compte réel n’a été créé.`)
    closeDrawer()
  }
  const decideClaim = (id, status, gesture, note) => {
    setClaims(current => current.map(claim => claim.id === id ? { ...claim, status, gesture, note } : claim))
    setNotice(`Réclamation ${id} ${status.toLowerCase()} dans la démo. Aucune réponse n’a été envoyée au client.`)
  }
  const openClaims = claims.filter(claim => claim.status === 'À valider').length
  return <div className="manager-app">
    <a className="manager-skip" href="#manager-main">Aller au contenu</a>
    <button type="button" className="manager-mobile-menu manager-icon-button" onClick={() => setSidebarOpen(current => !current)} aria-expanded={sidebarOpen} aria-label="Afficher la navigation"><ManagerIcon name="menu" /></button>
    {sidebarOpen && <button type="button" className="manager-sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Fermer la navigation" />}
    <aside className={`manager-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <Link to="/gerant" className="manager-brand" onClick={() => setSidebarOpen(false)}><img src={logo} alt="Mon Miam Miam" /><span><strong>MON MIAM MIAM</strong><small>ZEDUC-SP@CE · YANSOKI</small></span></Link>
      <div className="manager-role-tag">GÉRANT <span>●</span> EN DIRECT</div>
      <nav aria-label="Espace gérant" className="manager-nav">{navigation.map(item => <Link key={item.key} to={item.path} className={page === item.key ? 'active' : ''} aria-current={page === item.key ? 'page' : undefined} onClick={() => setSidebarOpen(false)}><ManagerIcon name={item.icon} /><span>{item.label}</span>{item.key === 'claims' && openClaims > 0 && <b>{openClaims}</b>}</Link>)}<span className="manager-nav-heading">AUTRES MODULES</span><span className="manager-nav-disabled" title="Maquette Gérant non fournie">Plan des tables <small>à venir</small></span><span className="manager-nav-disabled" title="Maquette Gérant non fournie">Menu & Stocks <small>à venir</small></span></nav>
      <div className="manager-sidebar-profile"><span className="manager-avatar">GE</span><span><strong>Gérant</strong><small>Direction.ZeDuc-Sp@ce</small></span></div>
    </aside>
    <div className="manager-shell"><header className="manager-topbar"><form onSubmit={event => { event.preventDefault(); if (page === 'statistics') go('/gerant') }} className="manager-global-search"><ManagerIcon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Rechercher" placeholder="Commande, employé, réclamation..." /></form><div className="manager-topbar-actions"><span className="manager-demo-chip" title="Données locales de démonstration">Démo locale</span><span className="manager-service-chip"><i /> Service en cours</span><button type="button" className="manager-icon-button" onClick={() => go('/gerant/reclamations')} aria-label={`${openClaims} réclamations à valider`}><ManagerIcon name="bell" />{openClaims > 0 && <b>{openClaims}</b>}</button><span className="manager-top-profile"><span className="manager-avatar">GE</span><span>Gérant</span></span></div></header>
      <main id="manager-main" className="manager-main">
        {page === 'dashboard' && <DashboardPage orders={orders} claims={claims} query={query} onNotice={setNotice} onNavigate={go} />}
        {page === 'team' && <TeamPage employees={employees} query={query} onAdd={() => go('/gerant/equipe/nouveau')} onEdit={employee => setEditor(employee.id)} />}
        {page === 'statistics' && <StatisticsPage onNotice={setNotice} />}
        {page === 'claims' && <ClaimsPage claims={claims} query={query} onDecide={decideClaim} />}
      </main>
      <footer className="manager-footer"><span>© Mon Miam Miam · ZeDuc-Sp@ce · Yansoki, Douala</span><Link to="/">Site public</Link><span>Maquettes Gérant · mode démo</span></footer>
    </div>
    {drawerOpen && <EmployeeDrawer key={selectedEmployee?.id || 'new'} employee={selectedEmployee} employees={employees} onClose={closeDrawer} onSave={saveEmployee} />}
    {notice && <div className="manager-toast" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fermer">×</button></div>}
  </div>
}
