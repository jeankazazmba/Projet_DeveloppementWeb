import { useEffect, useState } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminApp from '../features/admin/AdminApp.jsx'
import ManagerApp from '../features/manager/ManagerApp.jsx'
import EmployeeApp from '../features/employee/EmployeeApp.jsx'

const logo = '/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png'
const roles = [
  { id: 'admin', name: 'Administrateur', short: 'AD', description: 'Piloter les commandes, le catalogue, les équipes et les rapports.', path: '/admin' },
  { id: 'manager', name: 'Gérant', short: 'GE', description: 'Suivre le service, les livreurs, les tables et les stocks.', path: '/gerant' },
  { id: 'employee', name: 'Employé', short: 'EM', description: 'Traiter les commandes, le menu et les réclamations.', path: '/employe' },
]

function Workspace({ role, onLeave }) {
  useEffect(() => {
    if (role.id === 'admin') window.location.hash = '/dashboard'
    return () => { if (role.id === 'admin') window.location.hash = '' }
  }, [role.id])

  return <div className="desktop-workspace">
    {role.id === 'admin' ? <AdminApp /> : <MemoryRouter key={role.id} initialEntries={[role.path]}>
      <Routes>
        <Route path="/gerant/*" element={<ManagerApp />} />
        <Route path="/employe/*" element={<EmployeeApp />} />
        <Route path="*" element={<div className="desktop-route-return"><p>Cette page appartient au site web.</p><button onClick={onLeave}>Revenir aux espaces</button></div>} />
      </Routes>
    </MemoryRouter>}
    <button className="desktop-switch" type="button" onClick={onLeave} aria-label="Changer d’espace">
      <span aria-hidden="true">↔</span> Changer d’espace
    </button>
  </div>
}

export default function DesktopApp() {
  const [stage, setStage] = useState('splash')
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (stage !== 'splash') return undefined
    const timer = window.setTimeout(() => setStage('roles'), 1800)
    return () => window.clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (stage === 'workspace') return undefined
    document.title = `${stage === 'login' ? 'Connexion' : 'Bienvenue'} · Mon Miam Miam Bureau`
    return undefined
  }, [stage])

  const chooseRole = selected => {
    setRole(selected)
    setEmail('')
    setPassword('')
    setStage('login')
  }
  const leave = () => {
    setRole(null)
    setEmail('')
    setPassword('')
    setStage('roles')
  }

  if (stage === 'workspace' && role) return <Workspace role={role} onLeave={leave} />

  return <div className={`desktop-gateway desktop-${stage}`}>
    <div className="desktop-glow desktop-glow-a" aria-hidden="true" />
    <div className="desktop-glow desktop-glow-b" aria-hidden="true" />
    {stage === 'splash' ? <main className="desktop-splash" aria-live="polite">
      <div className="desktop-logo-halo"><img src={logo} alt="Mon Miam Miam" /></div>
      <span className="desktop-kicker">ZeDuc-Sp@ce · Kinshasa</span>
      <h1>Mon Miam Miam</h1>
      <p>Votre espace de travail, au même endroit.</p>
      <div className="desktop-progress" aria-hidden="true"><span /></div>
      <button type="button" className="desktop-skip" onClick={() => setStage('roles')}>Passer l’introduction</button>
    </main> : <main className="desktop-gateway-main">
      <header className="desktop-gateway-header"><img src={logo} alt="" /><div><strong>Mon Miam Miam</strong><span>Application bureau</span></div></header>
      {stage === 'roles' ? <section className="desktop-panel" aria-labelledby="desktop-title">
        <span className="desktop-kicker">BIENVENUE DANS VOTRE ESPACE</span>
        <h1 id="desktop-title">Choisissez votre rôle</h1>
        <p>Retrouvez les outils adaptés à votre activité.</p>
        <div className="desktop-roles">{roles.map(item => <button key={item.id} className="desktop-role" type="button" onClick={() => chooseRole(item)}>
          <span className="desktop-role-icon" aria-hidden="true">{item.short}</span>
          <span className="desktop-role-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
          <span className="desktop-role-arrow" aria-hidden="true">→</span>
        </button>)}</div>
        <p className="desktop-note">L’espace étudiant est disponible dans l’application mobile.</p>
      </section> : <section className="desktop-panel desktop-login" aria-labelledby="desktop-title">
        <button className="desktop-back" type="button" onClick={leave}>← Choisir un autre rôle</button>
        <span className="desktop-role-icon desktop-login-icon" aria-hidden="true">{role.short}</span>
        <span className="desktop-kicker">ESPACE {role.name.toUpperCase()}</span>
        <h1 id="desktop-title">Connexion</h1>
        <p>Accédez à l’espace {role.name.toLowerCase()} Mon Miam Miam.</p>
        <form className="desktop-login-form" onSubmit={event => event.preventDefault()}>
          <label htmlFor="desktop-email">Adresse e-mail</label>
          <input id="desktop-email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="nom@exemple.cd" />
          <label htmlFor="desktop-password">Mot de passe</label>
          <input id="desktop-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Votre mot de passe" />
          <button className="desktop-primary" type="submit" disabled title="Connexion réelle en attente de l’API d’authentification">Se connecter</button>
        </form>
        <p className="desktop-auth-note" role="status">La connexion réelle sera activée avec l’API d’authentification. Aucun identifiant n’est encore vérifié.</p>
        <button className="desktop-demo" type="button" onClick={() => setStage('workspace')}>Explorer la démo {role.name.toLowerCase()} <span aria-hidden="true">→</span></button>
      </section>}
      <footer className="desktop-gateway-footer">© Mon Miam Miam · Kinshasa, RDC <span>Version bureau · Mode démo</span></footer>
    </main>}
  </div>
}
