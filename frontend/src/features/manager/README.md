# Espace gérant web

Routes : `/gerant` (supervision), `/gerant/equipe`, `/gerant/equipe/nouveau`, `/gerant/tables`, `/gerant/menu`, `/gerant/statistiques`, `/gerant/reclamations`.

Intégration des cinq exports locaux `--Gerant` : supervision, équipe, ajout d'employé, statistiques et réclamations. Les aperçus de référence sont dans `frontend/public/figma-manager/`. L'interface reprend le logo, la typographie Poppins, la palette, la navigation, les cartes et les modes clair/sombre du back-office administrateur. La préférence de thème est partagée dans `localStorage` sous `mon-miam-miam-theme`.

Le backend commun ne fournit encore que `/api/health`. Les commandes et statistiques sont donc des exemples issus des maquettes. Les modifications d'employés et de réclamations sont conservées dans le navigateur via `localStorage`; elles ne créent aucun compte réel, n'envoient aucun message client et n'accordent aucun avoir réel. L'export CSV porte sur ces données de démonstration.

Le plan des tables et le menu de service complètent les deux entrées qui étaient inactives. Le gérant peut modifier localement l'état d'une table, lier une commande sur place, signaler l'indisponibilité d'un plat et le mettre à la une. Les objets conservent les identifiants et champs attendus par les écrans admin ; ces données locales ne sont pas encore synchronisées entre les rôles et seront remplacées par les ressources API communes.
