import { dishes } from "./catalog";

export const orderStages = ["Reçue", "En préparation", "Prête", "Servie", "Remise au livreur"];
export const claimStages = ["Toutes", "À traiter", "En cours", "Envoyée au gérant", "Résolue"];

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

// Jeu de données local pour prévisualiser les écrans Employé.
export const initialEmployeeData = {
  orders: [
    { id: "MM-1051", customer: "Carine M.", service: "Sur place", location: "Table 07", items: "Riz sauté au poulet", amount: 3000, status: "Reçue", createdAt: minutesAgo(2) },
    { id: "MM-1050", customer: "Éric T.", service: "Sur place", location: "Table 03", items: "Burger maison ×2, Jus de gingembre", amount: 5500, status: "Reçue", createdAt: minutesAgo(4) },
    { id: "MM-1049", customer: "Linda B.", service: "Livraison", location: "campus de Kinshasa", items: "Ndolé aux crevettes", amount: 3000, status: "Reçue", createdAt: minutesAgo(5) },
    { id: "MM-1048", customer: "Arsène K.", service: "Livraison", location: "campus de Kinshasa", items: "Poulet DG Royal ×2, Poisson braisé, Bissap", amount: 9750, status: "En préparation", createdAt: minutesAgo(9) },
    { id: "MM-1047", customer: "Yannick S.", service: "Sur place", location: "Table 11", items: "Brochettes de bœuf ×3", amount: 4500, status: "En préparation", createdAt: minutesAgo(12) },
    { id: "MM-1046", customer: "Mireille D.", service: "Livraison", location: "campus de Kinshasa", items: "Beignets-haricots ×2", amount: 1000, status: "En préparation", createdAt: minutesAgo(14) },
    { id: "MM-1045", customer: "Paul N.", service: "Sur place", location: "Table 14", items: "Poulet DG, Bissap", amount: 4000, status: "Prête", createdAt: minutesAgo(18) },
    { id: "MM-1044", customer: "Sandra O.", service: "Livraison", location: "campus de Kinshasa", items: "Poisson braisé & bobolo", amount: 4500, status: "Prête", createdAt: minutesAgo(21) },
  ],
  menu: dishes.filter(dish => dish.restaurantId === 'zeduc').map((dish) => ({
    id: dish.id,
    available: dish.available !== false,
    featured: dish.id === "public-poulet",
  })),
  claims: [
    { id: "RC-0031", student: "Arsène K.", orderId: "MM-1042", reason: "Plat servi froid", message: "Bonjour, le ndolé est arrivé complètement froid. Impossible de manger tel quel.", status: "En cours", received: "Il y a 18 min", amount: 4400, response: "" },
    { id: "RC-0030", student: "Mireille D.", orderId: "MM-1038", reason: "Article manquant", message: "La boisson commandée ne se trouvait pas dans mon sac de livraison.", status: "Envoyée au gérant", received: "Il y a 42 min", amount: 3200, response: "Nous avons vérifié la préparation et proposé un avoir pour la boisson manquante." },
    { id: "RC-0029", student: "Sandra O.", orderId: "MM-1035", reason: "Retard livraison", message: "La livraison est arrivée avec plus de 30 minutes de retard.", status: "À traiter", received: "Il y a 1 h 10", amount: 4500, response: "" },
    { id: "RC-0028", student: "Yannick S.", orderId: "MM-1029", reason: "Erreur montant", message: "Le montant débité ne correspond pas au total de la commande.", status: "Résolue", received: "Il y a 2 h 05", amount: 3000, response: "Le montant a été corrigé après vérification." },
  ],
};

export const employeeWeeks = [
  { label: "12 – 18 oct.", sales: [49000, 52000, 48000, 56000, 62000, 68000, 59500], orders: 132, onsite: 75, delivery: 57, peak: [6, 14, 24, 13, 4, 2, 6, 12, 21, 18, 8] },
  { label: "19 – 25 oct.", sales: [52000, 56000, 58000, 53000, 64000, 71000, 58500], orders: 138, onsite: 80, delivery: 58, peak: [8, 18, 28, 14, 4, 2, 7, 13, 25, 22, 9] },
  { label: "26 oct. – 1 nov.", sales: [54000, 57000, 61000, 55000, 65000, 70000, 60000], orders: 143, onsite: 84, delivery: 59, peak: [7, 17, 26, 15, 5, 3, 7, 14, 24, 20, 10] },
];

export const topEmployeeDishes = [
  { id: "admin-poulet", count: 38 },
  { id: "admin-poisson", count: 27 },
  { id: "admin-ndole", count: 22 },
  { id: "public-riz", count: 19 },
  { id: "admin-brochettes", count: 16 },
].map((item) => ({
  ...item,
  name: dishes.find((dish) => dish.id === item.id).name,
}));
