# Projet Développement Web

> **Projet collaboratif de développement web — ULC-ICAM**
>
> **État actuel :** dépôt initialisé, documentation et règles de collaboration en place. Le code de l'application reste à intégrer.

## Présentation

Ce dépôt centralise les travaux d'une équipe de développement web : cadrage, conception de l'interface, implémentation, intégration, tests, corrections et documentation.

Le fil conducteur pédagogique envisagé est une **application web de consultation et d'archivage de CER et de corbeilles d'exercices** : une bibliothèque numérique utile aux étudiants pour retrouver des travaux antérieurs et préparer leurs révisions. Le périmètre définitif, le nom produit et les fonctionnalités prioritaires devront être validés par l'équipe avant leur implémentation.

### Objectifs
- Construire une application web claire, accessible et responsive.
- Maintenir un code lisible, modulaire et réutilisable.
- Collaborer via les branches Git, les Issues et les Pull Requests.
- Assurer des revues de code et des tests avant l'intégration.
- Documenter l'installation, l'architecture et les décisions importantes.

### Fonctionnalités à cadrer (non encore livrées)
- Parcourir un catalogue de ressources pédagogiques.
- Rechercher et filtrer les ressources.
- Consulter les détails d'une ressource.
- Étudier, selon les besoins, un espace de contribution et de gestion.

**Important :** les éléments ci-dessus constituent un **cadrage initial**, pas une annonce de fonctionnalités déjà développées.

## Technologies

Le choix exact de la pile doit suivre les besoins réels et les compétences évaluées. Technologies rencontrées dans le parcours : HTML5, CSS3, JavaScript, React, PHP/Laravel, MySQL et PHPUnit. Leur mention ici **ne signifie pas qu'elles sont toutes utilisées dans le dépôt**.

Outils de collaboration : Git, GitHub, GitHub Issues, Pull Requests et GitHub Actions.

## État du dépôt

Le dépôt part d'une base vide. Cette première initialisation ajoute les documents de gouvernance et les modèles de travail ; il ne contient pas encore de source applicative ni de procédure de démarrage exécutée et vérifiée.

## Démarrage

```bash
git clone https://github.com/jeankazazmba/Projet_DeveloppementWeb.git
cd Projet_DeveloppementWeb
git switch -c feature/ma-premiere-fonctionnalite
```

Les commandes de lancement de l'application seront indiquées ici dès que sa stack et son code seront déposés.

## Travailler en équipe

1. Créer une **Issue** décrivant le besoin, la correction ou la tâche.
2. Partir de `main` et créer une branche courte : `feature/...`, `fix/...`, `docs/...`, `chore/...`, `test/...`, `refactor/...` ou `hotfix/...`.
3. Développer avec des commits explicites : `feat: ...`, `fix: ...`, `docs: ...`, etc.
4. Ouvrir une **Pull Request vers `main`** et expliquer les changements ainsi que les tests.
5. Demander **au moins une revue par un autre membre** avant toute fusion.
6. Ne pas publier de secrets, de mots de passe ou de fichiers `.env`.

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les règles détaillées et [SECURITY.md](SECURITY.md) pour les consignes de sécurité.

> **Limite actuelle de la plateforme :** les protections de branche/rulesets ne peuvent pas être activées pour ce dépôt privé avec la configuration GitHub disponible. Les règles de revue sont pour l'instant des conventions d'équipe ; GitHub Actions vérifie toutefois certaines conventions lors des Pull Requests.

## Feuille de route

- [x] Initialiser le dépôt et documenter les règles de contribution.
- [ ] Valider le besoin métier, les utilisateurs et les fonctionnalités du MVP.
- [ ] Fixer la stack technique et l'architecture des dossiers.
- [ ] Intégrer une première version exécutable.
- [ ] Ajouter tests adaptés à la stack.
- [ ] Organiser la recette, puis le déploiement.

## Pilotage

Responsable actuel du dépôt : [@jeankazazmba](https://github.com/jeankazazmba).

Les tâches et discussions techniques sont centralisées dans **GitHub Issues**. Les changements de code passent par **Pull Requests**.

## Licence

Dépôt privé de travail. Aucune licence open source n'est accordée par défaut. Une licence pourra être choisie si une publication publique est décidée.
