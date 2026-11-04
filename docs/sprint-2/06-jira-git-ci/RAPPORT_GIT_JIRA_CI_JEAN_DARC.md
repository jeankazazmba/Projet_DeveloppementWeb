# Rapport technique — Git, Jira et contrôles CI (Sprint 2)

**Projet :** Mon Miam Miam / ZeDuc@Space  
**Issue :** [#33](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/33)  
**Responsable :** Roseline BOLONGOSHA (`@roselinebolongosha-cloud`)  
**Binôme :** Jean d'Arc Kazamba (`@jeankazazmba`)  
**État :** rapport de contribution du binôme Jean d'Arc, **pas** validation globale de l'issue #33.

## 1. Objectif

Formaliser les règles de contribution, organiser les branches et PR, rattacher les travaux aux issues et au projet Jira PMEE, puis automatiser les premiers contrôles de dépôt.

## 2. Livrables existants sur `main`

| Élément | Source / preuve | État |
| --- | --- | --- |
| Conventions Git, commits et revues | [`CONTRIBUTING.md`](../../../CONTRIBUTING.md) | Documentées |
| Modèle de pull request | [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md) | Présent |
| Workflow de gouvernance | [`.github/workflows/collaboration.yml`](../../../.github/workflows/collaboration.yml) | Présent |
| Documents de référence | [`README.md`](../../../README.md), [`docs/CAHIER_DES_CHARGES.md`](../../CAHIER_DES_CHARGES.md), [`docs/DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) | Présents |
| Backlog et correspondance GitHub/Jira | [`docs/BACKLOG.md`](../../BACKLOG.md), [projet Jira PMEE](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE) | Documentés ; synchronisation technique non vérifiée |
| Historique de versioning antérieur | [PR #48](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/48) — PMEE-5, Sprint 1 | Fusionnée le 26 octobre 2026 ; référence de continuité, pas livrable nouveau du Sprint 2 |

## 3. Règles Git mises à disposition

- Branches dédiées avec préfixes `feature/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`, `hotfix/` ou `ci/`.
- Titres de PR structurés (`feat:`, `fix:`, `docs:`, etc.) et lien avec ticket ou issue.
- Relecture humaine et vérifications avant fusion selon `CONTRIBUTING.md`.
- Aucune protection obligatoire de `main` n'est attestée ; les règles de revue restent une convention d'équipe.

## 4. Contrôles effectivement configurés

Le workflow `collaboration.yml` est déclenché sur push vers `main`, sur PR vers `main` et manuellement. Il contrôle :

1. La présence de documents obligatoires et de couleurs du design system.
2. L'absence de fichiers `.env` sensibles suivis par Git.
3. Les préfixes de branches et les titres des PR.

**Limite majeure :** le workflow affiche explicitement que les tests applicatifs ne sont pas encore intégrés. Un statut GitHub Actions vert ne démontre ni compilation React ni tests Laravel. Des exécutions réussies ont été observées sur `main` au relevé du 4 novembre 2026, sans constituer une preuve de recette applicative.

## 5. Coordination Jira / GitHub

Le projet Jira PMEE est référencé dans la documentation et les issues. Le ticket [PMEE-14](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE-14) est mentionné dans l'issue #28. **La synchronisation automatique Jira–GitHub et la couverture de toutes les tâches par des liens bidirectionnels ne sont pas confirmées.**

L'issue [#33](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/33) était encore ouverte au relevé. Sa clôture nécessite une revue conjointe avec Roseline et les preuves de liaison, de CI et de validation prévues dans le ticket.

## 6. Liste de contrôle de remise

- [x] Conventions Git et contribution accessibles.
- [x] Workflow de gouvernance accessible.
- [x] Projet Jira PMEE et backlog documentés.
- [x] PR de versioning antérieure fusionnée.
- [ ] Captures ou export de la correspondance Jira ↔ PR/issue pour les tickets concernés.
- [ ] Preuve d'une revue de Roseline et validation de l'issue #33.
- [ ] Ajout des contrôles applicatifs : build/lint frontend et tests backend.
- [ ] Journal de recette CI daté, avec cas d'échec et correction.

**Conclusion :** contribution Git/CI de Jean d'Arc documentée ; les points Jira et la validation du binôme restent ouverts.
