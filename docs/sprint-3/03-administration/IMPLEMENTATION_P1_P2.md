# Administration de plateforme — réalisation P1/P2

L'espace `/plateforme` reprend le thème sombre et clair des back-offices. Sans configuration API, il propose une démonstration locale explicitement étiquetée. Avec `VITE_API_URL`, la connexion utilise `/api/login` et n'ouvre l'espace réel qu'à `is_platform_admin=true`.

## P1

- Restaurants : création en brouillon, édition, publication, suspension motivée et réactivation. Le répertoire API public ne retourne que les établissements actifs et publiés.
- Comptes : création et affectation des **administrateurs de restaurant**, révocation d'une affectation, suspension motivée et réactivation. La suspension révoque les jetons du compte. Les employés et gérants sont gérés dans le périmètre local.
- Droits : toutes les routes `/api/platform/*` vérifient le rôle plateforme. Les routes de contenu des équipes exigent une affectation locale, même si le compte possède aussi le rôle plateforme. Le compte connecté à `/plateforme` reste en mémoire pour cette visite.
- Audit : restaurant, compte administrateur et affectation sont inscrits côté serveur, avec auteur, cible, date, restaurant et motif disponible. Les mutations et leur audit sont dans la même transaction. Les anciens journaux de contenu ne sont pas exposés dans la vue plateforme.

Le compte initial se crée par la commande interactive existante `php artisan mmm:create-platform-admin adresse@example.cd`, après la migration. Cette commande ne modifie plus un compte existant.

## P2

- Vue globale avec filtre par restaurant et dates, nombres de commandes, volume de commandes hors annulations, réclamations escaladées et activité par restaurant.
- Nombre de plats, promotions, événements et jeux publiés **par restaurant**, sans titres, prix, brouillons ou édition dans `/plateforme`.
- Volumes de commandes par restaurant. Pour les réclamations escaladées, uniquement référence, restaurant, statut et date ; aucun nom d'étudiant, motif ou détail de commande.
- Totaux de fidélité et parrainage par restaurant, sans mouvement individuel. Conversion, expiration, portée des points et attribution des récompenses restent à valider avant toute mutation de solde.

La migration `2026_11_04_000002_create_platform_supervision.php` ajoute les tables de supervision. Elle ne crée aucune commande ni réclamation fictive dans la base. Les écrans connectés resteront vides pour ces flux tant que les parcours étudiant, employé et gérant n'écriront pas dans ces tables. Le mode démonstration présente des exemples locaux et ne les comptabilise jamais comme données serveur.

## À raccorder ensuite

1. Écriture serveur des commandes et des réclamations avec leur `restaurant_id`, statut, historique et contrôle des droits.
2. Règles validées de fidélité et parrainage, opérations idempotentes et audit des corrections.
3. Routes locales de gestion des comptes employés et gérants pour les administrateurs/gérants de restaurant. Le catalogue professionnel exige désormais une affectation locale ; la session de plateforme n'accorde aucun accès implicite.

La répartition complète et les décisions issues du cahier V1.0.2 sont dans [RESPONSABILITES_PAR_ROLE.md](RESPONSABILITES_PAR_ROLE.md).

L'assistant n'a exécuté ni migration, ni lancement, ni compilation de l'application.
