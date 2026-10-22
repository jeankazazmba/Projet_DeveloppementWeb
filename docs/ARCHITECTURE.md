# Architecture cible — Mon Miam Miam

**Statut : proposition de conception** inspirée de l'exigence « MVC ou similaire » du cahier des charges. Aucune stack ni API n'est actuellement installée.

## Principes

1. Séparer **interface web**, **API métier** et **stockage**.
2. Appliquer une autorisation côté serveur selon les quatre rôles.
3. Conserver la logique de prix, commande, points et parrainage **côté backend**.
4. Prévoir des modules indépendants et la possibilité d'ajouter plusieurs restaurants ultérieurement.
5. Prévoir la consultation actualisée des commandes / statistiques (actualisation AJAX ou mécanisme équivalent), sans annoncer de vraie diffusion temps réel avant développement.

## Schéma logique (cible)

```text
Navigateur (étudiant / employé / gérant / admin)
                  |
             Frontend web
                  |
              API REST
                  |
         Contrôleurs / Services
       ┌──────────┼───────────┐
 Auth & rôles   Commandes   Fidélité/Parrainage
       │          │            │
     Menus     Réclamations   Statistiques
       └──────────┼───────────┘
               Modèles
                  |
             Base de données

 Paiement externe via agrégateur : extension facultative
```

## Stack

**À valider** : le cahier autorise un frontend moderne comme React, Vue ou Angular et cite PHP/Laravel comme possibilité backend. Le choix de MySQL ou autre SGBD, les frameworks de tests et l'hébergement ne sont pas imposés. Les noms de dossiers ci-dessous sont **une convention recommandée si un frontend/backend séparés sont retenus**, pas une structure créée :

```text
frontend/         # interface étudiant, employé, gérant, administrateur
backend/          # API, validation, services, modèles
tests/            # tests unitaires, fonctionnels et E2E
docs/             # exigences, architecture, sécurité, API, design
```

## Modèle de données : premières entités à valider

| Entité | Responsabilité |
| --- | --- |
| `users` | Identité, contacts, rôle, statut, informations minimales de livraison. |
| `restaurants` | Extension multi-restaurant future ; un restaurant initial peut suffire. |
| `menu_items` | Plats/boissons, prix, disponibilité, description. |
| `orders` | Client, total, lieu de service/livraison, statut, horodatages. |
| `order_items` | Articles, quantités, prix figés au moment de la commande. |
| `loyalty_transactions` | Journal des crédits, débits, annulations et expirations des points (recommandation). |
| `referrals` | Parrain, filleul, code et statut de récompense. |
| `complaints` | Réclamations, réponses, validations et historique. |
| `promotions` / `events` | Campagnes, affiches et éventuels mini-jeux. |
| `payment_transactions` | **Bonus** uniquement si un paiement externe est retenu. |

Le document cite explicitement `users`, `orders` et `referrals`. Les autres entités sont des **propositions de modélisation**, à soumettre à revue.

## Contrôle des accès : intention

| Action | Étudiant | Employé | Gérant | Admin |
| --- | --- | --- | --- | --- |
| Voir menu/publications | Oui | Oui | Oui | Oui |
| Créer ses commandes | Oui | À décider | À décider | À décider |
| Gérer les commandes en service | Non | Oui | Supervision | Supervision |
| Modifier temporairement disponibilité menu | Non | Oui | À décider | Oui |
| CRUD structurel du menu | Non | Non | À décider | Oui |
| Créer compte employé | Non | Non | Oui | Oui |
| Consulter stats hebdomadaires | Non | Oui | Oui | Oui |
| Consulter stats globales | Non | Non | Oui | Oui |
| Consulter ses points et réclamations | Oui, les siens | Selon mission | Selon mission | Selon mission |
| Arbitrer les réponses aux réclamations | Non | Préparer la réponse | Oui | Oui |

Une cellule « À décider » signifie que le cahier ne tranche pas ce comportement. **Refuser par défaut** les opérations non autorisées dans le backend.

## Principaux contrats API envisagés

Le cahier mentionne à titre d'exemple :
- `POST /orders` — création de commande.
- `GET /users/{id}/points` — solde utilisateur.
- `POST /referral/generate` et `POST /referral/use` — parrainage.
- `POST /referral/reward` — récompense après première commande réussie.

**Recommandations d'implémentation :**
- Pour `/users/{id}/points`, vérifier que le sujet est l'utilisateur connecté ou un rôle habilité.
- Pour `/referral/reward`, préférer un **service interne déclenché par événement métier** à un endpoint librement invoquable par le client.
- Pour `POST /orders`, re-calculer montants et remises côté serveur, puis créditer les points au stade métier défini (à décider).
- Utiliser des transactions et clés d'idempotence lorsque cela évite un double débit/crédit.

Le contrat OpenAPI final sera produit après validation du backend. Aucune route n'est encore disponible.

## États métier à préciser

Commande : `créée → acceptée → en préparation → prête → servie/livrée`, avec branches `annulée/refusée` **proposées**. Cette proposition ne remplace pas une validation de l'équipe et du restaurant.

Éviter de déduire du document une obligation de géolocalisation GPS en temps réel : une **localisation pour livraison** est demandée, sans détail technique arrêté.

## Déploiement

Le cahier attend la **maquette web sur Vercel**. L'hébergement API/base de données et un éventuel déploiement applicatif complet **restent à choisir**. Les secrets de déploiement ne vont jamais dans Git.
