# Étape 10 — raccordement des interfaces à Laravel

## Configuration manuelle

- Web : `VITE_API_URL=http://localhost:8000` dans `frontend/.env.local`.
- Expo : `EXPO_PUBLIC_API_URL=http://<IP-LAN-DU-PC>:8000` dans `mobile/.env`. Un téléphone physique ne peut pas joindre l’API du PC via `localhost`.
- L’API Laravel, MySQL et les clients doivent être démarrés par le développeur. Ce changement ne lance ni ne compile les applications.

Les jetons de session restent en mémoire dans les clients. Une nouvelle ouverture demande une nouvelle connexion. Les données serveur des commandes, du panier et du profil étudiant ne sont pas conservées dans le stockage local.

## Parcours raccordés

| Interface | Lecture API | Écriture API | Limite explicite |
| --- | --- | --- | --- |
| Étudiant Expo | Restaurants et catalogue publiés, profil, panier, commandes | Connexion, inscription, panier, adresse, devis, commande idempotente, intention espèces | Variantes et suppléments non sélectionnables ; autres prestataires de paiement restent indisponibles en mode connecté. |
| Employé web et Expo | Commandes, plats du service, réclamations | Transitions de commande, disponibilité et plat du jour, prise en charge et proposition de réponse | Un employé ne confirme pas une livraison non affectée à son compte. |
| Gérant web | Commandes, équipe, tables, menu, réclamations, statistiques, positions datées | Création/suspension d’employé, validation ou correction des réclamations, affectation de livraison | Les droits fins et le statut manuel des tables n’ont pas de route métier ; ces contrôles restent désactivés ou signalent l’absence d’API. |
| Admin restaurant web | Contenus, commandes, tables, équipe, réclamations, horaires, statistiques | Création et modification de contenus, disponibilité, créneaux, frais de livraison, tables, comptes, décisions sur réclamation | La fiche publique et les politiques n’ont pas de route locale de modification. Les pages connectées ne permettent pas de les enregistrer fictivement. |
| Admin plateforme web | Restaurants, comptes, invitations, audit, agrégats et réclamations escaladées | Actions autorisées déjà présentes | Aucune commande nominative ni détail interne ajouté ; synchronisation affichée et actualisation périodique. |

Quand `VITE_API_URL` ou `EXPO_PUBLIC_API_URL` est absent, les parcours existants de démonstration restent accessibles. Quand une session réelle est ouverte, les mutations attendent la réponse de Laravel avant d’afficher une réussite. Le bandeau de chaque espace indique le chargement, les erreurs réseau et la dernière synchronisation. Le serveur reste seul juge des montants, de la disponibilité, des statuts et des droits.

## Vérifications manuelles proposées

1. Se connecter avec un compte étudiant. Choisir un restaurant, ajouter un de ses plats, puis ouvrir le panier. Vérifier le panier sur `/api/me/cart`.
2. Placer une commande avec un créneau actif et le mode espèces. Vérifier que le numéro affiché correspond à `/api/me/orders`; un échec réseau ne doit jamais montrer une confirmation.
3. Se connecter comme employé affecté au même restaurant. Avancer la commande et proposer une réponse à une réclamation. Vérifier l’état après actualisation.
4. Se connecter comme gérant. Vérifier que l’équipe, les statistiques et les livreurs appartiennent uniquement au restaurant choisi. Valider ou demander une correction sur une proposition employé.
5. Se connecter comme admin restaurant. Créer un brouillon de plat, publier, modifier un horaire et confirmer une décision de réclamation avec sa version courante.
6. Se connecter comme admin plateforme. Vérifier les agrégats et l’audit, ainsi que l’absence de données nominatives internes. Essayer un compte d’un autre rôle : l’accès doit être refusé.

Les listes chargées sont limitées à la première page de l’API (100 lignes). La pagination complète des écrans de supervision reste à intégrer avant l’exploitation d’un volume supérieur.
