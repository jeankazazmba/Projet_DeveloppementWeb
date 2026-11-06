const KEY = 'mmm-auth-session-v1'

export function readAuthSession() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY))
    return value?.token && value?.role ? value : null
  } catch { return null }
}

export function saveAuthSession(value) {
  localStorage.setItem(KEY, JSON.stringify({ token: value.token, role: value.role, profile: value.profile || null, restaurants: value.restaurants || [], restaurantId: value.restaurantId || null }))
}

export function clearAuthSession() {
  localStorage.removeItem(KEY)
}

export async function logoutAuthSession() {
  const session = readAuthSession()
  clearAuthSession()
  if (!session?.token) return
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '').replace(/\/api$/, '')
  if (!base) return
  try {
    await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${session.token}` } })
  } catch { /* La session locale est supprimée même si le réseau est indisponible. */ }
}

export const rolePath = role => ({ student: '/etudiant', employee: '/employe', manager: '/gerant', admin: '/admin', platform: '/plateforme' })[role] || '/acces'
