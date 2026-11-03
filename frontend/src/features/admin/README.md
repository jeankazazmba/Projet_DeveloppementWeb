# admin

Module React du back-office administrateur — Sprint 3, ticket PMEE-34.

## Périmètre de ce module

- Tableau de bord et indicateurs globaux.
- Comptes employés : création locale de démonstration, activation et suppression.
- Menu : ajout local, recherche, catégories, disponibilité et plat du jour.
- Promotions, événements et affiches : brouillon et diffusion locale.
- Supervision des réclamations.
- Paramètres : horaires et préparation des règles de fidélité.
- Accessibilité : contrôle de taille de police partagé dans `src/components/ui/FontSizeControl.jsx`.

Les données de démonstration résident dans `mockData.js`. Elles ne constituent pas des données réelles et sont réinitialisées au rechargement.

## API attendues

Au relevé du 3 novembre 2026, le backend expose uniquement `GET /api/health`. Les intégrations suivantes restent donc volontairement simulées : comptes employés, menu, statistiques, promotions/événements, réclamations et paramètres. Elles devront être branchées sur les contrats Laravel validés, avec contrôle des permissions côté serveur.

## Hors périmètre

Ce module ne modifie pas les interfaces des répertoires `student/`, `employee/` ou `manager/`. Le paiement agrégé, les règles détaillées de mini-jeux et les calculs définitifs de fidélité restent soumis aux décisions métier et aux autres modules du Sprint 3.
