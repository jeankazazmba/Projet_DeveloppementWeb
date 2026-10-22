# Backlog initial — Mon Miam Miam

**Statut :** backlog de préparation **GitHub** construit à partir du cahier des charges *Mon Miam Miam V1.0.2 (16/09/2024)*. Le cahier demande un suivi officiel dans **Jira** ; à ce stade, **aucun projet Jira n'est encore lié** à ce dépôt. Les priorités ci-dessous sont **proposées** pour faciliter l'atelier de cadrage : ce ne sont pas des décisions déjà validées.

## 1. Préparation du projet — priorité initiale

| Issue | Livrable | Priorité suggérée | Pourquoi |
| --- | --- | --- | --- |
| [#1](../issues/1) | MVP, parcours métier et règles à valider | P0 | Éviter les spécifications contradictoires |
| [#2](../issues/2) | Choix de stack, base de données, architecture et démarrage local | P0 | Débloquer le développement |
| [#4](../issues/4) | Backlog et responsabilités dans Jira | P0 | Organiser les **6 membres prévus** |
| [#5](../issues/5) | Figma et prototype Vercel des quatre espaces | P0 | Valider les interfaces et les parcours |

## 2. Parcours commande et exploitation — cœur fonctionnel

| Issue | Périmètre | Priorité suggérée |
| --- | --- | --- |
| [#6](../issues/6) | Authentification et autorisations **étudiant, employé, gérant, admin** | P0 |
| [#7](../issues/7) | Catalogue, menu du jour, disponibilité, promotions | P0 |
| [#8](../issues/8) | Panier, commande sur place/livraison, suivi étudiant | P0 |
| [#18](../issues/18) | File de traitement, préparation, validation par employé | P0 |
| [#10](../issues/10) | Réclamations et réponses, arbitrage gérant | P1 |
| [#11](../issues/11) | Supervision gérant, admin et statistiques actualisées | P1 |

Les statuts exacts de commande, les modalités de livraison et les droits détaillés devront être **validés dans #1**. Une maquette n'est pas une livraison fonctionnelle.

## 3. Fidélisation, expérience et conformité

| Issue | Périmètre | Priorité suggérée |
| --- | --- | --- |
| [#9](../issues/9) | **Epic** de coordination fidélité et parrainage | P1 |
| [#19](../issues/19) | Portefeuille, conversion, crédit/débit de points | P1 |
| [#20](../issues/20) | Codes uniques et récompense après première commande réussie | P1 |
| [#12](../issues/12) | Événements, mini-jeux et classement top 10 | P2 |
| [#21](../issues/21) | Consentement cookies, données personnelles et mentions légales | P1, exigence de sortie avant production |
| [#22](../issues/22) | **Bonus** : évaluation et intégration d'un agrégateur de paiement | P3, facultatif |

**Important :** le paiement agrégateur est présenté comme une fonctionnalité à envisager, puis explicitement comme **bonus non obligatoire dans les livrables**. Ne pas ralentir le cycle de commande obligatoire pour attendre cette fonctionnalité. Les taux de fidélité (1000 F/point et 15 points/1000 F) sont des **exemples** et ne doivent pas devenir des constantes de production sans validation.

## 4. Qualité et livraison

| Issue | Périmètre | Priorité suggérée |
| --- | --- | --- |
| [#13](../issues/13) | Tests unitaires/API/E2E, CI applicative, recette navigateur/mobile, bêta Vercel et documentation | P0 (transverse) |

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

## 6. Répartition indicative — **6 membres à nommer**

**Ce sont des domaines, pas des attributions réelles** :

1. Pilotage/Scrum, backlog Jira, documentation et intégration.
2. UX/UI, Figma, intégration web de l'espace étudiant.
3. Backend, authentification, API et base de données.
4. Commandes, exploitation employé et supervision gérant/admin.
5. Fidélité, parrainage, réclamations et règles métier.
6. Tests, sécurité, CI/CD et déploiement, en soutien transversal.

Chaque tâche possède **un responsable explicite dans Jira**, avec relecture croisée de la Pull Request. Un membre peut travailler sur plusieurs sujets selon les compétences disponibles.

## 7. Workflow Jira / GitHub

- **Jira** = source de vérité du backlog, des affectations et des dates, une fois créé.
- **GitHub Issues** = préparation et détail des tâches techniques tant que Jira n'est pas relié ; ajouter les clés Jira dès leur création.
- Branche : `feature/MMM-123-student-cart` si un ticket Jira existe, sinon `feature/student-cart`.
- Pull Request : résumer le résultat, indiquer ticket, scénario de recette et captures selon le module.
- Relecture humaine, vérifications vertes, puis fusion ; suivre [CONTRIBUTING.md](../CONTRIBUTING.md).

Les GitHub Issues **#14 à #17** ont été fermées comme doublons du backlog existant (#5 à #8) afin de garder une liste de travail non redondante.

## 8. Jalons relatifs, non datés

Le document de 2024 indique **6 personnes**, **4 semaines** et « 30 septembre – 21 octobre » ; les échéances doivent être **replanifiées pour l'équipe actuelle**.

- **S1 :** validation MVP, Jira, choix technique, base des maquettes, architecture.
- **S2 :** auth, menu et structures de données, intégration de l'interface.
- **S3 :** commandes étudiant/employé, contrôle d'accès, réclamations, fidélité priorisée.
- **S4 :** tableaux de bord, tests, correction, démo Vercel, guide et bêta.

Les critères détaillés de recette se trouvent dans [PLAN_DE_TESTS.md](PLAN_DE_TESTS.md), les décisions non prises dans [DECISIONS.md](DECISIONS.md) et les risques dans [RISQUES.md](RISQUES.md).
