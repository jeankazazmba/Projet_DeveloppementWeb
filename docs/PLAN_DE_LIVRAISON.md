# Plan d'organisation et de livraison — Mon Miam Miam

## Source et temporalité

Le cahier des charges (V1.0.2 du 16/09/2024) prévoit **6 membres**, un fonctionnement agile / Scrum, un **projet Jira** et une réalisation annoncée sur **4 semaines**, avec les dates imprimées **30 septembre–21 octobre**. **Ces dates de l'ancien cahier des charges ne sont pas un calendrier validé aujourd'hui.** Le tableau ci-dessous propose des semaines relatives **S1 à S4**, à dater par le responsable de projet.

## Outils et responsabilités

- **Jira** : backlog principal, user stories, bugs, priorités, affectations, critères d'acceptation, sprint et suivi.
- **GitHub** : code source, branches, revue des PR, Actions pour les tests et la qualité.
- **Figma** : écrans des quatre espaces et parcours.
- **Vercel** : aperçu interactif du frontend / maquette.
- **Cloud backend + base de données** : solution à choisir après définition de la stack.
- **Documentation** : réunions, risques, décisions, budgets et guides.

**Répartition de travail proposée (pas d'affectations nominatives)** : (1) coordination et QA, (2) UI/UX & frontend public/étudiant, (3) frontend opérationnel employé, (4) manager/admin et stats, (5) backend commandes/catalogue/authentification, (6) données/fidélité/parrainage/intégration. Les compétences, dépendances et disponibilités de l'équipe pourront imposer une autre distribution.

## Phases de réalisation (proposition)

| Semaine relative | Résultats attendus | Vérification |
| --- | --- | --- |
| **S1 — Cadrage/design** | Jira, périmètre MVP, personas et parcours, charte Figma, stack, schéma de données | Validation de l'architecture et des maquettes |
| **S2 — Fondations** | Auth/RBAC, menu, base de données, écrans étudiants, premières API | Scénario connexion → menu → panier |
| **S3 — Flux complets** | Commandes sur place/livraison, écrans employés, fidélité/parrainage, réclamations, stats | Tests d'intégration sur les parcours |
| **S4 — Stabilisation** | Admin/gérant, finition, navigation, E2E, correction bugs, rapports et documentation, démonstration Vercel/bêta | Recette, revue sécurité et présentation |

La faisabilité sur quatre semaines dépend du périmètre MVP et des personnes disponibles. **Paiement externe et extension mobile ne doivent pas être présentés comme obligatoires.**

## Structure recommandée du backlog Jira

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
