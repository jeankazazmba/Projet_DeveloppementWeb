# Livrables API — Sprint 1 (Issue #26)

Dossier de conception de l'équipe API : Yveline, Aksa et Wivine. Les documents sont des propositions de conception à relire et valider collectivement avant l'implémentation. Ils ne décrivent pas une API déjà déployée.

## Documents déposés

| Fichier | Contenu |
| --- | --- |
| `conventions_communes_des_API.pdf` | Conventions proposées pour les échanges API et l'intégration des modules. |
| `openapi.yaml` | Contrat OpenAPI provisoire des routes, rôles, paramètres, corps et erreurs des modules. |
| `cycle-de-parrainage.drawio` | Source éditable du diagramme de validation du code et d'attribution de la récompense après la première commande réussie. |
| `points-de-fidelite.drawio` | Source éditable du parcours de consultation et d'utilisation des points. |
| `gestion_des_risques.pdf` | Analyse générale des risques du projet, à valider avec l'équipe. |
| `analyse_du_budget.pdf` | Estimation budgétaire prévisionnelle, à valider avec l'équipe. |

Les diagrammes sont au format XML diagrams.net et peuvent être ouverts dans diagrams.net. Le contrat OpenAPI est une proposition de conception, pas une description d'une API déjà disponible.

## Vérification du contrat OpenAPI

Le `27/10/2026`, `openapi.yaml` a été validé avec `openapi-spec-validator 0.9.0` : OpenAPI `3.1.0`, 29 chemins et 12 tags. Cette validation confirme la structure du contrat; elle ne remplace pas la revue des règles métier et des permissions par l'équipe.

## Contributions

Les fichiers reçus ne précisent pas la contribution individuelle de chaque membre. Yveline, Aksa et Wivine doivent indiquer leur répartition respective dans le commentaire de l'Issue #26 lors de la demande de validation.

## Limites et décisions à valider

- Les conventions, le contrat OpenAPI et les diagrammes sont à valider par l'équipe avant implémentation.
- Les chemins français du contrat restent à harmoniser avec les exemples anglais du PDF de conventions.
- Le paiement en ligne et ses webhooks sont documentés comme bonus facultatif, pas comme exigence du MVP.
- Les montants, règles de calcul, statuts et conditions métier doivent être validés avant développement.
- La récompense de parrainage doit être déclenchée côté serveur après la première commande réussie; aucun endpoint client de récompense n'est exposé.
- Le budget et la gestion des risques couvrent le projet dans son ensemble; ils ne sont pas des contrats API.

Le PDF budgétaire présente une incohérence de devise entre sa couverture (CDF) et ses hypothèses (USD) ; ce point reste à corriger avant validation.
