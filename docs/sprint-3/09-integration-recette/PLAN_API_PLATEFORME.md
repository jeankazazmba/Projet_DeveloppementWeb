# Plan complet des API restantes

**Référence :** cahier de charges, répartition des responsabilités et interfaces déjà livrées. Les montants sont des entiers en `CDF`, les heures sont enregistrées en UTC puis affichées dans `Africa/Kinshasa`, et toute donnée métier porte un `restaurant_id`.

## Socle déjà disponible

- `POST /api/login`, `POST /api/logout` et jetons Sanctum.
- Catalogue public multi-restaurants et catalogue professionnel protégé.
- Supervision plateforme : restaurants, administrateurs locaux, invitations plateforme, audit et agrégats limités.
- Contrôle plateforme/local : un admin plateforme ne lit pas les détails opérationnels d’un restaurant.

## Ordre de livraison

| Priorité | Lot | API et données | Critères de recette |
| --- | --- | --- | --- |
| P0 | Identité et accès | inscription étudiant, vérification e-mail, mot de passe oublié, profil, révocation de sessions, affectations locales, permissions déléguées explicites. | `401` sans jeton, `403` hors rôle, `404` hors restaurant, session supprimée après suspension. |
| P0 | Menu et publication | catégories, plats, options, allergènes, stocks/disponibilité, images, promotions, événements et jeux datés. | un employé change seulement disponibilité/plat du jour ; un admin local publie ; le site et mobile ne lisent que le publié. |
| P0 | Commandes | panier serveur, devis, validation prix/horaires/restaurant, commande sur place ou livraison, lignes figées, transitions et historique. | une clé `Idempotency-Key` empêche le doublon ; prix modifié après commande sans effet rétroactif ; transitions refusées avec `409`. |
| P0 | Opérations restaurant | file de préparation, prise en charge, production, prêt, servi/livré, annulation, tables et créneaux. | employé et gérant ne voient que leur restaurant ; chaque transition conserve auteur et date. |
| P1 | Livraison | adresses, zones/frais, affectation d’un livreur si ce rôle est validé, position datée, preuve de remise. | étudiant voit seulement sa course ; gérant voit les courses actives locales ; aucune position publique non autorisée. |
| P1 | Réclamations | création par l’étudiant, pièces jointes privées, réponse employé, validation gérant, décision admin local, escalade minimale plateforme. | plateforme reçoit uniquement référence, restaurant, état et date ; aucun motif, échange ou identité. |
| P1 | Fidélité et parrainage | règles validées, journal atomique, attribution après événement éligible, code de parrainage, classement par commandes. | aucune double attribution ; solde recalculable depuis le journal ; top 10 filtré jour/semaine/mois. |
| P1 | Statistiques et notifications | agrégats locaux et plateforme, exports, notifications de commande/réclamation, synchronisation par relecture ou événement. | données confirmées uniquement ; filtres dates/restaurant ; aucun détail local dans `/platform/*`. |
| P2 | Paiement optionnel | intent de paiement, statut, référence fournisseur, webhook signé, rapprochement ; espèces « à régler ». | le webhook seul confirme un paiement ; aucune clé prestataire dans le mobile ou frontend ; test sandbox avant activation. |

## Contrats essentiels

| Ressource | Routes principales |
| --- | --- |
| Authentification | `POST /auth/register`, `POST /auth/login`, `POST /auth/password/forgot`, `POST /auth/password/reset`, `GET /me` |
| Restaurant local | `GET /staff/restaurants`, `GET /staff/restaurants/{id}/members`, `POST /staff/restaurants/{id}/members` |
| Commandes | `POST /restaurants/{id}/quotes`, `POST /restaurants/{id}/orders`, `GET /me/orders`, `GET /staff/restaurants/{id}/orders`, `PATCH /staff/orders/{id}/status` |
| Réclamations | `POST /me/orders/{id}/complaints`, `GET /me/complaints`, `PATCH /staff/complaints/{id}/proposal`, `PATCH /staff/complaints/{id}/review` |
| Fidélité | `GET /me/loyalty`, `GET /me/referrals`, `GET /restaurants/{id}/leaderboard?period=week` |
| Livraison | `GET /me/orders/{id}/delivery`, `PATCH /staff/deliveries/{id}` |
| Paiement | `POST /orders/{id}/payment-intents`, `POST /webhooks/payments/{provider}` |

Les noms finaux doivent être fixés dans une spécification OpenAPI avant codage. Toute mutation doit accepter `expected_version` et répondre `409` lors d’un conflit ; les créations critiques utilisent une clé d’idempotence. Les réponses paginées utilisent `data`, `meta` et des curseurs.

## Schéma à compléter

Ajouter notamment : `restaurant_memberships` avec permissions, `student_profiles`, `menu_categories`, `dish_options`, `inventory_items`, `orders`, `order_lines`, `order_events`, `delivery_addresses`, `deliveries`, `complaint_messages`, `complaint_attachments`, `loyalty_rules`, `loyalty_movements`, `referral_codes`, `game_participations`, `notification_deliveries`, `payment_intents` et `payment_events`.

Chaque table d’activité contient `restaurant_id`, `created_at`, `updated_at`, `version` et, si nécessaire, `deleted_at`. Les données sensibles restent séparées des agrégats plateforme.

## Sécurité et exploitation

- Policies Laravel sur chaque ressource, jamais un rôle envoyé par le client.
- Validation métier côté serveur, limitations par IP et compte, journal des opérations sensibles.
- Stockage privé des pièces jointes, URL temporaires, chiffrement et sauvegardes MySQL.
- Files de tâches pour notifications, exports et webhooks ; journalisation structurée et endpoint de santé approfondi.
- Tests feature par rôle, isolation multi-restaurants, tests d’idempotence, webhooks et migrations de montée de version.

## Raccordement progressif des interfaces

1. Brancher le portail étudiant web et Expo à l’authentification, catalogue et commande.
2. Brancher employé mobile/web sur la même file de commandes et la disponibilité de plats.
3. Brancher gérant sur l’équipe, les validations, statistiques et livraisons locales.
4. Brancher l’admin restaurant sur contenus, horaires, paiements affichés et règles validées.
5. Conserver l’admin plateforme sur les agrégats et métadonnées autorisées uniquement.

Le paiement reste un bonus tant que le prestataire RDC, la sandbox, la devise CDF et le webhook ne sont pas validés.
