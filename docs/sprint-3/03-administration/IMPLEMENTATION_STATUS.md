# État d’implémentation — Back-office administrateur

**Module :** PMEE-34 · Sprint 3  
**Code :** `frontend/src/features/admin/`  
**Mise à jour :** 3 novembre 2026

## Terminé côté interface

| Exigence | État | Emplacement |
| --- | --- | --- |
| ADM-01 · Comptes employés | Interface locale : ajout, activation/désactivation, suppression et recherche | `pages/AdminEmployeesPage.jsx` |
| ADM-02 · Menu CRUD | Ajout local, filtres, disponibilité et plat du jour | `pages/AdminMenuPage.jsx` |
| ADM-03 · Statistiques | Tableau de bord et indicateurs de démonstration | `pages/AdminDashboardPage.jsx` |
| ADM-04 · Promotions, événements, affiches | Création de brouillon, filtrage et activation locale | `pages/AdminPromotionsPage.jsx` |
| ADM-05 · Supervision des réclamations | Liste, note interne, mise en examen, résolution et rejet local | `pages/AdminComplaintsPage.jsx` |
| ADM-06 · Paramètres | Horaires et paramètres de fidélité préparatoires | `pages/AdminSettingsPage.jsx` |
| Accessibilité | Contrôle Petit / Standard / Grand, mémorisé dans le navigateur | `src/components/ui/FontSizeControl.jsx` |

## Dépendances backend restantes

Le dépôt expose seulement `GET /api/health` au 3 novembre 2026. Les opérations suivantes restent simulées et doivent être remplacées par les API Laravel et leurs contrôles RBAC :

- Comptes employés : création, mise à jour, désactivation, suppression et gestion des droits.
- Menu : liste, création, modification, suppression, images, disponibilité et plat du jour.
- Statistiques temps réel : commandes, ventes, programmes de fidélité et parrainage.
- Promotions, événements, affiches et règles de mini-jeux.
- Réclamations : consultations, réponses, arbitrage, historique et éventuels crédits de points.
- Paramètres : horaires et règles de fidélité validées par le métier.

## Hors périmètre de cette contribution

- Interfaces `student/`, `employee/` et `manager/`, attribuées à d’autres membres du Sprint 3.
- Paiement agrégé / Mobile Money : bonus optionnel, sans fournisseur ni contrat validé.
- Règles définitives de fidélité, parrainage, livraison, transitions de commande et mini-jeux : décisions métier et backend nécessaires.
- Authentification réelle, protection de route effective et permissions : contrôles backend obligatoires.

## Ce qui n’est pas nécessaire pour livrer le socle admin maintenant

- Transaction de paiement réelle ou clés de prestataire.
- GPS temps réel ou carte de suivi de livraison.
- Règles inventées de mini-jeux ou attribution automatique de points dans le navigateur.
- Toute modification des écrans hors administration.
