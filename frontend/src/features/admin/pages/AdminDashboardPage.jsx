import { Metric, Panel } from '../components/AdminUi.jsx'

export default function AdminDashboardPage({ openClaims, onNavigate }) {
  return <>
    <section className="admin-welcome">
      <p className="admin-kicker">SUIVI EN DIRECT · DÉMONSTRATION LOCALE</p>
      <h1>Pilotage du restaurant</h1>
      <p>Vue consolidée des ventes, commandes et programmes. Les chiffres seront alimentés par les endpoints statistiques du backend.</p>
    </section>
    <section className="admin-metric-grid" aria-label="Indicateurs clés">
      <Metric label="Chiffre d’affaires" value="248 500 FCFA" detail="Aujourd’hui · données de démonstration" />
      <Metric label="Commandes servies" value="64" detail="Service en cours" />
      <Metric label="Réclamations ouvertes" value={openClaims} detail="À superviser" />
    </section>
    <section className="admin-two-columns">
      <Panel title="Répartition du service" description="Aperçu de la journée, en attente des données API.">
        <dl className="admin-definition-list"><div><dt>Sur place</dt><dd>36 commandes</dd></div><div><dt>À emporter</dt><dd>18 commandes</dd></div><div><dt>Livraison</dt><dd>10 commandes</dd></div></dl>
      </Panel>
      <Panel title="Actions à suivre" description="Accès rapide aux opérations administratives.">
        <div className="admin-action-list"><button type="button" onClick={() => onNavigate('complaints')}>Superviser les réclamations ({openClaims})</button><button type="button" onClick={() => onNavigate('menu')}>Vérifier la disponibilité du menu</button><button type="button" onClick={() => onNavigate('promotions')}>Gérer les campagnes</button></div>
      </Panel>
    </section>
  </>
}
