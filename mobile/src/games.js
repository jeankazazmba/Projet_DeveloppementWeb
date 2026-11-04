import { getRemoteContent } from './remoteCatalog';
import { PRIMARY_RESTAURANT_ID, SECONDARY_RESTAURANT_ID } from './restaurants';

const demoGames = [
  { id: 'wheel-khalifa', restaurantId: PRIMARY_RESTAURANT_ID, type: 'wheel', title: 'Roue gourmande', description: 'Une tentative quotidienne chez Khalifa_food.' },
  { id: 'quiz-khalifa', restaurantId: PRIMARY_RESTAURANT_ID, type: 'quiz', title: 'Quiz gourmand', description: 'Trois questions pour découvrir la carte de Khalifa_food.', questions: [
    { question: 'Quel plat associe poulet et plantains ?', options: ['Poulet DG', 'Bissap', 'Beignets'], answer: 0 },
    { question: 'Quel jeu est proposé dans la démonstration ?', options: ['Roue gourmande', 'Course automobile', 'Bowling'], answer: 0 },
    { question: 'Quel service est proposé dans l’application ?', options: ['Commander un repas', 'Réserver un vol', 'Acheter un billet de train'], answer: 0 },
  ] },
  { id: 'memory-khalifa', restaurantId: PRIMARY_RESTAURANT_ID, type: 'memory', title: 'Paires gourmandes', description: 'Retrouvez les paires de plats de Khalifa_food.', pairs: ['Poulet DG', 'Ndolé', 'Poisson braisé'] },
  { id: 'wheel-sleepy', restaurantId: SECONDARY_RESTAURANT_ID, type: 'wheel', title: 'Roue du soir', description: 'Une tentative quotidienne chez sleepy hollow.' },
  { id: 'quiz-sleepy', restaurantId: SECONDARY_RESTAURANT_ID, type: 'quiz', title: 'Quiz du soir', description: 'Découvrez la carte de sleepy hollow.', questions: [
    { question: 'Quel plat est proposé chez sleepy hollow ?', options: ['Burger nocturne', 'Ndolé Royal', 'Riz sauté au poulet'], answer: 0 },
    { question: 'Quelle boisson accompagne la pause fraîche ?', options: ['Limonade gingembre et menthe', 'Café noir', 'Bissap vanille'], answer: 0 },
  ] },
  { id: 'memory-sleepy', restaurantId: SECONDARY_RESTAURANT_ID, type: 'memory', title: 'Paires du soir', description: 'Retrouvez les spécialités de sleepy hollow.', pairs: ['Burger nocturne', 'Brochettes du soir', 'Douceur mangue'] },
];

export function getGamesForRestaurant(restaurantId) {
  const remote = getRemoteContent(restaurantId, 'game');
  if (remote === null) return demoGames.filter(game => game.restaurantId === restaurantId);
  return remote.map(item => ({
    id: `api-${item.id}`, restaurantId: item.restaurant_id,
    type: item.details?.type || 'info', title: item.title,
    description: item.description || '',
    questions: item.details?.questions,
    pairs: item.details?.pairs,
  }));
}

export function playable(game) {
  if (game?.type === 'wheel') return true;
  if (game?.type === 'quiz') return Array.isArray(game.questions) && game.questions.length > 0 && game.questions.every(item => typeof item.question === 'string' && Array.isArray(item.options) && item.options.length >= 2 && item.options.every(option => typeof option === 'string') && Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length);
  if (game?.type === 'memory') return Array.isArray(game.pairs) && game.pairs.length >= 2 && game.pairs.every(pair => typeof pair === 'string' && pair.length > 0) && new Set(game.pairs).size === game.pairs.length;
  return false;
}
