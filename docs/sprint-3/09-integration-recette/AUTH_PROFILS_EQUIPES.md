# Authentification, profils et équipes — étape 2

## Contrat de connexion

Toutes les routes ci-dessous sont préfixées par `/api`. Les erreurs suivent `CONVENTIONS_API.md` (`message` et `error.code`). Les routes privées utilisent `Authorization: Bearer <token>` avec Sanctum. `/login` et `/logout` restent disponibles pour les clients existants ; `/auth/login` et `/auth/logout` sont leurs alias.

| Méthode et route | Accès | Corps principal | Réponse |
| --- | --- | --- | --- |
| `POST /auth/register` | Public | `name`, `email`, `password`, `password_confirmation`, `phone?` | 201, `token`, `user`, `restaurants: []` ; crée uniquement un étudiant |
| `POST /auth/login` | Public | `email`, `password` | 200, jeton Sanctum, identité et restaurants actifs |
| `POST /auth/logout` | Connecté | Aucun | 204, révoque le jeton courant |
| `GET /me` | Compte actif | Aucun | Profil, type de compte, établissements accessibles et leurs rôles |
| `PATCH /me` | Compte actif | `name?`, `phone?` (étudiant), `expected_version?` | Profil mis à jour ; 409 si version périmée |
| `POST /auth/password/forgot` | Public | `email` | 200 identique pour adresse connue ou inconnue |
| `POST /auth/password/reset` | Public | `email`, `token`, `password`, `password_confirmation` | 204, révoque tous les jetons de session |
| `POST /auth/email/verification/request` | Connecté | Aucun | 200, crée un jeton si besoin |
| `POST /auth/email/verify` | Connecté | `token` | 204, confirme l'adresse |

Un compte professionnel est créé par un responsable de restaurant ; un administrateur local est créé par l'admin plateforme via `/platform/users` ou le parcours d'invitation existant. Le client ne peut pas choisir son rôle à l'inscription publique. L'adresse e-mail n'est pas modifiable par `PATCH /me` : un changement d'adresse demandera un parcours de vérification séparé.

## Jetons et courrier

Les jetons sont aléatoires, conservés uniquement sous empreinte SHA-256 dans `password_reset_tokens` et `email_verification_tokens`, à usage unique. Réinitialisation : expiration après 60 minutes. Vérification : 24 heures. Un nouveau jeton remplace l'ancien. Les mots de passe sont hachés par Laravel. La réinitialisation invalide toutes les sessions existantes.

**Aucun courriel n'est envoyé actuellement.** En environnements `local` et `testing`, le jeton en clair est écrit dans le journal Laravel (`backend/storage/logs/laravel.log`), entrée `auth.local_token` avec `purpose`, `email` et `token`. Ce journal est sensible : ne pas le publier ni le partager. L'API ne retourne jamais le jeton. En production, il faut brancher un transport de courrier avant de proposer la récupération et la vérification aux utilisateurs ; les jetons ne sont alors pas journalisés.

La connexion est permise tant que la vérification de l'adresse n'est pas obligatoire dans le produit. Un compte globalement suspendu est refusé sur toutes les routes privées ; un compte suspendu localement garde son identité mais perd l'accès à ce restaurant.

## Équipes locales

Préfixe : `/api/staff/restaurants/{restaurant}/members`. Le restaurant provient de l'URL et l'affectation active de l'acteur est contrôlée côté serveur.

| Méthode | Action | Admin restaurant | Gérant | Employé / étudiant / admin plateforme |
| --- | --- | --- | --- | --- |
| `GET /` | Liste paginée, filtres `role`, `active`, `per_page` | Gérant et employé | Employé seul | Refusé |
| `POST /` | Créer un compte et l'affecter | Gérant ou employé | Employé seul | Refusé |
| `PUT /{user}` | Affecter un professionnel existant | Gérant ou employé | Employé seul | Refusé |
| `PATCH /{user}/status` | `is_active`, `reason?`, `expected_version?` | Gérant ou employé | Employé seul | Refusé |

La suspension requiert un motif ; elle modifie seulement l'affectation à cet établissement. Une version périmée retourne 409. Les opérations sont consignées dans `restaurant_member_audit_logs`. Aucun responsable local ne peut modifier sa propre affectation, affecter un étudiant ou un compte plateforme, ou modifier un administrateur de restaurant. L'administrateur de plateforme reste seul habilité à créer et affecter des administrateurs locaux via ses routes `/platform/*` ; il ne voit pas les employés et gérants.

La réponse de liste comprend les métadonnées de pagination Laravel et uniquement les champs professionnels autorisés (`id`, `name`, `email`, `role`, statut local et global, `version`).

## Vérification

`backend/tests/Feature/AuthAndTeamsTest.php` couvre inscription, connexion, profil, déconnexion, réinitialisation, vérification e-mail, droits de chaque rôle, suspension globale et locale, isolation des restaurants et conflit de version. Commande manuelle depuis `backend/` : `php artisan test`.
