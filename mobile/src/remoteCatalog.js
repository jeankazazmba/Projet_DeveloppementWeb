import { setDishes } from './catalog';
import { setRestaurants } from './restaurants';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '').replace(/\/api$/, '');
export const remoteApiUrl = apiUrl;
export async function staffRequest(path, token, options = {}) {
  if (!apiUrl) throw new Error('API non configurée. Utilisez la démonstration.');
  let response;
  try {
    response = await fetch(`${apiUrl}/api${path}`, { ...options, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  } catch {
    throw new Error('Réseau indisponible. Vérifiez la connexion à l’API.');
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.message || `Requête refusée (${response.status}).`);
    error.status = response.status;
    error.details = body?.error?.details;
    throw error;
  }
  return body;
}
export const studentRequest = staffRequest;
let remoteContent = null;

export function getRemoteContent(restaurantId, kind) {
  return remoteContent?.filter(item => item.restaurant_id === restaurantId && item.kind === kind) ?? null;
}

export async function loadRemoteCatalog() {
  if (!apiUrl) return false;
  const response = await fetch(`${apiUrl}/api/restaurants`);
  if (!response.ok) throw new Error('Répertoire indisponible');
  const restaurants = await response.json();
  if (!Array.isArray(restaurants) || !restaurants.length) return false;
  const content = await Promise.all(restaurants.map(async restaurant => {
    const result = await fetch(`${apiUrl}/api/restaurants/${encodeURIComponent(restaurant.id)}/content`);
    if (!result.ok) throw new Error(`Catalogue indisponible : ${restaurant.name}`);
    return result.json();
  }));
  const all = content.flat();
  setRestaurants(restaurants.map(item => ({ ...item, example: item.is_demo })));
  setDishes(all.filter(item => item.kind === 'dish').map(item => ({
    id: `api-${item.id}`, restaurantId: item.restaurant_id, name: item.title,
    description: item.description || '', category: item.details?.category || 'Plats',
    price: item.price_cdf || 0, available: item.is_available !== false, featured: item.is_featured === true,
    image: item.image_url ? { uri: item.image_url } : require('../assets/images/admin-menu-0.jpg'),
  })));
  remoteContent = all;
  return true;
}
