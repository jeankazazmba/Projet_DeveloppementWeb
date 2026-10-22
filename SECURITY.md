# Sécurité de Mon Miam Miam

Ce projet traite potentiellement les comptes des étudiants, noms, téléphones, adresses ou localisations de livraison, commandes, réclamations et points de fidélité.

## Signalement d'une faille

Ne pas ouvrir de ticket public avec une preuve d'exploitation, une donnée personnelle ou un secret. Contacter le responsable du dépôt [@jeankazazmba](https://github.com/jeankazazmba) via un canal privé. Les incidents doivent être consignés et traités avec discrétion.

## Autorisations métier (RBAC)

Les permissions s'appliquent **au backend** à chaque requête :
- **Étudiant** : uniquement son compte, ses commandes, points, réclamations et parrainages autorisés.
- **Employé** : commandes et opérations de service, modifications temporaires de menu, réclamations et statistiques hebdomadaires ; pas de gestion générale des administrateurs.
- **Gérant** : supervision quotidienne, comptes employés conformément au cahier des charges, statistiques, arbitrage des réclamations.
- **Administrateur** : contrôle global, employés, menu, promotions, paramètres et statistiques.

Les capacités détaillées et leurs exceptions doivent être validées dans [docs/DECISIONS.md](docs/DECISIONS.md). Toujours refuser par défaut ce qui n'est pas autorisé.

## Comptes et données

- Hacher les mots de passe avec un algorithme adapté de la stack ; jamais de stockage en clair.
- Prévoir réinitialisation sécurisée, limitation des tentatives, expiration des sessions et protection contre CSRF selon l'architecture.
- Valider les entrées côté serveur et sécuriser les requêtes à la base de données.
- Exclure fichiers `.env`, clés privées, jetons API, fichiers de paiement et sauvegardes de production du versionnement.
- Utiliser uniquement des données fictives pour tests, démonstrations et maquettes Vercel.
- Définir une politique de conservation, d'accès et de suppression des informations personnelles.
- Prévoir le consentement pour les **cookies non essentiels** ; une bannière seule ne garantit pas la conformité.
- Évaluer les exigences de protection des données pertinentes au contexte d'exploitation (le cahier des charges mentionne le RGPD) avec le responsable du projet avant mise en ligne.

## Fidélité et parrainage

- Calcul des points côté serveur, avec journal de mouvements et transactions atomiques.
- Vérification systématique du solde avant toute déduction.
- Empêcher le double crédit après reprise ou double clic, et le crédit multiple pour une même première commande de filleul.
- Prévoir les annulations, remboursements, litiges et ajustements audités.
- Protéger les codes de parrainage contre l'auto-parrainage et les abus ; règles finales à valider.

## Paiement : fonctionnalité bonus

L'intégration d'un agrégateur n'est **pas obligatoire** selon les livrables finaux du cahier. Si elle est développée :
- Utiliser un **sandbox**, jamais un paiement réel pour les tests.
- Garder les clés privées exclusivement sur le backend et dans un coffre de secrets.
- Vérifier les notifications de paiement côté serveur (signature + état distant si applicable).
- Gérer les callbacks en mode idempotent et réconcilier commandes et transactions.
- Ne jamais enregistrer de numéro de carte ou d'identifiants Mobile Money sensibles dans les logs.

## Vérifications avant mise en production

- [ ] Contrôle d'accès testé sur tous les rôles (et tentatives d'accès croisé).
- [ ] Aucune donnée réelle exposée dans le dépôt, les logs, captures ou URL.
- [ ] Analyse des dépendances et correctifs critiques.
- [ ] Tests des parcours commande / fidélité / parrainage / réclamations.
- [ ] Configuration HTTPS, CORS et sessions adaptée au déploiement.
- [ ] Politique de confidentialité et mentions légales rédigées et vérifiées.

**Statut :** règles documentées, non audit de sécurité. Aucune fonctionnalité ni système de paiement n'est actuellement en production.
