import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './staffCatalog.css'

const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '')
const kinds = [{ id: 'dish', label: 'Plats' }, { id: 'promotion', label: 'Promotions' }, { id: 'event', label: 'Événements' }, { id: 'game', label: 'Jeux' }]
const empty = { kind: 'dish', title: '', description: '', price_cdf: '', image_url: '', details: '{}', is_published: false }
const gameTemplates = {
  quiz: { type: 'quiz', questions: [{ question: 'Votre question ?', options: ['Réponse A', 'Réponse B'], answer: 0 }] },
  memory: { type: 'memory', pairs: ['Plat A', 'Plat B', 'Plat C'] },
  wheel: { type: 'wheel' },
}

async function request(path, options = {}, token) {
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.message || 'Une erreur est survenue. Vérifiez votre connexion et vos droits.')
  return body
}

export default function StaffCatalog() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [restaurantId, setRestaurantId] = useState('')
  const [kind, setKind] = useState('dish')
  const [contents, setContents] = useState([])
  const [draft, setDraft] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState({ id: '', name: '', location: '', hours: '', description: '' })
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' })
  const selectedRestaurant = restaurants.find(item => item.id === restaurantId)
  const canWrite = Boolean(session?.user.is_platform_admin || ['admin', 'manager'].includes(selectedRestaurant?.pivot?.role))
  const loadContent = useCallback(async () => {
    if (!session || !restaurantId) return
    try { setContents(await request(`/staff/restaurants/${encodeURIComponent(restaurantId)}/content`, {}, session.token)); setError('') }
    catch (reason) { setError(reason.message) }
  }, [session, restaurantId])
  useEffect(() => { loadContent() }, [loadContent])

  const login = async event => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await request('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      const assigned = await request('/staff/restaurants', {}, result.token)
      setSession(result); setRestaurants(assigned); setRestaurantId(assigned.length === 1 ? assigned[0].id : ''); setPassword('')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  const logout = async () => {
    try { await request('/logout', { method: 'POST' }, session.token) } catch { /* La session locale est fermée. */ }
    setSession(null); setRestaurants([]); setRestaurantId(''); setContents([])
  }
  const edit = item => { setEditing(item.id); setDraft({ kind: item.kind, title: item.title, description: item.description || '', price_cdf: item.price_cdf ?? '', image_url: item.image_url || '', details: JSON.stringify(item.details || {}, null, 2), is_published: item.is_published }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const save = async event => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const details = JSON.parse(draft.details || '{}')
      const body = { kind: draft.kind, title: draft.title.trim(), description: draft.description, price_cdf: draft.price_cdf === '' ? null : Number(draft.price_cdf), image_url: draft.image_url || null, details, is_published: draft.is_published }
      await request(`/staff/restaurants/${encodeURIComponent(restaurantId)}/content${editing ? `/${editing}` : ''}`, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(body) }, session.token)
      setDraft({ ...empty, kind }); setEditing(null); setNotice('Contenu enregistré pour ce restaurant.'); await loadContent()
    } catch (reason) { setError(reason instanceof SyntaxError ? 'Le champ détails doit contenir un objet JSON valide.' : reason.message) }
    finally { setBusy(false) }
  }
  const remove = async item => {
    if (!window.confirm(`Supprimer « ${item.title} » ?`)) return
    try { await request(`/staff/restaurants/${encodeURIComponent(restaurantId)}/content/${item.id}`, { method: 'DELETE' }, session.token); setNotice('Contenu supprimé.'); await loadContent() }
    catch (reason) { setError(reason.message) }
  }
  const togglePublication = async () => {
    try {
      const updated = await request(`/platform/restaurants/${encodeURIComponent(restaurantId)}`, { method: 'PATCH', body: JSON.stringify({ is_public: !selectedRestaurant.is_public }) }, session.token)
      setRestaurants(current => current.map(item => item.id === restaurantId ? updated : item))
      setNotice(updated.is_public ? 'Restaurant publié.' : 'Restaurant masqué du répertoire public.')
    } catch (reason) { setError(reason.message) }
  }
  const createRestaurant = async event => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const created = await request('/platform/restaurants', { method: 'POST', body: JSON.stringify(newRestaurant) }, session.token)
      setRestaurants(current => [...current, created].sort((a, b) => a.name.localeCompare(b.name, 'fr')))
      setRestaurantId(created.id)
      setNewRestaurant({ id: '', name: '', location: '', hours: '', description: '' })
      setNotice('Restaurant créé en brouillon. Publiez-le après avoir renseigné sa fiche et son contenu.')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  const createUser = async event => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      await request('/platform/users', { method: 'POST', body: JSON.stringify({ ...newUser, restaurant_id: restaurantId }) }, session.token)
      setNewUser({ name: '', email: '', password: '', role: 'employee' })
      setNotice('Compte créé et affecté à ce restaurant. Transmettez les identifiants par un canal sûr.')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }

  return <main className="staff-catalog"><div className="staff-catalog-shell"><header><div><span>MON MIAM MIAM · API COMMUNE</span><h1>Catalogue des restaurants</h1><p>Plats, promotions, événements et jeux sont publiés séparément pour chaque établissement.</p></div><div><Link to="/acces">← Espaces</Link>{session && <button onClick={logout}>Se déconnecter</button>}</div></header>
    {!base ? <div className="staff-catalog-card"><h2>Serveur à configurer</h2><p>Renseignez VITE_API_URL pour connecter le catalogue partagé. Les espaces de démonstration restent disponibles.</p></div> : !session ? <form className="staff-catalog-card staff-catalog-form" onSubmit={login}><h2>Connexion professionnelle</h2><label>Adresse e-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required /></label><label>Mot de passe<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label><button type="submit" disabled={busy}>Se connecter</button></form> : <>
      <div className="staff-catalog-card"><strong>{session.user.name}</strong><p>{session.user.is_platform_admin ? 'Administration plateforme' : 'Accès limité aux restaurants affectés à ce compte.'}</p>{restaurants.length > 1 ? <label>Restaurant de travail<select value={restaurantId} onChange={event => { setRestaurantId(event.target.value); setContents([]); setEditing(null); setDraft(empty) }}><option value="">Choisir un restaurant</option>{restaurants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : restaurants.length === 1 ? <p>Restaurant : <strong>{restaurants[0].name}</strong></p> : <p>Aucun restaurant attribué.</p>}</div>
      {session.user.is_platform_admin && <form className="staff-catalog-card staff-catalog-form" onSubmit={createRestaurant}><h2>Créer un restaurant</h2><label>Identifiant unique<input pattern="[a-zA-Z0-9_-]+" value={newRestaurant.id} onChange={event => setNewRestaurant({ ...newRestaurant, id: event.target.value })} required /></label><label>Nom<input value={newRestaurant.name} onChange={event => setNewRestaurant({ ...newRestaurant, name: event.target.value })} required /></label><label>Localisation<input value={newRestaurant.location} onChange={event => setNewRestaurant({ ...newRestaurant, location: event.target.value })} /></label><label>Horaires<input value={newRestaurant.hours} onChange={event => setNewRestaurant({ ...newRestaurant, hours: event.target.value })} /></label><button type="submit" disabled={busy}>Créer en brouillon</button></form>}
      {session.user.is_platform_admin && selectedRestaurant && <div className="staff-catalog-card"><strong>Visibilité de {selectedRestaurant.name}</strong><p>{selectedRestaurant.is_public ? 'Visible dans le répertoire public.' : 'Brouillon : invisible pour les étudiants.'}</p><button onClick={togglePublication}>{selectedRestaurant.is_public ? 'Masquer' : 'Publier'}</button></div>}
      {session.user.is_platform_admin && restaurantId && <form className="staff-catalog-card staff-catalog-form" onSubmit={createUser}><h2>Créer un compte pour {selectedRestaurant.name}</h2><label>Nom<input value={newUser.name} onChange={event => setNewUser({ ...newUser, name: event.target.value })} required /></label><label>Adresse e-mail<input type="email" value={newUser.email} onChange={event => setNewUser({ ...newUser, email: event.target.value })} required /></label><label>Mot de passe initial (12 caractères minimum)<input type="password" minLength="12" value={newUser.password} onChange={event => setNewUser({ ...newUser, password: event.target.value })} required /></label><label>Rôle<select value={newUser.role} onChange={event => setNewUser({ ...newUser, role: event.target.value })}><option value="employee">Employé</option><option value="manager">Gérant</option><option value="admin">Admin restaurant</option></select></label><button type="submit" disabled={busy}>Créer et affecter</button></form>}
      {restaurantId && <><div className="staff-catalog-tabs" role="group" aria-label="Type de contenu">{kinds.map(item => <button key={item.id} className={kind === item.id ? 'active' : ''} onClick={() => { setKind(item.id); setDraft({ ...empty, kind: item.id }); setEditing(null) }}>{item.label}</button>)}</div>{canWrite && <form className="staff-catalog-card staff-catalog-form" onSubmit={save}><h2>{editing ? 'Modifier' : 'Ajouter'} · {kinds.find(item => item.id === kind)?.label}</h2><label>Titre<input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} required /></label><label>Description<textarea value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>{kind === 'dish' && <label>Prix en CDF<input type="number" min="0" value={draft.price_cdf} onChange={event => setDraft({ ...draft, price_cdf: event.target.value })} /></label>}<label>URL de l’image<input type="url" value={draft.image_url} onChange={event => setDraft({ ...draft, image_url: event.target.value })} /></label>{kind === 'game' && <div className="staff-catalog-actions"><span>Modèle de jeu :</span>{Object.entries(gameTemplates).map(([type, template]) => <button type="button" key={type} onClick={() => setDraft({ ...draft, details: JSON.stringify(template, null, 2) })}>{type === 'quiz' ? 'Quiz' : type === 'memory' ? 'Paires' : 'Roue'}</button>)}</div>}<label>Détails JSON (catégorie, date, conditions…)<textarea value={draft.details} onChange={event => setDraft({ ...draft, details: event.target.value })} /></label><label className="staff-catalog-check"><input type="checkbox" checked={draft.is_published} onChange={event => setDraft({ ...draft, is_published: event.target.checked })} /> Publier sur le site et l’application étudiante</label><div className="staff-catalog-actions"><button type="submit" disabled={busy}>Enregistrer</button>{editing && <button type="button" onClick={() => { setEditing(null); setDraft({ ...empty, kind }) }}>Annuler</button>}</div></form>}<section className="staff-catalog-list" aria-label="Contenus du restaurant">{contents.filter(item => item.kind === kind).map(item => <article className="staff-catalog-card" key={item.id}><div><small>{item.is_published ? 'Publié' : 'Brouillon'}</small><h3>{item.title}</h3><p>{item.description}</p></div>{canWrite && <div className="staff-catalog-actions"><button onClick={() => edit(item)}>Modifier</button><button onClick={() => remove(item)}>Supprimer</button></div>}</article>)}{!contents.some(item => item.kind === kind) && <p>Aucun contenu dans cette rubrique pour ce restaurant.</p>}</section></>}
    </>}
    {error && <p className="staff-catalog-error" role="alert">{error}</p>}{notice && <p className="staff-catalog-notice" role="status">{notice}</p>}
  </div></main>
}
