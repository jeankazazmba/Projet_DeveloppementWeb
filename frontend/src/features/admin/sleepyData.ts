import { assets } from './design-assets'
import { initialSettings } from './data'
import type { Claim, Dish, Employee, Promotion, SettingsData } from './data'
import type { Order, RestaurantTable } from './operations'

export const sleepyEmployees: Employee[] = [
  { id: 'sh-e1', name: 'Nadia L.', email: 'nadia@sleepy-hollow.cd', role: 'Gérant', active: true, lastLogin: 'Aujourd’hui' },
  { id: 'sh-e2', name: 'Patrick M.', email: 'patrick@sleepy-hollow.cd', role: 'Employé', active: true, lastLogin: 'Aujourd’hui' },
]

export const sleepyDishes: Dish[] = [
  { id: 'sh-d1', name: 'Burger nocturne sleepy hollow', description: 'Bœuf braisé · Sauce maison', category: 'Plats chauds', price: 4200, available: true, featured: true, image: assets.menu.photo3, ingredients: ['Bœuf', 'Pain', 'Sauce maison'] },
  { id: 'sh-d2', name: 'Brochettes du soir', description: 'Bœuf mariné · Légumes grillés', category: 'Grillades & Braisés', price: 3200, available: true, featured: false, image: assets.menu.photo4, ingredients: ['Bœuf', 'Légumes'] },
  { id: 'sh-d3', name: 'Limonade gingembre et menthe', description: 'Gingembre frais · Menthe', category: 'Boissons fraîches', price: 1500, available: true, featured: false, image: assets.menu.photo6, ingredients: ['Gingembre', 'Menthe'] },
  { id: 'sh-d4', name: 'Douceur mangue', description: 'Dessert fruité à la mangue', category: 'Desserts', price: 2500, available: true, featured: false, image: assets.menu.photo5, ingredients: ['Mangue'] },
]

export const sleepyPromotions: Promotion[] = [
  { id: 'sh-p1', title: 'Duo du soir sleepy hollow', subtitle: 'Deux assiettes de brochettes', description: 'Deux assiettes de brochettes à partager.', type: 'Promotion', status: 'Active', tag: 'OFFRE DU SOIR', dateLabel: 'Dates de démonstration', start: '2026-11-01', end: '2026-12-31', image: assets.promotions.photo0, footer: 'Application & salle', metric: 'Démo' },
  { id: 'sh-p2', title: 'Pause fraîche sleepy hollow', subtitle: 'Boisson offerte', description: 'Une limonade avec une formule du soir.', type: 'Promotion', status: 'Active', tag: 'BOISSON', dateLabel: 'Dates de démonstration', start: '2026-11-01', end: '2026-12-31', image: assets.promotions.photo1, footer: 'Application & salle', metric: 'Démo' },
  { id: 'sh-p3', title: 'Soirée jeux sleepy hollow', subtitle: 'Rencontre gourmande', description: 'Musique et grillades au restaurant.', type: 'Événement', status: 'Programmée', tag: 'ÉVÉNEMENT', dateLabel: 'Date à confirmer', start: '2026-11-14', end: '2026-11-14', image: assets.promotions.photo4, footer: 'Sur place', metric: 'Démo' },
]

export const sleepyOrders: Order[] = [
  { id: 'SH-2001', customer: 'Nadia F.', placedAt: new Date().toISOString(), service: 'Sur place', table: 'T01', items: ['Burger nocturne sleepy hollow'], amount: 4200, payment: 'Espèces', status: 'En préparation' },
  { id: 'SH-2002', customer: 'Paul K.', placedAt: new Date().toISOString(), service: 'Livraison', table: null, items: ['Brochettes du soir', 'Limonade gingembre et menthe'], amount: 4700, payment: 'Airtel Money', status: 'Reçue' },
]

export const sleepyTables: RestaurantTable[] = Array.from({ length: 6 }, (_, index) => ({
  id: `T${String(index + 1).padStart(2, '0')}`, zone: 'Salle', seats: 4,
  status: index === 0 ? 'Occupée' : 'Libre', orderId: index === 0 ? 'SH-2001' : null,
}))

export const sleepyClaims: Claim[] = [
  { id: 'SH-RC-01', student: 'Paul K.', order: 'SH-2002', reason: 'Temps de livraison', status: 'En attente', updated: 'Aujourd’hui', credited: false },
]

export const sleepySettings: SettingsData = {
  ...initialSettings,
  restaurant: { name: 'sleepy hollow', address: 'Kinshasa, RDC · adresse à confirmer', phone: '', email: '', description: 'Pause gourmande, grillades et boissons fraîches.' },
}
