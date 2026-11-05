import { useState } from 'react'
import { platformApiBase, platformRequest } from '../platform/platformApi.js'

export const staffApi = platformRequest
export const hasStaffApi = Boolean(platformApiBase)

export function useStaffConnection(role) {
  const [mode, setMode] = useState(hasStaffApi ? 'login' : 'demo')
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const login = async (email, password) => {
    setBusy(true); setError('')
    try {
      const session = await staffApi('/auth/login', null, { method: 'POST', body: JSON.stringify({ email, password }) })
      const me = await staffApi('/me', session.token)
      const allowed = (me.restaurants || []).filter(item => item.role === role)
      if (!allowed.length || me.account_type !== 'professional') {
        await staffApi('/auth/logout', session.token, { method: 'POST' }).catch(() => {})
        throw new Error(`Ce compte n’a pas d’affectation ${role} active.`)
      }
      setToken(session.token); setProfile(me); setRestaurants(allowed)
      setRestaurantId(allowed[0].id); setMode('connected')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  const logout = () => {
    if (token) staffApi('/auth/logout', token, { method: 'POST' }).catch(() => {})
    setToken(null); setProfile(null); setRestaurants([]); setRestaurantId(null); setMode('login')
  }
  return { mode, token, profile, restaurants, restaurantId, setRestaurantId, busy, error, login, logout, enterDemo: () => setMode('demo'), returnToLogin: () => setMode('login') }
}

export function StaffLogin({ role, connection }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const labels = { employee: 'employé', manager: 'gérant', admin: 'administrateur du restaurant' }
  return <main className="staff-api-gate"><section className="staff-api-card">
    <h1>Connexion {labels[role]}</h1><p>Accès limité à vos restaurants.</p>
    <form onSubmit={event => { event.preventDefault(); connection.login(email, password) }}>
      <label>Adresse e-mail<input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Mot de passe<input type="password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
      {connection.error && <p role="alert">{connection.error}</p>}
      <button disabled={connection.busy}>{connection.busy ? 'Connexion…' : 'Se connecter'}</button>
    </form>
    <button type="button" onClick={connection.enterDemo}>Explorer la démonstration</button>
  </section></main>
}

export function SyncBanner({ connected, state, onRefresh }) {
  if (!connected) return <div className="staff-sync-banner">Mode démonstration · aucune donnée transmise au serveur.</div>
  return <div className="staff-sync-banner" role={state.error ? 'alert' : 'status'}>
    {state.loading ? 'Synchronisation en cours…' : state.error ? `API : ${state.error}` : `Dernière synchronisation : ${state.lastSync ? new Date(state.lastSync).toLocaleString('fr-CD') : 'en attente'}`}
    {onRefresh && <button type="button" onClick={onRefresh} disabled={state.loading}>Actualiser</button>}
  </div>
}

export const mapStaffOrder = order => ({ id: order.id, customer: order.customer_name,
  service: order.service === 'delivery' ? 'Livraison' : 'Sur place',
  location: order.table?.code || order.delivery_zone?.district || 'Retrait',
  items: (order.lines || []).map(line => `${line.title_snapshot} ×${line.quantity}`).join(', '),
  amount: order.amount_cdf, status: ({ received: 'Reçue', accepted: 'Acceptée', preparing: 'En préparation', ready: 'Prête',
    served: 'Servie', delivering: 'Remise au livreur', delivered: 'Livrée', cancelled: 'Annulée' })[order.status] || order.status,
  rawStatus: order.status, version: order.version, createdAt: order.created_at,
  deliveryAssigneeId: order.delivery_assignee_id })

export const mapStaffClaim = claim => ({ id: claim.id, student: claim.student_name, orderId: claim.order_id || '—',
  reason: claim.reason, message: claim.messages?.find(item => item.kind === 'student')?.body || claim.reason,
  status: ({ ouverte: 'À traiter', prise_en_charge: 'En cours', proposition_employe: 'Envoyée au gérant',
    validation_gerant: 'Validée', decision_admin: 'Décision admin', resolue: 'Résolue', rejetee: 'Rejetée', escaladee: 'Escaladée' })[claim.status] || claim.status,
  rawStatus: claim.status, version: claim.version, received: new Date(claim.created_at).toLocaleString('fr-CD'),
  amount: 0, location: '', attachment: null, response: claim.messages?.find(item => item.kind === 'employee_proposal')?.body || '' })
