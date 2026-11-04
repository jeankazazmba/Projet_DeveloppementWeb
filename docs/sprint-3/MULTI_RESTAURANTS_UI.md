# Interfaces multi-restaurants — état de la démonstration et de l’API

## Nouveau parcours

- Étudiant mobile : répertoire des restaurants en premier, recherche, fiche d’un établissement, puis seulement ses plats, promotions, événements et jeux. Le changement de restaurant demande confirmation si le panier contient des plats d’un autre établissement.
- Site public : le répertoire ouvre `/restaurants/:id`, avec les contenus propres à l’établissement. Le menu global reste consultable sur `/menu` avec un filtre par restaurant.
- Avec `VITE_API_URL` et `EXPO_PUBLIC_API_URL`, le site et l’application étudiante lisent le même catalogue publié depuis Laravel. L’employé mobile doit se connecter et ne voit que les restaurants affectés à son compte ; son menu partagé est en lecture seule.
- Les espaces web admin, gérant, employé et plateforme ouvrent `/catalogue-pro` pour gérer ou consulter les plats, promotions, événements et jeux via l’API commune. La création des restaurants et des comptes est réservée à l’admin plateforme. Un employé ne peut que lire.
- Les requêtes professionnelles sont filtrées côté serveur par l’affectation `restaurant_user`. L’URL ou le corps d’une requête ne peuvent pas donner accès à un autre restaurant. Les contenus privés et brouillons ne sont pas visibles dans l’API publique.

Les commandes, stocks, tables, livraisons, réclamations, statistiques et jeux de fidélité restent des démonstrations locales. Leur synchronisation demandera d’autres tables et routes. Le backend Laravel n’est pas encore hébergé ; la prévisualisation Vercel du frontend affiche donc la démo si `VITE_API_URL` n’est pas configurée.

## Démonstration encore locale

Sans adresse d’API, **Khalifa_food** (`khalifa-food`) et **sleepy hollow** (`sleepy-hollow`) sont les deux restaurants de démonstration. **ZeDuc-Sp@ce** désigne la plateforme. Le site et le mobile étudiant filtrent plats, promotions, événements et jeux par restaurant ; les espaces admin, gérant, employé et Tauri sélectionnent un restaurant et disposent de données de démonstration distinctes. La plateforme locale peut créer d’autres fiches dans le navigateur, sans création sur le serveur. Seul `/catalogue-pro` est relié à l’API pour les modifications de contenu.

L’authentification du catalogue est indépendante des écrans de démonstration historiques. Elle doit être étendue aux commandes, stocks, tables, livraisons, réclamations et statistiques avant de considérer l’ensemble du backoffice comme connecté.
