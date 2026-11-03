# Mon Miam Miam — application étudiante

Application React Native / Expo SDK 58. Elle reprend les parcours des 18 exports `*--Etudiant` de `app1-tous-les-ecran222s/screens`, adaptés à un téléphone : accueil, menu, détail de plat, panier, commande, historique, fidélité, parrainage, réclamations, jeux, classement et profil. Un splash screen au logo de la maquette et trois écrans de présentation précèdent la connexion lors de la première ouverture. La présentation peut être relancée depuis le profil.

Les interactions sont fonctionnelles en **mode démonstration local** et conservées sur l'appareil : compte de démonstration, panier, commandes simulées, points, parrainage et réclamations. Aucun paiement, aucune authentification serveur et aucun envoi de réclamation ne sont effectués. L'intégration de l'API Laravel, de l'agrégateur de paiement et des règles serveur de fidélité reste à réaliser.

Pour l'installation et le lancement par le propriétaire du projet : utiliser Node.js 22.13+ ou 24.3+, puis depuis `mobile/`, exécuter `npm ci` et `npx expo start`.

Les images de plats proviennent des SVG locaux de la maquette. `scripts/extract_assets.py` permet de les extraire de nouveau avec Pillow si les exports changent.

Dans Expo Go, le splash natif peut différer de celui d'une application installée. La transition de marque intégrée à l'application reste visible pour prévisualiser ce parcours ; vérifier le splash natif dans une version installable lorsque la compilation sera réalisée.
