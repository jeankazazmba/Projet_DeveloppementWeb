# Procédure opérationnelle — branches, Pull Requests et validation

**Projet :** Mon Miam Miam · **Sprint :** 1 · **Référence :** Issue #24 / Jira PMEE-5

## Objectif
Une modification doit pouvoir être reliée à une tâche, relue, testée et retrouvée. Le dépôt suit la convention de contribution publiée dans `CONTRIBUTING.md`. **La branche `main` n'est pas techniquement protégée dans la configuration actuelle** : cette procédure est une règle d'équipe, pas un contrôle automatique garanti.

## Parcours d'une contribution
1. Vérifier l'Issue GitHub et le ticket Jira, les critères d'acceptation, le responsable et le binôme.
2. Se synchroniser avec `main` avant de commencer.
3. Créer une branche courte par tâche, avec un préfixe autorisé : `feature/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`, `hotfix/` ou `ci/`.
4. Modifier uniquement les fichiers utiles ; contrôler `git diff` et `git status`.
5. Faire des commits atomiques au format `type: description`, en indiquant PMEE et/ou le numéro d'Issue si utile.
6. Publier la branche, ouvrir une PR vers `main` et référencer `Refs #24` ou l'Issue concernée sans fermeture anticipée.
7. Solliciter au moins **un autre membre** pour la revue, décrire tests et preuves.
8. Après approbation et contrôles pertinents, fusionner la PR, commenter l'Issue avec le lien et demander la validation finale.
9. Mettre Jira à jour après confirmation ; clôturer seulement quand les critères sont satisfaits.

## Commandes reproductibles
```bash
git switch main
git pull origin main
git switch -c docs/24-PMEE-5-livrables-versioning
git status
git diff
git add docs/sprint-1/05-git-versioning/
git diff --cached
git commit -m "docs: PMEE-5 documenter la procédure de revue"
git push -u origin docs/24-PMEE-5-livrables-versioning
```

**Pour une nouvelle tâche**, remplacer le nom de branche par une branche distincte ; ne pas réutiliser la branche PMEE-5.

## Modèle de description de PR
```markdown
## Objet
Contexte, Issue GitHub, ticket Jira.

## Modifications
- Fichiers et comportement concernés.

## Vérification
- [ ] Diff et liens vérifiés
- [ ] Tests applicables exécutés (ou « sans objet » justifié)
- [ ] Aucun secret ni donnée privée
- [ ] Documentation mise à jour

## Relecture
Relecteur sollicité : @...
Points à arbitrer : ...

Refs #NUMERO
Jira : PMEE-...
```

## Revue ciblée par type de livraison
| Type | Contrôles attendus |
| --- | --- |
| Documentation / conception | Liens accessibles, sources modifiables, cohérence des diagrammes et du cahier des charges |
| Frontend | Responsive, navigation, accessibilité de base, captures |
| API / backend | Contrats HTTP, validations, erreurs, rôles et tests |
| Base de données | Migrations réversibles, contraintes, jeux de données non sensibles |
| CI / déploiement | Exécution réelle, logs, échecs explicites, pas de secrets |

## Cas particuliers
- **Conflit Git :** récupérer `main`, résoudre localement, vérifier puis repousser ; ne pas écraser l'historique partagé.
- **PR refusée :** corriger sur la même branche et demander une nouvelle revue.
- **Urgence :** créer `hotfix/...`, garder une PR et une trace de vérification.
- **Absence de CI applicative :** déclarer « non disponible », jamais « tests passés ».
- **Jira non relié :** conserver références textuelles et documenter le test de liaison, sans annoncer de synchronisation.

## Critères d'acceptation du livrable
- [x] Processus Git / PR décrit
- [x] Modèle de PR proposé
- [x] Règles de revue et de preuve décrites
- [ ] Relecture indépendante réalisée (à renseigner dans PR #48)
- [ ] Adoption par l'équipe confirmée (à consigner dans l'Issue #24)
