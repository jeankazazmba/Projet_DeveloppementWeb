export const PLATFORM_NAME = 'ZeDuc-Sp@ce';
export const PRIMARY_RESTAURANT_ID = 'khalifa-food';
export const SECONDARY_RESTAURANT_ID = 'sleepy-hollow';
export const normalizeRestaurantId = id => id === 'zeduc' ? PRIMARY_RESTAURANT_ID : id === 'partenaire-demo' ? SECONDARY_RESTAURANT_ID : id;
export let restaurants = [
  { id: PRIMARY_RESTAURANT_ID, name: 'Khalifa_food', location: 'Kinshasa · adresse à confirmer', hours: 'Démo · 11h–21h', example: true },
  { id: SECONDARY_RESTAURANT_ID, name: 'sleepy hollow', location: 'Kinshasa · adresse à confirmer', hours: 'Démo · 12h–22h', example: true },
];

export const getRestaurant = id => restaurants.find(item => item.id === normalizeRestaurantId(id)) || restaurants[0];
export function setRestaurants(items) {
  if (Array.isArray(items) && items.length) restaurants = items;
}
