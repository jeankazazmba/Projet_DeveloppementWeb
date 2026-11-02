# Sprint 3 — Fonctionnalités métier et intégration

## Objectif
Construire les fonctionnalités métier complètes et intégrer les applications web React et mobile React Native/Expo avec l'API Laravel, en réutilisant le socle du Sprint 2.

**Important :** ce dossier rassemble les livrables, contrats, preuves de tests et suivis du Sprint 3. Le code exécutable reste dans `frontend/`, `backend/` et, lorsqu'elle sera créée, l'application mobile dans `mobile/`. Ne pas recopier le code dans `docs/sprint-3/`.

## Répartition et traçabilité

| Responsable | Livrable Sprint 3 | Jira | GitHub |
| --- | --- | --- | --- |
| Christian | Application web étudiant : catalogue, panier, commandes, historique | PMEE-28 | #62 |
| Roseline | Interfaces employé et gérant : commandes et supervision | PMEE-33 | #63 |
| Jean d'Arc | Back-office administrateur React | PMEE-34 | #64 |
| Jean d'Arc | Application mobile React Native/Expo | PMEE-29 | #65 |
| Caleb | Extensions MySQL, modèles et migrations métier | PMEE-36 | #66 |
| Aksa | RBAC avancé, politiques et API administrateur | PMEE-35 | #67 |
| Wivine | API panier, commandes, livraison, suivi et réclamations | PMEE-43 | #68 |
| Yveline | Fidélité, parrainage, événements, promotions ; **bonus paiement mobile** | PMEE-44 | #69 |

Le paiement mobile est un **bonus optionnel** : définir fournisseur, environnement sandbox, sécurité, callbacks/webhooks, statut transaction et critères de recette avant implémentation. Ne jamais ajouter de clés ou identifiants de paiement au dépôt.

## Organisation des livrables
- `01-web-etudiant/` : captures, critères de recette, documentation des parcours étudiant.
- `02-employe-gerant/` : captures et scénarios métier employé/gérant.
- `03-administration/` : parcours admin, règles de gestion et preuves de tests.
- `04-mobile/` : configuration Expo, instructions de lancement et captures.
- `05-donnees/` : schémas métier, décisions de migrations et jeux de données anonymisés.
- `06-auth-rbac/` : matrice de permissions et tests d'autorisation.
- `07-api-commandes/` : contrats d'API et exemples anonymisés.
- `08-fidelite-paiement/` : fidélité, parrainage, événements, paiement mobile optionnel.
- `09-integration-recette/` : tests bout en bout, incidents, décisions et validation inter-modules.

## Règles de dépôt
1. Chaque contribution se fait dans une branche dédiée, liée à son ticket GitHub et Jira.
2. Les modifications de code vont dans les répertoires applicatifs existants, pas dans les dossiers documentaires.
3. Une pull request indique le ticket, les changements, les tests exécutés et les dépendances.
4. Les fonctionnalités du Sprint 3 doivent réutiliser le socle du Sprint 2, sans le dupliquer.
5. Les contrats API et la matrice RBAC sont validés conjointement avant les intégrations sensibles.
6. Les documents de conception ne constituent pas une preuve de fonctionnement : joindre des résultats de tests.
