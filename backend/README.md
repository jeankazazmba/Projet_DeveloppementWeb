# API Mon Miam Miam — modules fidélité

Implémentation PHP 8.2+ avec PDO et MySQL des modules de fidélité, points,
parrainage, classement, promotions et événements. Elle suit les routes du contrat
`docs/sprint-1/04-contrats-api/openapi.yaml` pour les fonctionnalités couvertes.

## Démarrage

1. Créer une base MySQL puis exécuter `database/schema.sql`.
2. Définir `DB_DSN`, `DB_USER`, `DB_PASSWORD` et `APP_ENV` dans l'environnement.
   Exemple DSN : `mysql:host=127.0.0.1;dbname=mon_miam_miam;charset=utf8mb4`.
3. Relier l'authentification existante en stockant dans `sessions.token_hash`
   le SHA-256 du jeton Bearer émis et dans `sessions.user_id` l'identifiant du
   compte. La table `users` est incluse dans le schéma de démarrage.
4. Servir `public/` à la racine web. Le point d'entrée est `public/index.php`.

Toutes les réponses sont enveloppées au format du contrat API. Les opérations
qui changent les points sont transactionnelles et les attributions sont uniques
par commande ou parrainage. Les montants de fidélité sont des paramètres
configurables, initialisés à zéro jusqu'à validation métier. Les exemples
1 000 F / point et 15 points / 1 000 F ne sont pas codés en dur.

## Routes livrées

- `GET /api/v1/utilisateurs/{id}/points` et `/historique`
- `POST /api/v1/parrainage/generer`, `POST /utiliser`, `GET /parrainage`
- `GET/POST /api/v1/promotions` et `GET/POST /api/v1/evenements`
- `GET /api/v1/classement?periode=jour|semaine|mois`
- services internes `LoyaltyService::creditForOrder()` et
  `ReferralService::rewardAfterSuccessfulOrder()` à appeler depuis la
  transaction qui finalise une commande réussie. Il n'existe pas de route
  publique permettant à un étudiant de s'attribuer des points.

Les accès administrateur utilisent le rôle `administrateur`; le classement
public n'affiche qu'un pseudonyme et inclut les comptes ayant activé
`leaderboard_opt_in`.
