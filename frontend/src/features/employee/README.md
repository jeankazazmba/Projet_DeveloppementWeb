# Espace employé

L'application web employé se trouve sous `/employe` et s'ouvre depuis le profil Employé du portail `/acces`. Son interface est conçue d'abord pour téléphone : navigation basse, cartes de commandes et formulaires sur une colonne. Sur grand écran, elle reprend la barre latérale et les panneaux des exports Figma `--Employe`.

| Export local | Route | Actions de démonstration |
| --- | --- | --- |
| `24-Gestion-des-commandes--Employe` | `/employe/commandes` | Rechercher, filtrer et faire avancer une commande dans l'ordre Reçue → En préparation → Prête → Livrée. |
| `26-Mise-a-jour-du-menu--Employe` | `/employe/menu` | Chercher un plat, modifier sa disponibilité, choisir le plat du jour, annuler ou enregistrer les changements. Prix en lecture seule. |
| `27-Traitement-des-recalamtions--Employe` | `/employe/reclamations` | Filtrer, prendre en charge, rédiger une réponse de 500 caractères maximum et la soumettre au gérant. |
| `28-Statistiques--Employe` | `/employe/statistiques` | Consulter trois semaines de données de maquette et leurs graphiques. |

Les commandes, le menu et les réclamations sont conservés dans le stockage local du navigateur pour la démonstration. Ils ne sont pas synchronisés avec les espaces gérant/admin ni avec une base de données. La soumission d'une réponse ne contacte pas le client ou le gérant ; elle prépare seulement l'état local à raccorder à l'API commune.
