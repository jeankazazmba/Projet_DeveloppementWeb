# Plan de tests et recette — Mon Miam Miam

**Statut : plan de vérification, aucun test applicatif encore codé ni exécuté.** Le cahier demande tests unitaires, fonctionnels, end-to-end et un rapport de couverture des fonctionnalités principales.

## Stratégie

1. **Unitaires** : validations de formulaire, montants/quantités, calcul et débit de points, conditions de récompense.
2. **Intégration / API** : authentification, droits, commandes, menu, réclamations, contraintes de données.
3. **E2E** : parcours réels par rôle, depuis l'écran de connexion jusqu'à la commande servie/livrée.
4. **UI & navigateurs** : Chrome, Firefox, Safari, mobile/desktop, accessibilité de base.
5. **Sécurité** : isolation des utilisateurs, accès aux espaces privilégiés, données sensibles et abus de parrainage.
6. **Recette** : vérification du cahier de charges avec la direction et des étudiants bêta-testeurs.

## Matrice de scénarios à implémenter

| ID | Scénario | Résultat attendu |
| --- | --- | --- |
| AUTH-01 | Étudiant crée son compte avec les données attendues | Compte créé, mot de passe non exposé, connexion possible |
| AUTH-02 | Mot de passe invalide / tentative répétée | Refus et message sans fuite d'information |
| AUTH-03 | Étudiant tente d'accéder à l'interface admin ou aux commandes d'autrui | Refus côté serveur |
| MENU-01 | Employé marque un plat indisponible | Le menu reflète cet état et le panier évite une validation incohérente |
| ORDER-01 | Étudiant commande pour une arrivée sur place | Heure d'arrivée enregistrée conformément à la validation retenue |
| ORDER-02 | Étudiant commande en livraison | Adresse/localisation de livraison renseignée et enregistrée de façon sûre |
| ORDER-03 | Employé prépare puis valide le service | Statuts visibles pour les rôles autorisés et historisés |
| ORDER-04 | Deux validations simultanées d'une commande | Pas de double création ou double attribution de points |
| LOY-01 | Commande éligible aux points | Points calculés au taux configuré, une seule attribution |
| LOY-02 | Solde insuffisant / remise invalide | Opération refusée sans solde négatif |
| LOY-03 | Annulation ou remboursement | Réconciliation des points selon la politique validée |
| REF-01 | Parrain et filleul utilisent un code unique | Relation enregistrée une seule fois |
| REF-02 | Première commande réussie du filleul | Récompense attribuée au parrain **une fois** |
| REF-03 | Commandes répétées ou tentative d'auto-parrainage | Pas de récompenses frauduleuses |
| COM-01 | Étudiant ouvre une réclamation | Création et suivi dans son espace |
| COM-02 | Employé répond, gérant arbitre | Le workflow de validation conserve la décision |
| ADM-01 | Admin met à jour le menu ou les comptes employés | Modification autorisée et répercutée dans les interfaces |
| MGR-01 | Gérant supervise commandes et statistiques | Accès autorisé, données cohérentes et actualisées |
| PRIV-01 | Top 10 clients et consentement cookies | Protection des données et comportement de consentement conforme à la décision prise |
| E2E-01 | Étudiant commande → employé valide → étudiant consulte le suivi | Parcours complet sans rupture |
| PAY-B01 | Paiement sandbox (si bonus retenu) | État confirmé côté serveur et traitement idempotent des notifications |

Ces attentes doivent être précisées avec le métier avant toute validation définitive.

## Définition d'une recette acceptable

- [ ] Tous les scénarios **critiques du MVP choisi** passent.
- [ ] Pas de vulnérabilité critique connue non résolue.
- [ ] Les rôles sont correctement cloisonnés.
- [ ] Le suivi des commandes et le solde de points sont cohérents.
- [ ] Les problèmes connus sont documentés et priorisés.
- [ ] Un rapport récapitule cas testés, résultats, anomalies et couverture fonctionnelle réelle.

**Ne pas annoncer de pourcentage de couverture tant que les outils et suites de tests ne le calculent pas.** GitHub Actions vérifie actuellement la **gouvernance**, pas encore le comportement de l'application.
