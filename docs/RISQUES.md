# Gestion des risques — Mon Miam Miam

État : première analyse qualitative à valider en réunion de projet. Aucun risque n'est déclaré résolu.

| Risque | Impact | Priorité indicative | Prévention / mesure d'atténuation |
| --- | --- | --- | --- |
| Périmètre trop vaste pour une équipe de six personnes et quatre semaines | Retards, fonctionnalité incomplète | Élevée | Prioriser un MVP ; tickets Jira avec critères d'acceptation, gestion des dépendances |
| Choix technologique tardif / incompatibilité front-back | Intégration difficile | Élevée | Décider la stack et documenter contrats API dès la première phase |
| Double attribution/débit de fidélité et parrainage | Incohérences financières, abus | Élevée | Calcul serveur, transactions, idempotence, audit et tests de concurrence |
| Droits mal séparés entre employé, gérant et admin | Accès non autorisé | Élevée | Matrice RBAC testée côté API ; revues renforcées |
| Perte ou fuite de données clients | Atteinte à la confiance / risque juridique | Élevée | Données minimales, chiffrement en transit, secrets hors dépôt, sauvegardes, politique de conservation |
| Commandes manquées ou états non synchronisés | Mauvais service client | Élevée | Statuts explicites, rafraîchissement fiable, messages d'erreur, reprise après panne |
| Paiement externe mal intégré (**bonus**) | Débit sans commande / transactions incohérentes | Élevée si activé | Sandbox, notification authentifiée, rapprochement, reprise idempotente |
| Données de menu et promotions obsolètes | Commandes impossibles | Moyenne | Mise à jour par employés/admin, blocage des articles indisponibles |
| Erreurs de livraison et horaires non clarifiés | Insatisfaction étudiante | Moyenne | Définir zones, adresse et heure d'arrivée avant réalisation |
| Classement des meilleurs clients trop identifiable | Exposition de données | Moyenne | Affichage pseudonymisé et décision de consentement |
| Maquette incompatible mobile/Safari/Firefox | Démonstration incomplète | Moyenne | Recette navigateurs et tailles d'écran |
| Démos ou liens manquants (Figma/Vercel/Jira) | Livrables non vérifiables | Moyenne | Centraliser URLs et responsabilités dans le README |

## Méthode de suivi

Pour chaque risque, désigner un propriétaire et revoir **probabilité, gravité, plan d'action, statut** à chaque point d'avancement. Conserver les décisions dans Jira ou les comptes-rendus.

## Budget

Le cahier demande une **analyse budgétaire à produire par l'équipe** : aucun budget ni montant d'hébergement n'est fourni. Ne pas présenter de coût prévisionnel comme approuvé. Prévoir séparément hébergement front, API, base de données, nom de domaine, outils de design et éventuels frais d'agrégateur.
