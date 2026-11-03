export function Panel({ title, description, action, children }) {
  return <section className="admin-panel"><header className="admin-panel-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>
}

export function Metric({ label, value, detail }) {
  return <article className="admin-metric"><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`admin-badge admin-badge-${tone}`}>{children}</span>
}

export function EmptyState({ children = 'Aucune donnée ne correspond aux filtres.' }) {
  return <p className="admin-empty">{children}</p>
}

export function Notice({ children }) {
  return <p className="admin-notice" role="status">{children}</p>
}
