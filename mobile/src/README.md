# Code mobile

- `App.js` : sélection de l'espace, navigation, persistance locale et parcours étudiants.
- `EmployeeApp.js` : écrans employés et navigation flottante avec le thème mobile partagé.
- `employeeData.js` : commandes, disponibilités, réclamations et statistiques de démonstration employé.
- `SplashIntro.js` : transition de marque visible dans Expo Go.
- `Onboarding.js` : quatre écrans de présentation à chaque lancement dans l'espace étudiant, avant la connexion ou l’accueil selon la session, avec reprise possible.
- `AppTopBar.js` : barre supérieure flottante et translucide partagée par les deux espaces ; la navigation basse partage le même flou et la même vue cible Android.
- `FloatingCart.js` : accès au panier par bouton flottant déplaçable.
- `catalog.js` : plats et prix de démonstration, avec photos des exports Figma.
- `ui.js` : composants communs et thème sombre glassmorphism.

La future connexion à l'API Laravel devra remplacer les stockages locaux étudiant et employé pour l'authentification et le contrôle des rôles, le menu, les commandes, les paiements, la fidélité, les jeux, le classement et les réclamations. Les actions mobiles employé ne sont pas encore synchronisées avec le web employé.
