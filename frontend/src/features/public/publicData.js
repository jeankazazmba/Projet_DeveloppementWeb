const image = (screen, layer) => `/figma-public/${screen}/assets/layer-${String(layer).padStart(5, '0')}.svg`

export const homeImage = layer => image('13-accueil--Public', layer)
export const menuImage = layer => image('19-Menu--Public', layer)
export const promoImage = layer => image('20-promotions-evenements--Public', layer)

export const dishes = [
  { id: 'ndole', name: 'Ndolé aux crevettes fraîches et plantains', description: 'Feuilles de ndolé mijotées aux arachides, crevettes et plantains vapeur.', price: 3000, category: 'Plats', rating: '4,9', image: menuImage(75) },
  { id: 'poisson', name: 'Poisson braisé entier au feu de bois', description: 'Poisson grillé, épices du chef et bobolo traditionnel.', price: 4420, originalPrice: 5200, category: 'Grillades', rating: '5,0', image: menuImage(101), badge: 'Promo −15 %' },
  { id: 'poulet', name: 'Poulet DG Royal en portion individuelle', description: 'Poulet fermier, plantains fondants et légumes croquants.', price: 3500, category: 'Plats', rating: '4,9', image: menuImage(129), badge: 'Plat du jour' },
  { id: 'crevettes', name: 'Brochettes de crevettes géantes de Kribi', description: 'Crevettes grillées aux herbes et beurre parfumé.', price: 4000, category: 'Grillades', image: menuImage(157), unavailable: true },
  { id: 'brochettes', name: 'Brochettes de bœuf marinées aux épices', description: 'Bœuf braisé, soja et épices du Nord.', price: 1500, category: 'Grillades', rating: '4,8', image: menuImage(176) },
  { id: 'riz', name: 'Riz sauté spécial chef au poulet', description: 'Riz parfumé sauté avec poulet et légumes du marché.', price: 2500, category: 'Plats', rating: '4,7', image: menuImage(202) },
  { id: 'beignets', name: 'Beignets-haricots chauds', description: 'Beignets dorés, haricots rouges et piment maison.', price: 500, category: 'Plats', rating: '4,9', image: menuImage(228) },
  { id: 'gingembre', name: 'Jus de gingembre frais et menthe', description: 'Gingembre pressé à froid et menthe fraîche.', price: 1000, category: 'Boissons', rating: '4,8', image: menuImage(253) },
  { id: 'bissap', name: 'Jus de bissap glacé à la vanille', description: 'Fleurs d’hibiscus, vanille et glaçons pilés.', price: 1000, category: 'Boissons', rating: '4,9', image: menuImage(279) },
]

export const offers = [
  { title: 'Offre Duo Grillades', image: promoImage(74), badge: '−15 %', tag: 'Formule Midi', description: 'Un assortiment de grillades à partager, accompagné de bobolo et de deux bissaps.', terms: 'Offre valable le midi sur place, selon les disponibilités.' },
  { title: 'Happy Hour Rooftop', image: promoImage(103), badge: '1 acheté = 1 offert', tag: '17h – 20h', description: 'Cocktails artisanaux et jus pressés maison au coucher du soleil.', terms: 'Du mardi au vendredi, de 17h à 20h, sur une sélection de boissons.' },
  { title: 'Menu Spécial Ndolé Royal', image: promoImage(132), badge: '−20 %', tag: 'Tradition Étoilée', description: 'Ndolé aux crevettes fraîches et plantains mûrs dorés.', terms: 'Ce samedi uniquement. Prix affiché au moment de la commande.' },
  { title: 'Formule Étudiant Recharger', image: promoImage(161), badge: '2 800 FCFA', tag: 'Campus', description: 'Plat du jour Poulet DG et boisson fraîche.', terms: 'Sur présentation d’une carte étudiante valide.' },
  { title: 'Plateau Apéro Billard', image: promoImage(190), badge: '−25 %', tag: 'Lounge & Billard', description: 'Beignets, brochettes et trio de sauces pour les soirées matchs.', terms: 'Offre valable lors des soirées matchs, sur réservation.' },
  { title: 'Pack Anniversaire & Chill', image: promoImage(219), badge: 'Gâteau offert', tag: 'Réservation', description: 'Un moment sur le rooftop avec un gâteau offert pour votre groupe.', terms: 'Réservation de dix personnes minimum, sous réserve de confirmation.' },
]

export const events = [
  { day: '29', month: 'OCT', title: 'Soirée Ligue des Champions Canal+', time: '20h30', place: 'Terrasse Rooftop Yansoki', description: 'Diffusion grand écran et planches tapas en continu.', price: 'Entrée gratuite · Conso requise' },
  { day: '01', month: 'NOV', title: 'Tournoi de billard ZeDuc Cup', time: '16h00', place: 'Espace Billard & Lounge', description: 'Compétition amicale à 8-ball, trophée et crédits repas.', price: '1 500 FCFA / inscription' },
  { day: '07', month: 'NOV', title: 'Quiz musique & Afro-Beats Night', time: '19h00', place: 'Rooftop Panoramique', description: 'Blind test musical, DJ invité et cocktails signature.', price: 'Accès libre' },
]

export const formatPrice = price => `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`
