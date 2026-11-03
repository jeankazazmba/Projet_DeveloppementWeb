import { useState } from 'react'
import { Notice, Panel } from '../components/AdminUi.jsx'

export default function AdminSettingsPage({ settings, setSettings }) {
  const [draft, setDraft] = useState(settings)
  const [notice, setNotice] = useState('')
  const save = (event) => { event.preventDefault(); setSettings({ ...draft, pointsPerAmount: Number(draft.pointsPerAmount), pointsForDiscount: Number(draft.pointsForDiscount), discountAmount: Number(draft.discountAmount), expiryMonths: Number(draft.expiryMonths) }); setNotice('Paramètres enregistrés dans la démonstration locale. Les règles officielles doivent être validées côté backend.') }
  return <>
    <section className="admin-welcome"><p className="admin-kicker">ADM-06 · CONFIGURATION</p><h1>Paramètres du restaurant</h1><p>Configurez les horaires et préparez les règles de fidélité. Les valeurs proposées dans le cahier des charges restent à valider.</p></section>
    {notice && <Notice>{notice}</Notice>}
    <form className="admin-settings-form" onSubmit={save}><Panel title="Fidélité" description="Valeurs de démonstration, non définitives."><div className="admin-form-grid"><label>Montant dépensé pour un point (FCFA)<input min="1" type="number" required value={draft.pointsPerAmount} onChange={(event) => setDraft({ ...draft, pointsPerAmount: event.target.value })} /></label><label>Points nécessaires pour une remise<input min="1" type="number" required value={draft.pointsForDiscount} onChange={(event) => setDraft({ ...draft, pointsForDiscount: event.target.value })} /></label><label>Valeur de la remise (FCFA)<input min="1" type="number" required value={draft.discountAmount} onChange={(event) => setDraft({ ...draft, discountAmount: event.target.value })} /></label><label>Expiration (mois)<input min="0" type="number" required value={draft.expiryMonths} onChange={(event) => setDraft({ ...draft, expiryMonths: event.target.value })} /></label></div></Panel><Panel title="Horaires" description="Les horaires seront consommés par le menu et la prise de commande."><label className="admin-search">Plage de service<input required value={draft.openingHours} onChange={(event) => setDraft({ ...draft, openingHours: event.target.value })} /></label></Panel><div className="admin-save-row"><button type="button" onClick={() => setDraft(settings)}>Annuler</button><button type="submit" className="admin-primary-button">Enregistrer les paramètres</button></div></form>
  </>
}
