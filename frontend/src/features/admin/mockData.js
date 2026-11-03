export const initialEmployees = [
  { id: 'emp-01', name: 'Marie T.', email: 'marie.t@zeduc-space.cm', role: 'Employé', active: true, lastLogin: 'Aujourd’hui à 18:55' },
  { id: 'emp-02', name: 'Josué N.', email: 'josue.n@zeduc-space.cm', role: 'Employé', active: true, lastLogin: 'Aujourd’hui à 17:30' },
  { id: 'emp-03', name: 'Aïcha B.', email: 'aicha.b@zeduc-space.cm', role: 'Employé', active: true, lastLogin: 'Hier à 22:15' },
  { id: 'emp-04', name: 'Ferdinand M.', email: 'ferdinand.m@zeduc-space.cm', role: 'Employé', active: false, lastLogin: 'Il y a 14 jours' },
]

export const categories = ['Plats chauds', 'Grillades & braisés', 'Boissons fraîches', 'Desserts']

export const initialDishes = [
  { id: 'dish-01', name: 'Ndolé Royal aux Crevettes', category: categories[0], price: 4000, description: 'Mijoté traditionnel · Plantains vapeur', available: true, featured: true },
  { id: 'dish-02', name: 'Poulet DG Spécial ZeDuc', category: categories[0], price: 4500, description: 'Poulet fermier · Légumes sautés', available: true, featured: true },
  { id: 'dish-03', name: 'Poisson braisé & Bobolo', category: categories[1], price: 3500, description: 'Bar entier braisé au feu de bois', available: true, featured: false },
  { id: 'dish-04', name: 'Bissap Maison Menthe', category: categories[2], price: 1000, description: 'Rupture de stock momentanée', available: false, featured: false },
]

export const initialPromotions = [
  { id: 'promo-01', title: 'Promo Bar Braisé -15 %', type: 'Promotion', status: 'Active', start: '2026-11-01', end: '2026-11-30', description: 'Réduction sur le bar braisé servi sur place ou à emporter.' },
  { id: 'event-01', title: 'Soirée Ligue des champions', type: 'Événement', status: 'Programmée', start: '2026-11-18', end: '2026-11-18', description: 'Diffusion live et service tapas spécial match.' },
  { id: 'event-02', title: 'Tournoi de billard', type: 'Événement', status: 'Brouillon', start: '2026-12-03', end: '2026-12-03', description: 'Inscriptions limitées à seize joueurs.' },
]

export const initialComplaints = [
  { id: 'RC-0042', customer: 'Éric T.', subject: 'Points parrainage non crédités', status: 'En attente', updated: 'Il y a 15 min', answer: '' },
  { id: 'RC-0041', customer: 'Sarah M.', subject: 'Retard de livraison (+35 min)', status: 'En examen', updated: 'Il y a 1 h', answer: '' },
  { id: 'RC-0040', customer: 'Boris K.', subject: 'Boisson non conforme', status: 'Validée', updated: 'Il y a 3 h', answer: 'Point à vérifier avec le service.' },
]

export const initialSettings = {
  pointsPerAmount: 1000,
  pointsForDiscount: 15,
  discountAmount: 1000,
  expiryMonths: 12,
  openingHours: '11:00 – 22:00',
}
