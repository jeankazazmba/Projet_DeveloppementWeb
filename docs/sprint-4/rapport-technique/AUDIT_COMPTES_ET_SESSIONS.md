# Audit des comptes et des sessions

Dernière vérification : 6 novembre 2026. Les espaces web et mobiles utilisent l'API Laravel lorsqu'elle est configurée par `VITE_API_URL` ou `EXPO_PUBLIC_API_URL`. En l'absence d'API, les interfaces conservent explicitement leur mode démonstration ; aucune action n'est alors présentée comme confirmée par le serveur.

## Parcours par espace

| Espace | Création de compte | Connexion | Déconnexion | Session persistante |
| --- | --- | --- | --- | --- |
| Site public | Redirige vers le portail d'accès | N/A | Disponible depuis l'en-tête une fois connecté | Oui : le visiteur peut continuer à consulter le site, accéder à « Mon espace » ou se déconnecter. |
| Étudiant web | Inscription autonome via `POST /api/auth/register` | Oui | Oui, API puis suppression locale | Oui, stockage navigateur et restauration à l'ouverture. |
| Étudiant Expo | Inscription autonome via la même API | Oui | Oui, API puis `AsyncStorage` | Oui, restauration après le splash et les quatre écrans d'onboarding. |
| Employé web | Pas d'inscription publique : création/affectation par une personne autorisée | Oui | Oui | Oui, avec contrôle de l'affectation au restaurant. |
| Employé Expo | Pas d'inscription publique : compte préalablement affecté | Oui | Oui | Oui, avec stockage `AsyncStorage` distinct de l'étudiant. |
| Gérant web | Pas d'inscription publique : compte affecté | Oui | Oui | Oui, selon ses restaurants accessibles. |
| Admin restaurant web | Pas d'inscription publique : créé/affecté par l'admin plateforme | Oui | Oui | Oui, selon ses restaurants accessibles. |
| Admin plateforme web | Inscription uniquement après invitation / création contrôlée | Oui | Oui | Oui, sans accès aux données internes des restaurants. |

## Règles de session

1. L'API remet un jeton Bearer uniquement après une authentification réussie.
2. Le frontend mémorise le jeton et le rôle. Au retour dans un espace, il appelle `GET /api/me` avant de restaurer le contexte effectif ; un compte suspendu ou sans affectation est refusé.
3. Le bouton **Déconnexion** appelle `POST /api/auth/logout` quand l'API est joignable, puis efface toujours la session locale. Le comportement reste sûr hors ligne : aucune session n'est conservée localement.
4. Le site public ne déconnecte plus l'utilisateur lors de la navigation. Il affiche **Mon espace** pour le rôle mémorisé et garde les pages publiques accessibles.
5. Une erreur API `401` ou `403` efface la session locale et ramène l'utilisateur à la connexion.

## Limites connues

- Le jeton web est conservé dans `localStorage` pour répondre au besoin de continuité de session. En production, compléter cette décision par une politique CSP stricte, HTTPS et une durée de validité courte ; une solution par cookie `HttpOnly` pourra remplacer ce stockage.
- Le shell Tauri propose les rôles et ouvre les espaces web. L'authentification effective est celle de l'espace web chargé ; la création d'un flux d'authentification natif unique reste une amélioration distincte.
- L'onboarding étudiant est volontairement affiché à chaque lancement ; après son dernier écran, une session restaurée renvoie bien vers l'accueil.

## Recette manuelle minimale

1. Créer un compte étudiant, revenir sur le site public puis vérifier **Mon espace** et l'accès à l'espace étudiant.
2. Actualiser le navigateur : le profil doit être restauré après contrôle `GET /api/me`.
3. Cliquer sur **Déconnexion**, actualiser : le site doit proposer de nouveau Connexion et Inscription.
4. Connecter un employé affecté à `Khalifa_food`, puis vérifier que les données de `sleepy hollow` ne sont pas visibles.
5. Suspendre le compte dans l'API, actualiser l'espace : l'accès doit être refusé et la session supprimée.
6. Dans Expo, connecter l'étudiant, fermer puis rouvrir l'application, parcourir l'onboarding et vérifier l'arrivée à l'accueil ; se déconnecter et vérifier le retour à la connexion.
