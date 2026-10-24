# Répartition actuelle — phase de conception (jusqu'au dimanche 25 octobre 2026)

> **Statut : organisation de travail communiquée par l'équipe, phase préliminaire.**
> **Période :** consignée le 24/10/2026 ; point de clôture/revue prévu **dimanche 25/10/2026** (heure et validation collective à confirmer).
> **Important :** cette répartition décrit les **missions de conception et d'organisation**, **pas** les affectations définitives de développement. Les rôles et responsables de l'implémentation devront être redéfinis lors d'une prochaine réunion et mis à jour dans Jira.
> **Source :** répartition explicitée dans l'échange d'équipe du 23/10/2026 et confirmation de la durée actuelle par le responsable du dépôt le 24/10/2026. Les travaux produits par les membres ne sont pas réputés achevés sans lien vers un livrable validé.

## 1. Membres et responsabilités **actuelles** (phase de conception)

| Personne(s) | Mission actuellement communiquée | Livrables préparatoires à fournir/relier | État vérifiable au 24/10 |
| --- | --- | --- | --- |
| **Jean d'Arc Kazamba** (GitHub : [@jeankazazmba](https://github.com/jeankazazmba)) | **Versioning Git et organisation du dépôt GitHub** | Dépôt, conventions de branches/commits et Pull Requests, revues, contrôle GitHub Actions, guide de contribution, test de liaison avec le ticket Jira **[PMEE-5](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE-5)** | **Partiellement vérifié :** dépôt, documentation, modèles de PR/Issues et contrôle de gouvernance présents ; **liaison Jira–GitHub, accès collaborateurs et protection de `main` non confirmés/actifs** |
| **Roseline BOLONGOSHA** | **Gestion et organisation de Jira** | Projet, backlog, Epics, tickets assignés, priorités, dépendances, échéances, invitations et connexion GitHub | **Projet Jira [PMEE](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE) et attribution PMEE-5 attestés par notifications** ; organisation interne et synchronisation avec GitHub **non vérifiées directement** |
| **Christian** | **Conception des maquettes Figma** | Parcours et écrans accueil, authentification, étudiant, employé, gérant, admin ; lien Figma, validation mobile et charte | **Responsabilité déclarée**, lien Figma final et validation **non communiqués dans les sources consultées** |
| **Caleb** | **Conception de la base de données** | Modèle conceptuel/logique, schéma entité-relation, tables/relations et contraintes, revue des cas commande/fidélité/parrainage | **Responsabilité déclarée**, schéma validé **non présent dans le dépôt vérifié** |
| **Yviline, Aksa et Wivine** | **Conception des API** | Découpage des modules, routes/méthodes, schémas de requêtes/réponses, authentification/autorisation, codes d'erreur, contrat OpenAPI ou document équivalent | **Responsabilité commune déclarée**, répartition fine entre les trois et contrat validé **non présents dans le dépôt vérifié** |
| **Autres personnes intégrées à l'équipe** | À préciser collectivement | Nom, disponibilité, mission de conception éventuelle et identifiant GitHub | **Existence de nouveaux membres confirmée verbalement**, identités/missions non spécifiées ici |

Ne pas interpréter les lignes « non communiqué / non présent dans le dépôt » comme une preuve qu'un membre n'a **pas travaillé** : il peut déjà disposer de livrables dans Figma, Jira ou un autre espace non relié à ce dépôt.

### Règles de cette phase

- Le périmètre se limite à **la préparation et à la conception** ; personne ne se voit attribuer de nouveaux modules d'implémentation par ce document.
- **Jira PMEE** reste le registre de référence pour les statuts, responsables et échéances ; GitHub est la référence pour la documentation versionnée et, ensuite, le code.
- **WhatsApp** est privilégié pour les échanges rapides ; les décisions et blocages issus des discussions sont ensuite consignés dans **Jira** ou dans le présent dépôt.
- Toute modification de la répartition avant la revue de dimanche est consignée avec sa date, son auteur et sa validation.
- Un livrable est considéré comme **reçu** uniquement lorsque son lien/fichier est partagé ; **validé** seulement après revue par les personnes concernées.

## 2. Livrables attendus au point de revue du dimanche 25/10

| Domaine | Preuve attendue | Critère de revue |
| --- | --- | --- |
| Jira / coordination | Lien du tableau PMEE, liste des Epics/tickets, affectations nominatives, éventuels blocages | Pas de ticket de conception critique sans responsable ; clés Jira connues |
| Git / dépôt | README, règles de contribution, organisation de branches, PR test si accès disponibles, trace de test `PMEE-5` | Les membres peuvent lire/contribuer selon leurs permissions ; liaison Jira–GitHub évaluée sur une activité réelle |
| Figma | Lien éditable ou consultable des maquettes et des principaux parcours | Écrans clés et couleurs `#CFBD97` / `#000000` conformes ; points ouverts listés |
| Données | Diagramme ER / MCD-MLD ou schéma SQL conceptuel, dictionnaire et contraintes de clés | Correspondance avec les entités utilisateurs, menu, commandes, lignes de commande, fidélité, parrainage, réclamations |
| API | Contrat de conception (OpenAPI ou document structuré), modules, endpoints et schémas de données | Parcours principaux couverts ; contrats compatibles avec Figma et la base, règles de permissions décrites |
| Transversal | Décisions et questions encore ouvertes : MVP, stack, droits par rôle, statuts de commande, règles métier | Dépendances explicites avant le lancement de l'implémentation |

**Ce tableau énumère ce qu'il faut apporter à la revue** ; il ne signifie pas que les livrables existent déjà ni que dimanche constitue une date contractuelle de remise validée.

## 3. Points de coordination et dépendances

1. **Christian ↔ équipe API :** noms des actions du parcours, validations, erreurs, informations nécessaires au menu/panier/commande et états des écrans.
2. **Caleb ↔ équipe API :** entités/relations, contrats d'entrée et sortie, données sensibles, règles d'intégrité, identifiants et pagination.
3. **Roseline ↔ tous :** tickets et responsables, liens de livrables, échéances, blocages, statut « conçu / à revoir / validé ».
4. **Jean d'Arc ↔ Roseline :** accès au dépôt privé, test d'intégration de `PMEE-5` et convention de références Jira dans Git.
5. **Toute l'équipe ↔ responsable métier :** validation des décisions restant ouvertes avant codage : périmètre MVP, règles de commande/livraison, rôles, points, parrainage, technologies.

## 4. État du versioning — responsabilité Jean d'Arc

**En place sur GitHub :** dépôt privé, README et documentation métier, `CONTRIBUTING.md`, `SECURITY.md`, modèles d'Issue/PR, deux PR documentaires fusionnées, workflow GitHub Actions de **conventions/documentation**.

**À vérifier/achever avant transition :**
- [ ] Vérifier les membres ayant accepté l'invitation et les permissions utiles sur le dépôt ; ne pas inventer leur état.
- [ ] Vérifier avec Roseline la liaison Jira–GitHub et tracer une branche/PR contenant la clé `PMEE-5`.
- [ ] Publier et faire accepter les conventions Git à l'équipe ; revue humaine avant fusion.
- [ ] Documenter que **`main` n'est pas protégée techniquement** ; éviter les pushes directs par discipline d'équipe tant que la protection n'est pas disponible.
- [ ] Recueillir les liens vers les livrables de conception afin de les faire référencer dans Jira et/ou dans `docs/`.
- [ ] Préparer le point de passage de phase, sans annoncer d'assignations de développement non décidées.

**Non encore réalisé :** suite de tests applicatifs et pipeline de déploiement du code, car la stack n'est pas choisie et l'application n'est pas initialisée.

## 5. Passage à l'implémentation — décision à venir

À la **revue du dimanche**, consigner un compte rendu et une nouvelle matrice « équipe → modules de développement → responsable/relecteur → dépendances ». Les attributions actuelles de conception **ne sont pas reconduites automatiquement**. Voir [PASSAGE_CONCEPTION_IMPLEMENTATION.md](PASSAGE_CONCEPTION_IMPLEMENTATION.md).

### Sources et références internes

- [Ticket Jira PMEE-5](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE-5) (attribution versioning).
- [GitHub : backlog préparatoire](BACKLOG.md) et [plan de livraison](PLAN_DE_LIVRAISON.md).
- [Architecture cible](ARCHITECTURE.md), [décisions](DECISIONS.md), [plan de tests](PLAN_DE_TESTS.md).
