# Prévisualisation Vercel du site et des applications web

Le projet Vercel utilise le dossier `frontend/` comme racine. Une seule application Vite sert le site public (`/`), l’admin (`/admin`), le gérant (`/gerant`), l’employé (`/employe`), la plateforme (`/plateforme`) et le catalogue professionnel (`/catalogue-pro`). Les réécritures de `frontend/vercel.json` permettent d’ouvrir directement ces routes.

La branche `feature/sprint-3-frontend-features` doit être déployée en **Preview**. La production de `main` reste séparée.

## État au 4 novembre 2026

Le projet Vercel [`mon-miam-miam-web`](https://vercel.com/bagumakazamba-4703s-projects/mon-miam-miam-web) est créé dans l’équipe `bagumakazamba-4703s-projects` (`prj_SaDBcGCuIO10hPQN6PwNQs5KmvJg`). Il est configuré pour Vite, la racine `frontend/`, `npm run build`, `dist` et Node 22.

Le dépôt GitHub ne peut pas encore être relié : Vercel répond « You need to add a Login Connection to your GitHub account first ». Le propriétaire du compte doit ajouter GitHub dans les [paramètres d’authentification Vercel](https://vercel.com/account/settings/authentication), puis relier `jeankazazmba/Projet_DeveloppementWeb` depuis les [paramètres Git du projet](https://vercel.com/bagumakazamba-4703s-projects/mon-miam-miam-web/settings/git). Vérifier la branche avant tout déploiement de production. Aucun déploiement n’existe encore pour ce projet.

## Données communes

- `VITE_API_URL` : origine HTTPS du backend Laravel, **sans** `/api` final. Si elle n’est pas définie ou si l’API ne répond pas, le site affiche les données de démonstration locales.
- `EXPO_PUBLIC_API_URL` : même origine pour Expo. Sur téléphone physique en développement, utiliser une adresse accessible depuis le téléphone, pas `127.0.0.1`.
- `FRONTEND_URL` côté Laravel : liste d’origines autorisées par CORS, séparées par des virgules. Ajouter le domaine Preview utilisé pour tester la connexion au catalogue.

Le backend Laravel et sa base MySQL ne sont pas inclus dans le déploiement Vercel de `frontend/`. La synchronisation en ligne exige un hébergement séparé du backend, les migrations et un compte administrateur créé avec `php artisan mmm:create-platform-admin adresse@example.cd`. `php artisan db:seed` charge deux restaurants de démonstration et leurs contenus. Ces commandes sont destinées à la personne qui gère l’installation et le lancement.

L’API publique ne renvoie que les restaurants publiés et leurs contenus publiés. L’API professionnelle exige un jeton Sanctum et une affectation au restaurant. Les écrans historiques de commandes, stocks, tables, livreurs et statistiques restent des démonstrations locales ; seul le catalogue partagé (plats, promotions, événements, jeux, fiches restaurants) est raccordé à cette API à ce stade.
