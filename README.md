# Mon Miam Miam 🍽️

**Plateforme multi-restaurants ZeDuc-Sp@ce — démonstration située à Kinshasa, RDC, avec montants en CDF.**

Le dépôt contient le site React, les espaces web, l'application Expo et une API Laravel en cours de raccordement. Pour l'administration plateforme et les commandes de démarrage Docker Compose, voir [le guide plateforme](docs/sprint-3/03-administration/PLATEFORME_ET_DEMARRAGE.md). Le cahier V1.0.2 décrit l'origine du projet ; la localisation Kinshasa et le rôle administrateur de plateforme sont des décisions ultérieures.

## 🎯 Pourquoi Mon Miam Miam ?

Le restaurant ZeDuc@Space reçoit des commandes par messages et appels. Avec l'augmentation de la demande, l'équipe souhaite faciliter les commandes, le service et la livraison, tout en fidélisant les étudiants. **Mon Miam Miam** centralisera ces interactions dans une application web utilisable sur ordinateur et mobile.

### Objectifs métier

- Simplifier la consultation du menu, les commandes et leur suivi.
- Optimiser la coordination de la préparation, du service sur place et de la livraison.
- Assurer la traçabilité des commandes et des ventes.
- Afficher des tableaux de bord et des statistiques actualisées.
- Stimuler la fidélité et le parrainage ; proposer promotions, événements et mini-jeux.

**Référence métier :** *Cahier de charge projet : Mon Miam Miam*, propriétaire « ZeDuc@Space - x - DNx », version **V1.0.2**, datée du **16/09/2024**. Cette date est celle du document source, **pas** une date de livraison actuelle.

## 👥 Organisation actuelle de la conception (jusqu'au 25/10/2026)

- **Jean d'Arc Kazamba** : versioning Git/GitHub et organisation du dépôt.
- **Roseline BOLONGOSHA** : gestion Jira.
- **Christian** : maquettes Figma.
- **Caleb** : conception de la base de données.
- **Yviline, Aksa et Wivine** : conception des API.
- **Membres ajoutés** : missions à préciser collectivement.

Cette répartition est **temporaire et concerne la conception** ; les rôles d'implémentation seront redistribués après la revue du dimanche. Voir [la matrice et les livrables](docs/REPARTITION_PHASE_CONCEPTION.md) ainsi que [le protocole de transition](docs/PASSAGE_CONCEPTION_IMPLEMENTATION.md).

Le projet Jira [PMEE](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE) existe ; **la liaison Jira–GitHub reste à vérifier**.

## 👥 Les quatre espaces

| Rôle | Fonctionnalités attendues |
| --- | --- |
| **Étudiant** | Inscription/connexion, menu du jour, panier, commande sur place ou en livraison, suivi et historique, fidélité, code de parrainage, réclamations, jeux/événements et classement des 10 meilleurs clients. |
| **Employé** | Consultation/préparation/validation des commandes, disponibilité temporaire des plats, traitement des réclamations, statistiques hebdomadaires. |
| **Gérant** | Supervision des commandes en temps réel, création de comptes employés, statistiques générales, validation/rejet des réponses aux réclamations. |
| **Administrateur (direction)** | Comptes employés, menu CRUD, promotions et affiches d'événements, statistiques globales, réclamations et paramètres du restaurant. |

L'affichage du menu et des promotions sur la page d'accueil ainsi que le recueil du **consentement cookies** sont également demandés.

## 🧭 Parcours prioritaires

1. **Étudiant :** inscription → connexion → menu → panier → choix « sur place » avec heure d'arrivée ou « livraison » avec localisation → confirmation → suivi → commentaire/réclamation.
2. **Employé :** connexion → consulter les commandes → préparer → actualiser le statut → valider le service → traiter les réclamations.
3. **Fidélité / parrainage :** consulter le solde → gagner ou utiliser les points selon les règles métier → partager un code unique → créditer le parrain **une seule fois** après la première commande réussie du filleul.
4. **Pilotage :** gestion du menu et des employés, traitement des réclamations, promotions, statistiques et suivi des ventes.

**Paiement via agrégateur (Mobile Money/carte) : bonus facultatif selon les livrables du cahier des charges** ; ne pas le bloquer comme exigence du MVP sans décision de l'équipe. Le document le décrit aussi parmi les fonctionnalités envisagées : l'arbitrage est tracé dans [docs/DECISIONS.md](docs/DECISIONS.md).

## 🎨 Charte graphique

| Usage | Couleur |
| --- | --- |
| Primaire | `#CFBD97` (beige doré) |
| Secondaire | `#000000` (noir) |

Le logo original ZeDuc@Space figure dans le cahier des charges. **Ne pas recréer ou altérer l'identité sans disposer des ressources validées.** Typographie, iconographie et règles UI finales restent à faire valider. Voir [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

## 🏗️ Architecture et technologies

Exigences de conception : **architecture MVC ou équivalente**, découpage frontend/backend, données persistées, API et interface responsive, compatibilité Chrome/Firefox/Safari, évolutivité vers plusieurs restaurants.

Le cahier des charges **laisse le choix de la stack** (exemples : React/Vue/Angular, PHP/Laravel) : aucune technologie de production n'est encore arrêtée ni installée. Les modèles `users`, `orders`, `referrals`, les points de fidélité et les statistiques doivent être affinés lors de la conception.

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et [docs/CAHIER_DES_CHARGES.md](docs/CAHIER_DES_CHARGES.md).

## 🚦 Livraison et suivi

- Maquettes **Figma** et démonstration web sur **Vercel**.
- Dépôt GitHub, branches par fonctionnalité, revue via **Pull Request** et vérifications **GitHub Actions**.
- **Jira** est l'outil de suivi demandé pour le backlog, les sprints, les bugs et les responsables. Le projet Jira PMEE existe ; GitHub Issues accueille les éléments préparatoires, en attendant une synchronisation Jira–GitHub vérifiée.
- Tests unitaires, fonctionnels et **E2E** couvrant notamment le cycle de commande.
- Documentation des API, de l'architecture, des installations et de l'utilisation par rôle, schémas BD, risques, budget et livraison de préproduction.
- Application mobile ultérieure : **extension possible**, hors livrable web initial.

Le document source mentionne une équipe initiale de **6 personnes** et un délai de **4 semaines (30 septembre–21 octobre)**. **L'équipe actuelle s'est agrandie** et une nouvelle répartition de développement sera décidée après la revue du 25/10/2026. Ces dates proviennent du document de **2024** et **ne constituent pas un calendrier confirmé pour 2026**. Voir [docs/PLAN_DE_LIVRAISON.md](docs/PLAN_DE_LIVRAISON.md).

## 📁 Dossiers documentaires

| Document | Utilité |
| --- | --- |
| [Cahier des charges structuré](docs/CAHIER_DES_CHARGES.md) | Exigences fonctionnelles et périmètre |
| [Architecture](docs/ARCHITECTURE.md) | Modules, rôles, données, API |
| [Design system](docs/DESIGN_SYSTEM.md) | Identité, écrans et accessibilité |
| [Plan de livraison](docs/PLAN_DE_LIVRAISON.md) | Phases, équipe, Jira, livrables |
| [Répartition de conception](docs/REPARTITION_PHASE_CONCEPTION.md) | Responsables et livrables préliminaires jusqu'au 25/10/2026 |
| [Transition vers l'implémentation](docs/PASSAGE_CONCEPTION_IMPLEMENTATION.md) | Checklist et futurs rôles à réattribuer |
| [Backlog du projet](docs/BACKLOG.md) | Issues liées, priorités proposées et dépendances |
| [Plan de tests](docs/PLAN_DE_TESTS.md) | Scénarios de recette, contrôles |
| [Décisions ouvertes](docs/DECISIONS.md) | Arbitrages non tranchés |
| [Risques](docs/RISQUES.md) | Risques et stratégies de mitigation |

## 🛠️ Démarrage du travail

```bash
git clone https://github.com/jeankazazmba/Projet_DeveloppementWeb.git
cd Projet_DeveloppementWeb
git switch -c feature/student-cart
```

**Attention :** il n'existe pas encore d'application exécutable. Les commandes d'installation et les scripts de tests viendront avec la stack. N'inventez pas de commande `npm start` ou `php artisan serve` avant d'avoir ajouté la configuration correspondante.

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les règles Git et [SECURITY.md](SECURITY.md) pour la protection des comptes, des données et des points.

## 🔐 État des protections

Les conventions de branches, de revues et de qualité sont définies. **La branche `main` n'est pas techniquement protégée** : la configuration GitHub du dépôt privé ne permet pas pour l'instant l'activation de rulesets obligatoires. L'équipe doit donc respecter ces conventions ; GitHub Actions n'impose pas à lui seul une approbation de PR.

## ✅ Avancement vérifiable

- [x] Dépôt GitHub initialisé.
- [x] Cadrage écrit sur la base du cahier des charges Mon Miam Miam.
- [x] Modèles Issues/PR et contrôles de gouvernance.
- [x] Documenter la répartition de la phase de conception.
- [x] Identifier le projet Jira PMEE et le ticket versioning PMEE-5.
- [ ] Vérifier accès et liaison Jira–GitHub, recueillir les livrables de conception.
- [ ] Valider la nouvelle répartition d'implémentation, stack, dates, backlog Jira et MVP.
- [ ] Concevoir les maquettes Figma et prototype Vercel.
- [ ] Développer les quatre espaces et l'API.
- [ ] Tester, livrer la bêta et documenter la mise en production.

**Responsable du dépôt :** [@jeankazazmba](https://github.com/jeankazazmba). Ce dépôt privé n'est pas fourni sous licence open source.
