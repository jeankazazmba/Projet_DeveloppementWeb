export let restaurants = [
  { id: 'zeduc', name: 'ZeDuc-Sp@ce', location: 'Kinshasa · adresse à confirmer', hours: 'Horaires à confirmer', example: false },
  { id: 'partenaire-demo', name: 'Restaurant partenaire (exemple)', location: 'Kinshasa · localisation à renseigner', hours: 'Horaires à renseigner', example: true },
];

export const getRestaurant = id => restaurants.find(item => item.id === id) || restaurants[0];
export function setRestaurants(items) {
  if (Array.isArray(items) && items.length) restaurants = items;
}
