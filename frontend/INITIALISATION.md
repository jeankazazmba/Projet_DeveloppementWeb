# Initialisation : connexion entre le frontend et le backend

> Guide technique de la première intégration frontend (React) / backend (Laravel)
> Sprint 2 · Issue n° 28 · Dernière mise à jour : 31 octobre 2026

---

## Sommaire

1. [Objectif](#1-objectif)
2. [Principe de fonctionnement](#2-principe-de-fonctionnement)
3. [Prérequis et dépendances](#3-prérequis-et-dépendances)
4. [Étape 1 : lancer le backend](#4-étape-1--lancer-le-backend)
5. [Étape 2 : vérifier l'API](#5-étape-2--vérifier-lapi)
6. [Étape 3 : installer et configurer le frontend](#6-étape-3--installer-et-configurer-le-frontend)
7. [Étape 4 : le composant de test `ApiStatus`](#7-étape-4--le-composant-de-test-apistatus)
8. [Étape 5 : configurer CORS](#8-étape-5--configurer-cors)
9. [Étape 6 : valider la connexion](#9-étape-6--valider-la-connexion)
10. [Dépannage](#10-dépannage)
11. [Checklist de validation](#11-checklist-de-validation)

---

## 1. Objectif

Ce guide explique comment **établir la communication entre le frontend React et l'API Laravel**, et présente les dépendances nécessaires à son bon fonctionnement. Il s'appuie sur le guide fourni par l'équipe backend (`backend/docs/GUIDE_CHRISTIAN_REACT.md`).

Le critère de réussite est simple : la page d'accueil du frontend affiche **« Backend connecté »**.

---

## 2. Principe de fonctionnement

Le frontend et le backend sont deux applications **indépendantes**, qui tournent sur deux adresses différentes et communiquent par requêtes HTTP.

```
+--------------------------+  GET /api/health       +--------------------------+
|  Navigateur              | ---------------------> |  Backend Laravel         |
|  Frontend React (Vite)   |                        |  http://127.0.0.1:8000   |
|  http://localhost:5173   | <--------------------- |                          |
+--------------------------+  JSON {"status":"ok"}  +--------------------------+
```

Trois éléments doivent être en place :

1. **Le backend est lancé** et expose l'endpoint `/api/health`.
2. **Le frontend connaît l'adresse de l'API**, grâce à la variable d'environnement `VITE_API_URL`.
3. **Le backend autorise l'origine du frontend** (mécanisme CORS), sans quoi le navigateur bloque la réponse.

---

## 3. Prérequis et dépendances

### 3.1 Environnement

| Outil | Rôle | Vérification |
|---|---|---|
| **Node.js** (version LTS récente) et **npm** | Exécuter le frontend | `node -v` et `npm -v` |
| **PHP 8.2 ou supérieur** | Exécuter le backend | `php -v` |
| **Composer 2** | Installer les dépendances PHP | `composer -V` |
| **Git** | Gestion de versions | `git --version` |

### 3.2 Dépendances du frontend (npm)

Elles sont déclarées dans `frontend/package.json` et installées par `npm install`. Les versions exactes figurent dans `package.json` et `package-lock.json`.

| Dépendance | Rôle dans l'intégration |
|---|---|
| `react` | Bibliothèque d'interface : composants, états (`useState`) et effets (`useEffect`) utilisés par `ApiStatus` |
| `react-dom` | Affichage de l'application dans la page (`createRoot`) |
| `react-router-dom` | Navigation entre les pages (`BrowserRouter`, `Routes`, `Route`) |
| `vite` | Serveur de développement et outil de build ; **charge aussi les variables d'environnement** `VITE_*` |
| `@vitejs/plugin-react` | Support de JSX et rechargement à chaud dans Vite |
| `tailwindcss` | Framework CSS utilisé pour la mise en forme |
| `@tailwindcss/vite` | Intégration de Tailwind dans Vite |
| `eslint` et sa configuration | Analyse statique du code |

> Aucune bibliothèque HTTP supplémentaire n'est nécessaire : les appels à l'API utilisent la fonction **`fetch`** native du navigateur.

### 3.3 Dépendances du backend

| Élément | Rôle |
|---|---|
| **Laravel** | Framework PHP qui expose l'API (routes préfixées par `/api`) |
| **Extensions PHP** | Requises par Laravel (la liste est donnée par le guide d'installation du backend) |
| **Configuration CORS** | Autorise le frontend à appeler l'API ; pilotée par la variable `FRONTEND_URL` du fichier `backend/.env` |
| **MySQL** | Base de données du projet. Le script d'installation du backend **ne l'installe pas** et **n'exécute pas les migrations métier** |

---

## 4. Étape 1 : lancer le backend

Le backend est développé sur la branche `feat/28-backend-init` (PR n° 57). **Ne pas modifier cette branche directement** : elle appartient à l'équipe backend.

### 4.1 Récupérer le code

```bash
git clone https://github.com/jeankazazmba/Projet_DeveloppementWeb.git
cd Projet_DeveloppementWeb
git fetch origin
git checkout feat/28-backend-init
cd backend
```

### 4.2 Installer le backend

**Sous Windows (PowerShell)**, utiliser le script fourni :

```powershell
.\scripts\setup.ps1
```

Ce script installe les dépendances, crée le fichier `.env` si nécessaire, génère la clé d'application (`APP_KEY`) et vide le cache de configuration. Si PowerShell bloque son exécution, suivre les commandes manuelles du fichier `INSTALLATION.md` du backend, sans désactiver les protections de PowerShell.

**Sous Linux ou macOS**, le script PowerShell n'est pas utilisable. Les commandes équivalentes, indiquées par l'équipe backend, sont :

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan config:clear
```

### 4.3 Démarrer l'API

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Le serveur reste actif dans ce terminal : **ouvrez un second terminal** pour la suite.

---

## 5. Étape 2 : vérifier l'API

Dans un second terminal :

```bash
curl http://127.0.0.1:8000/api/health
```

Sous PowerShell : `Invoke-RestMethod http://127.0.0.1:8000/api/health`.

Réponse attendue :

```json
{
    "status": "ok",
    "application": "Mon Miam Miam",
    "service": "backend"
}
```

> Ce test prouve que l'API fonctionne, mais **pas que CORS est correctement configuré**. Le test décisif se fait dans le navigateur (étape 6).

---

## 6. Étape 3 : installer et configurer le frontend

### 6.1 Installer les dépendances

```bash
cd frontend
npm install
```

### 6.2 Déclarer l'adresse de l'API

Créer le fichier **`frontend/.env`** avec le contenu suivant :

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Points importants :

- Vite n'expose au code du navigateur que les variables dont le nom commence par **`VITE_`**.
- Elles se lisent avec `import.meta.env.VITE_API_URL`.
- Le fichier est lu **au démarrage** : après toute modification, arrêter (`Ctrl + C`) puis relancer `npm run dev`.
- Ce fichier est **propre à chaque poste** et ne doit pas être versionné. Vite permet aussi d'utiliser un fichier `.env.local`, prioritaire sur `.env`.

### 6.3 Brancher le routeur

Le fichier `src/main.jsx` doit envelopper l'application dans un `BrowserRouter`. Sans lui, le composant `Routes` provoque l'erreur `useRoutes() may be used only in the context of a <Router>` et la page reste blanche.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

---

## 7. Étape 4 : le composant de test `ApiStatus`

### 7.1 Le composant

Fichier **`frontend/src/features/ApiStatus.jsx`** :

```jsx
import { useEffect, useState } from 'react'

export default function ApiStatus() {
  const [message, setMessage] = useState('Vérification en cours...')

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health`)

        if (!response.ok) {
          throw new Error('Réponse HTTP ' + response.status)
        }

        const data = await response.json()

        setMessage(data.status === 'ok' ? 'Backend connecté' : 'Réponse inattendue')
      } catch (error) {
        setMessage('Connexion impossible : ' + error.message)
      }
    }

    checkApi()
  }, [])

  return <p className="p-8 text-xl text-black bg-white">{message}</p>
}
```

### 7.2 Fonctionnement

| Élément | Rôle |
|---|---|
| `useState` | Mémorise le message affiché ; valeur initiale : « Vérification en cours... » |
| `useEffect(..., [])` | Lance la vérification **une seule fois**, au premier affichage du composant |
| `fetch(`${import.meta.env.VITE_API_URL}/health`)` | Envoie la requête `GET` vers `http://127.0.0.1:8000/api/health` |
| `response.ok` | Détecte les réponses d'erreur HTTP (404, 500…) |
| `try / catch` | Capture les échecs réseau et les refus CORS, et affiche un message explicite |

### 7.3 Intégration dans la page d'accueil

Dans `frontend/src/App.jsx`, le composant est importé puis utilisé dans `Accueil` :

```jsx
import { Routes, Route } from 'react-router-dom'
import ApiStatus from './features/ApiStatus.jsx'

function Accueil() {
  return (
    <div>
      <h1 className="p-8 text-3xl font-bold text-amber-300 bg-black">Mon Miam Miam</h1>
      <ApiStatus />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
    </Routes>
  )
}
```

---

## 8. Étape 5 : configurer CORS

Un navigateur interdit à une page d'appeler une autre adresse, sauf si celle-ci l'autorise explicitement : c'est le mécanisme **CORS**. Ici, le frontend (`localhost:5173`) appelle le backend (`127.0.0.1:8000`) : le backend doit donc autoriser l'origine du frontend.

Cette autorisation est pilotée par la variable `FRONTEND_URL` du fichier `backend/.env`. Sa valeur par défaut est :

```dotenv
FRONTEND_URL=http://localhost:5173
```

Si Vite tourne sur une autre adresse (par exemple `http://127.0.0.1:5173`) ou un autre port :

1. Modifier `FRONTEND_URL` dans `backend/.env`.
2. Exécuter `php artisan config:clear`.
3. Redémarrer Laravel, puis recharger la page du frontend.

> `localhost` et `127.0.0.1` sont considérées comme **deux origines différentes** : la valeur de `FRONTEND_URL` doit correspondre exactement à l'adresse affichée dans la barre d'adresse du navigateur.

---

## 9. Étape 6 : valider la connexion

1. **Terminal 1**, dans `backend/` :
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```
2. **Terminal 2**, dans `frontend/` :
   ```bash
   npm run dev
   ```
3. Ouvrir **http://localhost:5173** dans le navigateur.

**Résultat attendu** : sous le titre « Mon Miam Miam », le message **« Backend connecté »** s'affiche.

Pour inspecter les échanges : touche **F12**, onglet **Réseau**, requête `health` (statut 200). L'onglet **Console** affiche les éventuelles erreurs CORS.

---

## 10. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Page entièrement blanche | Erreur JavaScript | Ouvrir la console (F12) et lire l'erreur |
| `useRoutes() may be used only in the context of a <Router>` | `BrowserRouter` absent de `main.jsx` | Voir l'étape 3, section 6.3 |
| `Connexion impossible : Failed to fetch` | Backend arrêté, mauvais port, ou erreur CORS | Vérifier que `php artisan serve` tourne ; consulter la console du navigateur |
| Erreur CORS dans la console | `FRONTEND_URL` ne correspond pas à l'adresse du frontend | Voir l'étape 5, puis `php artisan config:clear` et redémarrer Laravel |
| `Connexion impossible : Réponse HTTP 404` | Mauvaise valeur de `VITE_API_URL` | Elle doit se terminer par `/api` et ne pas contenir de `/` final |
| `Connexion impossible : Réponse HTTP 500` | Erreur côté backend | Consulter les journaux Laravel (`backend/storage/logs`) et prévenir l'équipe backend |
| `undefined/health` dans l'URL appelée | `.env` absent, mal nommé, ou serveur non redémarré | Vérifier le nom et le contenu du fichier, puis relancer `npm run dev` |
| `Failed to resolve import` | Mauvais chemin d'import ou fichier manquant | Vérifier le chemin dans l'instruction `import` |
| Le script `setup.ps1` est bloqué | Politique d'exécution de PowerShell | Utiliser les commandes manuelles de `INSTALLATION.md` |

---

## 11. Checklist de validation

- [ ] Node.js, npm, PHP 8.2+ et Composer 2 sont installés
- [ ] Le backend est installé et `php artisan serve` démarre sans erreur
- [ ] `http://127.0.0.1:8000/api/health` renvoie `{"status":"ok", ...}`
- [ ] `npm install` s'est terminé sans erreur dans `frontend/`
- [ ] Le fichier `frontend/.env` contient `VITE_API_URL=http://127.0.0.1:8000/api`
- [ ] Le fichier `.env` n'apparaît pas dans les fichiers à committer (`git status`)
- [ ] `FRONTEND_URL` du backend correspond à l'adresse du frontend
- [ ] La page `http://localhost:5173` affiche **« Backend connecté »** dans le navigateur
- [ ] Les résultats du test ont été transmis à l'équipe backend

### Informations à transmettre à l'équipe backend

- Versions de PHP et de Composer
- Résultat de `composer install`
- Réponse de `/api/health`
- Résultat du test dans le navigateur
- Erreurs CORS éventuelles

> Ne jamais transmettre le contenu des fichiers `.env` ni de secrets.
