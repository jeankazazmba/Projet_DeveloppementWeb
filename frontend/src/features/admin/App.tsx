import { useEffect, useState } from 'react'
import { assets } from './design-assets'
import { initialClaims, initialDishes, initialEmployees, initialPromotions, initialSettings } from './data'
import type { Page } from './data'
import { Icon, Modal, SearchInput } from './components/ui'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Menu from './pages/Menu'
import Promotions from './pages/Promotions'
import Claims from './pages/Claims'
import Settings from './pages/Settings'
import Orders from './pages/Orders'
import Tables from './pages/Tables'
import Reports from './pages/Reports'
import DataReadiness from './pages/DataReadiness'
import { initialOrders, initialTables } from './operations'

const nav: { page: Page; label: string; icon: string }[] = [
  { page: 'dashboard', label: 'Tableau de bord', icon: assets.dashboard.imgIcon },
  { page: 'orders', label: 'Commandes', icon: assets.dashboard.imgIcon1 },
  { page: 'tables', label: 'Tables & Salle', icon: assets.dashboard.imgIcon2 },
  { page: 'menu', label: 'Menu & Stocks', icon: assets.dashboard.imgIcon3 },
  { page: 'reports', label: 'Rapports & Ventes', icon: assets.dashboard.imgIcon4 },
  { page: 'employees', label: 'Équipe & Shifts', icon: assets.dashboard.imgIcon5 },
  { page: 'promotions', label: 'Promotions & Événements', icon: assets.promotions.imgContainer2 },
  { page: 'claims', label: 'Réclamations', icon: assets.dashboard.imgIcon6 },
  { page: 'settings', label: 'Paramètres', icon: assets.dashboard.imgContainer },
  { page: 'data', label: 'Données & intégration', icon: assets.dashboard.imgIcon4 },
]
type Theme = 'dark' | 'light'
function readPage(): Page {
  const key = window.location.hash.replace('#/', '').split('?')[0]
  return nav.find(item => item.page === key)?.page ?? 'dashboard'
}
export default function App() {
  const [page, setPage] = useState<Page>(readPage)
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem('mon-miam-miam-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [employees, setEmployees] = useState(initialEmployees)
  const [dishes, setDishes] = useState(initialDishes)
  const [promotions, setPromotions] = useState(initialPromotions)
  const [claims, setClaims] = useState(initialClaims)
  const [settings, setSettings] = useState(initialSettings)
  const [orders, setOrders] = useState(initialOrders)
  const [tables, setTables] = useState(initialTables)
  const [sidebar, setSidebar] = useState(false)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [info, setInfo] = useState('')
  useEffect(() => {
    const sync = () => { setPage(readPage()); setSidebar(false); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  useEffect(() => { document.title = `${nav.find(n => n.page === page)?.label} · Mon Miam Miam` }, [page])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('mon-miam-miam-theme', theme) } catch { /* Le thème reste appliqué pour cette session. */ }
    return () => { delete document.documentElement.dataset.theme }
  }, [theme])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 5000); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => { if (!sidebar) return; const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebar(false) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [sidebar])
  const navigate = (next: Page) => { window.location.hash = `/${next}`; setSidebar(false) }
  const openClaims = claims.filter(c => ['En attente', 'En examen'].includes(c.status)).length
  return <div className="app-shell">
    <a className="skip-link" href="#main">Aller au contenu</a>
    {sidebar && <button className="sidebar-shade" aria-label="Fermer la navigation" onClick={() => setSidebar(false)} />}
    <aside id="navigation" className={`sidebar ${sidebar ? 'is-open' : ''}`}>
      <a href="#/dashboard" className="brand" aria-label="Mon Miam Miam — Tableau de bord"><img src={assets.dashboard.imgMonMiamMiamZeDucSpCe} alt="Mon Miam Miam ZeDuc-Sp@ce" /><span>KINSHASA • RDC</span></a>
      <div className="role-line"><span className="badge">ADMIN RESTAURANT</span><span className="live-label"><img src={assets.dashboard.imgEllipse} alt="" />Démo active</span></div>
      <p className="admin-restaurant-scope">Restaurant : <strong>ZeDuc-Sp@ce</strong></p>
      <nav aria-label="Navigation administrateur">
        {nav.map(item => <div key={item.page}>
          <a href={`#/${item.page}`} onClick={() => setSidebar(false)} className={`nav-link ${page === item.page ? 'active' : ''}`} aria-current={page === item.page ? 'page' : undefined}><Icon src={item.icon} /><span>{item.label}</span>{item.page === 'claims' && openClaims > 0 && <span className="nav-count">{openClaims}</span>}</a>
        </div>)}
      </nav>
      <div className="sidebar-bottom"><a className="admin-platform-link" href="/plateforme">Vue admin plateforme →</a><div className="user-card"><span className="avatar">AD</span><div><strong>Admin</strong><small>Admini.ZeDuc-Sp@ce</small></div></div><div className="support-links"><button onClick={() => setInfo('Les coordonnées du support technique seront configurées avec le backend.')}><Icon src={assets.dashboard.imgContainer1} />Support<br />Technique</button><button disabled title="Authentification à connecter au backend"><Icon src={assets.dashboard.imgContainer2} />Déconnexion</button></div></div>
    </aside>
    <div className="workspace"><header className="topbar"><button type="button" className="icon-button mobile-menu" aria-label="Ouvrir la navigation" aria-expanded={sidebar} aria-controls="navigation" onClick={() => setSidebar(!sidebar)}>☰</button><form onSubmit={e => { e.preventDefault(); navigate('menu') }}><SearchInput value={query} onChange={setQuery} placeholder="Rechercher un plat..." /></form><div className="topbar-right"><span className="admin-current-restaurant">ZeDuc-Sp@ce</span><span className="demo-label" title="Données locales issues des maquettes, réinitialisées au rechargement">Démo</span><span className="service-chip"><img src={assets.dashboard.imgEllipse} alt="" />Service démo</span><button type="button" className="theme-toggle" aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'} aria-pressed={theme === 'light'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span></button><button className="notification-button" aria-label={`Voir les ${openClaims} réclamations ouvertes`} onClick={() => navigate('claims')}><Icon src={assets.dashboard.imgIconBell} /></button><button className="profile-button" onClick={() => navigate('settings')}><span className="avatar">AD</span><span>Admin</span></button></div></header>
      <main id="main" tabIndex={-1} className={`main-content page-${page}`}>
        {page === 'dashboard' && <Dashboard navigate={navigate} openClaims={openClaims} orders={orders} />}
        {page === 'orders' && <Orders orders={orders} setOrders={setOrders} notify={setNotice} />}
        {page === 'tables' && <Tables tables={tables} setTables={setTables} orders={orders} notify={setNotice} />}
        {page === 'employees' && <Employees employees={employees} setEmployees={setEmployees} notify={setNotice} />}
        {page === 'menu' && <Menu dishes={dishes} setDishes={setDishes} query={query} setQuery={setQuery} notify={setNotice} />}
        {page === 'reports' && <Reports orders={orders} notify={setNotice} />}
        {page === 'promotions' && <Promotions promotions={promotions} setPromotions={setPromotions} notify={setNotice} />}
        {page === 'claims' && <Claims claims={claims} setClaims={setClaims} notify={setNotice} />}
        {page === 'settings' && <Settings settings={settings} setSettings={setSettings} notify={setNotice} />}
        {page === 'data' && <DataReadiness employees={employees.length} dishes={dishes.length} promotions={promotions.length} claims={claims.length} orders={orders.length} tables={tables.length} />}
      </main>
      <footer className="footer"><img src={assets.dashboard.imgMonMiamMiamZeDucSpCe} alt="" /><p>© 2026 Mon Miam Miam • ZeDuc-Sp@ce, Kinshasa • RDC</p><button onClick={() => setInfo('Les mentions légales et conditions de vente doivent être fournies par le restaurant.')}>Mentions<br />Légales & CGV</button><button onClick={() => setInfo('La politique de confidentialité sera ajoutée avant la mise en production.')}>Politique RGPD<br />Campus</button><button onClick={() => setInfo('Le numéro WhatsApp complet du restaurant reste à renseigner.')}>WhatsApp<br />Assistance (+243)</button></footer>
    </div>
    {notice && <div className="toast" role="status">{notice}<button aria-label="Fermer la notification" onClick={() => setNotice('')}>×</button></div>}
    {info && <Modal title="Information" onClose={() => setInfo('')}><p className="muted">{info}</p><div className="dialog-actions"><button className="button primary" onClick={() => setInfo('')}>Fermer</button></div></Modal>}
  </div>
}
