# Interfaces web publiques et étudiant — Sprint 3

Le code est intégré à l’application React existante dans `frontend/src/`. Les écrans propres aux rôles employé et gérant ne sont pas modifiés.

## Écrans ajoutés

- Site public : accueil, menu, fiche plat, promotions et événements.
- Authentification : connexion, inscription, récupération de mot de passe, profil de démonstration.
- Parcours commande : panier, choix sur place ou livraison, récapitulatif, confirmation locale, liste et détail des commandes.
- Compléments : réclamations, fidélité, parrainage et interface préparatoire de paiement.

## État fonctionnel

Le catalogue, le panier et la création de commandes de **démonstration locale** partagent un état React ; les données sont réinitialisées au rechargement. Une réclamation peut aussi être créée localement. Aucune commande ni réclamation n’est transmise au restaurant. Les montants affichés sont indicatifs.

La connexion est une simulation d’interface, **sans authentification ni protection d’accès réelle**. La récupération de mot de passe, le portefeuille de points, les récompenses de parrainage et le paiement restent désactivés jusqu’aux contrats et endpoints sécurisés du backend. L’écran admin `/admin` existant ne doit pas être déployé comme espace sécurisé en l’état.

## Dépendances et limites

- Au relevé, `backend/routes/api.php` n’expose que `GET /api/health`.
- Les contrats et règles définitives doivent confirmer statuts des commandes, zones/frais de livraison, calcul des points, récompenses, dates et remises des promotions, règles de jeux.
- Le paiement mobile est un bonus facultatif : aucun fournisseur, transaction ou secret n’est intégré.
- Les maquettes Figma ont été identifiées par leurs frames et les exports PNG du dépôt ont servi de référence visuelle. La limite d’appels du MCP Figma a empêché une lecture détaillée de tous les calques. La fidélité visuelle et l’accessibilité des écrans doivent être revues avec l’équipe design.
- Aucun lancement, compilation ou recette navigateur n’a été effectué, conformément à la demande du propriétaire du projet.
