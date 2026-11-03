import { useState } from 'react'
import FontSizeControl from '../../components/ui/FontSizeControl.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import AdminEmployeesPage from './pages/AdminEmployeesPage.jsx'
import AdminMenuPage from './pages/AdminMenuPage.jsx'
import AdminPromotionsPage from './pages/AdminPromotionsPage.jsx'
import AdminComplaintsPage from './pages/AdminComplaintsPage.jsx'
import AdminSettingsPage from './pages/AdminSettingsPage.jsx'
import { initialComplaints, initialDishes, initialEmployees, initialPromotions, initialSettings } from './mockData.js'
import './admin.css'

const sections = [
  ['dashboard', 'Tableau de bord'],
  ['employees', 'Comptes employés'],
  ['menu', 'Menu'],
  ['promotions', 'Promotions & événements'],
  ['complaints', 'Réclamations'],
  ['settings', 'Paramètres'],
]

export default function AdminApp() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [lightTheme, setLightTheme] = useState(false)
  const [employees, setEmployees] = useState(initialEmployees)
  const [dishes, setDishes] = useState(initialDishes)
  const [promotions, setPromotions] = useState(initialPromotions)
  const [complaints, setComplaints] = useState(initialComplaints)
  const [settings, setSettings] = useState(initialSettings)
  const openClaims = complaints.filter((claim) => ['En attente', 'En examen'].includes(claim.status)).length

  const screen = {
    dashboard: <AdminDashboardPage openClaims={openClaims} onNavigate={setActiveSection} />,
    employees: <AdminEmployeesPage employees={employees} setEmployees={setEmployees} />,
    menu: <AdminMenuPage dishes={dishes} setDishes={setDishes} />,
    promotions: <AdminPromotionsPage promotions={promotions} setPromotions={setPromotions} />,
    complaints: <AdminComplaintsPage complaints={complaints} setComplaints={setComplaints} />,
    settings: <AdminSettingsPage settings={settings} setSettings={setSettings} />,
  }[activeSection]

  return (
    <div className={`admin-shell ${lightTheme ? 'is-light' : ''}`}>
      <aside className="admin-sidebar">
        <a className="admin-brand" href="#admin-dashboard">Mon Miam Miam <span>ADMINISTRATION</span></a>
        <nav aria-label="Navigation administration">
          {sections.map(([id, label]) => (
            <button key={id} type="button" className={activeSection === id ? 'is-active' : ''} onClick={() => setActiveSection(id)}>{label}</button>
          ))}
        </nav>
      </aside>
      <div className="admin-workspace">
        <header className="admin-header">
          <div><p className="admin-kicker">ESPACE ADMINISTRATEUR · ZEDUC-SP@CE</p><strong>{sections.find(([id]) => id === activeSection)?.[1]}</strong></div>
          <div className="admin-header-actions">
            <FontSizeControl />
            <button type="button" className="admin-theme-button" onClick={() => setLightTheme((current) => !current)} aria-pressed={lightTheme}>{lightTheme ? 'Thème sombre' : 'Thème clair'}</button>
          </div>
        </header>
        <main className="admin-content" id="admin-dashboard">
          {screen}
        </main>
      </div>
    </div>
  )
}
