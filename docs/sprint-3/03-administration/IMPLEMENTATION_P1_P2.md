# Administration de plateforme — réalisation P1/P2

L'espace `/plateforme` reprend le thème sombre et clair des back-offices. Sans configuration API, il propose une démonstration locale explicitement étiquetée. Avec `VITE_API_URL`, la connexion utilise `/api/login` et n'ouvre l'espace réel qu'à `is_platform_admin=true`.

## P1

- Restaurants : création en brouillon, édition, publication, suspension motivée et réactivation. Le répertoire API public ne retourne que les établissements actifs et publiés.
- Comptes : création avec mot de passe initial, affectation à un ou plusieurs restaurants, changement du rôle local, révocation d'une affectation, suspension motivée et réactivation. La suspension révoque les jetons du compte.
- Droits : toutes les routes `/api/platform/*` vérifient le rôle plateforme. Les routes de contenu des équipes contrôlent l'affectation au restaurant et le rôle. Le compte connecté à `/plateforme` reste en mémoire pour cette visite.
- Audit : restaurant, compte, affectation et mutations de contenu effectuées par l'admin plateforme sont inscrits côté serveur, avec auteur, cible, date, restaurant et motif disponible. Les mutations et leur audit sont dans la même transaction.

Le compte initial se crée par la commande interactive existante `php artisan mmm:create-platform-admin adresse@example.cd`, après la migration. Cette commande ne modifie plus un compte existant.

## P2

- Vue globale avec filtre par restaurant et dates, nombres de commandes, volume de commandes hors annulations, réclamations escaladées et activité par restaurant.
- Lecture des plats, promotions, événements et jeux avec leur restaurant propriétaire et leur état de publication. Le catalogue connecté reste accessible par `/catalogue-pro`.
- Lecture des commandes et réclamations escaladées, sans action de décision ou de remboursement.
- Vue fidélité et parrainage en lecture seule. Conversion, expiration, portée des points et attribution des récompenses restent à valider avant toute mutation de solde.

La migration `2026_11_04_000002_create_platform_supervision.php` ajoute les tables de supervision. Elle ne crée aucune commande ni réclamation fictive dans la base. Les écrans connectés resteront vides pour ces flux tant que les parcours étudiant, employé et gérant n'écriront pas dans ces tables. Le mode démonstration présente des exemples locaux et ne les comptabilise jamais comme données serveur.

## À raccorder ensuite

1. Écriture serveur des commandes et des réclamations avec leur `restaurant_id`, statut, historique et contrôle des droits.
2. Règles validées de fidélité et parrainage, opérations idempotentes et audit des corrections.
3. Session partagée entre `/plateforme` et `/catalogue-pro`, puis source de contenus commune avec les autres interfaces.

L'assistant n'a exécuté ni migration, ni lancement, ni compilation de l'application.
