# Espace gérant web

Routes : `/gerant` (supervision), `/gerant/equipe`, `/gerant/equipe/nouveau`, `/gerant/statistiques`, `/gerant/reclamations`.

Intégration des cinq exports locaux `--Gerant` : supervision, équipe, ajout d'employé, statistiques et réclamations. Les aperçus de référence et le logo sont dans `frontend/public/figma-manager/`.

Le backend commun ne fournit encore que `/api/health`. Les commandes et statistiques sont donc des exemples issus des maquettes. Les modifications d'employés et de réclamations sont conservées dans le navigateur via `localStorage`; elles ne créent aucun compte réel, n'envoient aucun message client et n'accordent aucun avoir réel. L'export CSV porte sur ces données de démonstration.
