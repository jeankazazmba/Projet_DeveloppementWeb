export const money = value => `${Math.round(value).toLocaleString('fr-CD')} CDF`

export const rights = [
  { key: 'orders', title: 'Gérer les commandes', detail: 'Tableau des commandes et préparation en cuisine' },
  { key: 'menu', title: 'Mettre à jour le menu du service', detail: 'Disponibilités et plats du jour ; prix en lecture seule' },
  { key: 'claims', title: 'Proposer une réponse aux réclamations', detail: 'Le gérant valide ou rejette la proposition' },
  { key: 'stats', title: 'Voir les statistiques hebdomadaires', detail: 'Rapports de ventes et taux d’affluence' },
]

export const initialEmployees = [
  { id: 'e1', name: 'Marie T.', email: 'marie.t@zeduc-space.cd', phone: '699 42 18 90', status: 'Actif', lastLogin: 'Il y a 5 min', rights: ['orders', 'menu', 'claims', 'stats'] },
  { id: 'e2', name: 'Josué N.', email: 'j.nguemo@zeduc-space.cd', phone: '699 31 42 55', status: 'Actif', lastLogin: 'Il y a 1 h', rights: ['orders', 'menu'] },
  { id: 'e3', name: 'Aïcha B.', email: 'aicha.b@zeduc-space.cd', phone: '699 12 21 30', status: 'Actif', lastLogin: 'Hier 18:40', rights: ['orders', 'claims'] },
  { id: 'e4', name: 'Ferdinand M.', email: 'f.mbassi@zeduc-space.cd', phone: '699 10 28 14', status: 'Suspendu', lastLogin: '12 oct.', rights: ['orders'] },
]

const age = minutes => new Date(Date.now() - minutes * 60_000).toISOString()
export const initialOrders = [
  { id: 'MM-1051', customer: 'Carine M.', service: 'Sur place', location: 'Table 07', employee: 'Marie T.', status: 'Reçue', createdAt: age(2), amount: 4400 },
  { id: 'MM-1050', customer: 'Éric T.', service: 'Sur place', location: 'Table 03', employee: 'Josué N.', status: 'Reçue', createdAt: age(4), amount: 3500 },
  { id: 'MM-1049', customer: 'Linda B.', service: 'Livraison', location: 'campus de Kinshasa', employee: 'Aïcha B.', status: 'Reçue', createdAt: age(5), amount: 5200 },
  { id: 'MM-1048', customer: 'Arsène K.', service: 'Livraison', location: 'campus de Kinshasa', employee: 'Marie T.', status: 'En préparation', createdAt: age(9), amount: 4400 },
  { id: 'MM-1047', customer: 'Yannick S.', service: 'Sur place', location: 'Table 11', employee: 'Josué N.', status: 'En préparation', createdAt: age(12), amount: 3000 },
  { id: 'MM-1046', customer: 'Mireille D.', service: 'Livraison', location: 'Campus université', employee: 'Aïcha B.', status: 'En préparation', createdAt: age(14), amount: 2800 },
  { id: 'MM-1045', customer: 'Paul N.', service: 'Sur place', location: 'Table 14', employee: 'Marie T.', status: 'Prête', createdAt: age(18), amount: 5500 },
  { id: 'MM-1044', customer: 'Sandra O.', service: 'Livraison', location: 'campus de Kinshasa', employee: 'Aïcha B.', status: 'Prête', createdAt: age(21), amount: 4500 },
]

// The keys mirror the admin table resource so this screen can later consume the same API.
export const initialTables = Array.from({ length: 12 }, (_, index) => {
  const id = `T${String(index + 1).padStart(2, '0')}`
  const order = initialOrders.find(item => item.service === 'Sur place' && item.location === `Table ${String(index + 1).padStart(2, '0')}`)
  return {
    id,
    zone: index < 8 ? 'Salle' : 'Terrasse',
    seats: index % 3 === 0 ? 6 : index % 3 === 1 ? 4 : 2,
    status: order ? 'Occupée' : index < 8 ? 'Libre' : index < 10 ? 'Réservée' : 'Nettoyage',
    orderId: order?.id || null,
  }
})

// Static preview markers. A driver app and authenticated location API are required for live GPS.
export const previewCouriers = [
  { id: 'liv-01', name: 'Livreur démo 01', status: 'En livraison', orderId: 'MM-1044', latitude: -4.3221, longitude: 15.3187, updatedAt: null },
  { id: 'liv-02', name: 'Livreur démo 02', status: 'Disponible', orderId: null, latitude: -4.3274, longitude: 15.3256, updatedAt: null },
  { id: 'liv-03', name: 'Livreur démo 03', status: 'En livraison', orderId: 'MM-1049', latitude: -4.3208, longitude: 15.3291, updatedAt: null },
]

export const initialClaims = [
  {
    id: 'RC-0031', student: 'Arsène K.', location: 'Secteur universitaire · Kinshasa', elapsed: 'Il y a 25 min', orderId: 'MM-1042', amount: 4400,
    reason: 'Plat servi froid (Ndolé aux crevettes)', status: 'À valider',
    message: 'Bonjour, le ndolé aux crevettes est arrivé totalement froid et le plantain n’était pas assez cuit. Déçu pour une commande livrée en résidence.',
    item: 'Ndolé aux crevettes + Plantain vapeur', attachment: 'Photo justificative · JPEG · 2,4 Mo',
    proposedBy: 'Marie T.', proposedAt: '12:51',
    proposal: 'Bonjour Arsène, nous vous présentons toutes nos excuses pour cet incident. Notre brigade de cuisine prend note immédiatement. Nous vous proposons un avoir de 1 000 CDF déductible sur votre prochaine commande Khalifa_food.',
    gesture: 'Réduction de 1 000 CDF', note: '',
  },
  {
    id: 'RC-0033', student: 'Clarisse M.', location: 'Campus universitaire · Kinshasa', elapsed: 'Il y a 1 h', orderId: 'MM-1039', amount: 2800,
    reason: 'Article manquant (Bissap 50cl oublié)', status: 'À valider',
    message: 'Bonjour, la boisson Bissap prévue avec mon menu n’était pas dans le sac de livraison. Merci de vérifier ma commande.',
    item: 'Menu du jour + Bissap 50cl', attachment: null,
    proposedBy: 'Josué N.', proposedAt: '12:17',
    proposal: 'Bonjour Clarisse, nous sommes désolés pour cet oubli. Nous proposons de créditer votre prochaine commande du montant de la boisson manquante.',
    gesture: 'Avoir portefeuille client', note: '',
  },
]

export const stats = {
  day: {
    label: 'Aujourd’hui', revenue: 187500, orders: 64, students: 9, points: 280, usedPoints: 180,
    sales: [12, 17, 24, 35, 28, 21, 25, 18, 31, 39, 24],
    labels: ['11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h'],
    issued: [42, 57, 62, 73], used: [26, 39, 48, 67],
    referrals: [26, 11, 5], onsite: 39, delivery: 25,
  },
  week: {
    label: '7 jours', revenue: 452000, orders: 151, students: 18, points: 690, usedPoints: 440,
    sales: [35, 52, 42, 64, 58, 77, 69], labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    issued: [61, 74, 90, 105], used: [38, 52, 67, 82],
    referrals: [68, 29, 13], onsite: 88, delivery: 63,
  },
  month: {
    label: '30 jours', revenue: 1684000, orders: 562, students: 47, points: 1940, usedPoints: 1320,
    sales: [29, 36, 42, 41, 46, 43, 58, 67, 84, 72, 88, 92, 94, 78, 80],
    labels: ['01 oct', '', '', '08 oct', '', '', '15 oct', '', '', '22 oct', '', '', '29 oct', '', ''],
    issued: [62, 77, 91, 84], used: [39, 59, 68, 75],
    referrals: [213, 106, 60], onsite: 326, delivery: 236,
  },
}

export const popularDishes = [
  { name: 'Poulet DG', portions: 142, revenue: 426000 },
  { name: 'Ndolé aux crevettes', portions: 118, revenue: 354000 },
  { name: 'Poisson braisé & bobolo', portions: 96, revenue: 432000 },
  { name: 'Burger maison Khalifa', portions: 74, revenue: 222000 },
  { name: 'Beignets-haricots & bouillie', portions: 68, revenue: 68000 },
]

export const gestures = ['Aucun geste', 'Réduction de 1 000 CDF', 'Avoir portefeuille client', 'Plat offert', '+150 points fidélité']

export const sleepyEmployees = [
  { id: 'sh-e1', name: 'Patrick M.', email: 'patrick@sleepy-hollow.cd', phone: '000 00 00 00', status: 'Actif', lastLogin: 'Aujourd’hui', rights: ['orders', 'menu', 'claims'] },
]
export const sleepyOrders = [
  { id: 'SH-2001', customer: 'Nadia F.', service: 'Sur place', location: 'Table 01', employee: 'Patrick M.', status: 'Reçue', createdAt: age(3), amount: 4000 },
  { id: 'SH-2002', customer: 'Paul K.', service: 'Livraison', location: 'Campus universitaire', employee: 'Patrick M.', status: 'En préparation', createdAt: age(12), amount: 4700 },
]
export const sleepyTables = Array.from({ length: 6 }, (_, index) => ({ id: `T${String(index + 1).padStart(2, '0')}`, zone: 'Salle', seats: 4, status: index === 0 ? 'Occupée' : 'Libre', orderId: index === 0 ? 'SH-2001' : null }))
export const sleepyClaims = [
  { id: 'SH-RC-01', student: 'Paul K.', location: 'Campus universitaire', elapsed: 'Il y a 8 min', orderId: 'SH-2002', amount: 4700, reason: 'Temps de livraison', status: 'À valider', message: 'Je souhaite connaître le délai de livraison.', item: 'Brochettes du soir', attachment: null, proposedBy: 'Patrick M.', proposedAt: 'Aujourd’hui', proposal: 'Nous vérifions la livraison.', gesture: 'Aucun geste', note: '' },
]
export const sleepyStats = Object.fromEntries(Object.entries(stats).map(([period, value]) => [period, {
  ...value, revenue: Math.round(value.revenue * 0.22), orders: Math.round(value.orders * 0.25), students: Math.round(value.students * 0.25),
  points: Math.round(value.points * 0.25), usedPoints: Math.round(value.usedPoints * 0.25),
  sales: value.sales.map(amount => Math.round(amount * 0.22)), issued: value.issued.map(amount => Math.round(amount * 0.25)),
  used: value.used.map(amount => Math.round(amount * 0.25)), referrals: value.referrals.map(amount => Math.round(amount * 0.25)),
  onsite: Math.round(value.onsite * 0.25), delivery: Math.round(value.delivery * 0.25),
}]))
export const sleepyPopularDishes = [
  { name: 'Burger nocturne sleepy hollow', portions: 18, revenue: 75600 },
  { name: 'Brochettes du soir', portions: 14, revenue: 44800 },
  { name: 'Limonade gingembre et menthe', portions: 9, revenue: 13500 },
]
export const sleepyPreviewCouriers = [
  { id: 'sh-liv-01', name: 'Livreur sleepy hollow', status: 'En livraison', orderId: 'SH-2002', latitude: -4.3258, longitude: 15.3206, updatedAt: null },
]
