import { useEffect, useState } from 'react'
import { Badge, PageHeading, Panel } from '../components/ui'

type Counts = { employees: number; dishes: number; promotions: number; claims: number; orders: number; tables: number }
type ApiState = 'checking' | 'connected' | 'unavailable' | 'unconfigured'

const apiBase = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const resources = [
  { key: 'employees', name: 'Employés et rôles', fields: 'id · nom · e-mail · rôle · statut', screen: 'Équipe & Shifts' },
  { key: 'dishes', name: 'Plats et disponibilités', fields: 'id · nom · catégorie · prix · disponibilité', screen: 'Menu & Stocks' },
  { key: 'orders', name: 'Commandes et lignes', fields: 'id · client · lignes · total · statut · paiement', screen: 'Commandes' },
  { key: 'tables', name: 'Tables et occupation', fields: 'id · zone · places · statut · commande', screen: 'Tables & Salle' },
  { key: 'promotions', name: 'Promotions, événements et jeux', fields: 'id · type · titre · dates · statut · visuel', screen: 'Promotions & Événements' },
  { key: 'claims', name: 'Réclamations', fields: 'id · étudiant · commande · motif · statut', screen: 'Réclamations' },
  { key: null, name: 'Étudiants et fidélité', fields: 'id · contact · points · historique des mouvements', screen: 'À alimenter par l’API' },
  { key: null, name: 'Parrainages', fields: 'id · parrain · filleul · première commande · récompense', screen: 'À alimenter par l’API' },
] as const

export default function DataReadiness(counts: Counts) {
  const [attempt, setAttempt] = useState(0)
  const [apiState, setApiState] = useState<ApiState>(apiBase ? 'checking' : 'unconfigured')
  useEffect(() => {
    if (!apiBase) return
    const controller = new AbortController()
    let active = true
    const timer = window.setTimeout(() => controller.abort(), 5000)
    setApiState('checking')
    fetch(`${apiBase}/health`, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(response => { if (!response.ok) throw new Error('API indisponible'); return response.json() })
      .then(data => { if (active) setApiState(data.status === 'ok' ? 'connected' : 'unavailable') })
      .catch(() => { if (active) setApiState('unavailable') })
      .finally(() => window.clearTimeout(timer))
    return () => { active = false; controller.abort(); window.clearTimeout(timer) }
  }, [attempt])
  const connectionLabel = apiState === 'connected' ? 'API accessible' : apiState === 'checking' ? 'Vérification…' : apiState === 'unconfigured' ? 'URL API à configurer' : 'API inaccessible'
  return <>
    <PageHeading first="Données &" accent="intégration" description="Préparez les ressources du back-office à recevoir les données métier de la base commune." action={apiBase && <button type="button" className="button subtle" onClick={() => setAttempt(value => value + 1)}>Vérifier l’API</button>} />
    <div className="admin-data-overview"><Panel title="Connexion au backend" subtitle="Seule la route de santé /api/health existe actuellement."><div className="admin-data-health"><Badge tone={apiState === 'connected' ? 'green' : 'yellow'}>{connectionLabel}</Badge><p>{apiBase ? `Adresse configurée : ${apiBase}` : 'Renseignez VITE_API_URL dans le frontend pour activer la vérification.'}</p><small>Une API accessible ne prouve pas que les tables métier ou la base de données sont prêtes.</small></div></Panel><Panel title="Source affichée aujourd’hui" subtitle="Les écrans existants montrent des données de démonstration."><div className="admin-data-health"><strong>Démo locale</strong><p>Les modifications admin restent dans la session du navigateur. Aucun enregistrement n’est envoyé à Laravel.</p><small>Les comptes, paiements et points réels seront validés côté serveur.</small></div></Panel></div>
    <Panel title="Ressources à raccorder" subtitle="Champs d’interface à aligner avec les modèles, migrations et contrats API de l’équipe backend."><div className="admin-data-table-scroll"><table className="admin-data-table"><thead><tr><th>RESSOURCE</th><th>CHAMPS À PRÉVOIR</th><th>ÉCRAN</th><th>DONNÉES ACTUELLES</th><th>BRANCHEMENT</th></tr></thead><tbody>{resources.map(resource => <tr key={resource.name}><td><strong>{resource.name}</strong></td><td>{resource.fields}</td><td>{resource.screen}</td><td>{resource.key ? `${counts[resource.key]} exemples locaux` : 'Aucun enregistrement réel'}</td><td><Badge tone="yellow">À connecter</Badge></td></tr>)}</tbody></table></div></Panel>
    <p className="admin-data-note">Les formes de données ci-dessus préparent l’interface. Les noms définitifs des tables, routes et permissions doivent suivre les contrats validés par l’équipe backend.</p>
  </>
}
