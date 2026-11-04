# Audit du cahier des charges et des interfaces — 4 novembre 2026

## Périmètre et règle de lecture

Source métier : `CAHIER DE CHARGE PROJET Mon Miam Miam.docx`, version 1.0.2 du 16 septembre 2024, 17 pages. Les identifiants ci-dessous correspondent à la [synthèse structurée](../CAHIER_DES_CHARGES.md). Audit du code présent sur la branche `feature/sprint-3-frontend-features`, sans lancement ni compilation. Il constate les écrans et leur logique visible dans le dépôt ; il ne valide pas leur comportement sur appareil ou navigateur.

**Interface présente** signifie qu'un parcours peut être parcouru avec des données locales. **Fonction métier complète** exige des comptes vérifiés, une base commune, des API et des échanges entre les rôles. À ce jour, les interfaces restent principalement des démonstrations indépendantes. Le backend expose seulement `GET /api/health` dans [`backend/routes/api.php`](../../backend/routes/api.php).

Le cahier situe le restaurant à **Yansoki, Douala (Cameroun)** et prévoit une **application web** comme livrable principal ; le mobile est une extension possible. Le paiement en ligne est explicitement un **bonus non obligatoire** dans les livrables. Les montants de l'interface sont en FCFA.

## Étudiant

| Exigence | Écran / interaction présents | Ce qui manque pour satisfaire le cahier |
| --- | --- | --- |
| ETU-01 Compte et profil | Connexion, inscription, mot de passe oublié et profil dans `mobile/src/App.js` ; portail d'accès web dans `frontend/src/features/public/AccessPortal.jsx`. | Authentification réelle, comptes persistés au serveur, réinitialisation du mot de passe, téléphone et localisation à l'inscription, vérification de la règle de mot de passe du cahier. La connexion mobile accepte tout mot de passe non vide. |
| ETU-02 Accueil, menu, promotions, événements | Site public `/`, `/menu`, `/promotions` ; accueil/menu/découverte dans `mobile/src/App.js` et `mobile/src/Discover.js`. | Publication depuis une source commune, horaires/disponibilités et dates réels. Les contenus et prix actuels sont des données de démonstration. |
| ETU-03 Panier et commande | Catalogue, détail, panier mobile et confirmation locale ; panier flottant déplaçable. | Création de commande par API, validation des prix et stocks côté serveur, réception par l'employé. **Aucun parcours étudiant web de commande** n'est routé dans `frontend/src/App.jsx`. |
| ETU-04 Sur place / livraison | Choix du mode, heure via sélecteur natif et adresse dans le checkout mobile. | Créneaux/zone de livraison vérifiés, affectation livreur, frais calculés par serveur, statut de service partagé. |
| ETU-05 Suivi, historique, commentaire | Liste/détail des commandes locales et carte de suivi illustrative. | Statuts réellement synchronisés, détails de paiement réels, preuve de livraison/service et commentaire après commande terminée. Les positions du livreur sont fictives. |
| ETU-06 Fidélité | Solde et remise simulés dans le mobile ; règles modifiables à l'écran admin. | Calcul/attribution/débit transactionnels, solde commun, remboursement/annulation et règles validées. Le mobile affiche **10 pts par 1 000 FCFA et 10 pts = 100 FCFA**, alors que l'admin initialise **1 pt par 1 000 FCFA et 15 pts = 1 000 FCFA** : ce sont des exemples divergents, à harmoniser avant intégration. |
| ETU-07 Parrainage | Écran de code, partage et gain local de 50 points. | Génération/validation côté serveur, lien parrain/filleul, crédit **après première commande réussie seulement**, attribution unique. Aujourd'hui un code quelconque crédite la démo immédiatement. |
| ETU-08 Réclamation | Formulaire et historique mobiles avec pièces jointes locales. | Envoi et suivi via API commune ; traitement salarié → validation gérant → décision visible par l'étudiant. |
| ETU-09 Jeux / événements | Rubrique de découverte et roue locale. | Événements publiés et inscriptions réelles, règles de jeu approuvées, récompenses contrôlées côté serveur. |
| ETU-10 Top 10 jour/semaine/mois | Écran de classement mobile avec filtres visuels. | **10 clients classés selon le nombre de commandes** sur la période choisie. Actuellement 5 profils illustratifs triés par **points**, et les filtres ne modifient pas les données. Confidentialité des noms à définir. |
| ETU-11 Cookies | Bandeau de consentement sur le site public, choix conservé en `localStorage`. | Politique de confidentialité finalisée et liaison du choix aux éventuels traceurs réellement utilisés. Cette exigence concerne avant tout le web. |

**Point bloquant de périmètre web :** le dossier `frontend/src/features/student/` est documentaire, et `frontend/src/App.jsx` ne route aucun espace étudiant authentifié. Le parcours de commande étudiant n'existe que dans l'application mobile de démonstration, alors que le web est le périmètre principal du cahier. Ce dossier est réservé à d'autres membres selon la répartition de l'équipe ; l'audit ne demande pas de modifier leur travail ici.

## Employé

| Exigence | Présent dans `frontend/src/features/employee/` et/ou `mobile/src/EmployeeApp.js` | Manque |
| --- | --- | --- |
| EMP-01 Connexion et commandes | Espace employé web et mobile, liste/filtres de commandes. | Authentification et contrôle du rôle ; arrivée des vraies commandes étudiantes. Le changement d'espace mobile est libre en démo. |
| EMP-02 Préparation, états, validation | Actions de progression et indicateurs. | Transitions autorisées et horodatées par API ; notification client/gérant et mise à jour du stock. |
| EMP-03 Menu temporaire | Disponibilité et « plat du jour » éditables localement. | Publication commune, droits limités, cohérence avec le menu administrateur et le catalogue étudiant. |
| EMP-04 Réclamations | Consultation, prise en charge et proposition de réponse dans le web ; parcours équivalent mobile. | Transmission effective au gérant, approbation/rejet sur le même dossier et réponse au client. |
| EMP-05 Statistiques hebdomadaires | Écran de chiffres/graphique. | Calcul depuis commandes validées, avec période et périmètre employé définis. |

## Gérant

| Exigence | Présent dans `frontend/src/features/manager/` | Manque |
| --- | --- | --- |
| GER-01 Commandes en temps réel | Tableau de bord et liste d'opérations ; carte livreurs illustrative. | Flux commun, actualisation en temps réel, affectation et géolocalisation réelle des livreurs. Les commandes du gérant sont des données initiales distinctes. |
| GER-02 Comptes employés et droits | Formulaire équipe et cases de droits, enregistrés dans `localStorage`. | Création de comptes serveur, mot de passe temporaire sûr, permissions appliquées par API. Le mot de passe saisi en démo n'est pas enregistré. |
| GER-03 Statistiques générales | Tableaux et diagrammes. | Agrégats fiables depuis commandes/payments/fidélité/parrainage réels ; dates et indicateurs définis. |
| GER-04 Arbitrage réclamations | Écran de validation/rejet et geste commercial local. | Dossier partagé avec l'employé et l'étudiant, historique de décision, notification et application effective de la compensation. |

## Administrateur / direction

| Exigence | Présent dans `frontend/src/features/admin/` | Manque |
| --- | --- | --- |
| ADM-01 Employés | Liste et formulaire d'ajout/modification/suppression. | Enregistrement en base, accès sécurisés, traçabilité. Les données admin sont des états React réinitialisés au rechargement. |
| ADM-02 Menu CRUD | Gestion des plats, disponibilité, prix, images. | API commune, stockage image, publication vers site/mobile/employé et contrôles côté serveur. |
| ADM-03 Statistiques temps réel | Dashboard et rapports avec diagrammes. | Sources de données réelles, définitions et calculs côté serveur, actualisation automatique. |
| ADM-04 Promotions / événements / jeux | Écran de campagnes avec formulaire et statuts. | Publication/synchronisation publique et mobile, validation des dates, règles et visuels de jeux. |
| ADM-05 Réclamations | Liste et états de réclamations. | Workflow commun, décisions traçables et communication étudiant. |
| ADM-06 Horaires, politiques, fidélité | Paramètres et moyens de paiement affichés. | Persistance et application serveur, publication des horaires, textes juridiques validés. Les interrupteurs de paiement ne déclenchent aucune transaction. |

## Travail transversal et livrables

| Sujet | État constaté | À faire |
| --- | --- | --- |
| Backend/API/base de données | Laravel initialisé, endpoint `/api/health`. | Schéma/migrations, auth et rôles, API menu/commandes/réclamations/fidélité/parrainage/publication, validations et politiques d'accès. |
| Partage entre applications | Chaque espace web/mobile utilise ses propres jeux de démonstration ou son stockage local. | Contrats d'API, identifiants et états communs, mise à jour des commandes et réclamations entre tous les rôles. |
| Sécurité / données personnelles | Écrans de réglages et avertissements de démo. | Contrôle d'accès serveur, mots de passe, protection des données, politique de conservation et textes adaptés au contexte juridique. |
| Responsive et navigateurs | Interfaces web responsive prévues ; mobile Expo SDK 58. | Recette effective Chrome/Firefox/Safari et tailles d'écran ; aucun résultat de test d'appareil établi dans cet audit. |
| Tests / CI / déploiement | Test de santé backend et documentation présents. | Tests métier et E2E, couverture, pipeline CI/CD et prévisualisation déployée Vercel documentée. |
| Livraison documentaire | Cahier structuré, README par espace et user stories mobiles. | Manuels par rôle, rapport de recette, guide de déploiement, décisions métier finalisées et preuves de tests. |

## Bonus ou extensions déjà codés

- Application mobile étudiant **et** employé, alors que le cahier rendait le mobile optionnel ; splash, quatre écrans d'onboarding et navigation flottante glassmorphism.
- Site public marketing avec menu, promotions et accès par rôle ; favoris et consentement local.
- Panier flottant déplaçable, sélecteur d'heure natif, cartes de suivi de livraison côté étudiant/gérant avec repères fictifs.
- Écrans de tables, rapports et préparation des données dans les back-offices, au-delà des six fonctions admin explicites.
- Mode clair/sombre pour admin et gérant, graphiques de démonstration, parcours de paiement par espèces et catalogue visuel des moyens en ligne.
- Le **paiement en ligne** reste un bonus *présenté dans l'interface*, non intégré ni exigé pour valider le MVP. Les cartes et cryptomonnaies sont également des options visuelles, sans fournisseur ni transaction.

## Services de paiement utilisables sans frais pour les tests

« Gratuit pour tester » = sandbox avec fonds fictifs ; cela ne garantit ni gratuité ni disponibilité des opérateurs en production.

| Service | Test documenté | Adéquation au projet |
| --- | --- | --- |
| [pawaPay](https://www.pawapay.io/plans) | Sandbox gratuite pour chaque compte, sans argent réel. Plan Standard sans frais de mise en place/mensuels, mais frais sur transactions réelles. | Bon choix pour tester **Mobile Money** et les trois portefeuilles demandés **si le marché ciblé est la RDC**. Ne traite pas les cartes. [Couverture par pays](https://www.pawapay.io/markets). |
| [Flutterwave](https://developer.flutterwave.com/docs/quickstart) | Environnement de test gratuit, cartes et Mobile Money simulés ; [scénarios de test](https://developer.flutterwave.com/docs/testing). | Utile pour tester cartes Visa/Mastercard et paiements Mobile Money simulés. Pour les collectes XAF au Cameroun, vérifier les réseaux réellement ouverts au compte ; sa [documentation francophone](https://developer.flutterwave.com/docs/francophone) ne décrit pas Airtel/M-Pesa pour `CM`. |
| [PayDunya](https://developers.paydunya.com/doc/FR/introduction) | Mode test et comptes fictifs documentés, avec compte Business activé. | Peut servir à comparer une intégration, mais la gratuité d'accès au compte et la prise en charge du trio demandé au Cameroun ne sont pas établies par cette source. |

**Conflit de marché à résoudre avant un paiement réel :** le restaurant du cahier est au **Cameroun**, tandis que [pawaPay indique Orange + MTN au Cameroun, et Orange + Airtel + Vodacom M-Pesa en RDC](https://www.pawapay.io/markets). L'interface affiche désormais Orange, Airtel et M-Pesa à la demande du propriétaire, **désactivés côté mobile**, mais ce trio ne doit pas être promis comme opérable pour le restaurant de Douala sans validation commerciale et technique. MTN a été retiré des sélecteurs de paiement du projet, conformément à la demande.

## Ordre de traitement recommandé pour rejoindre le cahier

1. Fixer les décisions métier : pays et moyens de paiement, catalogue/prix réels, statuts de commandes, règles de points et parrainage, responsabilités de chaque rôle.
2. Construire auth/rôles et la base commune, puis les API menu et commandes ; raccorder d'abord le parcours étudiant **web** et les écrans employé/gérant/admin existants.
3. Raccorder réclamations, fidélité et parrainage, avec règles atomiques et historique partagé ; corriger le top 10 selon le nombre de commandes.
4. Synchroniser le mobile avec la même API et remplacer les cartes/données fictives par des états réels lorsque le suivi livreur sera disponible.
5. Faire la recette et la documentation de livraison. Choisir et brancher une sandbox de paiement seulement si l'équipe décide de réaliser ce bonus.
