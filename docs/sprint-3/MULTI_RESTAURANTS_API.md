# Contrat de l’API multi-restaurants

Toutes les routes ci-dessous sont préfixées par `/api`.

| Méthode | Route | Accès |
| --- | --- | --- |
| GET | `/restaurants` | Public : établissements publiés |
| GET | `/restaurants/{id}` | Public : établissement publié |
| GET | `/restaurants/{id}/content?kind=dish` | Public : contenus publiés de cet établissement |
| POST | `/login` | Vérifie e-mail et mot de passe ; retourne un jeton Sanctum et les affectations |
| POST | `/logout` | Révoque le jeton courant |
| GET | `/staff/restaurants` | Restaurants affectés au compte, ou tous pour l’admin plateforme |
| GET | `/staff/restaurants/{id}/content` | Personnel affecté : y compris brouillons |
| POST/PATCH/DELETE | `/staff/restaurants/{id}/content[/{content}]` | Admin du restaurant, gérant ou admin plateforme |
| POST/PATCH | `/platform/restaurants[/{id}]` | Admin plateforme : création en brouillon et publication |
| POST | `/platform/users` | Admin plateforme : création et première affectation |
| PUT | `/platform/restaurants/{id}/members/{user}` | Admin plateforme : nouvelle affectation ou changement de rôle |

Les contenus possèdent `restaurant_id`, `kind` (`dish`, `promotion`, `event`, `game`), `title`, `description`, `price_cdf`, `image_url`, `details` (objet JSON) et `is_published`. Le serveur fixe `restaurant_id` à partir de l’URL et vérifie l’appartenance du compte avant chaque lecture ou écriture professionnelle. Un identifiant de contenu d’un autre restaurant renvoie 404.

La migration crée les tables `users`, `personal_access_tokens`, `restaurants`, `restaurant_user` et `restaurant_contents`. Le seeder crée ZeDuc et un partenaire fictif avec des contenus de démonstration. Le mot de passe du premier admin plateforme est saisi de façon interactive avec `php artisan mmm:create-platform-admin adresse@example.cd`. Aucun mot de passe n’est inclus dans le dépôt.

Le catalogue est synchronisé **après rechargement** ou changement de page, sans diffusion temps réel. Les données de commandes et autres modules métier ne sont pas encore raccordées.
