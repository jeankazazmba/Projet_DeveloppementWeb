# Passage de la conception à l'implémentation — protocole de revue

> **Proposition de passage de phase**, à utiliser lors du point prévu dimanche **25 octobre 2026**. Aucun rôle d'implémentation n'est attribué par défaut. Les personnes et les échéances définitives seront confirmées par l'équipe dans Jira.

## 1. Deux phases à ne pas confondre

| Phase | Ce qui est réparti | Résultat attendu | Statut |
| --- | --- | --- | --- |
| **Conception / préparation** (phase actuelle jusqu'au point du 25/10/2026) | Git/versioning, Jira/coordination, Figma, conception base de données, conception API | Documents, modèles, contrats, règles d'équipe et décisions validables | En cours ; [répartition nominative actuelle](REPARTITION_PHASE_CONCEPTION.md) |
| **Implémentation** (à planifier après la revue) | Développement frontend/backend, intégration, tests, qualité, déploiement, documentation finale | Application testée et livrables du cahier | **Non encore attribuée** et **non démarrée dans ce dépôt** |

Le cahier des charges de 2024 décrit une équipe initiale de six personnes ; l'équipe actuelle s'est agrandie. Le nouveau nombre, les disponibilités et les responsabilités de développement doivent être consignés dans Jira après concertation, et non déduits du texte historique.

## 2. Contrôles avant de commencer à coder (revue de préparation)

| Point | Livrable/preuve | État au 24/10/2026 |
| --- | --- | --- |
| Composition actualisée de l'équipe et accès | Identités/identifiants GitHub, accès validés, interlocuteurs | À documenter/confirmer |
| Backlog Jira PMEE | Epics, stories, tâches, responsables, jalons, critères d'acceptation | Existence du projet confirmée ; contenu interne à auditer |
| Liaison Jira–GitHub | Exécution visible d'une activité Git reliée à `PMEE-5` | Non vérifiée |
| Parcours Figma | Liens et écrans validés (étudiant, employé, gérant, admin) | À partager/valider |
| Modèle de données | Diagramme et dictionnaire : clés, cardinalités, contraintes | À partager/valider |
| Contrats API | Routes, payloads, auth, erreurs, noms des entités et versions | À partager/valider |
| MVP & règles métier | Parcours commande, rôles, fidélité/parrainage, réclamations, livraison et bonus | Décisions ouvertes dans [DECISIONS.md](DECISIONS.md) |
| Architecture/stack | Choix frontend/backend/SGBD, structure du dépôt et environnement | Non décidé |
| Stratégie de tests | Tests unitaires, API, E2E, responsables et exécution CI envisagée | Plan écrit, pas de tests applicatifs |
| Jalons à jour | Dates retenues, dépendances et responsables | À valider ; ne pas réutiliser les dates du cahier 2024 |

**Critère de démarrage suggéré :** approuver les fondamentaux (MVP, stack, contrats API/BDD, écrans prioritaires, plan et responsabilités), puis autoriser l'initialisation du projet. Les travaux de conception non bloquants peuvent se poursuivre parallèlement si l'équipe les identifie.

## 3. Registre des futures attributions — à remplir après décision de l'équipe

| Domaine futur | Responsable d'implémentation | Relecteur/intégration | Dépendances / ticket Jira |
| --- | --- | --- | --- |
| Frontend étudiant et pages publiques | **À désigner** | À désigner | Figma, API auth/menu/commandes |
| Frontend employé/gérant/admin | **À désigner** | À désigner | Figma, API gestion et RBAC |
| Backend/API | **À désigner** | À désigner | Contrats API, rôles, données |
| Base de données/migrations | **À désigner** | À désigner | MCD/MLD validé et stack |
| Intégration, versioning et CI | **À désigner** | À désigner | Accès, conventions, tests |
| Tests/recette et qualité | **À désigner** | À désigner | MVP, jeux de données, environnement |
| Déploiement/démonstration | **À désigner** | À désigner | Stack, secrets, Vercel/backend |

**Attention :** « Caleb = BDD » ou « Christian = Figma » est vrai **dans la conception actuelle**, pas une affectation automatiquement valable pour développer ces modules ensuite.

## 4. Ordre d'implémentation proposé, à arbitrer

1. Initialiser la structure frontend/backend, les outils locaux et les tests de fumée **après validation de la stack**.
2. Authentification et autorisations des quatre rôles + schéma de données de base.
3. Menu, disponibilité et parcours étudiant de commande sur place/livraison.
4. Traitement côté employé et suivi des commandes.
5. Supervision gérant/admin, réclamations, fidélité et parrainage suivant la priorité métier.
6. Tests E2E, revue de sécurité, conformité, démo/bêta et documentation de livraison.

Le paiement agrégateur est un **bonus facultatif** selon les livrables du cahier. Les sprints et dates doivent être décidés avec l'équipe actuelle.

## 5. Compte rendu minimal de revue (à compléter le 25/10)

- **Date, participants et personne animatrice :** à renseigner.
- **Liens livrables :** Jira / Figma / schéma BDD / contrat API / GitHub : à renseigner.
- **Ce qui a été validé :** à renseigner.
- **Blocages ou travaux complémentaires :** à renseigner.
- **Choix de la stack et MVP :** à renseigner.
- **Nouvelle matrice de développement :** à renseigner et recopier dans Jira.
- **Date de lancement et premier jalon :** à renseigner.
- **Décision de passage (« oui », « oui avec réserves » ou « non ») :** à prendre collectivement.

Une fois la phase validée, mettre à jour le README, [PLAN_DE_LIVRAISON.md](PLAN_DE_LIVRAISON.md), [BACKLOG.md](BACKLOG.md), [DECISIONS.md](DECISIONS.md), les tickets Jira et les éventuelles affectations GitHub ; ne pas laisser l'ancien partage de conception comme partage implicite du développement.
