import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { assets } from '../design-assets'

export function Icon({ src }: { src: string }) {
  return <span className="icon" aria-hidden="true"><img src={src} alt="" /></span>
}
export function PageHeading({ first, accent, description, action }: { first: string; accent?: string; description: string; action?: ReactNode }) {
  return <header className="page-heading"><div><p className="eyebrow">ESPACE ADMINISTRATEUR · ZEDUC-SP@CE · YANSOKI</p><h1>{first} <span>{accent}</span></h1><p className="muted">{description}</p></div>{action}</header>
}
export function Panel({ children, title, subtitle, action, className = '', id }: { children: ReactNode; title?: string; subtitle?: string; action?: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`panel ${className}`}>{title && <header className="panel-heading"><div><h2>{title}</h2>{subtitle && <p className="muted small">{subtitle}</p>}</div>{action}</header>}{children}</section>
}
export function Metric({ label, value, unit, note, icon, tone = '', children }: { label: string; value: string | number; unit?: string; note: string; icon?: string; tone?: string; children?: ReactNode }) {
  return <article className={`metric ${tone}`}><div className="metric-top"><div><p className="metric-label">{label}</p><p className="metric-value">{value} <small>{unit}</small></p></div>{icon && <span className="metric-icon"><Icon src={icon} /></span>}</div><div className="metric-note"><span>{note}</span>{children}</div></article>
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>
}
export function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" className={`toggle ${checked ? 'on' : ''}`} role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}><span /></button>
}
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="search-input"><Icon src={assets.dashboard.imgIconSearch} /><input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /></label>
}
export function EmptyState({ children = 'Aucun résultat pour ces filtres.' }: { children?: ReactNode }) {
  return <div className="empty-state" role="status">{children}</div>
}
export function Modal({ title, children, onClose, drawer = false, subtitle, confirm = false }: { title: string; children: ReactNode; onClose: () => void; drawer?: boolean; subtitle?: string; confirm?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const dialog = ref.current
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <dialog ref={ref} aria-labelledby={titleId} className={drawer ? 'dialog drawer' : confirm ? 'dialog dialog-confirm' : 'dialog'} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose() } }}><header className="dialog-heading">{confirm && <div className="delete-warning"><Icon src={assets.deleteEmployee.imgContainer} /></div>}<div><h2 id={titleId}>{title}</h2>{subtitle && <p className="muted small">{subtitle}</p>}</div>{!confirm && <button className="icon-button close-button" aria-label="Fermer" type="button" onClick={onClose}>×</button>}</header>{children}</dialog>
}
export function ConfirmDelete({ title, children, onClose, onConfirm }: { title: string; children: ReactNode; onClose: () => void; onConfirm: () => void }) {
  return <Modal title={title} onClose={onClose} confirm><div className="muted">{children}</div><div className="dialog-actions"><button type="button" className="button ghost" onClick={onClose}>Annuler</button><button type="button" className="button danger" onClick={onConfirm}><Icon src={assets.deleteEmployee.imgContainer1} />Supprimer</button></div></Modal>
}
export async function readImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Choisissez une image PNG, JPG ou WebP.')
  if (file.size > 8 * 1024 * 1024) throw new Error('L’image doit peser moins de 8 Mo.')
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Impossible de lire cette image.'))
    reader.readAsDataURL(file)
  })
  await new Promise<void>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(new Error('Cette image est illisible.')); img.src = url })
  return url
}
