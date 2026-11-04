# Cahier des charges structuré — Mon Miam Miam

**Source de vérité métier :** `CAHIER DE CHARGE PROJET : Mon Miam Miam`, **ZeDuc@Space - x - DNx**, **V1.0.2 (16/09/2024)**, 17 pages. Cette synthèse organise le document fourni ; elle **ne le remplace pas** et ne constitue pas une liste de fonctionnalités implémentées.

## 1. Problème et périmètre

Le restaurant ZeDuc@Space, fréquenté par des étudiants de l'UCAC-ICAM de Yansoki, reçoit actuellement les commandes par messages et appels. Mon Miam Miam doit améliorer la circulation des commandes, la livraison, la traçabilité des ventes et la fidélisation. L'application **web** constitue le périmètre de livraison principal ; une **application mobile** peut être ajoutée plus tard.

Parties prenantes : direction du restaurant, gérant, employés et étudiants.

Objectifs : commande fluide ; coordination du service ; statistiques temps réel ; promotions, événements, mini-jeux ; points de fidélité et parrainage.

## 2. Exigences fonctionnelles par rôle

### Étudiant

| ID | Exigence |
| --- | --- |
| ETU-01 | S'inscrire, se connecter, récupérer son mot de passe ; profil avec nom, e-mail, téléphone et localisation de livraison. |
| ETU-02 | Voir l'accueil, le menu du jour, les promotions et événements. |
| ETU-03 | Ajouter/retirer des articles du panier et confirmer une commande. |
| ETU-04 | Choisir **sur place** avec heure d'arrivée ou **livraison** avec adresse/localisation. |
| ETU-05 | Suivre ses commandes, consulter historique et détails de transaction ; commenter une commande servie/livrée. |
| ETU-06 | Gagner, consulter et utiliser des points de fidélité pour une remise, selon les règles validées. |
| ETU-07 | Obtenir/partager un code de parrainage et suivre les récompenses après la première commande réussie du filleul. |
| ETU-08 | Ouvrir et suivre une réclamation. |
| ETU-09 | Participer aux jeux et événements proposés. |
| ETU-10 | Consulter les **10 meilleurs clients** avec filtre jour/semaine/mois (conditions de confidentialité à définir). |
| ETU-11 | Être informé de l'usage des cookies et donner/refuser le consentement lorsque nécessaire. |

Le cahier cite également le paiement en ligne, mais le classe **bonus non obligatoire** dans ses livrables. Voir section 4.

### Employé

| ID | Exigence |
| --- | --- |
| EMP-01 | S'authentifier et consulter les commandes entrantes. |
| EMP-02 | Préparer, actualiser et valider les commandes après service. |
| EMP-03 | Mettre temporairement à jour le menu (indisponibilité, plat du jour). |
| EMP-04 | Consulter/répondre aux réclamations et transmettre les arbitrages. |
| EMP-05 | Consulter les statistiques de ventes hebdomadaires. |

### Gérant

| ID | Exigence |
| --- | --- |
| GER-01 | Suivre l'état des commandes en temps réel. |
| GER-02 | Créer des comptes employés et attribuer leurs droits autorisés. |
| GER-03 | Accéder aux statistiques générales des ventes, commandes, fidélité et parrainage. |
| GER-04 | Examiner les réclamations et valider ou rejeter les réponses des employés. |

### Administrateur / direction

| ID | Exigence |
| --- | --- |
| ADM-01 | Ajouter, modifier, supprimer les comptes employés. |
| ADM-02 | Gérer le menu en CRUD. |
| ADM-03 | Consulter statistiques temps réel des commandes, ventes et programmes. |
| ADM-04 | Créer promotions, événements et affiches de mini-jeux. |
| ADM-05 | Superviser les réclamations. |
| ADM-06 | Paramétrer horaires, politiques et règles de fidélité. |

Pour détailler les écrans, les règles d'accès et l'ordre d'intégration de cet espace, consulter la [spécification fonctionnelle de l'administration](sprint-3/03-administration/SPEC_FONCTIONNELLE_ADMIN.md). Elle distingue les exigences du cahier, les demandes multi-restaurants ultérieures et les propositions de conception.

## 3. Fidélité et parrainage

Données citées : `users`, `orders`, `referrals`. Les champs proposés dans le cahier incluent identifiants, contacts, points, parrain, statut, montants, dates, nombre de points gagnés et attribution de récompense.

**Exemples chiffrés donnés, non paramètres approuvés :** **1 000 F dépensés = 1 point** ; **15 points = réduction de 1 000 F**. Une **expiration à 12 mois** est citée comme possibilité, pas comme règle arrêtée.

- Calculer/consulter les points côté backend.
- Vérifier le solde avant application de la réduction.
- Créditer le parrain lorsque la première commande du filleul est réussie.
- Assurer une récompense attribuée au maximum une fois par parrainage.
- Permettre à l'admin d'ajuster les règles et traiter les réclamations de points.
- Tracer les débits/crédits pour éviter les incohérences (recommandation technique à valider).

API suggérées par le document : `POST /orders`, `GET /users/{id}/points`, `POST /referral/generate`, `POST /referral/use`, `POST /referral/reward`. Ce sont **des exemples de conception**, pas des routes déjà implémentées ; le endpoint de récompense ne doit pas pouvoir être appelé librement par un étudiant.

## 4. Paiements : décision à arbitrer

Le cahier mentionne l'intégration d'un agrégateur et les cartes/Mobile Money dans la description fonctionnelle, puis précise explicitement dans les livrables **« Bonus, cette fonctionnalité n'est pas obligatoire »**. La lecture prudente pour le MVP est : **commande obligatoire, paiement en ligne bonus**. Ne pas annoncer d'agrégateur choisi ni de transaction réelle disponible.

Agrégateurs évoqués à titre indicatif : CinetPay, Stripe, PayDunya. L'équipe et le restaurant devront choisir selon disponibilité, frais et API.

## 5. Exigences non fonctionnelles

- Compatibilité Chrome, Firefox et Safari.
- Interface responsive et parcours utilisables sur mobile.
- Architecture **MVC ou équivalente**, séparation frontend/backend, base de données et API.
- Évolutivité possible vers plusieurs restaurants.
- Protection des données (le cahier cite le **RGPD**, conformité effective à vérifier).
- Couleurs : **primaire `#cfbd97`**, **secondaire `#000000`**.
- Tables actualisées sans rechargement manuel (le document cite **AJAX**).
- Maquette **Figma**, démonstration déployée sur **Vercel**.
- Tests unitaires, fonctionnels et end-to-end ; pipeline CI/CD envisagé.
- Suivi projet **Jira**, code et branches sur **GitHub**.

## 6. Livrables attendus

1. Code frontend + backend sur GitHub, structuré et documenté.
2. Figma : accueil, authentification, étudiant, employé, gérant, administrateur.
3. API REST et schémas de données ; paiement **bonus**.
4. Maquette interactive Vercel ; guide déploiement backend, CI/CD.
5. Tests, rapport de couverture des fonctionnalités principales, bêta-test.
6. Documentation technique, manuel par rôle, charte graphique.
7. Backlog/planning Jira, rapports d'avancement et comptes-rendus.
8. Risques, analyse budgétaire, mentions légales et aspects juridiques.

## 7. Cadre temporel

La source indique **6 membres** et **4 semaines**, avec la plage **30 septembre–21 octobre** dans le document daté **2024**. **Il n'y a pas de nouvelle échéance 2026 confirmée.** Les jalons proposés dans `PLAN_DE_LIVRAISON.md` sont relatifs à un démarrage à déterminer.

## 8. Points non spécifiés ou incohérents

- Date de lancement actuelle et répartition nominative des six membres.
- Stack exacte, hébergement API, choix base de données.
- Fourniture des assets officiels (logo ZeDuc@Space, menus, tarifs, photos).
- Statuts et transitions exacts de commande/livraison, frais/zones de livraison.
- Montant et expiration définitifs des points ; règle d'arrondi, remboursements, annulations.
- Vérification de la confidentialité du top 10 clients.
- Éventuelle devise, prestataire de paiement et logique de confirmation hors ligne.
- Conformité juridique et cookies dans le contexte effectif d'exploitation.

Consulter [DECISIONS.md](DECISIONS.md) avant d'implémenter ces points.
