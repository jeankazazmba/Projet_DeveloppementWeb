# Décisions techniques — Sprint 2 / Issue #28

## Choix de départ à confirmer en revue

- Backend : PHP 8.2+ et Laravel 12.
- Authentification API : Laravel Sanctum 4.
- Base de données cible : MySQL 8+.
- Frontend : React + Vite, géré séparément par Christian.
- Communication : JSON via HTTP, préfixe `/api`.

Ces choix sont des propositions d'implémentation cohérentes avec les spécifications API du Sprint 1 ; ils ne constituent pas une validation collective définitive.

## Périmètre de l'initialisation

1. Application Laravel démarrable après installation des dépendances.
2. Configuration locale et modèle de fichier `.env.example`.
3. Point de contrôle public `GET /api/health`.
4. Configuration CORS pour le frontend local.
5. Tests de base et consignes de revue.

## À valider avec l'équipe

- Contrats API définitifs : routes, formats JSON, statuts d'erreur.
- Schéma MySQL final de Caleb et contraintes d'intégrité.
- Stratégie Sanctum (SPA avec cookies ou jetons API), politique de sessions et CSRF.
- URL et origine exactes du frontend en développement et en production.
- Gestion des environnements de déploiement.

Aucune donnée métier ni aucun compte réel n'est ajouté à ce stade.
