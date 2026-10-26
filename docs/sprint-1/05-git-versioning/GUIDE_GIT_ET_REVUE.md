# Livrable Sprint 1 — Stratégie Git et revue

**Responsable :** Jean d'Arc Kazamba · **GitHub :** @jeankazazmba · **Issue :** #24 · **Jira :** PMEE-5

## 1. Organisation
- `main` : référence commune ; interdiction **par convention** de pousser directement.
- Une branche courte par tâche : `docs/24-PMEE-5-livrables-versioning`, `feat/31-auth-roles`, `fix/NUMERO-description`.
- Chaque membre travaille dans son périmètre ; synchroniser `main` avant de créer sa branche.
- Pas de mot de passe, jeton, fichier `.env` réel ou données sensibles dans les commits.

## 2. Cycle standard

```bash
git switch main
git pull origin main
git switch -c docs/24-PMEE-5-livrables-versioning
# Ajouter ou modifier les documents
git status
git add docs/sprint-1/05-git-versioning/
git commit -m "docs: PMEE-5 livrables de versioning Sprint 1"
git push -u origin docs/24-PMEE-5-livrables-versioning
```

Ouvrir une Pull Request `docs/24-PMEE-5-livrables-versioning` → `main`, écrire `Refs #24` et `PMEE-5`, demander la relecture d'un autre membre, puis fusionner après revue. Publier le lien de la PR dans l'Issue #24.

## 3. Convention de messages
- `feat:` nouvelle fonctionnalité ;
- `fix:` correction ;
- `docs:` documentation ;
- `test:` tests ;
- `ci:` automatisation ;
- `chore:` entretien du dépôt ;
- `refactor:` restructuration sans changement fonctionnel.

## 4. Validation
- [ ] Le changement correspond à une Issue et une PR.
- [ ] Les fichiers et liens sont lisibles et dans le bon dossier.
- [ ] Les éventuels tests disponibles sont exécutés et décrits.
- [ ] Au moins un autre membre relit le travail.
- [ ] Le responsable de suivi confirme la validation avant clôture.

**Limite vérifiée :** sur ce dépôt privé, la protection technique de `main` n'est pas activée ; ces règles reposent sur la discipline de l'équipe. Le pipeline de tests applicatifs et le déploiement automatique ne sont pas encore en place.
