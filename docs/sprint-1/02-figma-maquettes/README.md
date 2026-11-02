# Christian — Maquettes Figma (Issue #5)

Maquette de **Mon Miam Miam**, la plateforme de commande en ligne du restaurant **ZeDuc-Sp@ce** (Yansoki, Douala).
Ce dossier conserve les liens, exports, règles de navigation, composants, règles responsive et décisions UI. Les sources de la maquette restent dans Figma ; les preuves et explications sont ici.

**Maquette Figma :** https://www.figma.com/design/zTGvFtSVhsLRnYl1KBn94l/Untitled?node-id=0-1&t=59LHp70a8GuP60vd-1

**Auteur :** Christian ONOKOLA · **Ticket :** [#5](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/5) · **Cahier des charges :** version 1.0.2 (16/09/2024) · **Documentation source :** 27 oct. 2026

---

## Sommaire

1. [Présentation](#1-présentation)
2. [Contenu du dossier](#2-contenu-du-dossier)
3. [Espaces et écrans](#3-espaces-et-écrans)
4. [Identité visuelle](#4-identité-visuelle)
5. [Coques de navigation et composants](#5-coques-de-navigation-et-composants)
6. [Plan du site et navigation](#6-plan-du-site-et-navigation)
7. [Parcours utilisateurs](#7-parcours-utilisateurs)
8. [Règles de gestion affichées](#8-règles-de-gestion-affichées)
9. [Droits par rôle](#9-droits-par-rôle)
10. [Responsive](#10-responsive)
11. [Accessibilité et RGPD](#11-accessibilité-et-rgpd)
12. [États des écrans](#12-états-des-écrans)
13. [Données d'exemple](#13-données-dexemple)
14. [Décisions UI](#14-décisions-ui)
15. [Méthode de production](#15-méthode-de-production)
16. [Suivi d'avancement](#16-suivi-davancement)
17. [Critères de l'issue #5](#17-critères-de-lissue-5)
18. [Contribuer](#18-contribuer)

---

## 1. Présentation

La maquette couvre **5 espaces** et **38 écrans**, chacun prévu en version **Desktop (1 440 px)** et **Mobile (390 px)**.

**Objectif du produit**

- Permettre aux étudiants de l'UCAC-ICAM de **commander** sur place ou en livraison, de **cumuler des points de fidélité**, de **parrainer** d'autres étudiants et de **déposer des réclamations**.
- Permettre au personnel de **suivre les commandes**, de **mettre à jour le menu** et de **traiter les réclamations**.
- Donner à la direction une **vue d'ensemble des ventes**.

**Portée.** La maquette montre ce que le cahier des charges demande de présenter.

**Hors périmètre.** Le code, la base de données, l'intégration réelle de l'agrégateur de paiement (bonus du cahier des charges) et l'application mobile native (extension possible).

## 2. Contenu du dossier

| Élément | Description |
|---|---|
| `README.md` | Ce document |
| Lien Figma | Source de la maquette (lecture avec le lien) |
| `Mon_Miam_Miam_Documentation_maquette.pdf` | Documentation complète de la maquette (21 pages) |
| `Mon_Miam_Miam_Pages.xlsx` | Suivi des 38 écrans, statuts Desktop et Mobile |
| `exports/` | Exports PNG ou PDF des écrans, rangés par espace (A à E) |

Convention de nommage conseillée pour les exports : `<espace>-<numéro>-<page>-<desktop|mobile>.png`, par exemple `C-21-gestion-commandes-desktop.png`.

## 3. Espaces et écrans

| Espace | Public visé | Écrans |
|---|---|---|
| **A. Pages publiques** | Visiteurs | 8 |
| **B. Espace étudiant** | Étudiants connectés | 16 (dont 4 annexes) |
| **C. Espace employé** | Cuisine et service | 4 |
| **D. Espace gérant** | Gérant | 4 |
| **E. Espace administrateur** | Direction | 6 |

Seules les pages publiques s'ouvrent sans compte.

### A. Pages publiques (8)

| N° | Page |
|---|---|
| 1 | Accueil |
| 2 | Menu (public) |
| 3 | Promotions et événements |
| 4 | Connexion étudiant |
| 5 | Inscription |
| 6 | Mot de passe oublié |
| 7 | Connexion du personnel |
| 8 | Bandeau de cookies |

### B. Espace étudiant (16)

| N° | Page | Entrée active du menu |
|---|---|---|
| 9 | Tableau de bord | Tableau de bord |
| 10 | Menu et commande | La Carte & Menus |
| 10b | Détail d'un plat | La Carte & Menus |
| 11 | Panier | La Carte & Menus |
| 12 | Commande et paiement | La Carte & Menus |
| 12b | Confirmation | Mes Commandes |
| 13 | Suivi de commande | Mes Commandes |
| 14 | Historique des commandes | Mes Commandes |
| 15 | Fidélité | Programme Fidélité |
| 16 | Parrainage | Parrainage |
| 17 | Réclamations | Mes Commandes |
| 17b | Nouvelle réclamation | Mes Commandes |
| 18 | Jeux et événements | Rooftop & Événements |
| 18b | Roue de la chance | Rooftop & Événements |
| 19 | Top 10 clients | Programme Fidélité |
| 20 | Profil et paramètres | Mon Profil & Préférences |

Les pages 17, 17b et 19 n'ont pas d'entrée propre dans le menu : elles s'ouvrent depuis les commandes et la fidélité.

### C. Espace employé (4)

| N° | Page | Contenu principal |
|---|---|---|
| 21 | Gestion des commandes | Voyant « En direct », quatre compteurs, colonnes de commandes, actions Accepter, Marquer prête, Valider la livraison |
| 22 | Mise à jour du menu | Plat du jour, tableau des plats avec interrupteur « Disponible », étoile « Plat du jour », prix en lecture seule, barre « changements non enregistrés » |
| 23 | Traitement des réclamations | Onglets avec compteurs, tableau, panneau de détail, réponses rapides, envoi au gérant |
| 24 | Statistiques hebdomadaires | Sélecteur de semaine, quatre indicateurs, ventes par jour, sur place contre livraison, top 5 des plats, heures de pointe |

### D. Espace gérant (4)

| N° | Page | Contenu principal |
|---|---|---|
| 25 | Supervision en direct | Indicateurs, tableau des commandes avec employé assigné, âge en rouge au-delà de 20 min, alertes, commandes par heure |
| 26 | Équipe | Tableau des employés, tiroir « Nouvel employé » avec mot de passe temporaire et droits |
| 27 | Statistiques générales | Périodes, ventes sur 30 jours, points distribués contre utilisés, entonnoir du parrainage, plats les plus vendus |
| 28 | Réclamations (validation) | Réponse proposée par l'employé, geste commercial, actions Valider et envoyer / Rejeter et demander une correction |

### E. Espace administrateur (6)

| N° | Page | Contenu principal |
|---|---|---|
| 29 | Tableau de bord | Six indicateurs, ventes en temps réel, commandes par service, entonnoir du parrainage, répartition des paiements, fil d'activité |
| 30 | Gestion des employés | Tableau avec rôle et statut, menu d'actions par ligne, confirmation de suppression |
| 31 | Gestion du menu | Tableau des plats, tiroir de modification (photo, prix, description, ingrédients) |
| 32 | Promotions et événements | Grille d'affiches (Active, Programmée, Expirée), tiroir de création avec aperçu |
| 33 | Suivi des réclamations | Indicateurs, historique complet, bloc « Réclamation de points » |
| 34 | Paramètres | Conversion des points, seuil minimum, validité, points du parrain, horaires |

## 4. Identité visuelle

Thème **sombre** : fond noir, **or `#CFBD97` en accent unique**, cartes plates, typographie **Poppins**. Le noir et l'or viennent de la charte du cahier des charges (primaire `#CFBD97`, secondaire `#000000`) et du logo ZeDuc-Sp@ce (emblème art déco doré sur fond noir). La structure des pages s'inspire d'un modèle de site de restaurant : titres bicolores, cartes sombres arrondies, sections qui alternent texte et photos. **Aucun orange ni couleur vive.**

### Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Fond de page | `#000000` | Arrière-plan, barre du haut |
| Surface | `#121212` | Cartes, panneaux, champs |
| Bordure | or à 18 %, 1 px | Contour discret des cartes |
| Primaire | `#CFBD97` | Entrée active du menu, mots clés des titres, icônes, prix, états sélectionnés |
| Primaire clair / foncé | `#E0D1B0` / `#B5A47D` | Survol / appui |
| Texte principal | `#F5F1E8` | Texte courant |
| Texte secondaire | `#A8A294` | Libellés, axes des graphiques |
| Texte discret | `#6F6A5E` | Légendes uniquement |
| Succès | `#6FCF97` | Livrée, validée, points gagnés |
| Avertissement | `#E8B04A` | En préparation, en attente |
| Erreur | `#E5604D` | Annulée, rejetée, points utilisés |
| Information | `#7AA7D9` | Envoyée, reçue |

### Typographie

- **Poppins** pour tout.
- Titres en gras (700), interligne 1,1, avec un ou deux mots clés en or et le reste en blanc (exemple : « Menu du **Jour** »).
- Interface et texte courant en 400, 500 et 600.
- Au-dessus de chaque titre de section : une petite étiquette dorée.
- Tailles des titres de section : 72 / 48 / 32 px sur Desktop, 40 / 30 / 24 px sur Mobile.

### Formes et effets

- Cartes plates à coins de **16 px**, bordure fine, **sans dégradé, sans halo, sans ornement**.
- Boutons en **pilule** : le principal est doré avec un léger dégradé et du texte noir (seul élément dégradé), le secondaire est un contour or.
- Champs de **52 px** de haut, coins de 12 px, icône et texte centrés sur la même ligne verticale.
- Icônes en traits fins dorés (style Lucide, 1,5 px).
- Grille de 8 px, conteneur de 1 200 px sur Desktop, marges de 16 px sur Mobile.

### Images et ton

- Photos de plats sombres et chaudes (vapeur, lumière dorée, fond noir), même étalonnage partout, coins arrondis.
- Toute l'interface est en **français**, les prix en **FCFA** avec une espace fine (« 3 500 FCFA »).
- Contenus réalistes pour Yansoki : Poulet DG, Ndolé aux crevettes, Poisson braisé et bobolo, Bissap.

## 5. Coques de navigation et composants

Chaque espace a **une coque unique**, identique sur toutes ses pages. En cas de doute, la page « Menu du jour » (10) sert de référence visuelle.

### Coque publique

Barre fixe : logo à gauche, liens Accueil, Menu, Promotions, Événements et Contact, bouton fantôme « Connexion », bouton doré « Commander ». Sur Mobile : logo et menu burger plein écran, avec une barre dorée « Commander » fixée en bas.

### Coque étudiant

- **Barre latérale** de 256 px, fixe, sur toute la hauteur, logo centré avec « YANSOKI · DOUALA », puis sept entrées : Tableau de bord, La Carte & Menus, Mes Commandes, Programme Fidélité, Rooftop & Événements, Parrainage, Mon Profil & Préférences. L'entrée active est une pilule dorée. Le bloc utilisateur (initiales, nom, « Étudiant UCAC-Douala ») et « Se déconnecter » sont collés en bas.
- **Barre du haut** : champ de recherche arrondi, pastille de points (« 120 pts MIAM »), notifications, panier avec pastille de quantité, bloc table et avatar.
- **Pied de page** : une seule ligne discrète (copyright et trois liens).
- **Mobile** : barre du haut (logo, points, panier) et barre d'onglets avec cinq entrées : Accueil, Menu, Commandes, Fidélité, Plus.

### Coque du personnel (employé, gérant, administrateur)

Même barre latérale que l'étudiant, avec une **pastille de rôle** en haut (« Employé », « Gérant », « Administrateur ») et un voyant vert **« En direct »**. Pages plus denses : tableaux, cartes de chiffres, graphiques. Mobile : barre du haut avec burger et barre d'onglets de quatre entrées au maximum.

### Composants récurrents

| Composant | Règle |
|---|---|
| Pastilles de statut de commande | Reçue (information), En préparation (avertissement), Prête (or), Livrée (succès), Annulée (erreur), identiques dans tous les espaces |
| Pastilles de réclamation | Envoyée, En cours d'examen, Réponse reçue, Résolue, Rejetée |
| Cartes de plat | Photo en haut, badge en haut à gauche (Plat du jour, Promo -15 %, Spécial Rooftop), titre, description, prix en or, bouton rond doré « + » ou sélecteur de quantité |
| Filtres | Pilules : l'active est remplie d'or, les autres sont en contour sombre |
| Tableaux | En-tête discret, lignes de même hauteur, texte sur une seule ligne, pagination ronde |
| Fenêtres | Centrées, largeur de 560 à 880 px, arrière-plan assombri et flou ; sur Mobile, feuille pleine hauteur depuis le bas |
| Champs de formulaire | 52 px, libellé au-dessus, astérisque doré si obligatoire, focus avec bordure or fine |
| Bandeau de cookies | Carte flottante en bas à gauche (Desktop) ou feuille basse (Mobile) : Tout accepter, Tout refuser, Personnaliser |
| Graphiques | Monochromes or, axes en `#A8A294`, jamais d'arc-en-ciel |

### Pages d'authentification (4, 5, 6, 7)

Même structure : carte de formulaire centrée verticalement et horizontalement, ligne d'adresse du restaurant fixée tout en bas de la page, jamais collée à la carte.

## 6. Plan du site et navigation

- **Accueil (1)** mène au Menu (2), aux Promotions (3), à la Connexion (4) et à l'Inscription (5), et aux commandes une fois connecté.
- **Connexion (4)** mène au Tableau de bord étudiant (9), à l'Inscription (5) et au Mot de passe oublié (6). Le lien « Accès personnel » mène à la Connexion du personnel (7), qui ouvre l'espace correspondant au rôle choisi (21, 25 ou 29).
- **Panier** : l'icône de la barre du haut et la barre flottante de la page Menu (10) ouvrent le Panier (11), puis Commande et paiement (12), Confirmation (12b) et Suivi (13).
- **Signaler un problème** : depuis le Suivi (13) et l'Historique (14), il ouvre le formulaire (17b), puis la liste des Réclamations (17).
- **Points** : la pastille de la barre du haut et la page Paiement mènent à Fidélité (15), qui renvoie au Parrainage (16), aux Jeux (18) et au Top 10 (19).
- **Personnel** : la pastille de rôle et la barre latérale donnent accès aux pages de l'espace ; la déconnexion ramène à la Connexion du personnel (7).

## 7. Parcours utilisateurs

Ces parcours sont ceux à relier dans le prototype Figma (onglet Prototype) pour la démonstration sur Vercel.

**Étudiant : commander**
1. Accueil (1) ou Connexion (4), puis Tableau de bord (9).
2. Menu et commande (10) : filtrer, ouvrir un plat (10b), choisir ses options, ajouter au panier.
3. Panier (11) : vérifier les articles, choisir Sur place ou Livraison, appliquer un code promo.
4. Commande et paiement (12) : heure d'arrivée ou adresse, Mobile Money, carte ou caisse, utilisation des points.
5. Confirmation (12b), puis Suivi de commande (13) jusqu'à la livraison.
6. Après la livraison : laisser un commentaire, ou signaler un problème (17b).

**Étudiant : s'inscrire et parrainer**
1. Inscription (5), avec ou sans code de parrainage, puis consentement RGPD.
2. Parrainage (16) : copier ou partager son code `MIAM-ARS24`.
3. Le filleul passe sa première commande : le parrain est crédité de 15 points, visibles dans Fidélité (15) et dans le suivi des filleuls.

**Étudiant : réclamer**
1. Historique des commandes (14), bouton « Signaler un problème » (ou depuis le Suivi).
2. Nouvelle réclamation (17b) : commande, motif, description, photo.
3. Réclamations (17) : suivre les étapes jusqu'à la réponse officielle, puis « C'est résolu » ou « Je ne suis pas satisfait ».

**Employé**
1. Connexion du personnel (7), rôle Employé.
2. Gestion des commandes (21) : accepter, marquer prête, valider la livraison.
3. Mise à jour du menu (22) : marquer un plat épuisé ou changer le plat du jour.
4. Traitement des réclamations (23) : rédiger la réponse et l'envoyer au gérant.
5. Statistiques hebdomadaires (24) pour ajuster le service.

**Gérant**
1. Supervision en direct (25) : suivre les commandes et les alertes de retard.
2. Équipe (26) : créer un compte employé avec ses droits.
3. Réclamations (28) : valider ou rejeter la réponse de l'employé, avec un geste commercial éventuel.
4. Statistiques générales (27).

**Administrateur**
1. Tableau de bord (29) pour la vue d'ensemble en temps réel.
2. Gestion des employés (30) et du menu (31).
3. Promotions et événements (32) : publier une affiche, qui apparaît ensuite sur l'Accueil et dans Promotions et événements (3).
4. Suivi des réclamations (33) et Paramètres (34) : taux de conversion des points, validité, horaires.

## 8. Règles de gestion affichées

Les chiffres affichés doivent rester cohérents d'un écran à l'autre. Ces règles viennent du cahier des charges, sauf mention contraire.

| Règle | Valeur affichée | Où elle apparaît |
|---|---|---|
| Gain de points | 1 000 FCFA dépensés = 1 point | Panier, paiement, confirmation, Fidélité |
| Utilisation des points | 15 points = 1 000 FCFA de réduction, minimum 15 points | Paiement, Fidélité, Paramètres administrateur |
| Expiration des points | 12 mois (exemple du cahier des charges, réglable) | Fidélité, Paramètres |
| Parrainage | Code unique par étudiant ; 15 points pour le parrain après la première commande du filleul (valeur d'exemple) | Inscription, Parrainage, Fidélité |
| Mot de passe | Au moins une majuscule et un chiffre | Inscription, nouveau mot de passe |
| Modes de service | Sur place (heure d'arrivée) ou livraison (adresse, téléphone) | Panier, paiement, suivi |
| Moyens de paiement | Mobile Money, carte bancaire, paiement à la caisse (l'agrégateur est un bonus) | Paiement, historique |
| Commentaire | Possible une fois la commande livrée | Suivi de commande |
| Top 10 | Classement par nombre de commandes, filtres jour, semaine, mois | Top 10 clients |
| Mises à jour du menu | Temporaires pour l'employé, définitives pour l'administrateur | Mise à jour du menu, Gestion du menu |
| Réclamations | L'employé rédige, le gérant valide ou rejette, l'étudiant voit la réponse officielle | Pages 17, 23, 28, 33 |
| Cookies | Consentement avant tout cookie non essentiel | Bandeau, Profil |

## 9. Droits par rôle

| Fonction | Étudiant | Employé | Gérant | Administrateur |
|---|---|---|---|---|
| Commander, payer, points, parrainage | Oui | Non | Non | Non |
| Déposer une réclamation | Oui | Non | Non | Non |
| Valider les commandes | Non | Oui | Voir en direct | Voir |
| Mettre à jour le menu | Non | Temporaire | Non | Oui (créer, modifier, supprimer) |
| Traiter les réclamations | Suivre | Répondre | Valider ou rejeter | Superviser |
| Créer des employés | Non | Non | Oui | Oui (aussi modifier, supprimer) |
| Statistiques | Top 10 | Semaine | Générales | Temps réel |
| Paramètres, promotions, événements | Non | Non | Non | Oui |

> La maquette affiche ces droits ; leur application réelle doit être faite **côté serveur** (voir [CONTRIBUTING.md](CONTRIBUTING.md)).

## 10. Responsive

- **Desktop** : 1 440 px de large, conteneur de 1 200 px, grille de 12 colonnes, barre latérale fixe de 256 px.
- **Mobile** : 390 px de large, une seule colonne, marges de 16 px.
  - La barre latérale devient une **barre d'onglets** en bas (cinq entrées pour l'étudiant, quatre au maximum pour le personnel).
  - Les **tableaux** deviennent des listes de cartes.
  - Les **fenêtres** deviennent des feuilles basses.
  - Les **panneaux latéraux** deviennent des écrans suivants.
  - Sur Mobile, les pages sans onglet (Parrainage, Jeux, Top 10, Réclamations, Profil) sont regroupées sous l'onglet « Plus ».
- Zones tactiles de **44 px minimum**, champs de 52 px.

| Écran | Particularité mobile |
|---|---|
| Accueil (1) | Une colonne, promos en carrousel, barre « Commander » fixée en bas |
| Menu public (2) | Liste de cartes, onglets défilants |
| Promotions et événements (3) | Affiches en une colonne, onglets collés en haut |
| Connexion (4) | Bandeau photo en haut puis formulaire plein écran |
| Inscription (5) | Assistant en deux étapes avec barre de progression |
| Mot de passe oublié (6) | Plein écran, un champ |
| Connexion du personnel (7) | Plein écran |
| Cookies (8) | Feuille basse |

## 11. Accessibilité et RGPD

### Accessibilité

- Texte principal `#F5F1E8` sur fond noir : contraste très élevé. Le texte discret `#6F6A5E` est réservé aux légendes et ne porte jamais une information seule.
- Texte noir sur les boutons dorés.
- Le statut ne repose jamais sur la couleur seule : chaque pastille a un libellé.
- Champs avec libellé visible, messages d'erreur en toutes lettres et icône, état de focus visible.

> Ces points sont des **intentions de conception** à contrôler sur les écrans réels (rapports de contraste dans Figma, ordre de tabulation, tailles minimales).

### Conformité RGPD

- Bandeau de cookies avec consentement avant les cookies non essentiels (page 8).
- Case de consentement à l'inscription, avec lien vers la politique de confidentialité (page 5).
- Dans le profil : gestion des cookies, export des données et suppression du compte (page 20).
- Mentions légales, conditions générales et politique de confidentialité dans les liens du pied de page.

## 12. États des écrans

| Écran | États montrés dans la maquette |
|---|---|
| Connexion (4) | Normal, erreur de mot de passe |
| Inscription (5) | Liste de règles du mot de passe partiellement remplie |
| Mot de passe oublié (6) | Demande, lien envoyé, nouveau mot de passe |
| Menu (10) | Plat ajouté avec quantité, plat indisponible, plat en promo |
| Panier (11) | Panier rempli, panier vide |
| Suivi de commande (13) | En préparation (avis verrouillé), Livrée (avis déverrouillé) |
| Fidélité (15) | Solde suffisant, solde sous le minimum de 15 points |
| Parrainage (16) | Code généré, code à générer |
| Roue de la chance (18b) | Tour disponible, résultat, tour utilisé |
| Mise à jour du menu (22) | Modifications non enregistrées |
| Gestion des employés (30) | Confirmation de suppression |

Chaque écran peut en plus avoir un état de chargement, un état vide et un état d'erreur réseau, à ajouter au moment de la maquette interactive.

## 13. Données d'exemple

Les mêmes données reviennent partout pour que la démonstration paraisse réelle. Ce sont des **exemples inventés**, à remplacer par de vraies valeurs avant toute présentation officielle. **Aucune donnée réelle ne doit figurer dans la démo.**

**Étudiant de référence**

| Élément | Valeur |
|---|---|
| Nom | Arsène Nkoulou (« Arsène K. » dans l'interface) |
| Solde de points | 120 pts, soit 8 000 FCFA de réduction |
| Code de parrainage | `MIAM-ARS24` |
| Classement | 4e du Top 10 du mois, 7 commandes |
| Adresse de livraison | Résidence La Terrasse, Bâtiment C, chambre 201 |
| Téléphone | +237 699 12 34 56 (fictif) |
| Filleuls | Clarisse M., Brice N., Nadine K. (récompensés, +15 pts chacun), Samuel T. (en attente) |

**Commande en cours MM-1048** : paiement par MTN Mobile Money, reçue à 19:02, arrivée estimée à 19:25.

| Article | Quantité | Prix |
|---|---|---|
| Poulet DG Royal | 2 | 7 000 FCFA |
| Poisson braisé et bobolo | 1 | 4 500 FCFA |
| Bissap frais glacé (50 cl) | 2 | 1 000 FCFA |
| Sous-total | | 12 500 FCFA |
| Réduction promo ETUDIANT10 | | −1 250 FCFA |
| Réduction points (30 pts) | | −2 000 FCFA |
| Frais de service et de livraison | | 500 FCFA |
| **Total réglé** | | **9 750 FCFA** |

Points gagnés : 9 (un point par tranche de 1 000 FCFA). Solde après livraison : 120 − 30 + 9 = **99 pts**.

**Historique** : 26 commandes, 82 300 FCFA dépensés, +185 points gagnés.

| N° | Date | Contenu | Service | Total | Statut |
|---|---|---|---|---|---|
| MM-1042 | 21 oct. | Ndolé aux crevettes, Jus de gingembre ×2 | Sur place | 4 400 FCFA | Livrée |
| MM-1039 | 18 oct. | Brochettes de bœuf ×3, Bissap | Sur place | 5 000 FCFA | Livrée |
| MM-1035 | 15 oct. | Riz sauté au poulet | Livraison | 3 000 FCFA | Livrée |
| MM-1031 | 12 oct. | Poulet DG, Bissap | Sur place | 4 000 FCFA | Livrée |
| MM-1027 | 9 oct. | Burger maison | Livraison | 3 000 FCFA | Annulée |
| MM-1022 | 5 oct. | Poisson braisé et bobolo | Sur place | 4 500 FCFA | Livrée |
| MM-1018 | 2 oct. | Beignets-haricots ×2 | Sur place | 1 000 FCFA | Livrée |

**Personnel et restaurant**

- Employée de référence : Marie T. Aucun nom n'est attribué au gérant.
- Plats : Poulet DG (3 500 FCFA), Ndolé aux crevettes (3 000 FCFA), Poisson braisé et bobolo (4 500 FCFA), Brochettes de bœuf (1 500 FCFA), Riz sauté au poulet (2 500 FCFA), Beignets-haricots (500 FCFA), Jus de gingembre (700 FCFA), Bissap (500 FCFA).
- Événements : Soirée Ligue des champions (mercredi 28 octobre, 21 h), Tournoi de billard (samedi 31 octobre, 18 h), Soirée acoustique et dégustation de Ndolé (vendredi 6 novembre, 19 h 30).
- Contact du restaurant : +237 6 00 00 00 00 et +237 699 00 11 22 (numéros fictifs).

## 14. Décisions UI

| Décision | Raison |
|---|---|
| Thème sombre, noir et or | Charte du cahier des charges et logo ZeDuc-Sp@ce |
| Or comme seul accent, aucun orange | Cohérence visuelle ; l'or remplace l'orange du visuel de référence |
| Cartes plates, sans dégradé ni halo | Sobriété ; seul le bouton principal est légèrement dégradé |
| Une coque par espace, identique sur toutes ses pages | Repères constants pour l'utilisateur |
| Le statut n'est jamais indiqué par la couleur seule | Accessibilité : chaque pastille a un libellé |
| Pastilles de statut identiques dans tous les espaces | Lecture immédiate pour l'étudiant comme pour le personnel |
| Graphiques monochromes or | Lisibilité et cohérence avec la charte |
| Chiffres cohérents d'un écran à l'autre | Démonstration crédible (voir section 13) |
| Menus temporaires pour l'employé, définitifs pour l'administrateur | Règle du cahier des charges |
| Réclamations : l'employé rédige, le gérant valide | Circuit de validation avant la réponse officielle |

## 15. Méthode de production

La chaîne de travail suit le cahier des charges : **maquette Figma déployée sur Vercel** pour la démonstration.

1. **Stitch** : chaque écran est généré avec le bloc de design commun puis le prompt de la page, un écran par prompt, au bon format (Web ou App).
2. **Cohérence** : pour toutes les pages de l'application, la page « Menu du jour » est importée comme image de référence avec le prompt de style de référence (coque, couleurs, bordures et effets identiques).
3. **Retouches** : une consigne courte et précise sur un seul défaut, sans régénérer l'écran.
4. **Figma** : export des écrans validés, pages rangées par espace (A à E), styles de couleur et de texte créés à partir des jetons de la section 4, prototype relié selon les parcours de la section 7.
5. **Vercel** : déploiement du prototype pour la démonstration, vérification du rendu sur plusieurs navigateurs et appareils.

## 16. Suivi d'avancement

Le classeur `Mon_Miam_Miam_Pages.xlsx` liste les 38 écrans avec deux colonnes de statut (Desktop et Mobile : À faire, En cours, Validé) et une feuille de synthèse qui calcule la part validée. L'indicateur « Prompt style de référence » signale les pages dont le prompt a été adapté au style de la page de référence.

## 17. Critères de l'issue #5

- [x] Lien vers la maquette Figma
- [x] Espaces étudiant, employé, gérant et administrateur identifiables (sections 3 et 5)
- [x] Guide de navigation et parcours (sections 6 et 7)
- [x] Composants et identité visuelle (sections 4 et 5)
- [x] Règles responsive (section 10)
- [x] Décisions UI (section 14)
- [x] Exports PNG ou PDF déposés dans `exports/`
- [ ] Confirmation du dépôt dans l'[issue #5](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/5)

## 18. Contribuer

Toute modification de ce dossier passe par une branche, une Pull Request relue et le ticket Jira correspondant, comme décrit dans [CONTRIBUTING.md](CONTRIBUTING.md). Pour les interfaces, joindre des captures Figma, vérifier le mobile et les couleurs `#CFBD97` / `#000000`.