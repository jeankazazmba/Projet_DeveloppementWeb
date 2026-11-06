# Référence API Laravel — Sprint 3

Cette référence décrit les routes effectivement déclarées dans `backend/routes/api.php`. Base : `https://<domaine>/api` en production, `http://localhost:8000/api` en local. Toutes les sommes sont des **entiers CDF** ; les horaires de restaurant suivent `Africa/Kinshasa`. Les dates échangées sont ISO 8601 avec fuseau explicite.

## Authentification, droits et réponses

- `POST /auth/register` crée un compte étudiant. `POST /auth/login` renvoie un jeton Sanctum ; les routes protégées exigent `Authorization: Bearer <jeton>`. `POST /auth/logout` révoque le jeton. Un compte suspendu reçoit `403`.
- Les espaces `staff/restaurants/{restaurant}` vérifient l'affectation active au restaurant. L'admin plateforme est exclu des données internes. Ses routes `platform/*` donnent des agrégats, des affectations et l'audit autorisés.
- Les routes `me/*` sont personnelles ; les identifiants d'autres utilisateurs ou restaurants renvoient généralement `404`. Les rôles précis par action sont décrits dans [la matrice des responsabilités](../03-administration/RESPONSABILITES_PAR_ROLE.md) et les documents par domaine ci-dessous.
- Les créations renvoient `201`, les lectures et mutations `200`, les suppressions `204`. Les erreurs utilisent `message` et `error: {code, message, details?}`. Codes : `401 unauthenticated`, `403 forbidden`, `404 not_found`, `409 conflict`, `422 validation_failed`. Le serveur peut renvoyer `503` sur `/ready`.
- Les listes paginées renvoient `data`, `current_page`, `per_page`, `total`, `last_page` pour les paginations Laravel directes. Les listes publiques `restaurants` et plateformes avec `?paginate=1` utilisent `data` et `meta`. `per_page` est plafonné à 100.
- Les modifications versionnées envoient `expected_version`. Un `409` impose de recharger la ressource avant de réessayer. Une commande et une intention de paiement nécessitent `Idempotency-Key` (8 à 120 caractères).
- `X-Request-ID` est renvoyé pour corréler une erreur avec le journal JSON. Le serveur ne journalise ni corps, ni query string, ni secret de paiement.

## Corps principaux

| Action | Champs requis ou importants | Résultat |
| --- | --- | --- |
| Inscription | `name`, `email`, `password`, `password_confirmation` (12 caractères minimum) | `token`, `user`, `restaurants` |
| Connexion | `email`, `password` | `token`, `user` |
| Contenu restaurant | `kind=dish|promotion|event|game`, `title`, `description?`, `price_cdf` pour un plat, `is_published?`, `published_from?`, `published_until?`, `expected_version` en mise à jour | Contenu avec `version` |
| Panier | `restaurant_id`, `items: [{content_id, quantity, variant_id?, supplement_ids?}]`, `replace_restaurant?`, `expected_version?` | Panier d'un seul restaurant |
| Devis et commande | `service=pickup|dine_in|delivery`, `requested_at`, `service_slot_id`, `items` ou panier serveur ; adresse pour livraison, table et nombre de convives sur place | Devis recalculé ou commande avec lignes et prix figés |
| Statut commande | `status`, `expected_version`, `reason?` ; motif obligatoire pour annuler | Commande avec nouvelle version et événement |
| Réclamation | `reason` puis transitions avec `status`, `expected_version`, `body?`, `reason?` selon l'étape | Réclamation et journal d'événements |
| Intention paiement | `method=cash` ou `sandbox_test` local, en-tête `Idempotency-Key` | `cash_due` ou `pending`, jamais `paid` par le client |
| Webhook test | `event_id`, `intent_id`, `status`, `external_reference?` ; en-têtes `X-Payment-Timestamp` et `X-Payment-Signature=sha256=<HMAC>` | Événement idempotent ; désactivé hors local/testing |

Les détails de validation et les transitions sont dans [authentification](AUTH_PROFILS_EQUIPES.md), [menu et commandes](MENU_COMMANDES_API.md), [opérations et réclamations](OPERATIONS_RECLAMATIONS_API.md), [fidélité et jeux](FIDELITE_PARRAINAGE_JEUX_API.md), [paiements](PAIEMENTS_API.md), [statistiques et notifications](STATISTIQUES_NOTIFICATIONS_API.md), [administration plateforme](../03-administration/IMPLEMENTATION_P1_P2.md) et [conventions](CONVENTIONS_API.md). Les règles serveur dans les contrôleurs Laravel font foi en cas d'écart documentaire.

## Inventaire exhaustif des routes

Le tableau ci-dessous est généré depuis `backend/routes/api.php` avec `python backend/scripts/update_api_reference.py`. Le mode `--check` détecte une route non documentée.

<!-- ROUTES:START -->
| Méthode | Route `/api` | Accès | Contrôleur |
| --- | --- | --- | --- |
| GET | `/health` | Public | `HealthController@live` |
| GET | `/ready` | Public | `HealthController@ready` |
| GET | `/restaurants` | Public | `RestaurantCatalogController@index` |
| GET | `/restaurants/{restaurant}` | Public | `RestaurantCatalogController@show` |
| GET | `/restaurants/{restaurant}/content` | Public | `RestaurantCatalogController@content` |
| GET | `/restaurants/{restaurant}/menu` | Public | `RestaurantCatalogController@menu` |
| GET | `/restaurants/{restaurant}/service-slots` | Public | `RestaurantSlotController@publicIndex` |
| GET | `/restaurants/{restaurant}/tables` | Public | `RestaurantOperationsController@publicTables` |
| GET | `/restaurants/{restaurant}/delivery-zones` | Public | `RestaurantOperationsController@publicZones` |
| GET | `/restaurants/{restaurant}/leaderboard` | Public | `LoyaltyController@leaderboard` |
| GET | `/payment-methods` | Public | `PaymentController@methods` |
| POST | `/webhooks/payments/test` | Signature HMAC locale | `PaymentController@webhook` |
| POST | `/login` | Public | `SessionController@login` |
| POST | `/auth/register` | Public | `AuthProfileController@register` |
| POST | `/auth/login` | Public | `SessionController@login` |
| POST | `/auth/password/forgot` | Public | `AuthProfileController@forgot` |
| POST | `/auth/password/reset` | Public | `AuthProfileController@reset` |
| POST | `/platform/register` | Public | `PlatformInvitationController@register` |
| POST | `/logout` | Jeton Sanctum | `SessionController@logout` |
| POST | `/auth/logout` | Jeton Sanctum | `SessionController@logout` |
| GET | `/me/notifications` | Compte actif | `NotificationController@index` |
| PATCH | `/me/notifications/{notification}/read` | Compte actif | `NotificationController@read` |
| GET | `/staff/restaurants/{restaurant}/statistics` | Personnel du restaurant, selon rôle | `RestaurantStatisticsController@index` |
| POST | `/staff/restaurants/{restaurant}/statistics/exports` | Personnel du restaurant, selon rôle | `RestaurantStatisticsController@export` |
| GET | `/me/statistics/exports/{export}` | Gérant ou admin restaurant | `RestaurantStatisticsController@showExport` |
| GET | `/me/statistics/exports/{export}/download` | Gérant ou admin restaurant | `RestaurantStatisticsController@download` |
| GET | `/me/orders/{order}/payment-intents` | Étudiant | `PaymentController@index` |
| POST | `/me/orders/{order}/payment-intents` | Étudiant | `PaymentController@store` |
| POST | `/me/payment-intents/{intent}/cancel` | Étudiant | `PaymentController@cancel` |
| GET | `/me/loyalty` | Étudiant | `LoyaltyController@loyalty` |
| GET | `/me/referrals` | Étudiant | `LoyaltyController@referrals` |
| GET | `/me/game-participations` | Étudiant | `LoyaltyController@myGames` |
| POST | `/restaurants/{restaurant}/referral-code` | Étudiant | `LoyaltyController@code` |
| POST | `/restaurants/{restaurant}/referrals` | Étudiant | `LoyaltyController@claim` |
| POST | `/restaurants/{restaurant}/games/{game}/participations` | Étudiant | `LoyaltyController@play` |
| GET | `/staff/restaurants/{restaurant}/loyalty-rules` | Personnel du restaurant, selon rôle | `LoyaltyController@rules` |
| POST | `/staff/restaurants/{restaurant}/loyalty-rules` | Personnel du restaurant, selon rôle | `LoyaltyController@createRule` |
| POST | `/staff/restaurants/{restaurant}/loyalty-rules/{rule}/validate` | Personnel du restaurant, selon rôle | `LoyaltyController@validateRule` |
| POST | `/staff/restaurants/{restaurant}/loyalty-rules/{rule}/activate` | Personnel du restaurant, selon rôle | `LoyaltyController@activateRule` |
| POST | `/restaurants/{restaurant}/complaints` | Étudiant | `ComplaintController@store` |
| GET | `/me/complaints` | Étudiant | `ComplaintController@mine` |
| GET | `/me/complaints/{complaint}` | Étudiant | `ComplaintController@myShow` |
| POST | `/me/complaints/{complaint}/messages` | Étudiant | `ComplaintController@studentMessage` |
| GET | `/staff/restaurants/{restaurant}/complaints` | Personnel du restaurant, selon rôle | `ComplaintController@staffIndex` |
| GET | `/staff/restaurants/{restaurant}/complaints/{complaint}` | Personnel du restaurant, selon rôle | `ComplaintController@staffShow` |
| PATCH | `/staff/complaints/{complaint}/status` | Personnel du restaurant, selon rôle | `ComplaintController@transition` |
| POST | `/complaints/{complaint}/attachments` | Étudiant ou personnel autorisé | `ComplaintAttachmentController@store` |
| GET | `/complaints/{complaint}/attachments/{attachment}/url` | Étudiant ou personnel autorisé | `ComplaintAttachmentController@temporaryUrl` |
| GET | `/complaint-attachments/{attachment}/download` | Étudiant ou personnel autorisé | `ComplaintAttachmentController@download` |
| GET | `/me/cart` | Étudiant | `StudentCartController@show` |
| PUT | `/me/cart` | Étudiant | `StudentCartController@save` |
| DELETE | `/me/cart` | Étudiant | `StudentCartController@clear` |
| GET | `/me/delivery-addresses` | Étudiant | `StudentAddressController@index` |
| POST | `/me/delivery-addresses` | Étudiant | `StudentAddressController@store` |
| PATCH | `/me/delivery-addresses/{address}` | Étudiant | `StudentAddressController@update` |
| DELETE | `/me/delivery-addresses/{address}` | Étudiant | `StudentAddressController@destroy` |
| POST | `/restaurants/{restaurant}/quotes` | Étudiant | `StudentOrderController@quote` |
| POST | `/restaurants/{restaurant}/orders` | Étudiant | `StudentOrderController@store` |
| GET | `/me/orders` | Étudiant | `StudentOrderController@index` |
| GET | `/me/orders/{order}` | Étudiant | `StudentOrderController@show` |
| GET | `/me/orders/{order}/tracking` | Étudiant | `StudentOrderController@tracking` |
| GET | `/staff/restaurants/{restaurant}/orders` | Personnel du restaurant, selon rôle | `StaffOrderController@index` |
| GET | `/staff/restaurants/{restaurant}/orders/{order}` | Personnel du restaurant, selon rôle | `StaffOrderController@show` |
| GET | `/staff/restaurants/{restaurant}/orders/{order}/tracking` | Personnel du restaurant, selon rôle | `StaffOrderController@tracking` |
| PATCH | `/staff/orders/{order}/status` | Personnel du restaurant, selon rôle | `StaffOrderController@status` |
| PUT | `/staff/orders/{order}/delivery-assignment` | Personnel du restaurant, selon rôle | `StaffOrderController@assignDelivery` |
| PUT | `/staff/orders/{order}/table-assignment` | Personnel du restaurant, selon rôle | `StaffOrderController@assignTable` |
| POST | `/staff/orders/{order}/delivery-position` | Personnel du restaurant, selon rôle | `StaffOrderController@position` |
| GET | `/staff/restaurants/{restaurant}/tables` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@tables` |
| POST | `/staff/restaurants/{restaurant}/tables` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@tableStore` |
| PATCH | `/staff/restaurants/{restaurant}/tables/{table}` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@tableUpdate` |
| DELETE | `/staff/restaurants/{restaurant}/tables/{table}` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@tableDelete` |
| GET | `/staff/restaurants/{restaurant}/delivery-zones` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@zones` |
| POST | `/staff/restaurants/{restaurant}/delivery-zones` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@zoneStore` |
| PATCH | `/staff/restaurants/{restaurant}/delivery-zones/{zone}` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@zoneUpdate` |
| DELETE | `/staff/restaurants/{restaurant}/delivery-zones/{zone}` | Personnel du restaurant, selon rôle | `RestaurantOperationsController@zoneDelete` |
| GET | `/staff/restaurants/{restaurant}/categories` | Personnel du restaurant, selon rôle | `RestaurantMenuController@categories` |
| POST | `/staff/restaurants/{restaurant}/categories` | Personnel du restaurant, selon rôle | `RestaurantMenuController@categoryStore` |
| PATCH | `/staff/restaurants/{restaurant}/categories/{category}` | Personnel du restaurant, selon rôle | `RestaurantMenuController@categoryUpdate` |
| DELETE | `/staff/restaurants/{restaurant}/categories/{category}` | Personnel du restaurant, selon rôle | `RestaurantMenuController@categoryDelete` |
| POST | `/staff/restaurants/{restaurant}/content/{content}/options` | Personnel du restaurant, selon rôle | `RestaurantMenuController@optionStore` |
| PATCH | `/staff/restaurants/{restaurant}/content/{content}/options/{option}` | Personnel du restaurant, selon rôle | `RestaurantMenuController@optionUpdate` |
| DELETE | `/staff/restaurants/{restaurant}/content/{content}/options/{option}` | Personnel du restaurant, selon rôle | `RestaurantMenuController@optionDelete` |
| GET | `/staff/restaurants/{restaurant}/allergens` | Personnel du restaurant, selon rôle | `RestaurantMenuController@allergens` |
| POST | `/staff/restaurants/{restaurant}/allergens` | Personnel du restaurant, selon rôle | `RestaurantMenuController@allergenStore` |
| PATCH | `/staff/restaurants/{restaurant}/allergens/{allergen}` | Personnel du restaurant, selon rôle | `RestaurantMenuController@allergenUpdate` |
| DELETE | `/staff/restaurants/{restaurant}/allergens/{allergen}` | Personnel du restaurant, selon rôle | `RestaurantMenuController@allergenDelete` |
| PUT | `/staff/restaurants/{restaurant}/content/{content}/allergens` | Personnel du restaurant, selon rôle | `RestaurantMenuController@setAllergens` |
| GET | `/staff/restaurants/{restaurant}/service-slots` | Personnel du restaurant, selon rôle | `RestaurantSlotController@index` |
| PATCH | `/staff/restaurants/{restaurant}/delivery-fee` | Personnel du restaurant, selon rôle | `RestaurantSlotController@fee` |
| POST | `/staff/restaurants/{restaurant}/service-slots` | Personnel du restaurant, selon rôle | `RestaurantSlotController@store` |
| PATCH | `/staff/restaurants/{restaurant}/service-slots/{slot}` | Personnel du restaurant, selon rôle | `RestaurantSlotController@update` |
| DELETE | `/staff/restaurants/{restaurant}/service-slots/{slot}` | Personnel du restaurant, selon rôle | `RestaurantSlotController@destroy` |
| GET | `/me` | Compte actif | `AuthProfileController@me` |
| PATCH | `/me` | Compte actif | `AuthProfileController@update` |
| POST | `/auth/email/verification/request` | Compte actif | `AuthProfileController@requestVerification` |
| POST | `/auth/email/verify` | Compte actif | `AuthProfileController@verifyEmail` |
| GET | `/staff/restaurants/{restaurant}/members` | Personnel du restaurant, selon rôle | `RestaurantTeamController@index` |
| POST | `/staff/restaurants/{restaurant}/members` | Personnel du restaurant, selon rôle | `RestaurantTeamController@store` |
| PUT | `/staff/restaurants/{restaurant}/members/{user}` | Personnel du restaurant, selon rôle | `RestaurantTeamController@assign` |
| PATCH | `/staff/restaurants/{restaurant}/members/{user}/status` | Personnel du restaurant, selon rôle | `RestaurantTeamController@status` |
| GET | `/staff/restaurants` | Personnel du restaurant, selon rôle | `StaffRestaurantController@restaurants` |
| GET | `/staff/restaurants/{restaurant}/content` | Personnel du restaurant, selon rôle | `StaffRestaurantController@content` |
| POST | `/staff/restaurants/{restaurant}/content` | Personnel du restaurant, selon rôle | `StaffRestaurantController@store` |
| PATCH | `/staff/restaurants/{restaurant}/content/{content}` | Personnel du restaurant, selon rôle | `StaffRestaurantController@update` |
| DELETE | `/staff/restaurants/{restaurant}/content/{content}` | Personnel du restaurant, selon rôle | `StaffRestaurantController@destroy` |
| PATCH | `/staff/restaurants/{restaurant}/content/{content}/service` | Personnel du restaurant, selon rôle | `StaffRestaurantController@service` |
| POST | `/platform/restaurants` | Admin plateforme | `PlatformRestaurantController@store` |
| GET | `/platform/restaurants` | Admin plateforme | `PlatformRestaurantController@index` |
| PATCH | `/platform/restaurants/{restaurant}` | Admin plateforme | `PlatformRestaurantController@update` |
| GET | `/platform/users` | Admin plateforme | `PlatformUserController@index` |
| POST | `/platform/users` | Admin plateforme | `PlatformUserController@store` |
| PATCH | `/platform/users/{user}` | Admin plateforme | `PlatformUserController@update` |
| PUT | `/platform/restaurants/{restaurant}/members/{user}` | Admin plateforme | `PlatformUserController@assign` |
| DELETE | `/platform/restaurants/{restaurant}/members/{user}` | Admin plateforme | `PlatformUserController@revoke` |
| GET | `/platform/insights` | Admin plateforme | `PlatformInsightsController@index` |
| GET | `/platform/complaint-escalations` | Admin plateforme | `PlatformInsightsController@complaintEscalations` |
| GET | `/platform/audit` | Admin plateforme | `PlatformInsightsController@audit` |
| GET | `/platform/invitations` | Admin plateforme | `PlatformInvitationController@index` |
| POST | `/platform/invitations` | Admin plateforme | `PlatformInvitationController@store` |
| DELETE | `/platform/invitations/{invitation}` | Admin plateforme | `PlatformInvitationController@destroy` |
| GET | `/platform/me` | Admin plateforme | `PlatformProfileController@show` |
| PUT | `/platform/me/password` | Admin plateforme | `PlatformProfileController@password` |
<!-- ROUTES:END -->
