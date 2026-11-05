import { useState } from 'react'

export default function PlatformProfilePanel({ user, mode, busy, onPasswordChange }) {
  const [draft, setDraft] = useState({ current_password: '', password: '', password_confirmation: '' })
  const submit = async event => {
    event.preventDefault()
    if (await onPasswordChange(draft)) setDraft({ current_password: '', password: '', password_confirmation: '' })
  }
  return <div className="platform-two-columns platform-list-layout">
    <section className="platform-card"><header className="platform-card-heading"><h2>Mon compte plateforme</h2></header><p className="platform-help">Cet accès supervise le réseau. Il n’ouvre pas les données internes des restaurants.</p><div className="platform-overview-list"><p><strong>{user?.name || 'Démonstration'}</strong><span>Nom</span></p><p><strong>{user?.email || 'Aucun compte connecté'}</strong><span>Adresse e-mail</span></p></div></section>
    <section className="platform-card"><header className="platform-card-heading"><h2>Modifier le mot de passe</h2></header>
      {mode === 'demo' ? <p className="platform-note">Un compte connecté est nécessaire pour modifier un mot de passe.</p> : <form className="platform-form" onSubmit={submit}>
        <label>Mot de passe actuel<input type="password" required autoComplete="current-password" value={draft.current_password} onChange={event => setDraft({ ...draft, current_password: event.target.value })} /></label>
        <label>Nouveau mot de passe<input type="password" required minLength={12} autoComplete="new-password" value={draft.password} onChange={event => setDraft({ ...draft, password: event.target.value })} /></label>
        <label>Confirmer le mot de passe<input type="password" required minLength={12} autoComplete="new-password" value={draft.password_confirmation} onChange={event => setDraft({ ...draft, password_confirmation: event.target.value })} /></label>
        <button className="platform-primary" disabled={busy}>Enregistrer</button>
      </form>}
    </section>
  </div>
}
