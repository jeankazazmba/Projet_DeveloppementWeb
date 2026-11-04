# Administration de la plateforme ZeDuc-Sp@ce

**Objet :** définir le rôle, les écrans, les règles métier et l'ordre de réalisation de l'administration **de toute la plateforme** Mon Miam Miam. **Relevé :** 4 novembre 2026. Les restaurants de démonstration sont **Khalifa_food** et **sleepy hollow**.

## 1. Ce que demande réellement le cahier

Le cahier V1.0.2 décrit un **administrateur de la direction d'un restaurant** : comptes employés, menu, statistiques des ventes et commandes, fidélité/parrainage, promotions/événements/affiches de jeux, réclamations et paramètres (horaires, politiques). Il précise seulement que l'application doit pouvoir accueillir **plusieurs restaurants à terme**. Il ne définit ni rôle « administrateur de plateforme », ni écrans de supervision inter-restaurants, ni modèle commercial SaaS. Le paiement en ligne est un **bonus non obligatoire**.

Le présent espace `/plateforme` est donc une **extension multi-restaurants demandée après le cahier**. Les fonctions sans équivalent dans la source sont marquées **Proposition** et doivent être validées comme règles métier avant une mise en production. L'espace `/admin` reste l'administration **d'un restaurant actif** ; sa spécification détaillée est dans [SPEC_FONCTIONNELLE_ADMIN.md](SPEC_FONCTIONNELLE_ADMIN.md).

| Origine | Besoin | Conséquence pour l'admin plateforme |
| --- | --- | --- |
| Cahier | Un admin de restaurant gère employés, menu, campagnes, réclamations, paramètres et statistiques. | La plateforme ne doit pas mélanger ces données ni remplacer le responsable de chaque restaurant. |
| Cahier | Évolutivité vers plusieurs restaurants. | Prévoir des établissements identifiés et des données séparées. |
| Demandes ultérieures | ZeDuc-Sp@ce est la plateforme ; Khalifa_food et sleepy hollow sont deux restaurants ; comptes éventuellement multi-affectés. | Créer/activer les restaurants, gérer les affectations, afficher un périmètre clair et superviser l'ensemble. |
| Proposition | Gouvernance, audit, support, alertes, indicateurs globaux. | Ajouter ces modules progressivement, selon les opérations réellement retenues. |

## 2. Mission et limites du rôle

L'admin plateforme crée et maintient les **établissements**, attribue les **accès**, contrôle leur publication et voit des indicateurs **agrégés**. Il peut consulter une fiche ou un incident d'un restaurant avec une trace d'accès. Le contenu éditorial, les commandes courantes et les décisions de service appartiennent d'abord aux équipes de ce restaurant.

Une personne peut être admin plateforme et avoir aussi une affectation locale, mais l'interface doit afficher clairement **dans quel rôle elle agit**. L'ouverture d'une fiche de restaurant depuis `/plateforme` ne doit pas devenir silencieusement une session `/admin` de cet établissement. Un mode d'assistance temporaire, s'il est retenu, exige un motif, une durée et un journal d'audit.

### Droits proposés

| Action | Admin plateforme | Admin restaurant | Gérant | Employé |
| --- | --- | --- | --- | --- |
| Créer, publier, suspendre un restaurant | Oui | Non | Non | Non |
| Créer une affectation ou nommer un admin restaurant | Oui | À définir pour ses propres employés | Selon droits locaux | Non |
| Voir les agrégats de tous les restaurants | Oui | Non | Non | Non |
| Modifier menu, promotions et jeux d'un restaurant | Assistance tracée seulement, si validée | Oui | Selon droits locaux | Disponibilité temporaire seulement |
| Traiter une commande ou réclamation courante | Escalade exceptionnelle seulement | Oui selon politique locale | Oui | Selon droits locaux |
| Modifier les paramètres globaux de la plateforme | Oui | Non | Non | Non |

**Règle ferme :** l'API vérifie le rôle et l'affectation à chaque lecture ou écriture. Cacher un bouton ne constitue pas une autorisation. Les routes publiques ne retournent que les restaurants et contenus publiés.

## 3. Architecture des écrans

| Rubrique `/plateforme` | Écran et actions attendues | Origine | Priorité |
| --- | --- | --- | --- |
| Vue d'ensemble | Nombre d'établissements par état, activité globale datée, commandes/incidents si leurs API existent ; liens vers les listes filtrées. Ne pas additionner les chiffres de démo à ceux du serveur. | Proposition dérivée du multi-restaurants | P1 pour états ; P2 pour ventes |
| Restaurants | Rechercher/filtrer, créer une fiche en brouillon, modifier identité/localisation/horaires, prévisualiser la fiche publique, publier, suspendre et archiver selon les règles validées. | Demande ultérieure | P1 |
| Détail d'un restaurant | Résumé, état, contacts, propriétaire/responsable, affectations, contenus publiés/brouillons, intégrations et historique des changements. | Proposition | P1 |
| Comptes et affectations | Rechercher un compte, inviter/créer, associer un ou plusieurs restaurants avec rôle, modifier ou révoquer chaque affectation, suspendre un compte, voir sa dernière activité. | Cahier pour employés ; demande ultérieure pour multi-affectation | P1 |
| Catalogue et publications | Vue globale filtrable par restaurant et type (plat, promotion, événement, jeu), état de publication, dates, contrôle des contenus incomplets. L'édition normale reste dans l'espace restaurant. | Cahier + demande ultérieure | P2 |
| Commandes et service | Synthèse inter-restaurants et accès en lecture au détail autorisé ; alertes de blocage ou de retard. Corrections exceptionnelles seulement avec motif et historique. | Proposition, adossée aux commandes du cahier | P2 |
| Réclamations et support | File des escalades inter-restaurants, attribution, suivi des délais, résolution et retour à l'établissement. Les dossiers ordinaires restent chez le gérant/admin local. | Proposition, dérivée du suivi des réclamations | P2 |
| Fidélité et parrainage | Vue globale des mouvements et anomalies ; configuration **globale ou locale à décider**. Les corrections doivent créer un mouvement traçable, jamais écraser un solde. | Cahier pour admin restaurant ; proposition pour global | P2 |
| Rapports et exports | Comparaison par période et restaurant, définitions stables des indicateurs, export daté et limité aux droits. | Proposition, dérivée des statistiques | P2 |
| Intégrations et santé | État de l'API, synchronisation des catalogues, erreurs et tâches en attente ; afficher distinctement démo, sandbox et production. | Proposition technique | P1 simple, P3 avancée |
| Sécurité et audit | Historique des connexions et mutations sensibles, révocation des sessions, configuration des politiques d'accès ; jamais d'affichage de mot de passe. | Proposition nécessaire à la gouvernance | P1 pour audit minimal |
| Paramètres plateforme | Nom/marque ZeDuc-Sp@ce, contacts de support, règles de visibilité, notifications, textes juridiques validés ; ne pas confondre avec les horaires d'un restaurant. | Proposition | P2 |

**Navigation proposée :** Vue d'ensemble → Restaurants → Comptes & accès → Catalogue → Commandes → Réclamations → Rapports → Intégrations → Audit → Paramètres. Les modules P2 peuvent rester cachés tant que leurs données serveur n'existent pas ; une carte avec des chiffres inventés ne doit pas paraître « temps réel ».

## 4. Parcours métier à rendre explicites

### 4.1 Création et publication d'un restaurant

1. L'admin plateforme crée une fiche **brouillon** avec identifiant stable, nom et localisation. Les informations manquantes sont visibles.
2. Il affecte au moins un admin restaurant, puis celui-ci complète contacts, horaires, menu et conditions d'exploitation.
3. Une prévisualisation montre exactement ce que le site et le mobile étudiant afficheront. Les contenus privés restent cachés.
4. La publication est confirmée et horodatée ; le restaurant devient visible dans le répertoire. Une suspension retire la possibilité de nouvelles commandes selon la règle à valider, sans effacer historiques, reçus ou réclamations.
5. Les changements d'état inscrivent acteur, date, motif et ancien/nouvel état.

**États proposés :** `brouillon → à vérifier → actif → suspendu → archivé`. Le code actuel ne possède que `is_public` côté API et `Brouillon/Exemple/Actif/Suspendu` côté démo locale. Le modèle définitif et les transitions doivent être décidés avant migration.

### 4.2 Création et affectation d'un utilisateur

1. Chercher l'e-mail pour éviter un compte doublon ; créer/inviter seulement si absent.
2. Sélectionner le restaurant et le rôle (`admin`, `manager`, `employee`) ; montrer les permissions résultantes.
3. Ajouter une deuxième affectation sans copier les données du premier restaurant.
4. Révoquer ou suspendre un accès avec confirmation et journal ; le compte conserve ses anciennes actions dans l'historique.

Le formulaire actuel de `/catalogue-pro` demande un mot de passe initial. **Proposition :** remplacer ce mécanisme par une invitation à définir le mot de passe ; éviter de transmettre un mot de passe en clair. L'e-mail de contact du projet n'étant pas encore actif, l'envoi réel doit attendre un canal confirmé.

### 4.3 Escalade et intervention

Le restaurant traite ses commandes et réclamations. Un dossier marqué « escaladé à la plateforme » porte restaurant, motif, pièces, responsable, échéance et chronologie. L'admin plateforme peut demander des précisions, assigner un responsable ou clore l'escalade. Toute correction de paiement ou de points nécessite une opération serveur idempotente et auditée ; la plateforme ne modifie jamais ces montants uniquement dans le navigateur.

### 4.4 User stories prioritaires

| ID | En tant qu'admin plateforme, je veux… | Terminé lorsque… |
| --- | --- | --- |
| PLAT-01 | voir tous les restaurants et leur état | la liste vient du serveur, se filtre et distingue brouillon, actif et suspendu. |
| PLAT-02 | créer un établissement sans l'exposer immédiatement | la fiche est enregistrée en brouillon et absente du site/mobile public. |
| PLAT-03 | affecter un responsable à un restaurant | le compte voit seulement ses restaurants autorisés après connexion. |
| PLAT-04 | publier ou suspendre une fiche avec motif | la visibilité publique change et l'action apparaît dans l'audit. |
| PLAT-05 | comparer l'activité des restaurants sur une période | les totaux proviennent des mêmes commandes confirmées, sans données de démo mélangées. |
| PLAT-06 | traiter une escalade sans intervenir dans le service courant | le dossier garde restaurant, responsable, décision, auteur et dates. |

## 5. Données et API à structurer

Le socle actuel comprend `users`, `restaurants`, `restaurant_user`, `restaurant_contents` et les jetons Sanctum. Il expose la connexion, le catalogue public, la lecture/écriture professionnelle contrôlée des contenus, `POST/PATCH /api/platform/restaurants`, `POST /api/platform/users` et `PUT /api/platform/restaurants/{restaurant}/members/{user}`. Ce socle **ne couvre pas** encore la liste privée filtrable des comptes, la révocation d'affectation, l'audit, les commandes, les réclamations ou les statistiques globales.

| Ressource à prévoir | Champs/règles minimaux | Usage plateforme |
| --- | --- | --- |
| Restaurant | `id`, nom, état, visibilité, lieu, horaires, contacts, responsable, dates | Répertoire et cycle de vie |
| Affectation | utilisateur, `restaurant_id`, rôle, état, dates, auteur | Autorisation et multi-affectation |
| Journal d'audit | acteur, rôle, restaurant éventuel, action, cible, date, motif et changements utiles | Traçabilité |
| Commande | `restaurant_id`, lignes/prix figés, statuts, montant, service, dates | Agrégats et escalades |
| Réclamation | `restaurant_id`, commande, auteur, responsable, statut, réponse, dates | Support et suivi |
| Mouvement de fidélité | utilisateur, restaurant ou portefeuille global **à décider**, points, cause, référence unique | Correction et statistiques |
| Paiement, seulement si retenu | commande, prestataire, référence, devise, état confirmé côté serveur | Rapprochement, sans prétendre à un encaissement réel |

**Contrat API proposé, non implémenté :** listes paginées et filtrées sous `/api/platform/restaurants`, `/api/platform/users`, `/api/platform/assignments`, `/api/platform/audit`, puis `/api/platform/metrics` et `/api/platform/escalations` une fois les ressources métier créées. Prévoir réponses 401/403/404, validation de données, confirmation des mutations, pagination, dates et identifiants stables. Les routes de l'admin local restent sous `/api/staff/restaurants/{restaurant}/…` ; un `restaurant_id` du corps de requête ne remplace jamais celui de l'URL autorisée.

**Isolation :** tout plat, événement, jeu, promotion, commande ou réclamation possède un restaurant propriétaire. Une liste globale de plateforme peut agréger ces lignes, mais chaque élément indique toujours son restaurant. Le changement de restaurant dans les autres applications recharge leur périmètre ; la plateforme n'utilise pas ce sélecteur pour masquer artificiellement une réponse serveur non filtrée.

## 6. État avant l'implémentation P1/P2 du 4 novembre 2026

| Capacité | Présent | Manquant pour l'espace plateforme complet |
| --- | --- | --- |
| Vue `/plateforme` | Liste et création de fiches, changement de statut, compteurs de restaurants en `localStorage`. | Session API, données serveur, détail, filtres, audit, validation des états. |
| Catalogue `/catalogue-pro` | Connexion API si configurée ; sélection du restaurant ; CRUD de plats/promotions/événements/jeux ; création de restaurant et de compte pour admin plateforme ; publication. | Intégrer ce flux dans la navigation plateforme et remplacer les doublons locaux ; UX d'invitation et de gestion des affectations. |
| API Laravel | Vérification `is_platform_admin` pour création/modification de restaurant et création/affectation d'utilisateur ; contrôle d'accès au contenu par restaurant. | Listes privées et mises à jour/révocation de comptes, états complets, audit, métriques et ressources métier. |
| Démo multi-restaurants | Khalifa_food et sleepy hollow avec des contenus distincts sur site/mobile, dans les espaces de démo et le seeder. | Synchronisation serveur des commandes, réclamations, paramètres et statistiques ; données réelles. |
| Tauri | Écran de rôle puis choix du restaurant pour les profils multi-affectés en démo. | Connexion réelle commune et contrôle des droits dans tous les espaces. |

L'implémentation P1/P2 et les limites des flux encore non raccordés sont décrites dans [IMPLEMENTATION_P1_P2.md](IMPLEMENTATION_P1_P2.md). Les totaux affichés par les écrans admin/gérant restent des exemples locaux et ne doivent pas être additionnés pour former des « ventes globales ».

## 7. Ordre de réalisation recommandé

| Lot | Résultat vérifiable | Dépendance |
| --- | --- | --- |
| P1. Session unique et droits | `/plateforme` refuse l'accès hors admin plateforme ; rôle et session sont les mêmes que dans `/catalogue-pro`. | Authentification Sanctum existante, stockage de session à revoir. |
| P1. Répertoire connecté | Créer, modifier, publier/suspendre et consulter les restaurants depuis la même API ; les deux démos restent distinguées des données de production. | États et validations métier. |
| P1. Affectations et audit | Voir, attribuer et révoquer les accès par restaurant ; chaque mutation sensible est tracée. | Routes de liste/révocation et politique d'autorisation. |
| P2. Contenus communs | Unifier publication entre `/admin`, `/plateforme` et `/catalogue-pro` ; prévisualiser site/mobile. | Source de catalogue commune. |
| P2. Opérations et supervision | Créer commandes/réclamations partagées, puis des métriques globales dérivées de transactions réelles. | Parcours étudiant/employé/gérant reliés au backend. |
| P2. Fidélité et parrainage | Décider portée des points, versionner les règles et rendre les corrections auditables. | Commandes confirmées et décisions métier. |
| P3, facultatif | Paiement réel, facturation/abonnement des restaurants, GPS temps réel, automatisations avancées. | Décision produit, prestataires, budgets et recette. |

## 8. Recette minimale

1. Un admin restaurant de Khalifa_food ne peut ni ouvrir ni modifier les contenus privés de sleepy hollow, même avec une URL ou un ID de contenu deviné ; l'admin plateforme voit les deux avec le rôle approprié.
2. Un restaurant en brouillon n'apparaît ni dans le répertoire public ni dans les menus mobiles ; après publication, ses plats et activités apparaissent uniquement sur sa fiche.
3. Un compte affecté aux deux restaurants choisit son contexte ; retirer son affectation sleepy hollow supprime immédiatement cet accès sans toucher à son accès Khalifa_food.
4. La suspension d'un restaurant bloque les nouvelles opérations définies par la politique choisie et préserve l'historique des commandes, paiements et réclamations.
5. Les nombres globaux sont calculés sur une période explicite et peuvent être rapprochés des totaux par restaurant ; aucun chiffre de démo n'est présenté comme réel.
6. Une modification sensible indique son auteur, sa date et son motif dans l'audit ; une erreur API affiche un échec au lieu d'un succès local trompeur.

## 9. Décisions à valider avant le backend complet

- **Portée de la fidélité et du parrainage :** points par restaurant ou portefeuille commun, et effet d'une commande dans un autre établissement.
- **Cycle de vie d'un établissement :** pièces/conditions requises avant publication, suspension, recours et archivage.
- **Droits d'intervention de la plateforme :** consultation seule ou assistance modifiant les données d'un restaurant, avec quelles preuves et quel délai.
- **Règles financières :** paiement en ligne facultatif, commissions/abonnements non mentionnés dans le cahier, remboursements et rapprochement éventuels.
- **Données personnelles :** durée de conservation, export, suppression, accès au classement étudiant et textes légaux selon le pays d'exploitation confirmé.
- **Informations réelles :** adresses, horaires, tarifs, contacts et identité des deux restaurants sont encore des exemples.

## Sources vérifiées

- `C:/Users/jeank/Downloads/CAHIER DE CHARGE PROJET Mon Miam Miam.docx`, notamment « Espace Administrateur », « Fidélité et Parrainage » et l'exigence d'évolutivité vers plusieurs restaurants.
- [Synthèse du cahier](../../CAHIER_DES_CHARGES.md) et [spécification admin restaurant](SPEC_FONCTIONNELLE_ADMIN.md).
- `frontend/src/features/platform/PlatformAdminApp.jsx`, `frontend/src/features/shared/StaffCatalog.jsx`, `backend/routes/api.php`, `backend/app/Http/Controllers/Api/PlatformRestaurantController.php` et `PlatformUserController.php`.
