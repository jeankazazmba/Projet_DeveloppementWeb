# Backlog initial — Mon Miam Miam

**Statut :** backlog de préparation **GitHub** construit à partir du cahier des charges *Mon Miam Miam V1.0.2 (16/09/2024)*. Le cahier demande un suivi officiel dans **Jira** ; le projet **[Jira PMEE](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE)** a été créé et le ticket **PMEE-5** est connu ; **la synchronisation du dépôt GitHub avec Jira n'est pas encore confirmée**. Les priorités ci-dessous sont **proposées** pour faciliter l'atelier de cadrage : ce ne sont pas des décisions déjà validées.

## 0. Phase active : conception et organisation — jusqu'au point du 25/10/2026

La répartition actuelle **ne concerne que la phase de conception** : Jean d'Arc Kazamba (Git/versioning, ticket Jira PMEE-5), Roseline BOLONGOSHA (Jira), Christian (Figma), Caleb (conception base de données), Yviline/Aksa/Wivine (conception API). Des membres supplémentaires ont été intégrés ; les nouvelles responsabilités de développement ne sont **pas encore définies**.

**Référence nominative :** [REPARTITION_PHASE_CONCEPTION.md](REPARTITION_PHASE_CONCEPTION.md). **Conditions de passage à l'implémentation :** [PASSAGE_CONCEPTION_IMPLEMENTATION.md](PASSAGE_CONCEPTION_IMPLEMENTATION.md).

**À suivre prioritairement pendant cette phase :** structure Git/Jira et accès, liens Figma, schéma BDD, contrats API, arbitrage MVP/stack, rendez-vous de revue. Les Issues de fonctionnalités **#6 à #22** sont un backlog de réalisation future, **pas une attribution actuelle de développement**.

### Tickets GitHub liés aux responsabilités actuelles

Ces tickets servent à référencer les livrables dans le dépôt ; **Jira PMEE reste le suivi officiel**. Ils ne constituent ni un sprint de développement ni une nouvelle affectation de rôles.

| Issue GitHub | Mission de conception | Responsable déclaré | Phase |
| --- | --- | --- | --- |
| [#24](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/24) | Versioning Git et contrôle liaison PMEE-5 | Jean d'Arc Kazamba (@jeankazazmba) | Jusqu'à la revue du 25/10 |
| [#4](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/4) | Backlog et organisation Jira | Roseline BOLONGOSHA | Jusqu'à la revue du 25/10 |
| [#5](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/5) | Maquettes et parcours Figma | Christian | Jusqu'à la revue du 25/10 |
| [#25](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/25) | Modèle et schéma de données | Caleb | Jusqu'à la revue du 25/10 |
| [#26](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/26) | Contrats et organisation des API | Yviline, Aksa, Wivine | Jusqu'à la revue du 25/10 |

Les tickets **#1** (MVP commun) et **#2** (stack / amorçage ensuite) sont ouverts **sans attribution individuelle définitive**. Il faut éviter de les interpréter comme des tâches Git confiées à Jean d'Arc.

## 1. Préparation du projet — priorité initiale

| Issue | Livrable | Priorité suggérée | Pourquoi |
| --- | --- | --- | --- |
| [#1](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/1) | MVP, parcours métier et règles à valider | P0 | Éviter les spécifications contradictoires |
| [#2](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/2) | Choix de stack/architecture et amorçage **après revue** | P0 au passage de phase | Débloquer le développement sans démarrer avant arbitrage |
| [#4](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/4) | Backlog et responsabilités dans Jira | P0 | Organiser les membres effectivement présents |
| [#5](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/5) | Figma et prototype Vercel des quatre espaces | P0 | Valider les interfaces et les parcours |

## 2. Parcours commande et exploitation — cœur fonctionnel

| Issue | Périmètre | Priorité suggérée |
| --- | --- | --- |
| [#6](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/6) | Authentification et autorisations **étudiant, employé, gérant, admin** | P0 |
| [#7](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/7) | Catalogue, menu du jour, disponibilité, promotions | P0 |
| [#8](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/8) | Panier, commande sur place/livraison, suivi étudiant | P0 |
| [#18](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/18) | File de traitement, préparation, validation par employé | P0 |
| [#10](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/10) | Réclamations et réponses, arbitrage gérant | P1 |
| [#11](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/11) | Supervision gérant, admin et statistiques actualisées | P1 |

Les statuts exacts de commande, les modalités de livraison et les droits détaillés devront être **validés dans #1**. Une maquette n'est pas une livraison fonctionnelle.

## 3. Fidélisation, expérience et conformité

| Issue | Périmètre | Priorité suggérée |
| --- | --- | --- |
| [#9](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/9) | **Epic** de coordination fidélité et parrainage | P1 |
| [#19](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/19) | Portefeuille, conversion, crédit/débit de points | P1 |
| [#20](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/20) | Codes uniques et récompense après première commande réussie | P1 |
| [#12](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/12) | Événements, mini-jeux et classement top 10 | P2 |
| [#21](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/21) | Consentement cookies, données personnelles et mentions légales | P1, exigence de sortie avant production |
| [#22](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/22) | **Bonus** : évaluation et intégration d'un agrégateur de paiement | P3, facultatif |

**Important :** le paiement agrégateur est présenté comme une fonctionnalité à envisager, puis explicitement comme **bonus non obligatoire dans les livrables**. Ne pas ralentir le cycle de commande obligatoire pour attendre cette fonctionnalité. Les taux de fidélité (1000 F/point et 15 points/1000 F) sont des **exemples** et ne doivent pas devenir des constantes de production sans validation.

## 4. Qualité et livraison

| Issue | Périmètre | Priorité suggérée |
| --- | --- | --- |
| [#13](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/13) | Tests unitaires/API/E2E, CI applicative, recette navigateur/mobile, bêta Vercel et documentation | P0 (transverse) |

Le workflow GitHub Actions actuel valide la **gouvernance documentaire** et les **conventions de PR**. Il **ne lance pas de tests de l'application** : ceux-ci doivent être ajoutés dès que la stack est décidée dans #2.

## 5. Dépendances proposées

```text
#1 MVP + #4 Jira
       |
       +--> #5 Figma --------+
       |                     |
       +--> #2 stack et DB --+--> #6 Auth ----+
                             |                 |
                             +--> #7 Menu -----+--> #8 Panier / Commande --> #18 Traitement
                                               |                           |
                                               +---------------------------+--> #10 Réclamations
                                               +---------------------------+--> #11 Stats
                                               +---------------------------+--> #9 Epic Fidélité
                                                                            +--> #19 Points
                                                                            +--> #20 Parrainage
#21 Données/cookies : transversal à tous les parcours
#13 Tests / recette : transversal dès #2, puis avant chaque livraison
#12 Événements et jeux : priorité à revalider
#22 Paiement agrégateur : bonus facultatif
```

## 6. Répartition nominative effective — uniquement pour la conception

| Responsable(s) | Tâche actuelle | État des preuves accessibles |
| --- | --- | --- |
| **Jean d'Arc Kazamba** | Git/versioning et préparation du dépôt | Documentation et contrôles de gouvernance présents ; PMEE-5 et lien Jira à vérifier |
| **Roseline BOLONGOSHA** | Jira et organisation du backlog | Projet PMEE créé ; qualité des affectations et intégration GitHub à confirmer |
| **Christian** | Maquettes Figma | Lien du livrable/validation à collecter |
| **Caleb** | Conception BDD | Schéma de données validé à collecter |
| **Yviline, Aksa, Wivine** | Conception des API | Contrats API et partage interne des sous-modules à collecter |
| **Autres membres intégrés** | À préciser | Identités et missions à valider |

**Aucune de ces missions ne préjuge de la répartition de l'implémentation après la revue du dimanche 25 octobre 2026.** Pour les livrables, validations et dépendances, lire [REPARTITION_PHASE_CONCEPTION.md](REPARTITION_PHASE_CONCEPTION.md).

## 7. Workflow Jira / GitHub

- **Jira PMEE** = source de vérité du backlog, des affectations et des dates ; projet créé, accès et synchronisation à confirmer.
- **GitHub Issues** = préparation et détail des tâches techniques, sans recopier en double les statuts Jira ; ajouter les clés Jira dès leur création.
- Branche : `chore/PMEE-5-versioning` pour le ticket existant ; pour les autres travaux, utiliser leur **véritable clé Jira** dès qu'elle est connue, sinon un nom de branche descriptif sans clé inventée.
- Pull Request : résumer le résultat, indiquer ticket, scénario de recette et captures selon le module.
- Relecture humaine, vérifications vertes, puis fusion ; suivre [CONTRIBUTING.md](../CONTRIBUTING.md).

Les GitHub Issues **#14 à #17** ont été fermées comme doublons du backlog existant (#5 à #8) afin de garder une liste de travail non redondante.

## 8. Jalons relatifs, non datés

Le document de 2024 indique **6 personnes initialement**, **4 semaines** et « 30 septembre – 21 octobre » ; l'équipe s'est agrandie ; les échéances et responsabilités de développement doivent être **replanifiées après le point du 25/10/2026**.

- **S1 :** validation MVP, Jira, choix technique, base des maquettes, architecture.
- **S2 :** auth, menu et structures de données, intégration de l'interface.
- **S3 :** commandes étudiant/employé, contrôle d'accès, réclamations, fidélité priorisée.
- **S4 :** tableaux de bord, tests, correction, démo Vercel, guide et bêta.

Les critères détaillés de recette se trouvent dans [PLAN_DE_TESTS.md](PLAN_DE_TESTS.md), les décisions non prises dans [DECISIONS.md](DECISIONS.md) et les risques dans [RISQUES.md](RISQUES.md).
