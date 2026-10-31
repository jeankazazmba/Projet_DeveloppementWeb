# Mon Miam Miam : Frontend

> **Initialisation du frontend et première intégration avec l'API Laravel**
> Sprint 2 · Issue n° 28 · Branche `feat/28-frontend-init`
> Dernière mise à jour : 31 octobre 2026

---

## 1. Présentation du projet

**Mon Miam Miam** (ZeDuc-Sp@ce) est une application web de commande en ligne et de gestion pour le restaurant de la Résidence La Terrasse (Yansoki, Douala). Elle permet aux étudiants de commander et de suivre leurs commandes, et au personnel de préparer, superviser et administrer le service.

Le projet est composé de deux parties :

| Partie | Technologie | Dossier |
|---|---|---|
| **Frontend** (ce document) | React, Vite, Tailwind CSS | `frontend/` |
| **Backend** | Laravel (API REST) | `backend/` |

Les documents de conception du projet se trouvent dans le dossier [`docs/`](../docs/), notamment [`DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md), [`PLAN_DE_TESTS.md`](../docs/PLAN_DE_TESTS.md) et [`RISQUES.md`](../docs/RISQUES.md).

---

## 2. Objet de ce document

Ce document présente le travail d'**initialisation du frontend** réalisé dans le cadre de l'issue n° 28. L'objectif de cette étape est de fournir à l'équipe une **base technique commune et fonctionnelle**, sur laquelle les autres membres pourront développer les écrans de l'application, et de **valider la communication entre le frontend et le backend**.

La procédure détaillée de connexion au backend est décrite dans [`INITIALISATION.md`](INITIALISATION.md).

---

## 3. Travail réalisé

| # | Livrable | Description | Fichier(s) |
|---|---|---|---|
| 1 | Projet frontend | Création du projet React avec Vite (JavaScript) et installation des dépendances | `package.json`, `vite.config.js`, `index.html` |
| 2 | Qualité du code | Configuration d'ESLint pour un style de code homogène dans l'équipe | `eslint.config.js` |
| 3 | Style | Intégration de Tailwind CSS via le plugin Vite | `vite.config.js`, `src/index.css` |
| 4 | Navigation | Mise en place de React Router : l'application est enveloppée dans un `BrowserRouter` | `src/main.jsx` |
| 5 | Routage | Déclaration de la première route (`/`) | `src/App.jsx` |
| 6 | Page d'accueil provisoire | Création du composant `Accueil` affichant le titre de l'application | `src/App.jsx` |
| 7 | Test de connexion à l'API | Création du composant `ApiStatus`, qui interroge l'endpoint `/api/health` du backend et affiche le résultat | `src/features/ApiStatus.jsx` |
| 8 | Configuration | Définition de l'adresse de l'API dans une variable d'environnement (`VITE_API_URL`) | `.env` |
| 9 | Intégration backend | Reprise du backend Laravel développé par l'équipe backend (branche `feat/28-backend-init`) pour valider l'intégration | voir `INITIALISATION.md` |
| 10 | Documentation | Rédaction du présent README et du guide d'initialisation | `README.md`, `INITIALISATION.md` |

---

## 4. Technologies utilisées

| Besoin | Outil |
|---|---|
| Interface utilisateur | [React](https://react.dev) |
| Outil de build et serveur de développement | [Vite](https://vite.dev) |
| Navigation entre les pages | [React Router](https://reactrouter.com) (`react-router-dom`) |
| Mise en forme | [Tailwind CSS](https://tailwindcss.com) |
| Analyse statique du code | [ESLint](https://eslint.org) |
| Communication avec le backend | API `fetch` native du navigateur |

La liste complète des dépendances et leur rôle est détaillée dans [`INITIALISATION.md`](INITIALISATION.md#3-prérequis-et-dépendances).

---

## 5. Structure actuelle du frontend

```
frontend/
├── public/                  # Fichiers statiques
├── src/
│   ├── assets/              # Images et ressources
│   ├── features/
│   │   └── ApiStatus.jsx    # Composant de test de la connexion à l'API
│   ├── App.jsx              # Routes et composant Accueil
│   ├── index.css            # Styles globaux (Tailwind)
│   └── main.jsx             # Point d'entrée de l'application
├── .env                     # Variables d'environnement locales (non versionné)
├── eslint.config.js         # Configuration d'ESLint
├── index.html               # Page HTML de départ
├── package.json             # Dépendances et scripts
├── vite.config.js           # Configuration de Vite
├── README.md                # Présentation (ce document)
└── INITIALISATION.md        # Guide de connexion frontend / backend
```

---

## 6. Composants développés

### `Accueil` (dans `src/App.jsx`)

Page d'accueil provisoire, associée à la route `/`. Elle affiche le titre « Mon Miam Miam » et intègre le composant `ApiStatus` afin de visualiser immédiatement l'état de la connexion au backend.

### `ApiStatus` (dans `src/features/ApiStatus.jsx`)

Composant de diagnostic. Au chargement, il envoie une requête `GET` à l'endpoint `/health` du backend et affiche l'un des trois messages suivants :

| Message | Signification |
|---|---|
| `Vérification en cours...` | La requête est en cours |
| `Backend connecté` | Le backend a répondu avec `status: "ok"` |
| `Connexion impossible : …` | La requête a échoué (backend éteint, CORS, erreur HTTP…) |

Ce composant est **temporaire** : il sera retiré de la page d'accueil lorsque de véritables écrans appelleront l'API.

---

## 7. Démarrage rapide

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur **http://localhost:5173**.

Pour que `ApiStatus` affiche « Backend connecté », le backend doit être lancé et la variable `VITE_API_URL` renseignée : voir [`INITIALISATION.md`](INITIALISATION.md).

### Scripts disponibles

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Génère la version de production dans `dist/` |
| `npm run preview` | Prévisualise la version de production |
| `npm run lint` | Analyse le code avec ESLint |

---

## 8. Prochaines étapes

Cette initialisation prépare les travaux suivants :

1. Intégrer la charte graphique décrite dans [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) (couleurs, typographie) dans la configuration de Tailwind.
2. Créer les composants d'interface réutilisables (boutons, champs, cartes, badges).
3. Créer les mises en page (layouts) des espaces public, étudiant et personnel.
4. Structurer le routage et protéger les espaces selon le rôle de l'utilisateur.
5. Développer les écrans par fonctionnalité, en s'appuyant sur les maquettes Figma.
6. Remplacer le composant de test `ApiStatus` par de véritables appels à l'API.

---

## 9. Contribution

Les règles de contribution (branches, commits, Pull Requests) sont décrites dans [`CONTRIBUTING.md`](../CONTRIBUTING.md) à la racine du dépôt.

---

## 10. Contributeurs

| Rôle | Contributeur |
|---|---|
| Initialisation du frontend | Christian Onokola |
| Initialisation du backend | Jean (branche `feat/28-backend-init`) |
