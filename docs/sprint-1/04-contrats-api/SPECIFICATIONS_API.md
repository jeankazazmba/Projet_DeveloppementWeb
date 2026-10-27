# Spécifications API — index des livrables de conception

**État au 27 octobre 2026.** Cet index remplace le fichier `0DOCUMENT_DE_CONCEPTION_TECHNIQUE___SPÉCIFICATIONS_DES_API 01`, qui ne contenait que 2 octets sans spécification exploitable. Il référence les contributions présentes ; il ne constitue pas un contrat API global validé.

## Sources disponibles

- [Documentation Back-office & Administrateur — Aksa Mbala](<Documentation_Back-office & Administrateur(API)_Mon_Miam_Miam.docx>) : proposition de 16 endpoints, conventions, permissions, modèles, tests et points à valider.
- [Diagramme UML — traitement d'une commande](Diagramme_UML_Traitement_Commande_Drawio.png).
- [Diagramme UML — validation d'une réclamation](Diagramme_UML_Validation_Reclamation_Drawio.png).
- [Issue #26 — conception des API](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/26) : coordination du trinôme et validation des contrats.
- [Architecture cible](../../ARCHITECTURE.md) et [livrables BDD](../03-base-de-donnees/) : références à rapprocher des contrats.

## Périmètre décrit par le document Word

| Module | Nombre d'endpoints proposés |
| --- | --- |
| Menu | 5 |
| Commandes | 3 |
| Réclamations | 3 |
| Comptes employés | 4 |
| Statistiques hebdomadaires | 1 |
| **Total back-office et administration** | **16** |

La proposition utilise Laravel, le préfixe `/api`, JSON et des jetons Bearer avec Sanctum. Le document présente une durée de jeton de 24 heures et la révocation du jeton courant à la déconnexion. Ces éléments décrivent la conception déposée, pas un comportement déjà implémenté ou testé.

## Consolidation nécessaire avant implémentation

- Faire relire le document par le trinôme API et préciser les contrats des autres modules, notamment inscription/connexion et création de commande côté étudiant.
- Aligner noms de champs, types, relations et contraintes avec le modèle de données.
- Confirmer les permissions, l'accès public au menu et les transitions de statut.
- Harmoniser les réponses : le document emploie notamment `{ message, data }` et un exemple statistique `{ success, data }`.
- Valider les règles de session, la devise et les calculs statistiques.
- Produire un contrat commun versionné, idéalement OpenAPI, avec exemples de requêtes, réponses et erreurs.

Le Sprint 2 suit notamment [#28 — initialisation](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/28), [#30 — migrations](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/30), [#31 — authentification](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/31) et [#32 — API menu](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/32). Aucune route applicative n'est encore disponible dans `main` au relevé.
