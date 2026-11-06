import { studentRequest } from './remoteCatalog';

export const contentId = id => /^api-(\d+)$/.test(String(id)) ? Number(String(id).slice(4)) : null;

export function mapOrder(order) {
  return {
    id: order.id,
    restaurantId: order.restaurant_id,
    date: order.created_at,
    items: (order.lines || []).map(line => ({
      id: String(line.id), name: line.title_snapshot, price: line.unit_price_cdf,
      quantity: line.quantity,
    })),
    subtotal: order.subtotal_cdf ?? order.amount_cdf,
    discount: 0,
    total: order.amount_cdf,
    mode: order.service === 'delivery' ? 'Livraison' : 'Retrait',
    address: order.delivery_address_snapshot?.address_line || '',
    arrival: order.requested_at || '',
    payment: 'Espèces à régler',
    paymentStatus: 'À régler',
    status: order.status,
    source: 'server',
  };
}

export function orderItems(cartItems) {
  return cartItems.map(({ dish, quantity }) => {
    const id = contentId(dish.id);
    if (!id) throw new Error('Ce plat de démonstration ne peut pas être commandé auprès du serveur. Actualisez le catalogue.');
    return { content_id: id, quantity };
  });
}

export function requestedDate(arrival) {
  if (!/^\d{2}:\d{2}$/.test(arrival)) throw new Error('Choisissez une heure valide.');
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Kinshasa', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  let candidate = new Date(`${today}T${arrival}:00+01:00`);
  if (candidate.getTime() <= Date.now() + 15 * 60000) candidate = new Date(candidate.getTime() + 86400000);
  return candidate;
}

export async function buildOrderRequest(restaurantId, token, { mode, address, district, phone, arrival, cartItems }) {
  const requested = requestedDate(arrival);
  const service = mode === 'Livraison' ? 'delivery' : 'pickup';
  const weekday = new Date(requested.getTime() + 3600000).getUTCDay();
  const slots = await studentRequest(`/restaurants/${encodeURIComponent(restaurantId)}/service-slots`, token);
  const slot = slots.find(item => item.service === service && Number(item.weekday) === weekday
    && arrival >= String(item.starts_at).slice(0, 5) && arrival < String(item.ends_at).slice(0, 5));
  if (!slot) throw new Error('Aucun créneau disponible pour cette heure. Choisissez une autre heure.');
  const body = { service, requested_at: requested.toISOString(), service_slot_id: slot.id, items: orderItems(cartItems) };
  if (service === 'delivery') {
    if (!address.trim() || !district.trim() || !phone.trim()) throw new Error('Renseignez l’adresse, la commune et le téléphone pour la livraison.');
    const saved = await studentRequest('/me/delivery-addresses', token, { method: 'POST', body: JSON.stringify({
      label: 'Commande mobile', address_line: address.trim(), district: district.trim(), city: 'Kinshasa', phone: phone.trim(),
    }) });
    body.delivery_address_id = saved.id;
  }
  return body;
}
