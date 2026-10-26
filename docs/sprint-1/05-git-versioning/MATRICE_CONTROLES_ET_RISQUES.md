# Matrice de contrôles Git, sécurité et risques — PMEE-5

**État documentaire :** 26/10/2026. Cette matrice définit des contrôles attendus ; elle ne certifie pas leur activation.

| Risque | Mesure proposée | Preuve attendue | Statut |
| --- | --- | --- | --- |
| Push direct sur `main` | PR obligatoire par convention, revue d'un pair | Historique des PR et approbations | Convention documentée, protection technique non activée |
| Changements non traçables | Branches et commits liés à Issue/Jira | Liens commits, PR et tickets | Procédure documentée |
| Fusion sans revue | Demander un autre membre | Approbation GitHub explicite | À vérifier PR par PR |
| Secret dans le dépôt | Exclure `.env`, jetons, données privées ; vérifier diff | Contrôle manuel, scanner si ajouté | Politique documentée ; scan automatisé non attesté |
| Code cassé | Exécuter tests, lint et build sur PR | Logs et statut des workflows | CI applicative non confirmée |
| Désaccord Figma / API / BDD | Revue croisée et décisions consignées | PR, documents et Issues liés | À exécuter par les équipes |
| Intégration Jira défaillante | Tester PMEE-5 dans panneau Development | Capture Jira et référence PR #48 | Non vérifié |
| Perte de traçabilité | Commenter Issue après dépôt et fusion | Liens de livraison, auteur, date | Modèle disponible |

## Contrôles à appliquer immédiatement
- [ ] Chaque nouvelle PR cite son Issue et le ticket Jira, si connu.
- [ ] Chaque PR est relue par un autre membre.
- [ ] Les tests réellement exécutés sont indiqués ; les tests indisponibles sont signalés.
- [ ] Les changements sensibles (authentification, permissions, données) reçoivent une revue renforcée.
- [ ] Les décisions sont conservées dans `docs/DECISIONS.md` ou l'Issue correspondante.
- [ ] Le test Jira–GitHub est réalisé et documenté.
- [ ] Une solution de protection de `main` est réévaluée si le plan GitHub évolue.

## Indicateurs de suivi proposés
- Nombre de PR ouvertes / fusionnées / en attente de revue.
- Part des PR avec Issue et Jira référencés.
- Nombre de livrables Sprint 1 déposés et approuvés.
- Nombre de PR avec tests ou justification d'absence.
- Délai de revue, à mesurer une fois les premiers cas documentés.

Ne pas publier de pourcentage ou de résultat sans relevé vérifiable. Les droits `write` n'impliquent pas qu'un membre ait livré son travail.
