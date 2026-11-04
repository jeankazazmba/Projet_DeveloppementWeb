# Spécification fonctionnelle de l'administration Mon Miam Miam

**Objet :** décrire l'espace de direction d'un restaurant, son état actuel et les règles nécessaires pour le relier aux autres applications. **Date du relevé :** 4 novembre 2026. **Source :** cahier des charges V1.0.2 du 16 septembre 2024, sections « Espace Administrateur » et « Fidélité et Parrainage », complété par les demandes ultérieures de gestion multi-restaurants. Le document source reste inchangé.

Les mentions **Cahier**, **Demande ultérieure** et **Proposition** indiquent l'origine des besoins. **Interface présente** désigne un écran manipulant des données locales ; cela ne signifie ni persistance en base ni synchronisation entre applications.

## 1. Périmètre et responsabilités

Le cahier confie à l'administrateur, membre de la direction du restaurant, la gestion des employés et du menu, les statistiques, les promotions, événements et jeux, les réclamations et les paramètres. Il lui confie aussi l'observation du programme de fidélité et de parrainage, le réglage des points et la validation de réclamations de points. Le paiement en ligne est un **bonus facultatif** du cahier.

La demande multi-restaurants introduit deux rôles distincts :

| Rôle | Périmètre | Responsabilité principale |
| --- | --- | --- |
| Administrateur de restaurant | Un ou plusieurs restaurants auxquels son compte est affecté | Paramétrer et superviser **son** établissement ; les données affichées et modifiées portent toujours l'identifiant du restaurant actif. |
| Gérant | Restaurants auxquels il est affecté | Piloter le service quotidien, créer des employés selon les droits accordés, arbitrer les réponses aux réclamations. |
| Employé | Restaurant de travail autorisé | Préparer et valider les commandes, signaler les indisponibilités et proposer des réponses. |
| Administrateur de plateforme | Ensemble des restaurants | Créer les établissements, gérer leurs affectations et leur publication, superviser la plateforme. Il ne remplace pas la gestion quotidienne du restaurant. |

**Règle transversale proposée :** si un compte a accès à plusieurs restaurants, il choisit l'établissement après connexion et peut changer de contexte depuis l'en-tête. S'il n'a qu'un établissement, celui-ci est sélectionné automatiquement. Une action sur un restaurant non attribué est refusée par le serveur, même si l'URL est modifiée. Les écrans de `/admin` restent limités à l'établissement actif ; les statistiques globales appartiennent à `/plateforme`.

## 2. Carte des écrans

| Écran cible | Origine | État du code au 4 novembre 2026 | Travail principal restant |
| --- | --- | --- | --- |
| Connexion et choix du restaurant | Cahier + demande ultérieure | `/admin` est accessible comme démo ; `/catalogue-pro` dispose d'une connexion API et d'un choix de restaurant. | Unifier la session, vérifier les rôles et appliquer le contexte à tout `/admin`. |
| Tableau de bord | Cahier ADM-03 | Chiffres et diagrammes calculés sur commandes locales de démonstration. | Indicateurs serveur, période, restaurant et actualisation. |
| Employés | Cahier ADM-01 | Liste, filtres, ajout, modification, suspension et suppression en mémoire. | Comptes réels, affectations, invitation/réinitialisation, historique. |
| Menu | Cahier ADM-02 | CRUD local de plats avec catégorie, prix, photo, disponibilité et plat du jour. | Relier au catalogue API, stockage des images et publication commune. |
| Promotions, événements et jeux | Cahier ADM-04 | Affiches et statuts locaux ; `/catalogue-pro` peut publier des contenus API par restaurant. | Un seul flux de publication, dates et règles validées côté serveur. |
| Réclamations | Cahier ADM-05 | Dossiers locaux, export CSV et décision locale de points. | Dossier partagé étudiant → employé → gérant → admin, réponse et audit. |
| Paramètres | Cahier ADM-06 | Fiche, horaires, fidélité, moyens de paiement et textes saisis en session. | Paramètres persistants par restaurant, appliqués aux autres interfaces. |
| Commandes | Proposition de structure | Liste, détail, filtres, export et transitions de démo. | Lecture des commandes communes et actions exceptionnelles clairement autorisées. |
| Rapports | Proposition de structure | Graphiques et exports fondés sur les commandes de démo. | Agrégats fiables et définitions stables des mesures. |
| Tables et salle | Proposition de structure | États et associations à des commandes locales. | À garder seulement si le restaurant exploite réellement des tables/réservations. |
| Données et intégration | Outil technique existant | Inventaire des ressources et test `/api/health`. | Afficher l'état réel des intégrations ; le texte qui dit que seule la route de santé existe est devenu obsolète. |
| Administration de plateforme | Demande ultérieure | `/plateforme` crée des fiches locales ; `/catalogue-pro` et l'API permettent déjà certaines créations/affectations. | Authentification unifiée, supervision et séparation stricte d'avec `/admin`. |

## 3. Fonctions détaillées et critères d'acceptation

### 3.1 Accès et contexte restaurant

**Cahier :** connexion sécurisée des utilisateurs. **Demande ultérieure :** plusieurs restaurants et séparation entre admin restaurant et admin plateforme.

- Après connexion, afficher le rôle, le nom du restaurant actif et les établissements autorisés. Le changement de restaurant recharge commandes, menu, campagnes, réclamations, paramètres et statistiques du nouveau périmètre.
- Empêcher toute action si le compte est suspendu, sans affectation ou sans permission pour le module. La déconnexion révoque la session serveur.
- **Acceptation :** un admin du restaurant A ne peut ni consulter ni modifier une ressource de B par l'interface ou par requête directe. Un compte affecté à A et B retrouve le bon contexte après sélection, sans mélange des données.
- **État :** la première API d'authentification et d'affectation existe pour `/catalogue-pro`, mais `/admin` emploie encore ses propres états de démonstration et un restaurant affiché en dur.

### 3.2 Tableau de bord et statistiques

**Cahier ADM-03 :** commandes, ventes, fidélité et parrainage en temps réel.

- Choisir une période et voir nombre de commandes, commandes en cours/terminées/annulées, ventes confirmées, panier moyen, ventes par mode de service et moyen de règlement, points gagnés/utilisés et parrainages validés.
- Chaque carte mène à sa liste filtrée. Afficher l'heure de dernière mise à jour. Un chiffre issu d'une démo doit porter la mention « Démo ».
- **Définitions proposées :** montant des commandes terminées = somme des commandes terminées, hors annulations et remboursements ; panier moyen = ce montant / nombre de commandes terminées ; encaissements = paiements confirmés par le prestataire ou espèces confirmées à la caisse ; points attribués = mouvements de crédit confirmés ; parrainages validés = filleuls dont la première commande éligible est terminée. Ces définitions doivent être approuvées avant codage serveur.
- **Acceptation :** tous les nombres portent sur le restaurant actif et la même période ; la somme des catégories correspond au total affiché. Une nouvelle commande ou un changement de statut apparaît après actualisation automatique, sans rechargement manuel.

### 3.3 Employés et accès

**Cahier ADM-01 :** ajouter, modifier et supprimer des comptes employés. Le gérant peut aussi créer des employés, avec des droits plus limités.

- Rechercher et filtrer par rôle, statut et restaurant ; créer un employé, le modifier, le suspendre/réactiver et retirer son accès. Afficher ses affectations et sa dernière activité sans révéler de mot de passe.
- Prévoir une invitation ou un lien de définition du mot de passe, une réinitialisation sécurisée et une confirmation pour les actions sensibles. Si le compte travaille pour plusieurs restaurants, gérer chaque affectation séparément.
- **Proposition de règle :** désactiver l'accès plutôt que supprimer physiquement un utilisateur lié à des commandes ou décisions passées ; conserver l'historique d'audit. Le droit de créer un autre administrateur reste réservé à un admin autorisé ou à l'admin plateforme.
- **Acceptation :** l'employé créé peut se connecter uniquement aux restaurants attribués ; une suspension bloque la prochaine action serveur ; la suppression d'une affectation ne supprime pas les historiques métier.
- **État :** le formulaire `/admin` ne modifie que la session React ; le bouton de réinitialisation est désactivé. L'API `/platform/users` sait créer un compte avec affectation, mais n'est pas reliée à cet écran.

### 3.4 Menu et disponibilité

**Cahier ADM-02 :** CRUD des plats et boissons. Les employés ne doivent pouvoir faire que des changements temporaires de disponibilité et de plat du jour.

- Créer/modifier/retirer un article : nom, catégorie, description, prix en CDF, image, ingrédients/allergènes, disponibilité, mise en avant et publication. Afficher un aperçu de la carte étudiante.
- Les changements structurels (prix, texte, photo, publication) appartiennent à l'admin ; les changements temporaires des employés doivent être tracés et visibles par l'admin. Un plat retiré ne doit plus être commandable, mais doit rester lisible dans l'historique des commandes.
- **Proposition :** ajouter une quantité de stock et des seuils seulement si le restaurant prévoit de maintenir un inventaire réel ; l'intitulé actuel « Menu & Stocks » ne suffit pas à définir cette fonction.
- **Acceptation :** un plat publié apparaît uniquement dans le menu de son restaurant sur le site et le mobile ; son prix et sa disponibilité sont revérifiés par le serveur lors de la commande ; une image invalide est refusée.
- **État :** `/admin` gère les plats localement. `/catalogue-pro` possède un CRUD API des contenus par restaurant ; les deux écrans ne partagent pas encore la même source.

### 3.5 Promotions, événements et mini-jeux

**Cahier ADM-04 :** créer des offres, événements et jeux sous forme d'affiches. **Demande ultérieure :** chaque contenu appartient à un restaurant.

- Gérer brouillon, programmation, publication, expiration et retrait. Renseigner titre, descriptif, visuel, dates, restaurant, conditions de participation et éventuelle récompense. Prévisualiser le rendu public/mobile.
- Pour une promotion, définir l'avantage et ses conditions. Pour un événement, préciser lieu, capacité et inscription si ces fonctions sont retenues. Pour un jeu, définir règles, limites de participation et remise des gains avant de le publier.
- **Acceptation :** un contenu publié pour A n'apparaît jamais sur la page de B ; un contenu expiré cesse d'être proposé ; une récompense ne peut être attribuée qu'une fois selon la règle validée.
- **État :** `/admin` manipule des affiches locales, tandis que `/catalogue-pro` peut enregistrer des contenus `promotion`, `event` et `game` par API. Les règles de jeu et récompenses serveur ne sont pas en place.

### 3.6 Réclamations et corrections de points

**Cahier ADM-05 et section fidélité :** superviser les réclamations, y compris celles portant sur les points. Le gérant valide ou rejette les réponses proposées par les employés.

- Afficher restaurant, commande liée, étudiant, motif, pièces jointes, responsable, statut, dates et chronologie. Filtrer les dossiers ouverts et ceux en retard.
- **Workflow proposé :** étudiant dépose → employé prend en charge et propose une réponse → gérant valide/rejette → étudiant reçoit la décision. L'admin voit l'ensemble des dossiers de son restaurant et arbitre les cas sensibles ou les corrections de points.
- Pour une correction de fidélité, afficher les mouvements existants et exiger motif, montant et confirmation ; créer un mouvement de points atomique au lieu de modifier directement un solde.
- **Acceptation :** chaque transition est horodatée avec son auteur ; un même dossier ne crédite jamais deux fois les points ; la décision et la réponse sont visibles par l'étudiant.
- **État :** les décisions de `/admin` changent uniquement les dossiers locaux. Les écrans étudiant, employé et gérant utilisent encore des données indépendantes.

### 3.7 Paramètres du restaurant

**Cahier ADM-06 :** horaires, politiques et règles de fidélité. Le cahier propose des valeurs de points comme exemples, sans les fixer définitivement.

- **Fiche et service :** identité, adresse, contacts, horaires, créneaux, modalités de retrait/livraison, zone et frais si retenus. Afficher une prévisualisation des informations publiques.
- **Fidélité et parrainage :** taux de gain, conversion, seuil, plafond, expiration éventuelle et récompense après première commande éligible du filleul. Versionner les règles et dater leur prise d'effet ; une modification ne doit pas recalculer arbitrairement l'historique.
- **Politiques :** préparer CGV, annulation et confidentialité ; exiger validation du contenu avant publication.
- **Paiement :** les interrupteurs actuels sont uniquement des réglages visuels. L'encaissement en ligne est facultatif ; aucun moyen ne doit être présenté comme réellement actif sans prestataire, vérification serveur et recette.
- **Acceptation :** enregistrer une règle pour A ne modifie pas B ; les horaires publics suivent le réglage publié ; une commande utilise la version de règle applicable à sa date.

### 3.8 Commandes, rapports et tables

Ces écrans organisent le back-office actuel, mais ne constituent pas trois blocs admin autonomes explicitement demandés par le cahier. Ils servent les exigences de supervision et de statistiques.

- **Commandes :** lecture du détail et des états ; annulation ou correction réservée à des droits explicites, avec motif et audit. Les transitions ordinaires restent du ressort des employés et du gérant.
- **Rapports :** périodes et indicateurs identiques à ceux du tableau de bord, exports de données autorisés et clairement datés. Aucune valeur fictive ne doit être étiquetée « encaissée » en production.
- **Tables :** conserver la gestion des places et réservations uniquement après validation du besoin métier. Dans le cas contraire, masquer cet écran au lieu de créer une dépendance inutile.
- **Acceptation :** les exports ne contiennent que les enregistrements du restaurant actif et respectent les filtres visibles. Les changements de commande ou de table autorisés sont reflétés dans les autres espaces.

## 4. Données et échanges à prévoir

La première migration Laravel contient déjà `users`, `restaurants`, `restaurant_user` et `restaurant_contents`. Les routes existantes couvrent la connexion, les affectations, le catalogue public, le CRUD des contenus professionnels et certaines opérations de plateforme. Elles ne couvrent pas encore commandes, réclamations, fidélité, parrainage, statistiques et paramètres complets.

| Ressource métier à compléter | Champs ou liens indispensables | Source de l'écran admin |
| --- | --- | --- |
| Commande et lignes | `restaurant_id`, étudiant, articles et prix figés, total, mode de service, statut, dates | Tableau de bord, commandes, ventes |
| Historique des statuts | commande, ancien/nouveau statut, acteur, date, motif | Suivi et audit |
| Réclamation | `restaurant_id`, commande, étudiant, motif, statut, responsable, réponse, décision | Réclamations |
| Règles de fidélité et mouvements | `restaurant_id`, version de règle, origine, points crédités/débités, date | Paramètres, statistiques, corrections |
| Parrainage | parrain, filleul, restaurant, code, première commande éligible, récompense unique | Statistiques et réclamations de points |
| Paramètres du restaurant | coordonnées, horaires, livraison, politiques, dates d'application | Paramètres et site public |
| Audit | restaurant, acteur, action, ressource, date, ancien/nouvel état pertinent | Actions sensibles |
| Paiement, si bonus retenu | commande, référence, montant, devise, statut vérifié, prestataire | Suivi des encaissements |

**Contrat d'API proposé :** prolonger les routes professionnelles sous `/api/staff/restaurants/{restaurant}/…` pour les ressources métier, avec politiques d'accès serveur par rôle et affectation. L'admin plateforme utilise des routes `/api/platform/…` distinctes. Les réponses de liste fournissent filtres, pagination et dates ; les mutations renvoient l'état enregistré. Le frontend ne décide jamais seul du prix, du solde de points, du statut payé ou de la propriété d'un restaurant.

Pour l'actualisation du service, commencer par une invalidation des données après chaque mutation et une mise à jour périodique contrôlée des listes actives. Une diffusion par événements peut suivre si le besoin de temps réel le justifie. Toujours afficher chargement, liste vide, erreur réseau, accès refusé et confirmation d'enregistrement ; ne jamais remplacer silencieusement une erreur API par des chiffres de démonstration.

## 5. Structure proposée du code

Conserver `/admin` et `/plateforme` comme espaces distincts. Dans `frontend/src/features/admin/`, regrouper chaque module par sa page, ses composants et son accès aux données ; partager les composants visuels et la gestion de session avec les autres back-offices sans partager leurs jeux de données locaux. Ajouter une couche d'appels API et des types de ressources par restaurant. Le `restaurantId` actif doit venir de la session autorisée et être passé à chaque requête métier.

Dans Laravel, séparer contrôleurs, validations, politiques d'autorisation et services métier. Centraliser les transitions de commande, les mouvements de points et la récompense de parrainage dans des opérations transactionnelles. Conserver les historiques et les tests d'isolation entre restaurants. Cette structure est une **proposition technique**, non une obligation de nommage du cahier.

## 6. Ordre de réalisation et recette

| Étape | Objectif vérifiable | Dépendance |
| --- | --- | --- |
| 1 | Unifier connexion, rôle, restaurant actif et refus inter-restaurants dans `/admin`. | Session API et affectations existantes. |
| 2 | Relier employés, menu et contenus publiés à la source commune ; supprimer les doublons de données entre `/admin` et `/catalogue-pro`. | Droits et contrats API. |
| 3 | Créer commandes et statuts partagés ; rendre le tableau de bord et les rapports calculables. | Parcours de commande étudiant et flux employé. |
| 4 | Partager réclamations, réponses et décisions entre les quatre rôles. | Commandes et notifications. |
| 5 | Appliquer paramètres, fidélité et parrainage côté serveur. | Commandes confirmées, règles validées. |
| 6 | Finaliser événements/jeux, tests de recette, documentation et contrôle des données personnelles. | Publication et règles de gains. |
| 7, facultative | Intégrer une sandbox puis un paiement réel si la décision métier est prise. | Prestataire, compte marchand, backend et recette sécurisée. |

**Scénarios de recette essentiels :**

1. Un admin de A crée un plat ; il apparaît dans le menu public/mobile de A et jamais dans celui de B. Un employé de A peut le marquer indisponible, sans en modifier le prix.
2. Une commande étudiante de A arrive chez l'employé, puis dans les vues gérant/admin de A ; ses transitions et ses chiffres restent cohérents après rechargement.
3. Une réclamation suit étudiant → employé → gérant → admin si arbitrage nécessaire ; chaque rôle voit l'état autorisé et l'étudiant reçoit la décision.
4. Une première commande éligible du filleul crédite le parrain une seule fois ; annulation ou doublon ne crée aucun deuxième crédit.
5. Un admin de A tente d'ouvrir une ressource de B par URL ou API ; le serveur refuse et aucune donnée de B n'est retournée.

## 7. Décisions métier encore ouvertes

- Le cahier historique situe ZeDuc@Space à Yansoki au Cameroun ; les interfaces récentes le situent à Kinshasa en RDC et affichent des CDF. Confirmer officiellement la localisation, la devise, les coordonnées et les textes juridiques avant production.
- Approuver les règles exactes de gain, conversion, expiration et correction des points. Les nombres du cahier sont des **exemples**, pas des paramètres décidés.
- Définir les permissions précises de l'admin et du gérant, les actions de commande exceptionnelles et les motifs de correction.
- Décider si tables, réservations, stock chiffré et paiement en ligne appartiennent au produit à livrer ; le paiement en ligne est explicitement facultatif selon le cahier.
- Fixer les statuts et les délais des commandes et réclamations, ainsi que les conditions et récompenses des jeux.

## 8. Références de vérification

- `docs/CAHIER_DES_CHARGES.md` : synthèse fidèle du document source.
- `frontend/src/features/admin/App.tsx` et `frontend/src/features/admin/pages/` : écrans admin actuels, majoritairement en mémoire React.
- `frontend/src/features/shared/StaffCatalog.jsx` : catalogue professionnel connecté à l'API lorsque `VITE_API_URL` est configurée.
- `frontend/src/features/platform/PlatformAdminApp.jsx` : vue plateforme locale.
- `backend/routes/api.php` et `backend/database/migrations/2026_11_04_000001_create_tenant_catalog.php` : capacités serveur déjà codées.
