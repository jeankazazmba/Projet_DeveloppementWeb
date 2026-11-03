export const money = value => `${Math.round(value).toLocaleString('fr-FR')} FCFA`

export const rights = [
  { key: 'orders', title: 'Gérer les commandes', detail: 'Tableau des commandes et préparation en cuisine' },
  { key: 'menu', title: 'Mettre à jour le menu (temporaire)', detail: 'Disponibilités, plats du jour et prix' },
  { key: 'claims', title: 'Traiter les réclamations', detail: 'Suivi et résolution des litiges clients' },
  { key: 'stats', title: 'Voir les statistiques hebdomadaires', detail: 'Rapports de ventes et taux d’affluence' },
]

export const initialEmployees = [
  { id: 'e1', name: 'Marie T.', email: 'marie.t@zeduc-space.cm', phone: '699 42 18 90', status: 'Actif', lastLogin: 'Il y a 5 min', rights: ['orders', 'menu', 'claims', 'stats'] },
  { id: 'e2', name: 'Josué N.', email: 'j.nguemo@zeduc-space.cm', phone: '699 31 42 55', status: 'Actif', lastLogin: 'Il y a 1 h', rights: ['orders', 'menu'] },
  { id: 'e3', name: 'Aïcha B.', email: 'aicha.b@zeduc-space.cm', phone: '699 12 21 30', status: 'Actif', lastLogin: 'Hier 18:40', rights: ['orders', 'claims'] },
  { id: 'e4', name: 'Ferdinand M.', email: 'f.mbassi@zeduc-space.cm', phone: '699 10 28 14', status: 'Suspendu', lastLogin: '12 oct.', rights: ['orders'] },
]

const age = minutes => new Date(Date.now() - minutes * 60_000).toISOString()
export const initialOrders = [
  { id: 'MM-1051', customer: 'Carine M.', service: 'Sur place', location: 'Table 07', employee: 'Marie T.', status: 'Reçue', createdAt: age(2), amount: 4400 },
  { id: 'MM-1050', customer: 'Éric T.', service: 'Sur place', location: 'Table 03', employee: 'Josué N.', status: 'Reçue', createdAt: age(4), amount: 3500 },
  { id: 'MM-1049', customer: 'Linda B.', service: 'Livraison', location: 'Rés. La Terrasse', employee: 'Aïcha B.', status: 'Reçue', createdAt: age(5), amount: 5200 },
  { id: 'MM-1048', customer: 'Arsène K.', service: 'Livraison', location: 'Rés. La Terrasse', employee: 'Marie T.', status: 'En préparation', createdAt: age(9), amount: 4400 },
  { id: 'MM-1047', customer: 'Yannick S.', service: 'Sur place', location: 'Table 11', employee: 'Josué N.', status: 'En préparation', createdAt: age(12), amount: 3000 },
  { id: 'MM-1046', customer: 'Mireille D.', service: 'Livraison', location: 'Campus IUT', employee: 'Aïcha B.', status: 'En préparation', createdAt: age(14), amount: 2800 },
  { id: 'MM-1045', customer: 'Paul N.', service: 'Sur place', location: 'Table 14', employee: 'Marie T.', status: 'Prête', createdAt: age(18), amount: 5500 },
  { id: 'MM-1044', customer: 'Sandra O.', service: 'Livraison', location: 'Rés. La Terrasse', employee: 'Aïcha B.', status: 'Prête', createdAt: age(21), amount: 4500 },
]

export const initialClaims = [
  {
    id: 'RC-0031', student: 'Arsène K.', location: 'Rés. La Terrasse · Douala', elapsed: 'Il y a 25 min', orderId: 'MM-1042', amount: 4400,
    reason: 'Plat servi froid (Ndolé aux crevettes)', status: 'À valider',
    message: 'Bonjour, le ndolé aux crevettes est arrivé totalement froid et le plantain n’était pas assez cuit. Déçu pour une commande livrée en résidence.',
    item: 'Ndolé aux crevettes + Plantain vapeur', attachment: 'Photo justificative · JPEG · 2,4 Mo',
    proposedBy: 'Marie T.', proposedAt: '12:51',
    proposal: 'Bonjour Arsène, nous vous présentons toutes nos excuses pour cet incident. Notre brigade de cuisine prend note immédiatement. Nous vous proposons un avoir de 1 000 FCFA déductible sur votre prochaine commande ZeDuc-Sp@ce.',
    gesture: 'Réduction de 1 000 FCFA', note: '',
  },
  {
    id: 'RC-0033', student: 'Clarisse M.', location: 'Campus IUT · Douala', elapsed: 'Il y a 1 h', orderId: 'MM-1039', amount: 2800,
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
  { name: 'Burger maison ZeDuc', portions: 74, revenue: 222000 },
  { name: 'Beignets-haricots & bouillie', portions: 68, revenue: 68000 },
]

export const gestures = ['Aucun geste', 'Réduction de 1 000 FCFA', 'Avoir portefeuille client', 'Plat offert', '+150 points fidélité']
