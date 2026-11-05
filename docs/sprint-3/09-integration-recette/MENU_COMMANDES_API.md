# Menu, publication, panier et commandes — étapes 3 et 4

Toutes les routes portent le préfixe `/api`. Les erreurs suivent [CONVENTIONS_API.md](CONVENTIONS_API.md). Les routes privées demandent un jeton Sanctum. Les prix et frais sont **des entiers en CDF**, sans décimales. L'heure de service est évaluée dans le fuseau `Africa/Kinshasa` ; envoyer `requested_at` en ISO 8601 avec décalage horaire.

## Menu et publication

Le catalogue conserve `restaurant_contents` et les anciennes routes `/restaurants/{restaurant}/content` et `/staff/restaurants/{restaurant}/content`. Un contenu a `kind = dish | promotion | event | game`. Les nouveaux champs sont `category_id`, `stock_quantity`, `published_from`, `published_until`. Une date de début est inclusive et une date de fin exclusive. `stock_quantity = null` signifie stock non suivi ; zéro signifie épuisé. Le prix du plat est obligatoire à la création. Les variantes et suppléments ajoutent un montant non négatif à `price_cdf`.

| Route | Accès | Fonction |
| --- | --- | --- |
| `GET /restaurants/{restaurant}/content?kind=` | Public | Contenus publiés, disponibles, dans leur période ; plats en stock et catégorie active uniquement |
| `GET /restaurants/{restaurant}/menu` | Public | Catégories actives, plats actifs, options disponibles et allergènes |
| `GET /staff/restaurants/{restaurant}/content` | Équipe locale | Admin : tous les contenus ; gérant/employé : plats publiés utiles au service |
| `POST /staff/restaurants/{restaurant}/content` | Admin restaurant | Créer plat, promotion, événement ou jeu |
| `PATCH /staff/restaurants/{restaurant}/content/{content}` | Admin restaurant | Modifier, avec `expected_version?` pour les anciens clients ; 409 en cas de conflit |
| `DELETE /staff/restaurants/{restaurant}/content/{content}` | Admin restaurant | Supprimer |
| `PATCH /staff/restaurants/{restaurant}/content/{content}/service` | Admin restaurant ou employé | `is_available`, `is_featured`, `expected_version?` seulement |
| `GET/POST /staff/restaurants/{restaurant}/categories` | Admin restaurant | Lister/créer catégorie |
| `PATCH/DELETE /staff/restaurants/{restaurant}/categories/{category}` | Admin restaurant | Modifier/supprimer, `expected_version` obligatoire |
| `POST /staff/restaurants/{restaurant}/content/{content}/options` | Admin restaurant | Créer variante ou supplément (`kind`, `name`, `price_delta_cdf`, stock optionnel) |
| `PATCH/DELETE /staff/restaurants/{restaurant}/content/{content}/options/{option}` | Admin restaurant | Modifier/supprimer, `expected_version` obligatoire |
| `GET/POST /staff/restaurants/{restaurant}/allergens` | Admin restaurant | Lister/créer allergène local |
| `PATCH/DELETE /staff/restaurants/{restaurant}/allergens/{allergen}` | Admin restaurant | Modifier/supprimer, `expected_version` obligatoire |
| `PUT /staff/restaurants/{restaurant}/content/{content}/allergens` | Admin restaurant | Remplacer `allergen_ids`, `expected_version` du plat obligatoire |

Une catégorie, option ou allergène d'un autre restaurant est rejeté côté serveur. Le gérant n'obtient aucun droit d'édition du menu. L'admin plateforme n'entre pas dans ces routes. Les contenus publics ne sont servis que si la fiche du restaurant est active et publique.

## Horaires, panier et adresses

`restaurants.hours` reste un texte de présentation. Les commandes utilisent des `service_slots` structurés avec `service = pickup | dine_in | delivery`, `weekday` de 0 (dimanche) à 6 (samedi), `starts_at`, `ends_at` et `is_active`. Les heures sont locales à Kinshasa et un créneau ne traverse pas minuit. Sans créneau actif, aucun devis ni commande n'est possible. L'admin restaurant configure les créneaux via `GET/POST /staff/restaurants/{restaurant}/service-slots` et `PATCH/DELETE /staff/restaurants/{restaurant}/service-slots/{slot}`. Les modifications et suppressions exigent `expected_version`. `GET /restaurants/{restaurant}/service-slots` expose uniquement les créneaux actifs. `PATCH /staff/restaurants/{restaurant}/delivery-fee` fixe `delivery_fee_cdf` avec `expected_version` ; le frais est zéro pour les autres services.

L'étudiant utilise `GET/PUT/DELETE /me/cart`. `PUT` remplace le panier entier (`restaurant_id`, `items`, `expected_version` si panier existant). Un changement de restaurant renvoie 409 jusqu'à l'envoi de `replace_restaurant: true` ; les anciennes lignes sont alors supprimées. Une ligne porte `content_id`, `quantity`, `variant_id?`, `supplement_ids?`. Les options doivent appartenir au plat. Le panier n'est jamais considéré comme un prix garanti.

`GET/POST /me/delivery-addresses` et `PATCH/DELETE /me/delivery-addresses/{address}` gèrent les adresses de l'étudiant. Modification et suppression exigent `expected_version`. La livraison demande une adresse du compte située à Kinshasa. La commande garde aussi une copie de l'adresse au moment de sa création.

## Devis et commandes

`POST /restaurants/{restaurant}/quotes` et `POST /restaurants/{restaurant}/orders` acceptent :

```json
{
  "service": "delivery",
  "requested_at": "2026-11-06T12:00:00+01:00",
  "service_slot_id": 1,
  "delivery_address_id": 1,
  "items": [{"content_id": 12, "quantity": 2, "variant_id": 4, "supplement_ids": [7]}]
}
```

`items` est facultatif si le compte possède un panier du restaurant ciblé. Le serveur recalcule chaque prix, les options, le stock cumulé, la période de publication, le créneau, les frais et le total. Le devis ne réserve rien. La commande revérifie sous transaction et décompte le stock suivi. Elle demande l'en-tête `Idempotency-Key` (8 à 120 caractères alphanumériques, `.`, `_`, `:`, `-`). Une répétition identique retourne la commande existante avec 200 ; la première création retourne 201 ; la même clé pour un autre corps retourne 409. Les lignes gardent titre, options et prix unitaires figés. La commande commence à `pending` ; aucun encaissement n'est déclenché à cette étape.

`GET /me/orders` renvoie les commandes de l'étudiant connecté, paginées (`per_page`, `status`). `GET /me/orders/{order}` ne révèle jamais celle d'un autre étudiant. `GET /staff/restaurants/{restaurant}/orders` renvoie les commandes réelles du restaurant à l'équipe affectée, paginées ; l'admin plateforme est exclu. `PATCH /staff/orders/{order}/status` demande `status` et `expected_version` ; le conflit renvoie 409.

Transitions autorisées : `pending → confirmed → preparing → ready`. Ensuite, livraison : `ready → delivering → completed` ; retrait/sur place : `ready → completed`. `cancelled` est possible avant `completed`, sans saut d'étape, et rend le stock suivi. Chaque transition est inscrite dans `order_events`. Les anciennes commandes de démonstration n'ont pas de propriétaire étudiant et ne sont pas modifiables par cette route.

## Vérification et limites

Les Feature tests dans `MenuPublicationTest.php` et `OrdersFlowTest.php` couvrent publication et expiration, droits par rôle, isolation, prix CDF, créneau, stock, idempotence, conflit de version et accès aux commandes. Les deux nouvelles migrations sont `000008_create_menu_domain` et `000009_create_order_domain`.

Le transport et le paiement réels, la géolocalisation de l'adresse et les réductions appliquées au panier relèvent des étapes ultérieures. Une promotion est publiée ici comme contenu ; elle ne réduit pas automatiquement le devis tant qu'une règle de remise validée n'existe pas.
