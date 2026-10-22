# Contribuer à Mon Miam Miam

Ce guide s'applique au **frontend**, au **backend**, à l'**API**, aux **maquettes** et à la **documentation** du restaurant ZeDuc@Space.

## Organisation des 6 contributeurs

Le cahier des charges prévoit une équipe de **6 personnes**, avec des responsabilités explicites. Les affectations réelles sont encore à décider et à consigner dans **Jira** (pas d'identités inventées ici). Les tâches peuvent être réparties par domaines : expérience étudiant, opérations employés, supervision gérant/admin, API & données, qualité & déploiement, coordination & design. Ces domaines sont des **propositions de répartition**, pas des rôles officiellement attribués.

### Jira et GitHub

1. Créer / affecter une **story, tâche ou bug dans Jira** (source principale du backlog).
2. Décrire les critères d'acceptation et la dépendance aux autres modules.
3. Créer une branche GitHub ciblée, idéalement avec l'identifiant Jira quand il est connu, p. ex. `feature/MMM-12-student-cart`.
4. Ouvrir une **Pull Request (PR)** en indiquant le ticket Jira et, le cas échéant, une Issue GitHub.
5. Faire relire et exécuter les tests avant fusion.
6. Mettre le ticket Jira et la documentation à jour après livraison.

Si aucun projet Jira n'est encore connecté, utiliser temporairement les Issues GitHub comme espace de préparation ; ne pas prétendre que Jira est synchronisé.

## Branches et commits

La branche `main` désigne la version de référence. **Pas de push direct sur `main` par convention d'équipe.**

Préfixes acceptés : `feature/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`, `hotfix/`, `ci/`.

Exemples métier :
- `feature/student-cart`
- `feature/employee-orders`
- `feature/manager-dashboard`
- `feature/admin-menu`
- `feature/loyalty-points`
- `feature/referral-codes`
- `feature/complaints`
- `docs/api-contracts`

```bash
git switch main
git pull origin main
git switch -c feature/student-cart
# Modifier le code, exécuter les tests, puis :
git add .
git commit -m "feat: ajouter la gestion du panier étudiant"
git push -u origin feature/student-cart
```

Utiliser des commits structurés `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`. La PR respecte elle aussi ce préfixe.

## Règles de revue

- Une **PR = un périmètre métier** ; documenter le problème résolu et les étapes de test.
- Demander **au moins une revue d'un autre membre** avant fusion.
- Vérifier les contrôles GitHub Actions ; le statut vert n'est pas une validation métier.
- Pour les interfaces : joindre captures Figma / écran, vérifier mobile et les couleurs `#CFBD97` / `#000000`.
- Pour les API : fournir requêtes/réponses, validations, droits des rôles et tests.
- Pour le paiement (optionnel) : ne jamais intégrer de vraies clés dans le dépôt ; privilégier un sandbox de l'agrégateur choisi.
- Une correction de bug doit inclure un scénario de reproduction et idéalement un test de non-régression.
- Les PR sensibles (authentification, portefeuille fidélité, parrainage, comptes employés, paiements) exigent une revue renforcée et des tests négatifs.

## Définition de « terminé »

Une fonctionnalité est terminée seulement si :
- [ ] Ses critères d'acceptation sont couverts.
- [ ] Les règles de permissions **étudiant / employé / gérant / admin** sont testées.
- [ ] Les états d'erreur, délais et données invalides sont gérés.
- [ ] Les tests pertinents passent et la recette manuelle est décrite.
- [ ] L'interface est responsive et utilisable sur les navigateurs ciblés.
- [ ] Aucune donnée réelle, aucun secret et aucun mot de passe n'est commité.
- [ ] Le README / guide utilisateur / contrat API est mis à jour si nécessaire.
- [ ] La PR a reçu une revue et le ticket Jira est mis à jour.

Pour les domaines fidélité/parrainage, tester expressément : soldes insuffisants, double attribution, première commande réussie, annulation et non-réutilisation frauduleuse.

## Sécurité et données

Voir [SECURITY.md](SECURITY.md). Les validations et les permissions doivent être imposées **côté serveur**, pas seulement par React/Vue/Angular. Ne pas introduire de données réelles dans la démo Vercel.

## Limite actuelle

Les protections de branche de GitHub ne sont pas disponibles sur ce dépôt privé avec sa configuration actuelle : l'obligation de PR et la revue humaine sont à faire respecter par l'équipe. **Aucun contributeur ne doit supposer qu'un ruleset bloque un push direct.**
