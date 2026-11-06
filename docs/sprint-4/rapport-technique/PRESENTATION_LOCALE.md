# Présentation locale — Mon Miam Miam

Cette recette couvre l'application web, le bureau Tauri et Expo avec des données locales. Elle ne constitue pas un déploiement public.

## Préparer les données

Après le démarrage de MySQL et Laravel, exécuter depuis `backend/` :

```powershell
php artisan db:seed --class=PresentationSeeder --force
```

Le jeu de données est idempotent et limité aux environnements `local` et `testing`.

| Rôle | Adresse | Mot de passe | Espace |
| --- | --- | --- | --- |
| Étudiant | `etudiant.presentation@monmiammiam.test` | `Presentation!2026` | `/etudiant` ou Expo |
| Employé | `employe.presentation@monmiammiam.test` | `Presentation!2026` | `/employe` ou Expo |
| Gérant | `gerant.presentation@monmiammiam.test` | `Presentation!2026` | `/gerant` |
| Admin restaurant | `admin.presentation@monmiammiam.test` | `Presentation!2026` | `/admin` |
| Admin plateforme | `plateforme.presentation@monmiammiam.test` | `Presentation!2026` | `/plateforme` |

Tous les comptes professionnel sont affectés à `Khalifa_food`. Les données de plateforme démontrent aussi l'agrégation multi-restaurants avec `sleepy hollow`.

## Parcours à montrer

1. Site public : restaurants, menus, promotions, événements et jeux par établissement.
2. Étudiant : inscription ou connexion, panier mono-restaurant, devis, commande, fidélité, parrainage, réclamation et déconnexion.
3. Employé : commande reçue, acceptée, préparation, prête puis servie ; indisponibilité d'un plat et proposition de réclamation.
4. Gérant : suivi du restaurant, équipe, réclamation, statistiques et livraison.
5. Admin restaurant : contenus, menu, créneaux, tables, zones, équipe et statistiques.
6. Admin plateforme : établissements, admins locaux, journal d'audit, escalades et agrégats non nominatifs.

Après l'étape 2, le même utilisateur reste connecté lorsqu'il passe du site public à son espace. La déconnexion révoque le jeton côté API lorsque le réseau est disponible et retire la session locale.

## Frontières à expliquer

- Seul l'étudiant crée son propre compte. Les employés, gérants et admins restaurant sont créés ou affectés par l'admin restaurant ou plateforme, selon leurs droits.
- L'admin plateforme reçoit une invitation avant inscription.
- Les paiements électroniques restent une préparation de sandbox ; la démonstration active le règlement espèces `cash_due`.
- Les mises à jour inter-applications utilisent actuellement un polling sécurisé, pas encore WebSocket.
