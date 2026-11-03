import { useMemo, useState } from 'react'
import { Badge, EmptyState, Notice, Panel } from '../components/AdminUi.jsx'

const blankEmployee = { name: '', email: '', role: 'Employé', active: true, lastLogin: 'Jamais connecté' }

export default function AdminEmployeesPage({ employees, setEmployees }) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(blankEmployee)
  const [notice, setNotice] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const filteredEmployees = useMemo(() => employees.filter((employee) => `${employee.name} ${employee.email} ${employee.role}`.toLowerCase().includes(query.toLowerCase().trim())), [employees, query])

  const addEmployee = (event) => {
    event.preventDefault()
    if (!draft.name.trim() || !draft.email.trim()) return
    setEmployees((current) => [...current, { ...draft, id: crypto.randomUUID(), name: draft.name.trim(), email: draft.email.trim() }])
    setDraft(blankEmployee)
    setNotice('Compte ajouté à la démonstration locale. La création réelle attend l’API administrateur.')
  }

  return <>
    <section className="admin-welcome"><p className="admin-kicker">ADM-01 · DONNÉES DE DÉMONSTRATION</p><h1>Comptes employés</h1><p>Ajoutez, modifiez le statut ou retirez un accès. Les permissions définitives doivent être vérifiées par Laravel.</p></section>
    {notice && <Notice>{notice}</Notice>}
    <div className="admin-two-columns admin-top-aligned">
      <Panel title="Ajouter un compte" description="Les identifiants et mots de passe sont gérés par le backend.">
        <form className="admin-form" onSubmit={addEmployee}>
          <label>Nom complet<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <label>E-mail professionnel<input type="email" required value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
          <label>Rôle<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })}><option>Employé</option><option>Gérant</option></select></label>
          <button className="admin-primary-button" type="submit">Créer le compte</button>
        </form>
      </Panel>
      <Panel title="Comptes actifs" description={`${employees.filter((employee) => employee.active).length} accès actifs sur ${employees.length}.`}>
        <label className="admin-search">Rechercher<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom ou e-mail" /></label>
      </Panel>
    </div>
    <Panel title="Liste de l’équipe" description="Les changements sont limités à cette session tant que les endpoints ne sont pas disponibles.">
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Collaborateur</th><th>Rôle</th><th>Dernière connexion</th><th>Accès</th><th>Action</th></tr></thead><tbody>{filteredEmployees.map((employee) => <tr key={employee.id}><td><strong>{employee.name}</strong><span>{employee.email}</span></td><td><Badge tone={employee.role === 'Gérant' ? 'gold' : 'neutral'}>{employee.role}</Badge></td><td>{employee.lastLogin}</td><td><button type="button" className="admin-text-button" onClick={() => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, active: !item.active } : item)}><Badge tone={employee.active ? 'success' : 'danger'}>{employee.active ? 'Actif' : 'Désactivé'}</Badge></button></td><td><button type="button" className="admin-danger-button" onClick={() => setPendingDelete(employee)}>Supprimer</button></td></tr>)}</tbody></table></div>
      {filteredEmployees.length === 0 && <EmptyState />}
    </Panel>
    {pendingDelete && <section className="admin-confirmation" role="dialog" aria-modal="true" aria-labelledby="delete-employee-title"><h2 id="delete-employee-title">Supprimer ce compte ?</h2><p>Le compte de {pendingDelete.name} sera retiré de la démonstration locale.</p><div><button type="button" onClick={() => setPendingDelete(null)}>Annuler</button><button className="admin-danger-button" type="button" onClick={() => { setEmployees((current) => current.filter((employee) => employee.id !== pendingDelete.id)); setPendingDelete(null); setNotice('Compte supprimé de la démonstration locale.') }}>Supprimer</button></div></section>}
  </>
}
