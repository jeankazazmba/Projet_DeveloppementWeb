// Catalogue de démonstration. L'API Laravel remplacera cette source une fois livrée.
export const products = [
  { id: 'poulet-dg', name: 'Poulet DG Royal', category: 'Plats', description: 'Poulet fermier, plantains dorés et légumes croquants.', price: 3500, image: '/images/menu/menu-photo1.png', available: true, daily: true },
  { id: 'ndole', name: 'Ndolé aux crevettes', category: 'Plats', description: 'Feuilles de ndolé, pâte d’arachide et crevettes.', price: 3000, image: '/images/menu/menu-photo0.png', available: true, daily: true },
  { id: 'poisson', name: 'Poisson braisé et bobolo', category: 'Grillades', description: 'Bar braisé au charbon, bâtons de manioc.', price: 4500, image: '/images/menu/menu-photo2.png', available: true, daily: false },
  { id: 'brochettes', name: 'Brochettes de bœuf', category: 'Grillades', description: 'Bœuf mariné aux épices douces.', price: 1500, image: '/images/menu/menu-photo4.png', available: true, daily: false },
  { id: 'beignets', name: 'Beignets-haricots', category: 'Plats', description: 'Beignets dorés et haricots mijotés.', price: 500, image: '/images/menu/menu-photo5.png', available: true, daily: false },
  { id: 'bissap', name: 'Bissap maison', category: 'Boissons', description: 'Infusion d’hibiscus fraîche.', price: 1000, image: '/images/menu/menu-photo7.png', available: false, daily: false },
]
export const money = (amount) => `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`
