# admin

Le back-office de `app_backoffice` est intégré à l'application React commune sous `/admin`.

`AdminApp.jsx` charge ses styles uniquement pendant l'affichage du back-office. Les six écrans, leurs composants et les ressources Figma proviennent du prototype local. Les actions restent celles du prototype : elles manipulent des données de démonstration en mémoire et ne sont pas encore reliées au backend Laravel.

Les dix dossiers `--Admin` de l'export `app1-tous-les-ecran222s/screens` ont été vérifiés contre les pages et dialogues intégrés. Leurs `preview.png` et `metadata.json` sont conservés dans `frontend/public/figma-admin/`. Les fichiers SVG détaillés restent dans l'export original ; l'interface utilise déjà ses ressources optimisées dans `frontend/public/assets/figma/`.

| Export | Interface intégrée |
| --- | --- |
| `34-Tableau-de-bord--Admin` | `/admin#/dashboard` |
| `35-Gestion-des-employes--Admin` | `/admin#/employees` |
| `36-Suppression-compte--Admin` | Actions d'un employé dans `/admin#/employees` |
| `37-Suppression-compte--Admin` | Confirmation de suppression d'un employé |
| `38-Gestion-Menu--Admin` | `/admin#/menu` |
| `39-Modifier-un-plat--Admin` | Panneau de modification d'un plat |
| `40-Gestion-promo-event--Admin` | `/admin#/promotions` |
| `41-Creer-un-event--Admin` | Panneau de création d'une affiche ou d'un événement |
| `42-suivi-des-reclamations--Admin` | `/admin#/claims` |
| `43-Parametres--Admin` | `/admin#/settings` |

Ne pas dupliquer cet espace dans `student/`, `employee/` ou `manager/`, qui appartiennent aux autres membres de l'équipe.
