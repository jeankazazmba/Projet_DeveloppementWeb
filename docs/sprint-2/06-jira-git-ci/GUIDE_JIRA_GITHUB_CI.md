# Guide Jira, GitHub et CI — Mon Miam Miam

**Sprint 2 :** issue [#33](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/33) ; Jira [PMEE-19](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE-19) (correspondance indiquée dans la description Jira).  
**Responsable :** Roseline BOLONGOSHA ; **binôme :** Jean d'Arc Kazamba.  
**Objet :** procédure opérationnelle documentée à partir de la configuration observée au 4 novembre 2026.

## 1. Outils et source de vérité

- Jira [PMEE](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE) : planification, responsable, statut et suivi des sprints.
- GitHub [Projet_DeveloppementWeb](https://github.com/jeankazazmba/Projet_DeveloppementWeb) : code, branches, issues, pull requests, revues et GitHub Actions.
- Documents : [CONTRIBUTING.md](../../../CONTRIBUTING.md), [BACKLOG.md](../../BACKLOG.md) et [workflow de gouvernance](../../../.github/workflows/collaboration.yml).

**Vérification Jira :** PMEE-19 existe et est attribué à Roseline ; son statut affiché dans Jira est « À faire » au relevé. PMEE-26 est une autre story de configuration attribuée à Roseline, également « À faire ». L'état Jira peut être en retard sur le travail effectivement réalisé ; ce guide ne le modifie pas automatiquement.

## 2. Flux de travail de l'équipe

1. Vérifier le ticket Jira, les critères d'acceptation, le responsable et le binôme.
2. Référencer la clé Jira et l'issue GitHub correspondante dans la description de la PR.
3. Créer une branche dédiée depuis `main` : `feature/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`, `hotfix/` ou `ci/`.
4. Faire des commits structurés et pousser la branche distante.
5. Ouvrir une PR vers `main` avec objectifs, changements, liens, tests et captures utiles.
6. Attendre les contrôles automatisés, faire relire par un autre membre, corriger les retours.
7. Fusionner après validation ; reporter les preuves dans le dossier documentaire du sprint et mettre à jour Jira.

```bash
git switch main
git pull origin main
git switch -c docs/PMEE-19-guide-collaboration
# Éditer les documents
git add docs/
git commit -m "docs: préciser le guide Jira et GitHub"
git push -u origin docs/PMEE-19-guide-collaboration
```

**Attention :** `feat/` n'est pas un préfixe accepté par le workflow actuel ; utiliser `feature/`.

## 3. Contrôles CI en place

| Workflow | Déclencheur | Vérifications |
| --- | --- | --- |
| [collaboration.yml](../../../.github/workflows/collaboration.yml) | PR vers main, push main, manuel | Documentation requise, absence de secrets .env suivis, convention de branche et de titre PR |
| [frontend-ci.yml](../../../.github/workflows/frontend-ci.yml) | Modifications frontend, manuel | `npm ci`, `npm run lint`, `npm run build` sous Node 22 |

Les deux contrôles ont réussi sur la PR [#81](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/81), fusionnée le 4 novembre 2026. **Ce résultat ne certifie pas les tests métier, E2E ni la synchronisation Jira.** Les tests backend automatisés dans GitHub Actions restent à ajouter.

## 4. Procédure de contrôle d'une PR

- Vérifier que la PR référence l'issue et Jira, possède un périmètre limité et n'expose aucun secret.
- Vérifier les checks dans l'onglet « Checks » ; consulter les logs si un contrôle échoue.
- Tester localement les fonctionnalités sensibles ; le statut vert seul ne suffit pas.
- Confirmer l'approbation du relecteur et l'absence de conflit avant fusion.
- Reporter la date, le lien de PR, le SHA et le résultat de recette dans Jira.

## 5. Limites et risques

- La liaison automatique Jira ↔ GitHub n'est pas prouvée par la simple présence de clés dans les descriptions.
- La protection obligatoire de la branche `main` n'est pas attestée.
- Le workflow `collaboration.yml` comporte encore un message historique indiquant que la stack n'existe pas : ce message est obsolète.
- Les contrôles applicatifs backend, API et E2E ne sont pas encore couverts par le workflow frontend.

## 6. Critères de remise

**Pièces documentées :** guide, conventions, workflows, correspondances Jira/GitHub et exemples de PR.  
**À valider avec Roseline :** mise à jour des statuts Jira, démonstration des liens, relecture et éventuels contrôles backend.  
**Ne pas assimiler :** documentation déposée = ticket Jira terminé.
