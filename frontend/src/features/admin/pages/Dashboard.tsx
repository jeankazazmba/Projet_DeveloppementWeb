import { useState } from 'react'
import { assets } from '../design-assets'
import type { Page } from '../data'
import { Badge, Icon, Metric, Modal, PageHeading, Panel } from '../components/ui'

const a = assets.dashboard
const activity = [
  ['19:02', 'Commande MM-1048 reçue', 'Arsène K. · Livraison Résidence La Terrasse', '9 750 FCFA', 'blue'],
  ['18:55', 'Livraison MM-1045 validée', 'Validée par l’employée Marie T.', 'Livrée', 'green'],
  ['18:40', 'Réclamation RC-0033 enregistrée', 'Article manquant : Bobolo supplémentaire', 'Priorité Haute', 'red'],
  ['18:22', 'Menu mis à jour', 'Ndolé royal marqué disponible en cuisine', 'Cuisine Principale', 'yellow'],
  ['17:50', 'Commande MM-1042 servie', 'Sur place · Table 04', '5 500 FCFA', 'green'],
  ['17:15', 'Shift Soir démarré', '4 serveurs & 3 cuisiniers pointés au badge', 'Superviseur ZS', 'gold'],
]
export default function Dashboard({ navigate, openClaims }: { navigate: (page: Page) => void; openClaims: number }) {
  const [preview, setPreview] = useState(false)
  return <>
    <PageHeading first="Tableau de" accent="bord" description="Vue d’ensemble en temps réel de ZeDuc-Sp@ce · Résidence La Terrasse, Yansoki, Douala." action={<div className="segmented period"><button className="selected" aria-pressed="true">Aujourd’hui</button><button disabled title="Historique à fournir par le backend">7 jours</button><button disabled title="Historique à fournir par le backend">30 jours</button><button onClick={() => setPreview(true)}><Icon src={a.imgContainer3} />Aperçu rapide</button></div>} />
    <div className="metrics dashboard-metrics">
      <Metric label="VENTES DU JOUR" value="187 500" unit="FCFA" note="+12,4 % vs hier" icon={a.imgContainer4} tone="positive"><Icon src={a.imgContainer5} /><img className="sparkline" src={a.imgSparklineSvg} alt="Tendance des ventes en hausse" /></Metric>
      <Metric label="COMMANDES PASSÉES" value="64" unit="tickets" note="+8 commandes / heure de pointe" icon={a.imgContainer6}><img className="sparkline" src={a.imgSvg} alt="Évolution des commandes" /></Metric>
      <Metric label="PANIER MOYEN" value="2 930" unit="FCFA" note="Stable vs semaine précédente" icon={a.imgContainer7}><img className="sparkline" src={a.imgSvg1} alt="Panier moyen stable" /></Metric>
      <Metric label="NOUVEAUX ÉTUDIANTS" value="6" unit="inscrits" note="Campus IUT & Résidence La Terrasse" icon={a.imgContainer8}><Badge>Actif</Badge></Metric>
      <Metric label="POINTS FIDÉLITÉ DISTRIBUÉS" value="71" unit="pts" note="Fidélité campus active · Taux 94%" icon={a.imgContainer9}><img className="sparkline" src={a.imgSvg2} alt="Évolution des points distribués" /></Metric>
      <Metric label="RÉCLAMATIONS OUVERTES" value={openClaims} unit="dossiers" note="En attente d’arbitrage" icon={a.imgContainer10} tone="negative"><button className="badge yellow" onClick={() => navigate('claims')}>Action requise</button></Metric>
    </div>
    <div className="sales-grid" id="sales">
      <Panel title="Ventes en temps réel" subtitle="Suivi horaire de la journée (11h00 — 21h00)" className="sales-panel" action={<div className="chart-key"><span>● FCFA collectés</span><Badge>Pic : 13h00 · 42 000 FCFA</Badge></div>}><div className="sales-graphic"><img src={a.imgSvg3} alt="Ventes horaires : pic à 13 h, 42 000 FCFA" /></div><div className="chart-hours">{Array.from({ length: 11 }, (_, i) => <span key={i} className={i === 2 ? 'gold-text' : ''}>{i + 11}h{i === 2 ? ' (Pic)' : ''}</span>)}</div></Panel>
      <Panel title="Commandes par service" subtitle="Sur place vs Livraison campus" className="service-panel"><div className="donut"><img src={a.imgSvg4} alt="Sur place 58 %, livraison 42 %" /><div><strong>64</strong><small>TOTAL</small></div></div><div className="donut-legend"><p><span>■ Sur place (58%)</span><small>37 commandes</small></p><p><span>■ Livraison (42%)</span><small>27 commandes</small></p></div></Panel>
    </div>
    <div className="insights-grid">
      <Panel title="Moyens de paiement" subtitle="Ventilation des encaissements" action={<Icon src={a.imgContainer11} />}>{[['MTN Mobile Money',46,'86 250'],['Orange Money',28,'52 500'],['Caisse (Espèces)',16,'30 000'],['Carte bancaire',10,'18 750']].map(([name, percent, total]) => <div className="payment" key={name}><div><strong>{name}</strong><span>{percent} %</span></div><progress value={Number(percent)} max="100" aria-label={`${name} : ${percent} %`} /><small>{total} FCFA encaissés</small></div>)}<div className="payment-total"><span>Taux Mobile Money combiné</span><strong>74% du chiffre d’affaires</strong></div></Panel>
      <Panel title="Plats les plus vendus" subtitle="Top 5 de la cuisine ZeDuc" action={<Icon src={a.imgContainer12} />}><ol className="top-dishes">{[['Poulet DG Royal',24],['Ndolé aux crevettes',18],['Poisson braisé & bobolo',14],['Burger maison ZeDuc',11],['Beignets-haricots',9]].map(([name,total], i) => <li key={name}><span className="rank">{i + 1}</span><span>{name}</span><strong>{total} portions</strong></li>)}</ol><button className="text-button end" onClick={() => navigate('menu')}>Gérer les ruptures de stock <Icon src={a.imgContainer13} /></button></Panel>
      <Panel title="Entonnoir du parrainage" subtitle="Acquisition & conversion campus" action={<Icon src={a.imgContainer14} />}><div className="funnel">{[['1. Codes partagés','148 partages',100],['2. Inscriptions validées','54 inscrits (36%)',54 / 148 * 100],['3. Premières commandes','29 convertis (19%)',29 / 148 * 100]].map(([label,value,percent]) => <div key={label}><div className="split"><strong>{label}</strong><span>{value}</span></div><progress value={Number(percent)} max="100" aria-label={String(label)} /></div>)}</div><p className="referral-total">Bonus parrainage distribué <strong>14 500 FCFA</strong></p></Panel>
    </div>
    <Panel title="Fil d’activité en temps réel" subtitle="Flux chronologique direct des opérations au restaurant et en salle" action={<span className="live-label"><img src={a.imgEllipse} alt="" />Flux de démonstration</span>}><ol className="activity-list">{activity.map(([time,title,description,result,tone]) => <li key={time}><time>{time}</time><span className={`activity-dot ${tone}`} /><strong>{title}</strong><span className="muted">{description}</span><span className="activity-result">{tone === 'red' || result === 'Livrée' ? <Badge tone={tone}>{result}</Badge> : result}</span></li>)}</ol></Panel>
    {preview && <Modal title="Aperçu rapide" onClose={() => setPreview(false)}><p className="muted">Instantané de démonstration du tableau de bord.</p><dl className="summary"><div><dt>Ventes</dt><dd>187 500 FCFA</dd></div><div><dt>Commandes</dt><dd>64</dd></div><div><dt>Réclamations à traiter</dt><dd>{openClaims}</dd></div></dl><div className="dialog-actions"><button className="button primary" onClick={() => { setPreview(false); navigate('claims') }}>Voir les réclamations</button></div></Modal>}
  </>
}
