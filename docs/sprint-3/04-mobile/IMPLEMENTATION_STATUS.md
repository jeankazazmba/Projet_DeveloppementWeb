# Application mobile étudiante — état du Sprint 3

## Écrans codés

Les 18 exports `*--Etudiant` ont un parcours mobile correspondant : connexion et mot de passe oublié, accueil, menu, détail du plat, panier, paiement, confirmation, commandes et détail de commande, fidélité, parrainage, réclamations et signalement, jeux et roue de la chance, classement, profil. Un écran de création de compte complète le parcours d'authentification.

Un splash natif Expo reprend le logo doré de la maquette. Une transition de marque visible dans Expo Go et quatre écrans d'onboarding présentent le menu, la commande, les avantages étudiants, puis le suivi des commandes et l'assistance. L'onboarding est affiché à la première ouverture, son état est enregistré localement et il peut être revu depuis le profil ou la connexion. Un bouton flottant avec icône de chariot ouvre le panier ; il est déplaçable par glissement et reste dans la zone visible de l'écran. Une barre haute fixe présente le logo, la recherche du menu et les notifications locales. La navigation basse est flottante avec des coins arrondis.

Le thème reprend le noir et l'or des maquettes avec des cartes translucides et des bordures lumineuses. Les photos du menu sont extraites des ressources Figma fournies localement.

## Fonctionnement actuel

Navigation, recherche et filtres du menu, quantités du panier, commande de démonstration, historique, points, réduction, parrainage, signalement avec photo locale, roue quotidienne et édition du nom. Les données sont conservées sur le téléphone avec AsyncStorage.

## À raccorder au serveur

Authentification et réinitialisation du mot de passe ; compte et profil réels ; catalogue et promotions dynamiques ; disponibilité, tarif de livraison et suivi des commandes ; agrégateur de paiement (Mobile Money/carte) ; règles et contrôles serveur de fidélité et de parrainage ; réclamations et pièces jointes ; jeux, classement et événements réels. Le dossier `backend/routes/api.php` ne définit aujourd'hui qu'un endpoint `/health` : il n'existe pas encore de contrats métier à appeler. Les écrans indiquent le mode démonstration et ne présentent pas une commande ou un paiement local comme une transaction réelle.

## Vérification effectuée

Analyse syntaxique des fichiers JavaScript/JSX, résolution des versions npm dans `package-lock.json` et vérification des fichiers image. Après la migration vers SDK 58, `expo-doctor` valide 20 contrôles sur 20. Aucun lancement ou compilation sous SDK 58 n'a été effectué, conformément au rôle réservé au propriétaire du projet.

**Environnement** : Expo SDK 58, React Native 0.88.1, React 19.3.0. Le Node.js actuellement actif est 23.4.0 ; Expo SDK 58 exige Node.js 22.13+ (branche 22), 24.3+ (branche 24) ou 26+. Utiliser une version prise en charge avant le lancement.
