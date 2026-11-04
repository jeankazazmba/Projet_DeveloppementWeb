import { assets } from './design-assets'

export type Page = 'dashboard' | 'orders' | 'tables' | 'menu' | 'reports' | 'employees' | 'promotions' | 'claims' | 'settings' | 'data'
export type Employee = { id: string; name: string; email: string; role: 'Employé' | 'Gérant'; active: boolean; lastLogin: string }
export type Dish = { id: string; name: string; description: string; category: string; price: number; available: boolean; featured: boolean; image: string; ingredients: string[] }
export type Promotion = { id: string; title: string; subtitle: string; description: string; type: 'Promotion' | 'Événement' | 'Jeu concours'; status: 'Active' | 'Programmée' | 'Expirée' | 'Brouillon'; tag: string; dateLabel: string; start: string; end: string; image: string; footer: string; metric: string }
export type Claim = { id: string; student: string; order: string; reason: string; status: 'En attente' | 'En examen' | 'Validée' | 'Résolue' | 'Rejetée'; updated: string; credited: boolean }
export const categories = ['Plats chauds', 'Grillades & Braisés', 'Boissons fraîches', 'Desserts']
export const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Marie T.', email: 'marie.t@zeduc-space.cd', role: 'Employé', active: true, lastLogin: 'Aujourd’hui à 18:55' },
  { id: 'e2', name: 'Josué N.', email: 'josue.n@zeduc-space.cd', role: 'Employé', active: true, lastLogin: 'Aujourd’hui à 17:30' },
  { id: 'e3', name: 'Aïcha B.', email: 'aicha.b@zeduc-space.cd', role: 'Employé', active: true, lastLogin: 'Hier à 22:15' },
  { id: 'e4', name: 'Ferdinand M.', email: 'ferdinand.m@zeduc-space.cd', role: 'Employé', active: false, lastLogin: 'Il y a 14 jours' },
  { id: 'e5', name: 'Jean-Paul D.', email: 'jp.gerant@zeduc-space.cd', role: 'Gérant', active: true, lastLogin: 'Aujourd’hui à 19:10' },
]
const dishRows: [string, string, number, number, string][] = [
  ['Ndolé Royal aux Crevettes', 'Mijoté traditionnel · Plantains vapeur', 0, 4000, assets.menu.photo0],
  ['Poulet DG Spécial ZeDuc', 'Poulet fermier · Légumes sautés', 0, 4500, assets.menu.photo1],
  ['Poisson braisé & Bobolo', 'Bar entier braisé au feu de bois', 1, 3500, assets.menu.photo2],
  ['Burger maison ZeDuc', 'Bœuf braisé · Sauce secrète', 0, 3000, assets.menu.photo3],
  ['Brochettes de bœuf Suya', 'Épices Kankankan · Oignons rouges', 1, 2500, assets.menu.photo4],
  ['Beignets-Haricots (Koki/BH)', 'Beignets soufflés · Bouillie maison', 0, 1000, assets.menu.photo5],
  ['Jus de Gingembre frais', 'Gingembre pressé · Citron vert', 2, 1000, assets.menu.photo6],
  ['Bissap Maison Menthe', 'Rupture de stock momentanée', 2, 1000, assets.menu.photo7],
]
export const initialDishes: Dish[] = dishRows.map(([name, description, category, price, image], i) => ({ id: `d${i + 1}`, name, description, category: categories[category], price, image, available: i !== 7, featured: [0, 1, 4].includes(i), ingredients: i === 0 ? ['Feuilles de ndolé', 'Gambas fraîches', 'Plantains mûrs', 'Pâte d’arachide'] : [] }))
export const initialPromotions: Promotion[] = [
  { id: 'p1', title: 'Promo Bar Braisé -15 %', subtitle: 'Spécialité du chef ZeDuc', description: 'Bar entier mariné aux épices du Congo, servi avec ses accompagnements.', type: 'Promotion', status: 'Active', tag: 'OFFRE LOUNGE', dateLabel: 'Valable jusqu’au 30 oct. · Sur place & Emporter', start: '2024-10-01', end: '2024-10-30', image: assets.promotions.photo0, footer: 'Affichage écran & application', metric: 'Portée : 1.2k vues' },
  { id: 'p2', title: 'Code ETUDIANT10 -10 %', subtitle: 'Avantage campus de Kinshasa', description: 'Réduction automatique sur toute la carte sur présentation de votre carte étudiant.', type: 'Promotion', status: 'Active', tag: 'CAMPUS PRIVILEGE', dateLabel: 'Sur présentation carte campus université · En cours', start: '2024-10-01', end: '2024-11-30', image: assets.promotions.photo1, footer: 'Scan QR au comptoir', metric: '88 utilisations' },
  { id: 'p3', title: 'Soirée Ligue des champions', subtitle: 'Ambiance Lounge VIP', description: 'Service tapas spécial match, brochettes de bœuf et ambiance lounge.', type: 'Événement', status: 'Active', tag: 'DIFFUSION LIVE', dateLabel: 'Mercredi 28 octobre · 21 h · Écrans géants & Tapas', start: '2024-10-28', end: '2024-10-28', image: assets.promotions.photo2, footer: 'Réservations tables 85%', metric: 'Quasi complet' },
  { id: 'p4', title: 'Tournoi de billard', subtitle: 'Cash Prize 150 000 CDF', description: 'Inscriptions limitées à 16 joueurs. Cocktail de bienvenue.', type: 'Événement', status: 'Programmée', tag: 'COMPÉTITION ZEDUC', dateLabel: 'Samedi 31 octobre · 18 h · Inscriptions ouvertes', start: '2024-10-31', end: '2024-10-31', image: assets.promotions.photo3, footer: '12/16 inscrits', metric: 'Début J-3' },
  { id: 'p5', title: 'Soirée acoustique & Ndolé', subtitle: 'Dégustation Royale aux Crevettes', description: 'Accords mets et vins africains, buffet dégustation et musique live.', type: 'Événement', status: 'Programmée', tag: 'CONCERT & GASTRONOMIE', dateLabel: 'Vendredi 6 novembre · 19 h 30 · Live Band & Buffet', start: '2024-11-06', end: '2024-11-06', image: assets.promotions.photo4, footer: 'Accès sur réservation', metric: '15 000 CDF / pers' },
  { id: 'p6', title: 'Happy hour de rentrée', subtitle: 'Cocktails 1 acheté = 1 offert', description: 'Offre de rentrée sur tous les mocktails de la maison.', type: 'Promotion', status: 'Expirée', tag: 'CAMPAGNE TERMINÉE', dateLabel: 'Terminé le 15 oct. · 18 h - 20 h', start: '2024-10-01', end: '2024-10-15', image: assets.promotions.photo5, footer: 'Statistiques archivées', metric: 'Réactiver' },
]
export const initialClaims: Claim[] = [
  { id: 'RC-0042', student: 'Éric T.', order: 'MM-1049', reason: 'Points parrainage non crédités', status: 'En attente', updated: 'Il y a 15 min', credited: false },
  { id: 'RC-0041', student: 'Sarah M.', order: 'MM-1046', reason: 'Retard livraison (+35m)', status: 'En examen', updated: 'Il y a 1 h', credited: false },
  { id: 'RC-0040', student: 'Boris K.', order: 'MM-1038', reason: 'Boisson (Bissap)', status: 'Validée', updated: 'Il y a 3 h', credited: false },
  { id: 'RC-0039', student: 'Mireille D.', order: 'MM-1035', reason: 'Erreur assaisonnement', status: 'Résolue', updated: 'Hier', credited: false },
  { id: 'RC-0038', student: 'Paul N.', order: 'MM-1029', reason: 'Facturation incorrecte', status: 'Rejetée', updated: '26 oct.', credited: false },
  { id: 'RC-0037', student: 'Aïcha B.', order: 'MM-1022', reason: 'Emballage endommagé', status: 'Résolue', updated: '25 oct.', credited: false },
]
export type Schedule = { day: string; open: boolean; start: string; end: string; note: string }
export type SettingsData = {
  gain: number; conversion: number; minimum: number; expiry: number; referral: number; schedule: Schedule[]
  restaurant: { name: string; address: string; phone: string; email: string; description: string }
  payments: { orange: boolean; airtel: boolean; mpesa: boolean; cash: boolean; card: boolean }
  policies: { salesTerms: string; cancellation: string; privacy: string }
}
export const initialSettings: SettingsData = {
  gain: 1000, conversion: 15, minimum: 15, expiry: 12, referral: 15,
  schedule: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, i) => ({ day, open: i !== 6, start: i === 5 ? '12:00' : '11:00', end: i === 4 ? '23:30' : i === 5 ? '00:00' : '22:00', note: i < 4 ? 'Service continu' : i === 4 ? 'Nocturne Lounge' : i === 5 ? 'Soirée Concerts & Billard' : 'Fermeture hebdomadaire' })),
  restaurant: { name: 'ZeDuc-Sp@ce · Mon Miam Miam', address: 'Kinshasa, République démocratique du Congo · adresse exacte à confirmer', phone: '', email: '', description: 'Cuisine congolaise, terrasse panoramique et service étudiant.' },
  payments: { orange: false, airtel: false, mpesa: false, cash: true, card: false },
  policies: { salesTerms: '', cancellation: '', privacy: '' },
}
export const money = (value: number) => new Intl.NumberFormat('fr-FR').format(value)
export const initials = (name: string) => name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase()
export const matches = (text: string, query: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
