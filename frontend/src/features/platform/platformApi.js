export const platformApiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '') || ''

export async function platformRequest(path, token, options = {}) {
  if (!platformApiBase) throw new Error('Configurez VITE_API_URL pour connecter la plateforme.')
  const response = await fetch(`${platformApiBase}/api${path}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(body?.message || `Requête refusée (${response.status}).`)
    error.status = response.status
    throw error
  }
  return body
}
