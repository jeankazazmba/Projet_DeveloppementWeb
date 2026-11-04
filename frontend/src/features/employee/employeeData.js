import { menuImage } from '../public/publicData.js'

export const money = value => `${Math.round(value).toLocaleString('fr-FR')} CDF`
export const orderSteps = ['Reçue', 'En préparation', 'Prête', 'Livrée']
export const menuCategories = ['Tout', 'Plats chauds', 'Grillades & Braisés', 'Boissons fraîches', 'Desserts & Douceurs']

const minutesAgo = minutes => new Date(Date.now() - minutes * 60_000).toISOString()

// Données de démonstration inspirées des quatre exports --Employe.
export const initialOrders = [
  { id: 'MM-1051', customer: 'Carine M.', service: 'Sur place', location: 'Table 07', items: 'Riz sauté au poulet', amount: 3000, status: 'Reçue', createdAt: minutesAgo(2) },
  { id: 'MM-1050', customer: 'Éric T.', service: 'Sur place', location: 'Table 03', items: 'Burger maison ×2, Jus de gingembre', amount: 5500, status: 'Reçue', createdAt: minutesAgo(4) },
  { id: 'MM-1049', customer: 'Linda B.', service: 'Livraison', location: 'campus de Kinshasa', items: 'Ndolé aux crevettes', amount: 3000, status: 'Reçue', createdAt: minutesAgo(5) },
  { id: 'MM-1048', customer: 'Arsène K.', service: 'Livraison', location: 'campus de Kinshasa', items: 'Poulet DG Royal ×2, Poisson braisé & bobolo, Bissap', amount: 9750, status: 'En préparation', createdAt: minutesAgo(9) },
  { id: 'MM-1047', customer: 'Yannick S.', service: 'Sur place', location: 'Table 11', items: 'Brochettes de bœuf ×3', amount: 4500, status: 'En préparation', createdAt: minutesAgo(12) },
  { id: 'MM-1046', customer: 'Mireille D.', service: 'Livraison', location: 'campus de Kinshasa', items: 'Beignets-haricots ×2', amount: 1000, status: 'En préparation', createdAt: minutesAgo(14) },
  { id: 'MM-1045', customer: 'Paul N.', service: 'Sur place', location: 'Table 14', items: 'Poulet DG, Bissap', amount: 4000, status: 'Prête', createdAt: minutesAgo(18) },
  { id: 'MM-1044', customer: 'Sandra O.', service: 'Livraison', location: 'campus de Kinshasa', items: 'Poisson braisé & bobolo', amount: 4500, status: 'Prête', createdAt: minutesAgo(21) },
]

export const initialMenu = [
  { id: 'plat-poulet', name: 'Poulet DG Spécial ZeDuc', description: 'Bananes plantains frites et poulet fermier mijoté', category: 'Plats chauds', price: 3500, available: true, featured: true, image: menuImage(129) },
  { id: 'plat-ndole', name: 'Ndolé Royal aux Crevettes', description: 'Feuilles de ndolé, crevettes et plantains vapeur', category: 'Plats chauds', price: 4000, available: true, featured: false, image: menuImage(75) },
  { id: 'plat-poisson', name: 'Bar Braisé & Bobolo Artisanal', description: 'Poisson braisé au feu de bois et bobolo', category: 'Grillades & Braisés', price: 3800, available: false, featured: false, image: menuImage(101) },
  { id: 'plat-brochettes', name: 'Brochettes de Bœuf Suya', description: 'Bœuf mariné et épices du Nord', category: 'Grillades & Braisés', price: 2200, available: true, featured: false, image: menuImage(176) },
  { id: 'plat-bissap', name: 'Bissap Glacé & Feuilles de Menthe', description: 'Infusion d’hibiscus et menthe fraîche', category: 'Boissons fraîches', price: 1000, available: true, featured: false, image: menuImage(279) },
  { id: 'plat-gingembre', name: 'Jus de Gingembre Pressé Maison', description: 'Gingembre, citron vert et miel', category: 'Boissons fraîches', price: 1200, available: true, featured: false, image: menuImage(253) },
  { id: 'plat-riz', name: 'Riz Sauté aux Légumes & Émincé de Bœuf', description: 'Riz sauté, légumes croquants et bœuf', category: 'Plats chauds', price: 2800, available: true, featured: false, image: menuImage(202) },
  { id: 'plat-dessert', name: 'Tartelette Mangue & Fruits de la Passion', description: 'Pâtisserie fruitée de la maison', category: 'Desserts & Douceurs', price: 1800, available: true, featured: false, image: '/employee-assets/tartelette.jpg' },
]

export const initialClaims = [
  { id: 'RC-0031', student: 'Arsène K.', orderId: 'MM-1042', reason: 'Plat servi froid', message: 'Bonjour, ma commande MM-1042 est arrivée il y a 15 minutes mais le ndolé était complètement froid et la sauce figée. Impossible de manger tel quel.', status: 'En cours', received: 'Il y a 18 min', amount: 4400, location: 'campus de Kinshasa · Chambre B12', attachment: 'photo_plat_froid.jpg', response: '' },
  { id: 'RC-0030', student: 'Mireille D.', orderId: 'MM-1038', reason: 'Article manquant', message: 'La boisson commandée ne se trouvait pas dans mon sac de livraison.', status: 'Envoyée au gérant', received: 'Il y a 42 min', amount: 3200, location: 'Campus université', attachment: null, response: 'Nous avons vérifié la préparation et proposé un avoir pour la boisson manquante.' },
  { id: 'RC-0029', student: 'Sandra O.', orderId: 'MM-1035', reason: 'Retard livraison', message: 'La livraison est arrivée avec plus de 30 minutes de retard.', status: 'À traiter', received: 'Il y a 1 h 10', amount: 4500, location: 'campus de Kinshasa', attachment: null, response: '' },
  { id: 'RC-0028', student: 'Yannick S.', orderId: 'MM-1029', reason: 'Erreur montant', message: 'Le montant débité ne correspond pas au total de la commande.', status: 'Résolue', received: 'Il y a 2 h 05', amount: 3000, location: 'Table 11', attachment: null, response: 'Le montant a été corrigé après vérification.' },
  { id: 'RC-0027', student: 'Éric T.', orderId: 'MM-1022', reason: 'Boisson non conforme', message: 'La boisson reçue ne correspond pas à ma commande.', status: 'Rejetée', received: 'Il y a 3 h 15', amount: 1000, location: 'Table 03', attachment: null, response: '' },
]

export const responseTemplates = ['Toutes nos excuses pour ce désagrément.', 'Nous vérifions avec la cuisine et revenons vers vous.', 'Un geste commercial peut être proposé après validation du gérant.']

export const weeklyStats = [
  { label: '12 – 18 oct. 2026', sales: [49000, 52000, 48000, 56000, 62000, 68000, 59500], orders: 132, onsite: 75, delivery: 57, peak: [6, 14, 24, 13, 4, 2, 6, 12, 21, 18, 8] },
  { label: '19 – 25 oct. 2026', sales: [52000, 56000, 58000, 53000, 64000, 71000, 58500], orders: 138, onsite: 80, delivery: 58, peak: [8, 18, 28, 14, 4, 2, 7, 13, 25, 22, 9] },
  { label: '26 oct. – 1 nov. 2026', sales: [54000, 57000, 61000, 55000, 65000, 70000, 60000], orders: 143, onsite: 84, delivery: 59, peak: [7, 17, 26, 15, 5, 3, 7, 14, 24, 20, 10] },
]

export const topDishes = [
  { name: 'Poulet DG Spécial ZeDuc', count: 38 },
  { name: 'Poisson braisé et bobolo', count: 27 },
  { name: 'Ndolé royal aux crevettes', count: 22 },
  { name: 'Riz sauté au poulet', count: 19 },
  { name: 'Brochettes de bœuf Suya', count: 16 },
]
