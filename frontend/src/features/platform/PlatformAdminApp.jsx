import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getRestaurants, saveRestaurants } from '../../data/restaurants.js'
import './platform.css'

export default function PlatformAdminApp() {
  const [restaurants, setRestaurants] = useState(getRestaurants)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [hours, setHours] = useState('')
  const [notice, setNotice] = useState('')
  const create = event => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName || !location.trim()) return
    if (restaurants.some(item => item.name.toLocaleLowerCase('fr') === cleanName.toLocaleLowerCase('fr'))) return setNotice('Ce nom existe déjà dans la démonstration.')
    const next = [...restaurants, { id: `restaurant-${Date.now()}`, name: cleanName, location: location.trim(), hours: hours.trim() || 'Horaires à renseigner', description: 'Nouvel établissement de démonstration. Menu à publier.', status: 'Brouillon', example: true }]
    saveRestaurants(next)
    setRestaurants(next)
    setName('')
    setLocation('')
    setHours('')
    setNotice(`${cleanName} ajouté localement. Aucun restaurant réel n’a été créé sur le serveur.`)
  }
  const updateStatus = (id, status) => {
    const next = restaurants.map(item => item.id === id ? { ...item, status } : item)
    saveRestaurants(next)
    setRestaurants(next)
  }
  return <div className="platform-app"><header className="platform-header"><div><span className="platform-kicker">MON MIAM MIAM · PLATEFORME</span><h1>Administration de la plateforme</h1><p>Gérez les fiches des établissements et préparez leur activation.</p></div><div><Link to="/catalogue-pro">Catalogue partagé →</Link> · <Link to="/admin">Administration ZeDuc-Sp@ce →</Link></div></header><main className="platform-main"><div className="platform-metrics"><div><strong>{restaurants.length}</strong><span>Restaurants répertoriés</span></div><div><strong>{restaurants.filter(item => item.status === 'Actif').length}</strong><span>Actifs dans la démo</span></div><div><strong>—</strong><span>Commandes inter-restaurants · API attendue</span></div></div><div className="platform-grid"><section className="platform-panel"><h2>Établissements</h2><p>Le restaurant partenaire possède deux articles fictifs pour tester le menu ; les nouvelles fiches sont vides.</p><div className="platform-list">{restaurants.map(item => <article key={item.id}><div><strong>{item.name}</strong><small>{item.location}</small><small>{item.hours}</small><span>{item.status}{item.example ? ' · données de démonstration' : ''}</span></div><div><Link to={`/menu?restaurant=${encodeURIComponent(item.id)}`}>Voir la fiche menu</Link>{item.id !== 'zeduc' && <select aria-label={`Statut de ${item.name}`} value={item.status} onChange={event => updateStatus(item.id, event.target.value)}><option>Brouillon</option><option>Exemple</option><option>Actif</option><option>Suspendu</option></select>}</div></article>)}</div></section><section className="platform-panel"><h2>Ajouter un restaurant</h2><p>Création locale pour prévisualiser la structure multi-restaurants.</p><form onSubmit={create}><label>Nom du restaurant<input value={name} onChange={event => setName(event.target.value)} required placeholder="Nom de l’établissement" /></label><label>Localisation<input value={location} onChange={event => setLocation(event.target.value)} required placeholder="Ville, quartier…" /></label><label>Horaires<input value={hours} onChange={event => setHours(event.target.value)} placeholder="À confirmer" /></label><button type="submit">Créer la fiche de démonstration</button></form>{notice && <p role="status" className="platform-notice">{notice}</p>}<p className="platform-footnote">Avant la production : authentification, validation du propriétaire, séparation des données et supervision côté API.</p></section></div></main></div>
}
