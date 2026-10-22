# Guide de contribution

Bienvenue dans le projet. Ces conventions s'appliquent à tous les contributeurs, y compris le responsable du dépôt.

## 1. Organisation du travail

- Chaque fonctionnalité ou correction commence par une **Issue**, décrivant le résultat attendu et les critères d'acceptation.
- Une tâche a un responsable identifiable. Les décisions importantes sont conservées dans l'Issue ou la Pull Request.
- Le travail doit rester découpé en changements simples, vérifiables et indépendants.

## 2. Règles Git et branches

La branche **`main`** représente la version de référence du projet. **Ne poussez pas directement sur `main`** : ouvrez une Pull Request (PR).

À partir de `main`, nommez les branches :

- `feature/description-courte` : nouvelle fonctionnalité.
- `fix/description-courte` : correction.
- `docs/description-courte` : documentation.
- `test/description-courte` : tests.
- `refactor/description-courte` : restructuration sans changement métier.
- `chore/description-courte` : maintenance.
- `hotfix/description-courte` : correction urgente.
- `ci/description-courte` : automatisation CI.

Exemple :

```bash
git switch main
git pull origin main
git switch -c feature/recherche-cer
# Après avoir modifié les fichiers :
git add .
git commit -m "feat: ajouter la recherche de CER"
git push -u origin feature/recherche-cer
```

## 3. Messages de commit

Utiliser : `type: résumé à l'infinitif`.

Types conseillés : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`.

Exemples : `feat: ajouter une barre de recherche` ou `fix: corriger la validation du formulaire`.

## 4. Pull Requests

Avant de demander une fusion :

1. Lier l'Issue ou expliquer la motivation du changement.
2. Résumer précisément les fichiers et comportements modifiés.
3. Vérifier manuellement le comportement concerné ; lancer les tests disponibles.
4. Fournir des captures pour les modifications visuelles.
5. Corriger les conflits et s'assurer que les vérifications GitHub Actions passent.
6. Demander **au moins une revue d'un autre développeur**.
7. Ne fusionner qu'après résolution des commentaires bloquants.

**Convention d'équipe :** privilégier le squash merge et des PR de taille raisonnable. Ne jamais fusionner son propre travail sans relecture, sauf urgence documentée.

## 5. Qualité et sécurité

- N'ajoutez jamais de secrets, de clés privées, de jetons ni de données personnelles réelles au dépôt.
- N'ajoutez pas de `.env` ; fournissez, au besoin, un `.env.example` sans valeur sensible.
- Respectez la cohérence de nommage, la sémantique HTML et l'accessibilité.
- Évitez les duplications de code et documentez toute nouvelle dépendance.
- Ajoutez des tests à chaque fonctionnalité lorsque la stack le permet.
- Préservez la compatibilité mobile et desktop.

## 6. Limitations actuelles

Les règles de protection de branche ne sont **pas techniquement imposées** sur le dépôt privé dans sa configuration actuelle. Jusqu'à leur activation, l'équipe doit respecter manuellement les règles ci-dessus. Les contrôles automatiques vérifient certains aspects (présence des documents et conventions de PR), mais ne remplacent pas la revue humaine.
