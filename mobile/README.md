# Mon Miam Miam — application étudiante

Application React Native / Expo SDK 58. Elle reprend les parcours des 18 exports `*--Etudiant` de `app1-tous-les-ecran222s/screens`, adaptés à un téléphone : accueil, menu, détail de plat, panier, commande, historique, fidélité, parrainage, réclamations, jeux, classement et profil. Un splash screen au logo de la maquette puis quatre écrans de présentation apparaissent à chaque lancement, même si une session locale existe déjà. Après le quatrième écran, l’utilisateur rejoint la connexion ou l’accueil selon sa session. La présentation peut aussi être relancée depuis le profil ou la connexion.

Les interactions sont fonctionnelles en **mode démonstration local** et conservées sur l'appareil : compte de démonstration, panier, commandes simulées, points, parrainage et réclamations. Le paiement à la caisse ou à la livraison est proposé et enregistré comme « À régler », sans débit ni transmission de commande au restaurant. MTN Mobile Money, Orange Money, Visa, Mastercard, Bitcoin et Ethereum sont visibles avec leurs logos, mais désactivés en attendant les prestataires, l'API Laravel et la confirmation sécurisée côté serveur. Aucune authentification serveur ni aucun envoi de réclamation ne sont effectués. Les points gagnés sur une commande en attente de paiement ne sont pas crédités.

Le bouton flottant du panier peut être touché pour ouvrir le panier ou déplacé par glissement dans la zone visible de l'écran. Il affiche le nombre d'articles et reste au-dessus de la barre de navigation.

La barre haute flottante en verre donne accès à l'accueil par le logo, à la recherche des plats et aux notifications locales des commandes et signalements. La navigation principale flotte au-dessus du contenu avec le même effet glassmorphism. Sur Android compatible, les deux barres floutent la vue derrière elles ; ailleurs, leur fond translucide préserve la lecture.

Pour l'installation et le lancement par le propriétaire du projet : utiliser Node.js 22.13+ ou 24.3+, puis depuis `mobile/`, exécuter `npm ci` et `npx expo start`.

Les images de plats proviennent des SVG locaux de la maquette. `scripts/extract_assets.py` permet de les extraire de nouveau avec Pillow si les exports changent.

Dans Expo Go, le splash natif peut différer de celui d'une application installée. La transition de marque intégrée à l'application reste visible pour prévisualiser ce parcours ; vérifier le splash natif dans une version installable lorsque la compilation sera réalisée.
