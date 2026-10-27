# Guide de Christian — Tester React avec le backend Laravel

Ce guide concerne l'issue #28. Le backend est sur la branche `feat/28-backend-init` et la PR #57 est en brouillon.

## A. Préparer le backend

Dans PowerShell :

```powershell
git clone https://github.com/jeankazazmba/Projet_DeveloppementWeb.git
cd Projet_DeveloppementWeb
git fetch origin
git checkout feat/28-backend-init
cd backend
.\scripts\setup.ps1
```

Prérequis : PHP 8.2+, Composer 2 et extensions PHP nécessaires. Si PowerShell bloque le script, exécuter manuellement les commandes du fichier `INSTALLATION.md` ; ne pas désactiver globalement les protections PowerShell.

Le script installe les dépendances, crée `.env` si nécessaire, génère `APP_KEY` et vide le cache de configuration. Il **n'installe pas MySQL** et ne lance pas les migrations métier.

## B. Démarrer et vérifier l'API

Dans le dossier `backend` :

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Dans un deuxième terminal :

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Réponse attendue :

```json
{
    "status": "ok",
    "application": "Mon Miam Miam",
    "service": "backend"
}
```

## C. Appeler l'API depuis React/Vite

Dans le projet React, créer `.env.local` :

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Dans un composant React :

```jsx
import { useEffect, useState } from 'react';

export default function ApiStatus() {
    const [message, setMessage] = useState('Vérification en cours...');

    useEffect(() => {
        async function checkApi() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/health`
                );

                if (!response.ok) {
                    throw new Error('Réponse HTTP ' + response.status);
                }

                const data = await response.json();

                setMessage(data.status === 'ok'
                    ? 'Backend connecté'
                    : 'Réponse inattendue');
            } catch (error) {
                setMessage('Connexion impossible : ' + error.message);
            }
        }

        checkApi();
    }, []);

    return <p>{message}</p>;
}
```

Lancer Vite avec `npm run dev` et vérifier que la page affiche **Backend connecté**.

## D. Vérifier CORS

La valeur par défaut du backend est `FRONTEND_URL=http://localhost:5173`.
Si Vite tourne sur `http://127.0.0.1:5173` ou sur un autre port, adapter `FRONTEND_URL` dans `backend/.env`, puis exécuter :

```powershell
php artisan config:clear
```

Redémarrer Laravel et recharger React.

**Attention :** une requête `curl` ou `Invoke-RestMethod` réussie ne prouve pas que CORS fonctionne ; effectuer aussi le test dans le navigateur.

## E. Tests et remontée des problèmes

Depuis `backend` :

```powershell
php artisan route:list --path=api
php artisan test
```

Communiquer au responsable backend :
- version PHP et Composer ;
- résultat de `composer install` ;
- réponse de `/api/health` ;
- résultat du test React dans le navigateur ;
- erreurs CORS éventuelles (sans partager `.env` ni secrets).

## F. Important pour le travail en équipe

Ne pas modifier directement la branche backend de Jean. Créer une branche frontend à partir de `main`, intégrer les changements backend après fusion de la PR #57 ou travailler temporairement avec la branche de démonstration.
