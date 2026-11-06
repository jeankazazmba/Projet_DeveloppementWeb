import { useState } from 'react'

const formatDate = value => new Intl.DateTimeFormat('fr-CD', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kinshasa' }).format(new Date(value))

export default function PlatformInvitationsPanel({ invitations, invitationLink, onInvite, onRevoke, busy, mode }) {
  const [email, setEmail] = useState('')
  const [pendingRevoke, setPendingRevoke] = useState(null)
  const invite = async event => {
    event.preventDefault()
    if (await onInvite(email)) setEmail('')
  }
  return <div className="platform-two-columns platform-list-layout">
    <section className="platform-card"><header className="platform-card-heading"><h2>Invitations en attente</h2></header>
      <p className="platform-help">Une invitation donne le rôle administrateur de ZeDuc-Sp@ce. Elle expire après 48 heures et ne peut servir qu’une fois.</p>
      {mode === 'demo' ? <p className="platform-note">Les invitations sont disponibles seulement avec une API connectée.</p> : <div className="platform-restaurant-list">{invitations.map(item => <article className="platform-restaurant-row" key={item.id}><div><strong>{item.email}</strong><small>Expire le {formatDate(item.expires_at)}</small></div>{pendingRevoke === item.id ? <div className="platform-inline-actions"><button className="platform-danger" disabled={busy} onClick={async () => { if (await onRevoke(item.id)) setPendingRevoke(null) }}>Confirmer</button><button className="platform-text-button" onClick={() => setPendingRevoke(null)}>Annuler</button></div> : <button className="platform-secondary" disabled={busy} onClick={() => setPendingRevoke(item.id)}>Révoquer</button>}</article>)}{!invitations.length && <p className="platform-empty">Aucune invitation en attente.</p>}</div>}
    </section>
    <section className="platform-card"><header className="platform-card-heading"><h2>Inviter un administrateur plateforme</h2></header>
      <p className="platform-help">Le lien est affiché une seule fois après création. Transmettez-le directement à la personne concernée.</p>
      <form className="platform-form" onSubmit={invite}><label>Adresse e-mail *<input type="email" required value={email} onChange={event => setEmail(event.target.value)} autoComplete="off" /></label><button className="platform-primary" disabled={busy || mode === 'demo'}>Créer l’invitation</button></form>
      {invitationLink && <div className="platform-invitation-result"><strong>Lien d’inscription à transmettre</strong><input readOnly aria-label="Lien d’inscription" value={invitationLink} onFocus={event => event.target.select()} /><button className="platform-secondary" onClick={() => navigator.clipboard?.writeText(invitationLink)}>Copier le lien</button><small>Le jeton n’est pas conservé en clair par le serveur.</small></div>}
    </section>
  </div>
}
