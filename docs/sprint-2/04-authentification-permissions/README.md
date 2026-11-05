# Mon Miam Miam — Issue #31 : Authentification

Livrable de travail d'Aksa — backend Laravel connecté à Supabase Auth.

## Contenu
- `backend/app/Services/SupabaseAuthService.php` : appels à Supabase Auth et lecture du profil/affectations avec le jeton de l'utilisateur.
- `backend/app/Http/Controllers/Api/AuthController.php` : inscription, connexion, renouvellement, profil courant, déconnexion et récupération du mot de passe.
- `backend/app/Http/Middleware/AuthenticateSupabase.php` : vérification de la session pour les routes protégées ; expose l'identité (profil, rôles, affectations) à Wivine pour les permissions.
- `backend/app/Exceptions/` : exceptions typées (refus Supabase, compte désactivé, profil illisible) pour renvoyer le bon code HTTP.
- `backend/routes/api.php` : routes à intégrer dans `routes/api.php` du projet Laravel.
- `backend/config/services.php.extrait` et `backend/.env.example.extrait` : configuration à fusionner.
- `backend/database/rls_policies_a_valider_avec_caleb.sql` : proposition de politiques RLS, à examiner avec Caleb avant toute exécution.
- `documentation/` : documentation technique et guide de validation.

## Décision technique
Conformément à AC-08 dans les éléments transmis pour la base de données, Supabase Auth est le fournisseur d'identité et de session. Laravel reste l'API du projet. Sanctum ne doit pas gérer en parallèle la même session.

## Intégration
1. Copier les dossiers `app/Services`, `app/Exceptions`, `app/Http/Controllers/Api` et `app/Http/Middleware` dans le projet Laravel en fusionnant les fichiers, sans écraser les fichiers existants.
2. Fusionner les routes du fichier `backend/routes/api.php` dans `routes/api.php`.
3. Ajouter l'entrée `supabase` de `backend/config/services.php.extrait` au tableau retourné par `config/services.php`.
4. Copier les variables de `backend/.env.example.extrait` dans `.env`, puis remplacer les valeurs d'exemple par celles du projet Supabase. Ne jamais mettre de clé secrète dans Git ou dans le frontend.
5. Avec Caleb, vérifier les politiques RLS permettant à un utilisateur authentifié de lire uniquement sa ligne dans `profiles` et ses affectations dans `staff_assignments`. La proposition SQL fournie ne doit pas être exécutée sans vérification des politiques déjà présentes.
6. Vérifier dans Supabase le trigger `trg_create_profile`, les colonnes réellement déployées et l'URL de redirection de récupération du mot de passe.
7. Exécuter les tests de `documentation/PLAN_DE_TESTS_ET_VALIDATION.md` avec l'environnement de développement partagé, puis faire la démonstration avec Wivine avant de clôturer l'Issue.

## Routes
| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public, limitation à 5 tentatives par minute et par combinaison IP + adresse e-mail |
| POST | `/api/auth/refresh` | Public avec `refresh_token` |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public avec jeton de récupération |
| GET | `/api/auth/me` | Bearer access token Supabase |
| POST | `/api/auth/logout` | Bearer access token Supabase |

## Format des réponses
Toutes les réponses (succès, erreurs métier, erreurs de validation) suivent l'enveloppe commune `success`, `message`, `data`, `error`. En cas d'erreur, `error` contient `code` et `details` ; en cas de succès, `error` vaut `null`.

| Situation | HTTP | `error.code` |
|---|---|---|
| Champ invalide ou manquant | 422 | `VALIDATION_ERROR` (détail par champ dans `details`) |
| Inscription refusée | 422 | `REGISTRATION_FAILED` |
| E-mail ou mot de passe incorrect | 401 | `INVALID_CREDENTIALS` |
| Compte désactivé | 403 | `ACCOUNT_DISABLED` |
| Jeton absent ou invalide (routes protégées) | 401 | `UNAUTHORIZED` |
| Jeton de renouvellement invalide ou expiré | 401 | `SESSION_INVALID` |
| Lien de réinitialisation invalide ou expiré | 422 | `INVALID_RESET_TOKEN` |
| Plus de 5 tentatives de connexion par minute | 429 | `RATE_LIMIT_EXCEEDED` |
| Supabase indisponible ou déconnexion non confirmée | 502 | `AUTH_PROVIDER_ERROR` |
| Profil/affectations illisibles (RLS, trigger), erreur inattendue | 500 | `INTERNAL_ERROR` |

Les codes `UNAUTHORIZED`, `VALIDATION_ERROR`, `RATE_LIMIT_EXCEEDED` et `INTERNAL_ERROR` viennent des conventions communes ; `INVALID_CREDENTIALS` et `ACCOUNT_DISABLED` reprennent le diagramme de connexion de Wivine. Les autres codes sont des propositions à faire valider par l'équipe.

## Rôles renvoyés
L'API renvoie les valeurs de la base : `student`, `employee`, `manager`, `admin`. Correspondance avec les noms du projet : étudiant, employé, gérant, administrateur. Ce choix de nommage est à confirmer avec Wivine, qui consomme ces rôles pour les permissions.

## Limites à ne pas masquer
- Les modifications du format d'erreur (version actuelle) n'ont pas pu être contrôlées par `php -l` (PHP absent de l'environnement de rédaction). Relancer `php -l` sur tous les fichiers avant la PR. Le code n'a pas été exécuté contre le projet Laravel/Supabase réel : les tests d'intégration restent à faire.
- La lecture des tables utilise le jeton utilisateur et dépend donc des politiques RLS. Aucun `service_role` n'est utilisé par ce module.
- La classification étudiant suppose, à ce stade, qu'un compte sans aucune ligne dans `staff_assignments` est un étudiant. Un compte ayant une affectation de personnel inactive reçoit une liste de rôles vide, et n'est pas reclassé automatiquement étudiant. Caleb/Wivine doivent valider cette règle métier.
- Le trigger, les colonnes et les politiques RLS ne sont pas prouvés comme déployés par les seuls documents de conception.
- Le frontend doit conserver et renouveler les jetons de manière sécurisée. Le `refresh_token` est sensible : ne pas l'inscrire dans les logs ni l'exposer à un tiers.

## Suivi des pièces demandées dans LIVRABLES_A_DEPOSER.md

| Pièce | État |
| --- | --- |
| Matrice des rôles et autorisations | Travail complémentaire suivi dans la PR #79, encore en revue. |
| Contrats et parcours d’authentification | Présentés dans Documentation_Issue31_Authentification_Aksa.docx. |
| Preuves de tests 401/403 et accès autorisés | Non jointes. Le plan de tests est fourni, mais aucun résultat d’exécution n’est attesté ici. |
| Endpoints, middleware et blocages | Décrits dans ce README et implémentés dans backend/. |

Le code n’a pas encore été exécuté dans le projet Laravel/Supabase réel. Les valeurs Supabase de backend/.env.example sont des placeholders. Les politiques RLS restent une proposition et ne doivent pas être exécutées avant validation.
