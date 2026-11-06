# Audit des pull requests — 6 novembre 2026

Audit basé sur les métadonnées et contrôles GitHub Actions ; **ne remplace pas une revue exhaustive du code ou des tests manuels**.

| PR | Auteur | Périmètre | Contrôles constatés | Décision |
| --- | --- | --- | --- | --- |
| [#60](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/60) | Wivine | Contrats API (12 fichiers) | Aucun check renvoyé ; fusionnabilité indéterminée au relevé ; conflit constaté antérieurement | Rebaser et relire avant fusion |
| [#79](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/79) | Wivine | Rôles/accès restaurant (3 fichiers) | Contrôle de conventions en échec ; placement PSR-4 des classes à corriger | Corriger puis tester avant fusion |
| [#80](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/80) | Jean d'Arc | Site public, administration, mobile (1041 fichiers) | Brouillon ; conventions réussies ; lint/build React en échec | **Ne pas fusionner** avant CI verte et recette |
| [#83](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/83) | Aksa | Authentification (13 fichiers) | Conventions réussies ; tests backend non attestés | Revue sécurité et tests avant fusion |
| [#84](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/84) | Yveline | Fidélité/promotions (9 fichiers) | Conflits GitHub (dirty) ; aucun check renvoyé | Résoudre conflits, tests métier avant fusion |

## Ordre de mise en commun proposé

1. Stabiliser les contrats API et les schémas de données, identifier les écarts de conception.
2. Intégrer l'authentification et le contrôle d'accès côté Laravel après tests.
3. Résoudre les conflits de fidélité/promotions et tester les règles métier.
4. Corriger la CI du frontend de #80, distinguer fichiers générés/dépendances du code source et revoir les 1041 fichiers.
5. Vérifier l'intégration API sur les quatre espaces web et Expo, les permissions et les erreurs réseau.
6. Démontrer les parcours critiques, collecter les résultats de tests, documenter les limitations et fusionner les PR prêtes.

## Statuts historiques

PR [#81](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/81) et [#82](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/82) : documentation Sprint 2 fusionnée. Une PR fusionnée ne prouve pas automatiquement tous les critères métier des issues associées.
