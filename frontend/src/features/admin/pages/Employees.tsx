import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { initials, matches } from '../data'
import type { Employee } from '../data'
import { assets } from '../design-assets'
import { Badge, ConfirmDelete, EmptyState, Icon, Metric, Modal, PageHeading, SearchInput, Toggle } from '../components/ui'

const a = assets.employees
export default function Employees({ employees, setEmployees, notify }: { employees: Employee[]; setEmployees: Dispatch<SetStateAction<Employee[]>>; notify: (message: string) => void }) {
  const [filter, setFilter] = useState('Tous')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<Employee | null>(null)
  const [error, setError] = useState('')
  const active = employees.filter(e => e.active).length
  const rows = employees.filter(e => matches(`${e.name} ${e.email} ${e.role}`, query) && (filter === 'Tous' || filter === 'Actifs' && e.active || filter === 'Suspendus' && !e.active || filter === 'Gérants' && e.role === 'Gérant'))
  const edit = (employee: Employee) => { setError(''); setEditing({ ...employee }) }
  const save = () => {
    if (!editing) return
    if (!editing.name.trim()) { setError('Renseignez le nom de l’employé.'); return }
    if (employees.some(e => e.id !== editing.id && e.email.toLowerCase() === editing.email.trim().toLowerCase())) { setError('Cette adresse e-mail est déjà utilisée.'); return }
    const value = { ...editing, id: editing.id || crypto.randomUUID(), name: editing.name.trim(), email: editing.email.trim() }
    setEmployees(current => editing.id ? current.map(e => e.id === editing.id ? value : e) : [...current, value])
    setEditing(null); notify('Compte enregistré dans la démonstration locale.')
  }
  return <>
    <PageHeading first="Gestion des" accent="employés" description="Ajoutez, modifiez, suspendez ou supprimez les comptes." action={<button className="button primary" onClick={() => edit({ id: '', name: '', email: '', role: 'Employé', active: true, lastLogin: 'Jamais connecté' })}><Icon src={a.imgContainer} />Ajouter un employé</button>} />
    <div className="metrics"><Metric label="Total Employés" value={employees.length} note="Actifs & suspendus" icon={a.imgContainer1} /><Metric label="Actifs" value={active} note="En service opérationnel" icon={a.imgContainer2} tone="positive" /><Metric label="Suspendus" value={employees.length - active} note="Accès momentanément bloqué" icon={a.imgContainer3} tone="negative" /></div>
    <div className="toolbar"><div className="segmented">{[['Tous',employees.length],['Actifs',active],['Suspendus',employees.length-active],['Gérants',employees.filter(e => e.role === 'Gérant').length]].map(([name,count]) => <button key={name} className={filter === name ? 'selected' : ''} aria-pressed={filter === name} onClick={() => setFilter(String(name))}>{name} ({count})</button>)}</div><SearchInput value={query} onChange={setQuery} placeholder="Filtrer la liste..." /></div>
    <div className="table-panel employee-table"><div className="table-scroll"><table><thead><tr><th>Employé</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th className="align-right">Actions</th></tr></thead><tbody>{rows.map(e => <tr key={e.id}><td><div className="person"><span className="avatar">{initials(e.name)}</span><div><strong>{e.name}</strong><small>{e.email}</small></div></div></td><td><Badge tone={e.role === 'Gérant' ? '' : 'neutral'}>{e.role}</Badge></td><td><Badge tone={e.active ? 'green' : 'red'}>● {e.active ? 'Actif' : 'Suspendu'}</Badge></td><td className="muted">{e.lastLogin}</td><td className="align-right"><details className="action-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.removeAttribute('open') }} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.removeAttribute('open'); event.currentTarget.querySelector('summary')?.focus() } }}><summary aria-label={`Actions pour ${e.name}`}><Icon src={a.imgContainer5} /></summary><div className="dropdown" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}><button onClick={() => edit(e)}><Icon src={a.imgContainer7} />Modifier</button><button disabled title="L’envoi d’un lien nécessite le backend"><Icon src={a.imgContainer8} />Réinitialiser le mot de passe</button><button onClick={() => { setEmployees(current => current.map(item => item.id === e.id ? { ...item, active: !item.active } : item)); notify(`Compte ${e.active ? 'suspendu' : 'activé'} localement.`) }}><Icon src={a.imgContainer9} />{e.active ? 'Suspendre' : 'Activer'}</button><button className="danger-text" onClick={() => setDeleting(e)}><Icon src={a.imgContainer10} />Supprimer</button></div></details></td></tr>)}</tbody></table></div>{rows.length === 0 && <EmptyState />}</div>
    {editing && <Modal title={editing.id ? 'Modifier l’employé' : 'Ajouter un employé'} onClose={() => setEditing(null)}><form className="form-stack" onSubmit={e => { e.preventDefault(); save() }}><label>Nom complet *<input required autoFocus maxLength={100} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></label><label>Adresse e-mail *<input required type="email" maxLength={150} value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></label><label>Rôle<select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value as Employee['role'] })}><option>Employé</option><option>Gérant</option></select></label><div className="switch-row"><span>Compte actif</span><Toggle checked={editing.active} onChange={active => setEditing({ ...editing, active })} label="Compte actif" /></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button type="button" className="button ghost" onClick={() => setEditing(null)}>Annuler</button><button className="button primary" type="submit">Enregistrer</button></div></form></Modal>}
    {deleting && <ConfirmDelete title="Supprimer ce compte ?" onClose={() => setDeleting(null)} onConfirm={() => { setEmployees(current => current.filter(e => e.id !== deleting.id)); setDeleting(null); notify('Compte supprimé de la démonstration locale.') }}>Le compte de <strong>{deleting.name}</strong> sera supprimé de cette session. Ses accès et les données du serveur ne sont pas modifiés dans cette démonstration.</ConfirmDelete>}
  </>
}
