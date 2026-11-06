export const platformApiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '') || ''

export async function platformRequest(path, token, options = {}) {
  if (!platformApiBase) throw new Error('Configurez VITE_API_URL pour connecter la plateforme.')
  let response
  try {
    response = await fetch(`${platformApiBase}/api${path}`, {
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    })
  } catch { throw new Error('Réseau indisponible. Vérifiez la connexion à l’API.') }
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(body?.message || `Requête refusée (${response.status}).`)
    error.status = response.status
    throw error
  }
  return body
}
