import { useState } from 'react'
import FontSizeControl from '../../components/ui/FontSizeControl.jsx'
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
          <section className="admin-welcome">
            <p className="admin-kicker">SPRINT 3 · PMEE-34</p>
            <h1>{activeSection === 'dashboard' ? 'Pilotage du restaurant' : sections.find(([id]) => id === activeSection)?.[1]}</h1>
            <p>Module administrateur en cours d’intégration. Les données affichées seront reliées aux API Laravel dès que leurs contrats seront disponibles.</p>
          </section>
          <section className="admin-empty-state" aria-live="polite">
            <h2>Écran à intégrer</h2>
            <p>Cette zone réserve le bon emplacement pour la maquette et les opérations d’administration du Sprint 3.</p>
          </section>
        </main>
      </div>
    </div>
  )
}
