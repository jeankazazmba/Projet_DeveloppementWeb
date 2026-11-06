const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '')

export const studentApiConfigured = Boolean(base)

export async function studentApi(path, token, { method = 'GET', body, headers = {}, signal } = {}) {
  if (!base) throw new Error('Configurez VITE_API_URL pour utiliser le compte étudiant.')
  let response
  try {
    response = await fetch(`${base}/api${path}`, {
      method, signal,
      headers: { Accept: 'application/json', ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error('Connexion à l’API indisponible. Vérifiez le réseau puis réessayez.')
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const details = data?.error?.details || data?.errors
    const first = details && Object.values(details).flat()[0]
    const error = new Error(first || data?.error?.message || data?.message || `Erreur HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

export async function studentDownload(url, token, filename) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error('Pièce jointe indisponible.')
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl; link.download = filename || 'piece-jointe'; link.click()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export const formatCdf = value => `${new Intl.NumberFormat('fr-CD').format(Number(value || 0))} CDF`
export const asList = value => Array.isArray(value) ? value : value?.data || []
