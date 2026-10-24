# Plan d'organisation et de livraison — Mon Miam Miam

## Source et temporalité

Le cahier des charges (V1.0.2 du 16/09/2024) prévoit initialement **6 membres**, un fonctionnement agile / Scrum, un **projet Jira** et une réalisation annoncée sur **4 semaines**, avec les dates imprimées **30 septembre–21 octobre**. **Ces dates de l'ancien cahier des charges ne sont pas un calendrier validé aujourd'hui.** Le tableau ci-dessous propose des semaines relatives **S1 à S4**, à dater par le responsable de projet.

## Outils et responsabilités

- **Jira** : backlog principal, user stories, bugs, priorités, affectations, critères d'acceptation, sprint et suivi.
- **GitHub** : code source, branches, revue des PR, Actions pour les tests et la qualité.
- **Figma** : écrans des quatre espaces et parcours.
- **Vercel** : aperçu interactif du frontend / maquette.
- **Cloud backend + base de données** : solution à choisir après définition de la stack.
- **Documentation** : réunions, risques, décisions, budgets et guides.

**Répartition réelle pour la phase de conception (jusqu'au point du dimanche 25/10/2026) :** Jean d'Arc Kazamba — versioning Git/GitHub ; Roseline BOLONGOSHA — Jira ; Christian — Figma ; Caleb — conception BDD ; Yviline, Aksa et Wivine — conception API. Des membres supplémentaires ont rejoint l'équipe ; leurs missions seront précisées après confirmation. Voir [la matrice et les livrables actuels](REPARTITION_PHASE_CONCEPTION.md).

**À la revue de dimanche, ces responsabilités devront être réévaluées pour l'implémentation :** aucune attribution de module de développement n'est présumée. Voir [le protocole de transition](PASSAGE_CONCEPTION_IMPLEMENTATION.md).

## Phases de réalisation (proposition)

La phase **actuelle** est la **conception/préparation jusqu'au point du 25/10/2026**. Le tableau S1–S4 est une projection **relative, non datée et non validée pour la période suivante**. Les affectations de développement seront décidées à l'issue de la revue, et le démarrage ne doit pas être annoncé avant validation.

| Semaine relative | Résultats attendus | Vérification |
| --- | --- | --- |
| **S1 — Cadrage/design** | Jira, périmètre MVP, personas et parcours, charte Figma, stack, schéma de données | Validation de l'architecture et des maquettes |
| **S2 — Fondations** | Auth/RBAC, menu, base de données, écrans étudiants, premières API | Scénario connexion → menu → panier |
| **S3 — Flux complets** | Commandes sur place/livraison, écrans employés, fidélité/parrainage, réclamations, stats | Tests d'intégration sur les parcours |
| **S4 — Stabilisation** | Admin/gérant, finition, navigation, E2E, correction bugs, rapports et documentation, démonstration Vercel/bêta | Recette, revue sécurité et présentation |

La faisabilité sur quatre semaines dépend du périmètre MVP et des personnes disponibles. **Paiement externe et extension mobile ne doivent pas être présentés comme obligatoires.**

## Structure recommandée du backlog Jira

Le projet Jira réel **[PMEE](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE)** existe ; l'attribution de **PMEE-5** au versioning Git a été notifiée. Les Epics réels, autres tickets et la synchronisation GitHub restent à vérifier.

Épopées **proposées** :
- **EPIC-01** — Cadrage, architecture, données et droits d'accès.
- **EPIC-02** — Expérience étudiant : authentification, menu, panier, commande.
- **EPIC-03** — Opérations restaurant : employé, gérant, administrateur.
- **EPIC-04** — Fidélité, parrainage, réclamations, promotions.
- **EPIC-05** — Qualité, conformité, CI, Figma, démo et déploiement.
- **EPIC-BONUS** — Paiement agrégateur et extension mobile (non requis dans le MVP).

Les identifiants réels des tickets Jira dépendent du projet Jira créé : ne pas inventer de clés comme si elles étaient attribuées.

## Rituels de l'équipe

- Point quotidien court sur progression, blocages, dépendances.
- Revue de code via Pull Requests, validation d'au moins un pair.
- Démonstration des parcours à chaque jalon.
- Compte-rendu court et décisions consignées.
- Vérification du temps restant et révision du périmètre si nécessaire.

## Livrables de fin de projet

- [ ] Code frontend/backend et instructions d'installation.
- [ ] Prototypes Figma des écrans requis.
- [ ] Maquette Vercel démontrable.
- [ ] Documentation des API et schémas de données.
- [ ] Tests unitaires/fonctionnels/E2E et rapport de tests.
- [ ] Procédure de déploiement backend et configuration CI/CD.
- [ ] Manuels étudiant, employé, gérant, administrateur.
- [ ] Jira à jour et comptes-rendus de sprint.
- [ ] Budget, risques, mentions légales et politique de données.
- [ ] Recette et retour bêta.

**Point de vigilance :** « CI/CD » figure dans les livrables ; le dépôt dispose aujourd'hui uniquement d'un contrôle de conventions. **Il ne possède pas encore de pipeline applicatif de tests ni de déploiement.**
