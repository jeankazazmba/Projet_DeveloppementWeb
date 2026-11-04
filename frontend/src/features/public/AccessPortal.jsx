import { useState } from 'react'
import { Link } from 'react-router-dom'

const profiles = [
  {
    id: 'student', number: '01', icon: 'student', title: 'Étudiant',
    subtitle: 'Commander et profiter des avantages MIAM',
    description: 'Parcourez le menu, préparez vos commandes, suivez vos points de fidélité et vos parrainages depuis l’application mobile.',
    platform: 'Application mobile', state: 'Accès depuis le téléphone',
  },
  {
    id: 'employee', number: '02', icon: 'employee', title: 'Employé',
    subtitle: 'Assurer le service au quotidien',
    description: 'Suivez les commandes, mettez à jour les disponibilités du menu, préparez les réponses aux réclamations et consultez les statistiques du service.',
    platform: 'Application web responsive', state: 'Démo disponible', to: '/employe',
  },
  {
    id: 'manager', number: '03', icon: 'manager', title: 'Gérant',
    subtitle: 'Superviser le restaurant en direct',
    description: 'Accédez aux commandes en cours, à la gestion de l’équipe, aux statistiques et à la validation des réclamations.',
    platform: 'Application web', state: 'Démo disponible', to: '/gerant',
  },
  {
    id: 'admin', number: '04', icon: 'admin', title: 'Administrateur',
    subtitle: 'Piloter l’ensemble de la plateforme',
    description: 'Ouvrez le back-office pour consulter les tableaux de bord et administrer les modules disponibles.',
    platform: 'Application web', state: 'Démo disponible', to: '/admin',
  },
]

function ProfileIcon({ name }) {
  const paths = {
    student: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.3V16c3 2.5 7 2.5 10 0v-4.7M21 9v6" /></>,
    employee: <><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16M10 12v2h4v-2" /></>,
    manager: <><path d="M3 20h18M6 16V9m6 7V4m6 12v-5" /><circle cx="6" cy="7" r="1" /><circle cx="18" cy="9" r="1" /></>,
    admin: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  }
  return <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function AccessPortal() {
  const [selectedId, setSelectedId] = useState(null)
  const selected = profiles.find(profile => profile.id === selectedId)

  return <main id="public-main" className="public-access-portal">
    <section className="public-container public-access-intro">
      <span className="public-kicker">MON MIAM MIAM · ACCÈS</span>
      <h1>À chacun son <em>espace.</em></h1>
      <p>Choisissez votre profil pour rejoindre l’application qui correspond à votre rôle.</p>
      <div className="public-access-steps" aria-label="Étapes d’accès"><span><b>1</b> Choisir un profil</span><i aria-hidden="true" /><span><b>2</b> Accéder à son espace</span></div>
    </section>

    <section className="public-container public-access-profiles" aria-label="Choix de l’espace utilisateur">
      {profiles.map(profile => <button type="button" key={profile.id} className={`public-profile-card ${selectedId === profile.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(profile.id)} aria-pressed={selectedId === profile.id} aria-controls="public-profile-detail">
        <span className="public-profile-card-top"><span className="public-profile-icon"><ProfileIcon name={profile.icon} /></span><span className="public-profile-number">{profile.number} / 04</span></span>
        <strong>{profile.title}</strong><span className="public-profile-subtitle">{profile.subtitle}</span>
        <span className="public-profile-card-bottom"><span>{profile.platform}</span><span aria-hidden="true">→</span></span>
      </button>)}
    </section>

    <div className="public-container public-access-detail-wrap"><section id="public-profile-detail" className="public-access-detail" aria-live="polite">
      {selected ? <><div className="public-access-detail-copy"><span className="public-kicker">ESPACE {selected.title.toLocaleUpperCase('fr')}</span><h2>{selected.subtitle}</h2><p>{selected.description}</p><span className={`public-access-state ${selected.to ? 'is-ready' : ''}`}><i />{selected.state}</span></div><div className="public-access-detail-action">{selected.to ? <><Link className="public-pill" to={selected.to}>Entrer dans l’espace {selected.title.toLocaleLowerCase('fr')} <span aria-hidden="true">↗</span></Link><small>Accès de démonstration : la connexion par compte sera reliée au backend.</small></> : <><p>L’application étudiante se consulte sur téléphone. Son accès depuis le site sera proposé après sa publication.</p><Link to="/menu">Voir le menu du restaurant →</Link></>}</div></> : <><div><span className="public-kicker">VOTRE PARCOURS</span><h2>Sélectionnez un espace ci-dessus</h2><p>Les informations d’accès correspondant à votre profil apparaîtront ici.</p></div><span className="public-access-detail-mark" aria-hidden="true">✦</span></>}
    </section></div>

    <section id="inscription" className="public-container public-access-registration"><div><span className="public-kicker">NOUVEAU SUR MON MIAM MIAM ?</span><h2>Envie de nous rejoindre ?</h2><p>L’inscription étudiante et la connexion sécurisée seront disponibles après l’intégration du service d’authentification. Aucun compte n’est créé depuis cette page pour le moment.</p></div><Link to="/menu">Découvrir le menu <span aria-hidden="true">→</span></Link></section>
  </main>
}
