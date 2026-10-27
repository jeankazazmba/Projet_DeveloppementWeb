# Sprint 2 et tâches de Jean d'Arc Kazamba

**Relevé GitHub du 27 octobre 2026.** Les statuts et affectations ci-dessous ont été lus dans les Issues. L'échéance du Sprint 2, indiquée dans leur description, est le **28 octobre 2026**. La synchronisation avec Jira PMEE n'est pas vérifiée. Une Issue ouverte ne permet pas, à elle seule, de distinguer « à faire » et « en cours ».

## Issues du Sprint 2

| Issue | Travail attendu | Responsable dans la description | Binôme dans la description | Assignés GitHub | État GitHub |
| --- | --- | --- | --- | --- | --- |
| [#28](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/28) | Initialiser frontend, backend et conventions | @jeankazazmba | @Ono206 | @Ono206, @jeankazazmba | Ouverte |
| [#29](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/29) | Intégrer les écrans Figma responsive | @Ono206 | @yveline-kabwadya | @Ono206, @yveline-kabwadya | Ouverte |
| [#30](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/30) | Migrations et jeux de données | @Caleb-Kashoba | @aksambala25-cell | @Caleb-Kashoba | Ouverte |
| [#31](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/31) | Authentification et permissions | @aksambala25-cell | @wivinemukendi-blip | @wivinemukendi-blip | Ouverte |
| [#32](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/32) | API menu et connexion frontend | @wivinemukendi-blip | @Caleb-Kashoba | @Caleb-Kashoba, @wivinemukendi-blip | Ouverte |
| [#33](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/33) | Configurer Jira, branches et contrôles CI | @roselinebolongosha-cloud | @jeankazazmba | @jeankazazmba, @roselinebolongosha-cloud | Ouverte |
| [#34](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/34) | Scénarios de test et guide d'installation | @roselinebolongosha-cloud | @yveline-kabwadya | @yveline-kabwadya, @roselinebolongosha-cloud | Ouverte |

**Écarts d'affectation à clarifier avec l'équipe :** #30 mentionne Aksa comme binôme mais seul Caleb est assigné ; #31 indique Aksa comme responsable et Wivine comme binôme, alors que seule Wivine est assignée. Ce relevé conserve les deux informations sans réattribuer les tâches.

## Jean d'Arc — priorités du Sprint 2

### #28 — Initialiser frontend, backend et conventions

**Responsable : @jeankazazmba ; binôme : @Ono206.** Issue ouverte, sans commentaire au relevé.

Critères de l'Issue :
- Projet exécutable en local, README et variables d'environnement documentées.
- Lien vers le code, la PR ou le livrable.
- Démonstration ou tests effectués avec le binôme.
- Relecture par un autre membre avant clôture.

La branche `main` contient encore uniquement les livrables documentaires et la gouvernance. Pour préparer cette tâche, consolider la stack et ses versions avec l'équipe : React apparaît dans #53 et Laravel/Sanctum dans la proposition API back-office. Le SGBD et les conventions communes doivent être explicités avant l'initialisation.

### #33 — Configurer Jira, branches et contrôles CI

**Responsable : @roselinebolongosha-cloud ; binôme : @jeankazazmba.** Issue ouverte, sans commentaire au relevé.

Critères de l'Issue :
- Tickets reliés aux PR, conventions et workflow de vérification.
- Lien vers le code, la PR ou le livrable.
- Démonstration ou tests effectués avec le binôme.
- Relecture par un autre membre avant clôture.

Les conventions et un workflow documentaire existent déjà. Restent à apporter les preuves de liaison Jira et les contrôles applicatifs adaptés au projet initialisé par #28. La fusion PMEE-5 ne prouve pas la synchronisation Jira.

## Autres tâches concernant Jean d'Arc

| Issue | Rôle dans la description | Échéance indiquée | État GitHub |
| --- | --- | --- | --- |
| [#24 — PMEE-5, versioning](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/24) | Responsable | Sprint 1 | Fermée, motif completed ; liaison Jira non vérifiée |
| [#39 — Intégration frontend/backend](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/39) | Responsable, binôme Aksa | 30/10/2026 | Ouverte ; Jean d'Arc seul assigné |
| [#44 — Tests des permissions et régression](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/44) | Responsable, binôme Caleb | 31/10/2026 | Ouverte |
| [#45 — Démo Vercel et documentation](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/45) | Binôme de Christian (@Ono206) | 31/10/2026 | Ouverte |
| [#53 — Application mobile React Native](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/53) | Responsable | Sprint 4 / prolongation possible | Ouverte ; bonus non bloquant pour le web |

**Ordre de travail proposé :** traiter #28 pour rendre le projet exécutable, avancer sur #33 avec Roseline, puis préparer l'intégration #39. Les tâches #44 et #45 suivent la stabilisation du parcours ; #53 reste un bonus après stabilisation de l'API et du web.

