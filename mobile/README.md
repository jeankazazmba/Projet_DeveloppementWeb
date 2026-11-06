# Mon Miam Miam — application mobile étudiant et employé

Application React Native / Expo SDK 58. L'espace étudiant reprend les parcours des 18 exports `*--Etudiant` de `app1-tous-les-ecran222s/screens`, adaptés à un téléphone : accueil, menu, détail de plat, panier, commande, historique, fidélité, parrainage, réclamations, jeux, classement et profil. Un splash screen au logo de la maquette puis quatre écrans de présentation apparaissent à chaque lancement de l'espace étudiant, même si une session locale existe déjà. Après le quatrième écran, l’utilisateur rejoint la connexion ou l’accueil selon sa session. La présentation peut aussi être relancée depuis le profil ou la connexion.

L'espace employé reprend le thème sombre glassmorphism et les barres flottantes de l'étudiant, avec des actions propres au service : recherche et filtres de commandes, progression de la préparation, disponibilité et plat du jour sur tout le catalogue mobile, prise en charge des réclamations, proposition de réponse au gérant et statistiques hebdomadaires illustrées par des graphiques. Il est accessible en **mode démonstration** depuis la connexion ou le profil étudiant ; le profil employé permet de revenir à l'espace étudiant. Le dernier espace ouvert est mémorisé. Les deux espaces possèdent des stockages locaux distincts et ne se synchronisent pas entre eux ni avec le web.

Le contrôle d'accès et le partage des données nécessitent l'API commune. Le passage entre espaces actuel sert seulement à prévisualiser les interfaces ; il ne constitue pas une authentification d'employé. Voir le [document d'interactions et user stories](../docs/sprint-3/04-mobile/INTERACTIONS_APPS_ET_USER_STORIES.md).

Les interactions sont fonctionnelles en **mode démonstration local** et conservées sur l'appareil : compte de démonstration, panier, commandes simulées, points, parrainage et réclamations. L'implantation de démonstration est **Kinshasa, RDC** ; l'adresse exacte et les tarifs en **CDF** restent à confirmer. Le paiement à la caisse ou à la livraison est enregistré comme « À régler ». Orange Money, Airtel Money, M-Pesa, Visa, Mastercard, Bitcoin et Ethereum sont sélectionnables dans le checkout pour tester localement une réussite, un refus ou une attente, sans débit ni transmission de commande au restaurant. Une réussite crée une commande locale avec une référence `TEST-...` ; un refus ou une attente ne crée aucune commande. Aucune donnée de carte ou de portefeuille n'est recueillie. Les sandboxes externes, l'API Laravel et la confirmation sécurisée côté serveur restent à raccorder. Aucune authentification serveur ni aucun envoi de réclamation ne sont effectués. Les points gagnés sur une commande en attente de paiement ne sont pas crédités.

Voir le [guide de tests des paiements en RDC](../docs/sprint-3/08-fidelite-paiement/TESTS_PAIEMENT_RDC.md) pour les scénarios et les intégrations externes à préparer.

Le bouton flottant du panier peut être touché pour ouvrir le panier ou déplacé par glissement dans la zone visible de l'écran. Il affiche le nombre d'articles et reste au-dessus de la barre de navigation.

La barre haute flottante en verre donne accès à l'accueil par le logo, à la recherche des plats et aux notifications locales des commandes et signalements. La navigation principale flotte au-dessus du contenu avec le même effet glassmorphism. Sur Android compatible, les deux barres floutent la vue derrière elles ; ailleurs, leur fond translucide préserve la lecture.

Pour l'installation et le lancement par le propriétaire du projet : utiliser Node.js 22.13+ ou 24.3+, puis depuis `mobile/`, exécuter `npm ci` et `npx expo start`.

Les images de plats proviennent des SVG locaux de la maquette. `scripts/extract_assets.py` permet de les extraire de nouveau avec Pillow si les exports changent.

La rubrique « À découvrir » présente les promotions, événements et jeux du site public dans le thème mobile. Les sept visuels des offres proviennent de l'export local `20-promotions-evenements--Public`. Le contenu est informatif : les dates et disponibilités sont à confirmer, et le quiz attend une publication réelle. La roue reste une simulation locale.

Le formulaire de commande utilise le sélecteur d'heure natif du téléphone. Pour une commande en livraison, son détail présente une carte et le futur emplacement du livreur. Les repères actuels sont explicitement fictifs. Une position réelle pourra être fournie dans `order.deliveryTracking.courier` (`latitude`, `longitude`, `name`) avec `updatedAt` ; la mise à jour, l'affectation et la protection de ces données exigent encore l'API et l'application du livreur. Aucune permission GPS n'est demandée à l'étudiant pour afficher cette carte.

La prévisualisation de la carte native dans Expo Go utilise `react-native-maps`. Une version Android installable utilisant Google Maps nécessitera la configuration de sa clé dans le plugin natif ; cette étape appartient à la compilation réalisée par le propriétaire du projet.

Dans Expo Go, le splash natif peut différer de celui d'une application installée. La transition de marque intégrée à l'application reste visible pour prévisualiser ce parcours ; vérifier le splash natif dans une version installable lorsque la compilation sera réalisée.
