# Application mobile étudiante — état du Sprint 3

## Écrans codés

Les 18 exports `*--Etudiant` ont un parcours mobile correspondant : connexion et mot de passe oublié, accueil, menu, détail du plat, panier, paiement, confirmation, commandes et détail de commande, fidélité, parrainage, réclamations et signalement, jeux et roue de la chance, classement, profil. Un écran de création de compte complète le parcours d'authentification.

Le thème reprend le noir et l'or des maquettes avec des cartes translucides et des bordures lumineuses. Les photos du menu sont extraites des ressources Figma fournies localement.

## Fonctionnement actuel

Navigation, recherche et filtres du menu, quantités du panier, commande de démonstration, historique, points, réduction, parrainage, signalement avec photo locale, roue quotidienne et édition du nom. Les données sont conservées sur le téléphone avec AsyncStorage.

## À raccorder au serveur

Authentification et réinitialisation du mot de passe ; compte et profil réels ; catalogue et promotions dynamiques ; disponibilité, tarif de livraison et suivi des commandes ; agrégateur de paiement (Mobile Money/carte) ; règles et contrôles serveur de fidélité et de parrainage ; réclamations et pièces jointes ; jeux, classement et événements réels. Le dossier `backend/routes/api.php` ne définit aujourd'hui qu'un endpoint `/health` : il n'existe pas encore de contrats métier à appeler. Les écrans indiquent le mode démonstration et ne présentent pas une commande ou un paiement local comme une transaction réelle.

## Vérification effectuée

Analyse syntaxique des fichiers JavaScript/JSX, résolution des versions npm dans `package-lock.json` et vérification des fichiers image. Aucun lancement ou compilation n'a été effectué, conformément au rôle réservé au propriétaire du projet.

**Environnement** : Expo SDK 57, React Native 0.86.3, React 19.2.3. Le Node.js actuellement actif est 23.4.0 ; React Native 0.86.3 annonce les versions de Node.js 20.19.4+, 22.13.0+, 24.3.0+ ou 25+, dans les plages indiquées par son moteur npm. Prévoir une version prise en charge avant le lancement.
