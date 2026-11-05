# Répartition des responsabilités et des fonctionnalités par utilisateur

**Projet :** Mon Miam Miam — plateforme ZeDuc-Sp@ce.

**Source analysée :** `CAHIER DE CHARGE PROJET Mon Miam Miam.docx`, version V1.0.2 du 16 septembre 2024, sections « Description fonctionnelle », « Description technique des fonctionnalités », « Fidélité et parrainage », « Paiement », « Contraintes » et « Livrables ».

**Mise à jour :** 5 novembre 2026.

## 1. Périmètre et règle de séparation

Le cahier attribue la gestion interne à la **direction d'un restaurant**, à son **gérant** et à ses **employés**. L'étudiant utilise les services du restaurant. La capacité à accueillir plusieurs restaurants est une contrainte d'évolution, mais le cahier ne crée aucun rôle « administrateur de plateforme ». Ce rôle est une **extension demandée ensuite** pour gérer ZeDuc-Sp@ce et les établissements qui y participent.

Chaque plat, promotion, événement, jeu, commande, réclamation et mouvement de fidélité appartient à un restaurant. L'appartenance et les droits sont vérifiés par le serveur. Un administrateur de plateforme supervise le réseau avec des **indicateurs agrégés et des métadonnées minimales** ; il n'ouvre pas le menu interne, les commandes individuelles, les dossiers ordinaires ou les comptes clients d'un restaurant. Dans l'implémentation actuelle, un compte plateforme est refusé par les routes internes même si une ancienne affectation locale existe. Une personne exerçant aussi une fonction locale doit utiliser un compte local distinct.

## 2. Fonctions par type d'utilisateur

| Type | Responsabilités | Fonctions et données accessibles | Frontière |
| --- | --- | --- | --- |
| Visiteur du site | Découvrir la plateforme et choisir un restaurant. | Présentation, établissements publiés, horaires et localisation déclarés, menus et offres publiés, accès à l'inscription/connexion, consentement aux cookies. | Aucun accès aux commandes, comptes ou statistiques privés. Le cahier prévoit la page d'accueil ; le répertoire multi-restaurants vient des demandes ultérieures. |
| Étudiant | Commander et suivre sa propre expérience. | Inscription, connexion, récupération de mot de passe, restaurant choisi, menu et promotions, panier, service sur place ou livraison, heure d'arrivée, commande, commentaire après livraison, historique personnel, réclamation personnelle, points, code de parrainage, jeux, événements et classement des dix meilleurs clients avec filtres jour/semaine/mois. | Voit ses commandes, points et réclamations, jamais ceux d'un autre étudiant. Le paiement en ligne figure dans la description, puis dans les livrables comme **bonus non obligatoire** ; son encaissement réel exige un prestataire validé. |
| Employé | Exécuter le service de son restaurant. | Consulter/préparer/valider les commandes, signaler une indisponibilité temporaire ou le plat du jour, suivre et proposer une réponse aux réclamations, consulter les statistiques de vente hebdomadaires nécessaires au service. | Accès limité au restaurant affecté. Ne crée ni restaurant, ni administrateur, ni règle globale de fidélité. |
| Gérant | Superviser les opérations quotidiennes du restaurant. | Suivi des commandes, création et affectation de comptes employés dans son établissement, statistiques générales locales, consultation des réclamations et validation/rejet des réponses proposées par les employés. | Ne dispose pas des droits complets de la direction et ne voit aucun autre restaurant sans affectation. |
| Direction / administrateur de restaurant | Piloter son établissement. | Gestion des employés et de leurs accès locaux ; CRUD du menu ; promotions, événements et affiches de jeux ; commandes et ventes ; réclamations ; statistiques locales, fidélité et parrainage ; horaires et politiques du restaurant. Peut traiter une réclamation de points selon une règle validée. | Porte les décisions et les détails opérationnels de **son** restaurant uniquement. Le cahier appelle ce rôle « espace administrateur ». |
| Administrateur de plateforme | Exploiter ZeDuc-Sp@ce comme réseau multi-restaurants. | Créer/mettre en service/suspendre les fiches d'établissements ; créer et affecter les administrateurs de restaurant ; journaliser les actions sensibles ; voir le nombre d'établissements, les volumes et tendances agrégés par restaurant ; repérer les réclamations **escaladées** par leur identifiant, restaurant, statut et date ; suivre les totaux de fidélité/parrainage après validation des règles. | Ne lit pas les plats détaillés, commandes nominatives, motifs et échanges de réclamations ordinaires, mouvements individuels de points, données de paiement ou statistiques internes détaillées. Le rôle est une **extension**, pas une responsabilité définie dans le cahier V1.0.2. |

Le cahier mentionne la livraison, mais **ne définit pas un espace livreur**. Un éventuel compte livreur, ses positions et ses droits restent une décision produit distincte. L'agrégateur de paiement est un prestataire technique externe, pas un utilisateur de gestion du restaurant.

## 3. Matrice des décisions et des droits

| Action | Étudiant | Employé | Gérant | Admin restaurant | Admin plateforme |
| --- | --- | --- | --- | --- | --- |
| Choisir un restaurant et consulter son contenu public | Oui | Oui | Oui | Oui | Oui, comme visiteur |
| Créer et suivre sa propre commande/réclamation | Oui | — | — | — | — |
| Préparer/valider une commande locale | — | Oui | Supervise | Supervise | Totaux uniquement |
| Modifier temporairement la disponibilité du menu | — | Oui | Supervise | Oui | — |
| Créer/modifier plats, offres, événements et jeux | — | — | Selon délégation locale | Oui | — |
| Répondre à une réclamation locale | Dépose/suit | Propose une réponse | Valide ou rejette | Décide | Identifie une escalade, sans dossier interne |
| Gérer les comptes employés du restaurant | — | — | Oui | Oui | — |
| Créer et affecter un administrateur de restaurant | — | — | — | — | Oui |
| Voir les ventes et statistiques détaillées d'un restaurant | Ses données | Semaine utile au service | Oui, local | Oui, local | Indicateurs agrégés |
| Fixer les horaires et politiques du restaurant | — | — | Selon délégation locale | Oui | — |
| Définir les règles de points et parrainage du restaurant | — | — | Consulte | Oui après validation métier | Vue des totaux ; arbitre seulement une règle commune explicitement décidée |
| Créer, publier ou suspendre un restaurant | — | — | — | — | Oui |
| Voir le journal d'administration de plateforme | — | — | — | — | Oui |

« Selon délégation locale » signifie qu'un droit précis doit être décidé et contrôlé côté serveur avant d'être offert dans l'interface. Le cahier ne tranche pas ces cas. La gestion des accès par l'admin plateforme concerne l'identité, le rôle et l'affectation ; elle ne lui donne pas automatiquement accès aux données internes du restaurant.

## 4. Données autorisées dans la vue plateforme

| Domaine | Vue plateforme autorisée | Vue réservée au restaurant |
| --- | --- | --- |
| Établissement | Identifiant, nom, localisation publique, horaires publics, état de publication, date de création. | Paramètres opérationnels internes, planning de service, stocks et tables. |
| Comptes professionnels | Identité de connexion, statut et affectations des administrateurs de restaurant et de plateforme. | Comptes des employés et gérants, planning, performance et détails de travail. |
| Contenus | Nombre de contenus publiés par type et par restaurant. | Titres, descriptions, prix, images, disponibilité, brouillons et édition. |
| Commandes et ventes | Nombre, volume agrégé hors annulations, tendance et restaurant concernés. Le volume n'est pas un encaissement confirmé. | Identité du client, articles, table/adresse, commentaire, montant et paiement de chaque commande. |
| Réclamations | Nombre d'escalades et liste minimale : référence, restaurant, statut, date. | Nom de l'étudiant, motif, commande, échanges, pièces jointes et décision. |
| Fidélité et parrainage | Totaux agrégés par restaurant. | Solde et mouvements individuels, identité des filleuls, corrections de points. |
| Audit | Actions de gouvernance de la plateforme avec auteur, cible, date et motif. | Journal des opérations propres au restaurant, à concevoir séparément. |

**Contrôle serveur requis :** supprimer les champs et listes interdits des réponses `/api/platform/*`. Masquer une colonne dans React ne protège pas une API qui continue à la transmettre. Un compte admin plateforme ne peut ni être affecté comme admin local ni accéder au catalogue professionnel, y compris lorsqu'une ancienne affectation existe. La création et l'affectation des employés et gérants doivent passer par des routes locales réservées au gérant ou à l'admin du restaurant ; elles ne font pas partie des routes de plateforme.

## 5. Parcours et responsabilités de bout en bout

1. **Entrée d'un restaurant :** l'admin plateforme crée une fiche en brouillon, attribue un responsable local et publie l'établissement lorsque ses informations publiques sont prêtes. L'admin du restaurant saisit ensuite son menu, ses offres et ses paramètres.
2. **Commande :** l'étudiant sélectionne un restaurant et commande ; l'employé prépare et valide ; le gérant supervise ; l'admin restaurant contrôle les ventes ; l'admin plateforme ne voit que les agrégats.
3. **Réclamation :** l'étudiant dépose ; l'employé prépare une réponse ; le gérant valide ou rejette ; l'admin restaurant décide. Une escalade vers la plateforme ne transmet dans la vue réseau que le signal et les métadonnées minimales tant qu'un processus d'arbitrage détaillé n'est pas défini.
4. **Fidélité et parrainage :** le serveur attribue ou débite les points après les événements métier éligibles ; l'étudiant voit son solde ; le restaurant traite ses réclamations ; la plateforme observe les totaux. Les exemples de conversion du cahier sont illustratifs et demandent validation avant activation.
5. **Plusieurs affectations :** l'employé, le gérant ou l'admin restaurant choisit explicitement l'établissement autorisé. Chaque requête interne est filtrée par cet établissement ; le rôle plateforme ne contourne pas cette limite.

## 6. Contraintes communes du cahier

- Connexion sécurisée et contrôle des droits côté serveur ; protection des données personnelles et consentement aux cookies selon l'usage réel.
- Interface web compatible avec les navigateurs visés, architecture séparant données, logique et vues, tables dynamiques actualisées par API.
- Charte graphique `#cfbd97` et `#000000`, maquettes Figma, suivi Jira, code GitHub, démonstration Vercel et documentation des API.
- Tests des parcours critiques de commande et livraison ; base de données pour utilisateurs, commandes et statistiques. La déclinaison mobile et le paiement par agrégateur sont présentés avec des statuts différents selon les sections : le document de livrables qualifie explicitement le paiement de bonus.

## 7. Décisions encore à valider

1. Le seuil et le taux exacts de points, leur expiration et leur portée : par restaurant ou commune à la plateforme.
2. Le niveau de délégation du gérant sur menu, événements, politiques et comptes.
3. Le protocole d'escalade des réclamations : catégories, preuves, décideur, délai et accès exceptionnel au dossier complet.
4. Les règles d'une commande multi-restaurants, y compris livraison, fidélité et paiement.
5. Le statut du livreur et les données de géolocalisation autorisées.

Ces points ne créent aucun droit implicite pour l'admin plateforme. Les permissions et les données visibles doivent suivre les décisions validées, avec un journal des changements sensibles.
