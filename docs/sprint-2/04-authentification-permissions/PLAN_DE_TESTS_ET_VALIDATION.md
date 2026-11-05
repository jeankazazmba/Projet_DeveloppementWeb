# Issue #31 — Plan de tests et points de validation

## Tests fonctionnels à exécuter dans l'environnement du projet

1. Inscription avec nom, e-mail, téléphone, mot de passe conforme et confirmation identique : création du compte Supabase et du profil attendu.
2. Inscription avec mot de passe sans majuscule : rejet de validation.
3. Inscription avec mot de passe sans chiffre : rejet de validation.
4. Inscription avec confirmation différente : rejet de validation.
5. Connexion avec identifiants valides : retour des deux jetons, de `expires_in`, du profil et des rôles.
6. Connexion avec mauvais mot de passe : réponse 401, `error.code` = `INVALID_CREDENTIALS`, sans détail sensible de Supabase ; même réponse pour un e-mail inconnu.
7. Sixième tentative rapprochée après cinq échecs : réponse 429, `RATE_LIMIT_EXCEEDED`.
8. Renouvellement avec `refresh_token` valide : nouveaux jetons renvoyés ; le frontend remplace les anciens.
9. Renouvellement avec jeton invalide/expiré : réponse 401, `SESSION_INVALID`.
10. GET `/api/auth/me` sans Bearer token : réponse 401, `UNAUTHORIZED`.
11. GET `/api/auth/me` avec jeton valide : identité et profil de l'utilisateur courant.
12. Déconnexion : demande de logout transmise à Supabase ; tester ensuite le comportement du jeton et du refresh token dans la configuration réelle.
13. Mot de passe oublié : réponse générique identique, que l'adresse existe ou non ; vérifier la réception de l'e-mail et la redirection.
14. Réinitialisation avec jeton de récupération valide : mot de passe modifié ; retester la connexion.
15. Profil d'un autre utilisateur : lecture refusée par RLS.
16. Affectations d'un autre utilisateur : lecture refusée par RLS.
17. Affectation employé/gérant/admin active : rôle correspondant retourné.
18. Affectation de personnel inactive sans affectation active : aucun rôle de personnel et aucun reclassement automatique étudiant.
19. Compte avec `account_status` différent de `active` : connexion et routes protégées refusées par 403, `ACCOUNT_DISABLED`.
20. Erreur de validation (ex. e-mail manquant) : réponse 422 au format commun `success/message/data/error`, `VALIDATION_ERROR`, détail par champ dans `error.details` (et non le format natif de Laravel).
21. Toute réponse d'erreur contient bien le champ `error` ; toute réponse de succès contient `error: null`.
22. Politique RLS volontairement bloquante (ou profil absent) : réponse 500 `INTERNAL_ERROR`, et non un 401 « identifiants incorrects ».
23. Supabase injoignable : réponse 502 `AUTH_PROVIDER_ERROR`.
24. Réponse d'un `/me` ou d'une route protégée : `roles` disponibles dans `request->attributes('supabase_identity')` pour les permissions de Wivine (test commun avec elle).

## Confirmations requises auprès de Caleb

- Les politiques RLS autorisent-elles l'utilisateur authentifié à lire sa propre ligne dans `profiles` et ses propres lignes dans `staff_assignments`, et refusent-elles celles des autres utilisateurs ?
- Les colonnes réelles correspondent-elles à `profiles(id, full_name, phone, account_status, created_at)` et `staff_assignments(id, restaurant_id, user_id, staff_role, is_active, assigned_at)` ?
- Le trigger `trg_create_profile` crée-t-il réellement `public.profiles` après l'inscription et renseigne-t-il `full_name` et `phone` à partir des métadonnées d'inscription ?
- Confirme-t-on la règle métier : aucune affectation de personnel = étudiant ; affectation de personnel inactive = aucun rôle de personnel, sans attribution automatique du rôle étudiant ?
- La configuration de confirmation d'e-mail et l'URL de redirection de réinitialisation sont-elles activées dans le projet Supabase ?

## Limites de validation
Le contrôle syntaxique PHP ne remplace pas les tests d'intégration. Le module ne peut être déclaré opérationnel qu'après intégration dans le dépôt Laravel, configuration de Supabase et exécution de ces tests.

## Confirmations requises auprès de Wivine

- Noms de rôles utilisés par les permissions : valeurs de la base (`student/employee/manager/admin`) ou noms français ?
- Les permissions lisent-elles `request->attributes->get('supabase_identity')['roles']` posé par le middleware ?
- Les codes d'erreur proposés (`INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `SESSION_INVALID`, `REGISTRATION_FAILED`, `INVALID_RESET_TOKEN`, `AUTH_PROVIDER_ERROR`) sont-ils acceptés comme convention commune ?
