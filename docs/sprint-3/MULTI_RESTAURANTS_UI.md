# Interfaces multi-restaurants — état de la démonstration

Les interfaces proposent deux établissements : ZeDuc-Sp@ce et un restaurant partenaire **fictif**. Deux articles fictifs permettent de tester le filtre de catalogue et l’interdiction de mélanger des restaurants dans un panier. Les nouveaux restaurants créés dans l’espace « Admin plateforme » sont enregistrés dans le `localStorage` de ce navigateur ; leur menu est vide.

- Site public : liste consultable, localisation, horaires, accès au menu filtré, restaurant affiché sur les plats, offres et événements.
- Étudiant mobile : filtre « tous les plats » ou un restaurant, restaurant affiché sur les plats et commandes, panier limité à un restaurant avec confirmation avant sa remise à zéro.
- Employé et gérant web : restaurant de travail visible, données locales séparées par identifiant d’établissement. Les statistiques et cartes du restaurant fictif affichent un état vide.
- Employé mobile : choix de l’établissement en entrant dans l’espace, stockage local séparé, statistiques vides pour le restaurant fictif.
- Administrateur restaurant : l’interface actuelle reste celle de ZeDuc-Sp@ce. L’admin plateforme dispose d’un écran distinct de création et de suivi des fiches d’établissements.
- Tauri : choix du restaurant après le rôle et l’écran de connexion de démonstration, seulement pour les rôles ayant deux établissements dans leur profil d’exemple.

## Raccordement nécessaire avant un usage réel

L’API doit fournir les restaurants, les affectations de comptes et les droits, puis filtrer côté serveur les commandes, menus, stocks, tables, livreurs, réclamations, statistiques, promotions et événements par `restaurant_id`. La création d’un restaurant, l’activation et le changement de contexte doivent être autorisés par le backend. Les interfaces actuelles ne constituent pas un contrôle d’accès. Les données `localStorage` du navigateur, du WebView Tauri et de l’application Expo ne se synchronisent pas entre elles.
