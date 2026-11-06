# Opérations du restaurant et réclamations — étapes 5 et 6

Routes préfixées par `/api`. Les routes privées demandent `Authorization: Bearer <jeton Sanctum>`. Les erreurs suivent `CONVENTIONS_API.md`. Les prix et frais restent des entiers CDF ; les créneaux sont évalués à l'heure de Kinshasa.

## Commandes et service

Les codes de statut API sont `received` (reçue), `accepted` (acceptée), `preparing` (en préparation), `ready` (prête), `served` (servie, sur place ou retrait), `delivering` (en livraison), `delivered` (livrée) et `cancelled` (annulée). Les commandes créées avant cette étape avec `pending` et `confirmed` sont converties par la migration. Les anciens `completed` deviennent `served` ou `delivered` selon le service.

Flux autorisés : `received → accepted → preparing → ready`, puis `ready → served` pour le service sur place/retrait ou `ready → delivering → delivered` pour la livraison affectée. Une annulation avant le statut final exige un motif et un gérant ou admin local ; elle restitue le stock suivi et libère la réservation de table. L'employé peut avancer la commande mais ne l'annule pas. En livraison, seul l'employé affecté peut signaler son départ, sa position et la remise ; gérant et admin local peuvent superviser la transition. Toute mutation de commande exige `expected_version` et inscrit dans `order_events` l'auteur, l'horodatage, le motif éventuel, l'action et la nouvelle version. Un saut ou une version périmée renvoie 409.

| Route | Rôle | Fonction |
| --- | --- | --- |
| `GET /staff/restaurants/{restaurant}/orders` | Équipe locale | Liste paginée, filtre `status` |
| `GET /staff/restaurants/{restaurant}/orders/{order}` | Équipe locale | Détail filtré par rôle |
| `PATCH /staff/orders/{order}/status` | Équipe locale selon transition | `status`, `expected_version`, `reason?` |
| `PUT /staff/orders/{order}/table-assignment` | Gérant, admin local | `dining_table_id`, `expected_version`, `reason?` ; contrôle du chevauchement |
| `PUT /staff/orders/{order}/delivery-assignment` | Gérant, admin local | `employee_id`, `expected_version`, `reason?` ; employé actif du même restaurant |
| `POST /staff/orders/{order}/delivery-position` | Employé affecté | `latitude`, `longitude` ; horodatage serveur ; livraison en cours uniquement |
| `GET /staff/restaurants/{restaurant}/orders/{order}/tracking` | Gérant, admin local, employé affecté | Dernière position datée |
| `GET /me/orders/{order}/tracking` | Étudiant propriétaire | Statut et dernière position datée |

L'employé non affecté à une livraison voit le statut, la zone et les lignes utiles au service, **pas l'adresse complète ni le téléphone**. Le gérant et l'admin local voient l'adresse de leur restaurant ; l'employé affecté la voit pendant sa mission, puis perd cet accès après livraison ou annulation. Un autre restaurant reçoit 404 ; l'admin plateforme ne reçoit que les agrégats existants dans `/platform/insights`. Aucun rôle livreur séparé n'est créé : la livraison est une affectation ponctuelle d'un employé existant.

## Tables et zones de livraison

`GET /restaurants/{restaurant}/tables` expose code et capacité des tables actives. L'admin local configure les tables avec `GET/POST /staff/restaurants/{restaurant}/tables` et `PATCH/DELETE /staff/restaurants/{restaurant}/tables/{table}`. Le gérant et l'employé peuvent lire les tables locales. Les mutations exigent `expected_version`. Une table ayant un historique de réservation est désactivée plutôt que supprimée.

Pour `dine_in`, le devis et la commande exigent `dining_table_id` et `party_size`. Le serveur vérifie la capacité, le créneau de service existant et une réservation de 90 minutes sans chevauchement. La commande réserve la table ; l'annulation ou le service terminé la libère. Le gérant ou l'admin local peut réaffecter une table libre.

`GET /restaurants/{restaurant}/delivery-zones` expose districts et frais actifs. L'admin local configure les zones par `GET/POST /staff/restaurants/{restaurant}/delivery-zones` et `PATCH/DELETE /staff/restaurants/{restaurant}/delivery-zones/{zone}`. Le gérant peut les consulter. Une zone est un district de Kinshasa. Dès qu'au moins une zone existe, l'adresse de livraison doit correspondre à une zone active ; son `fee_cdf` remplace le frais général du restaurant. Sans zone configurée, le frais général déjà présent reste applicable. Le devis et la commande conservent la zone et le frais calculé ; la commande garde la copie de l'adresse.

La position est une coordonnée datée fournie par l'employé affecté, sans validation géographique automatique. Le suivi temps réel par carte et les règles de conservation des positions devront être décidés avant une exploitation réelle.

## Réclamations

Les codes de statut sont `ouverte`, `prise_en_charge`, `proposition_employe`, `validation_gerant`, `decision_admin`, `resolue`, `rejetee`, `escaladee`. L'étudiant crée et consulte uniquement ses dossiers ; `order_id`, s'il est fourni, doit être sa commande du restaurant. L'employé prend en charge et propose une réponse interne. Le gérant valide ou renvoie en correction avec motif. L'admin local publie sa décision puis résout, rejette ou escalade. Une version périmée ou une transition hors de ce flux renvoie 409. Chaque transition crée un `complaint_event` avec auteur, date, motif et version.

| Route | Rôle | Fonction |
| --- | --- | --- |
| `POST /restaurants/{restaurant}/complaints` | Étudiant | `reason`, `order_id?` |
| `GET /me/complaints`, `GET /me/complaints/{complaint}` | Étudiant propriétaire | Liste paginée et détail filtré |
| `POST /me/complaints/{complaint}/messages` | Étudiant propriétaire, dossier ouvert | Message visible par l'étudiant et l'équipe |
| `GET /staff/restaurants/{restaurant}/complaints`, `GET /staff/restaurants/{restaurant}/complaints/{complaint}` | Équipe locale | Liste et dossier du seul restaurant affecté |
| `PATCH /staff/complaints/{complaint}/status` | Employé, gérant ou admin local selon l'étape | `status`, `expected_version`, `body?`, `reason?` |
| `GET /platform/complaint-escalations` | Admin plateforme | Seulement `id`, `restaurant_id`, `status`, `created_at` ; liste paginée |

Les propositions de l'employé et notes du gérant sont **internes**. L'étudiant ne reçoit que ses messages et la décision publiée par l'admin local ; les motifs internes des événements ne lui sont pas renvoyés. L'admin plateforme ne peut ni ouvrir le dossier ni lire les messages, pièces jointes, identité du client ou motif.

## Pièces jointes privées

`POST /complaints/{complaint}/attachments` accepte JPEG, PNG ou PDF jusqu'à 5 Mo. Les fichiers sont placés sur le disque Laravel `local`, dans un répertoire privé, jamais dans `public`. `GET /complaints/{complaint}/attachments/{attachment}/url` renvoie une URL signée valable **5 minutes** uniquement au propriétaire ou à l'équipe locale autorisée. `GET /complaint-attachments/{attachment}/download` vérifie la signature, le jeton Sanctum, le compte destinataire et la policy au moment du téléchargement. L'URL est donc à utiliser avec l'en-tête Bearer. Les chemins de stockage ne sont jamais exposés par l'API. Une pièce interne n'est pas visible par l'étudiant ; la plateforme n'a aucun accès aux fichiers.

Les policies sont dans `backend/app/Policies/ComplaintPolicy.php`. Les tests `RestaurantOperationsTest.php` et `ComplaintWorkflowTest.php` couvrent transitions, affectations, zones, conflits de table, confidentialité des adresses et pièces jointes, isolation par restaurant et projection plateforme.
