# Lancer les différentes parties de Mon Miam Miam

Ce guide utilise **PowerShell sous Windows**. Ouvrir un terminal distinct pour chaque serveur à laisser actif. Les chemins ci-dessous partent de la racine du dépôt `Projet_DeveloppementWeb`.

## Démarrage de tout l'écosystème

### Lanceur sur le Bureau

Deux fichiers sont disponibles directement sur le Bureau Windows :

- `Lancer Mon Miam Miam.cmd` détecte l'IPv4 du PC, puis démarre Docker, MySQL, Laravel, le worker, le site web, Expo et Tauri.
- `Arreter Mon Miam Miam.cmd` arrête les conteneurs ; fermer également les fenêtres Expo et Tauri avec `Ctrl+C`.

Double-cliquer sur le premier fichier et garder la fenêtre ouverte jusqu'au message de réussite. Si la détection réseau échoue, le lanceur demande l'adresse IPv4 du PC ; elle doit être accessible depuis le téléphone utilisant Expo Go.

Préparer `.env` à la racine avec `DB_PASSWORD` et `MYSQL_ROOT_PASSWORD`, puis installer les dépendances avec `npm ci` dans `frontend/` et `mobile/`. Docker Desktop, Rust, WebView2 et les outils C++ Windows sont requis pour cette configuration complète. Relever l'adresse IPv4 du PC sur le réseau Wi-Fi avec `ipconfig`. Le téléphone Expo Go doit être sur ce même réseau.

```powershell
.\scripts\start-ecosystem.ps1 -CheckOnly -LanIp 192.168.1.10
.\scripts\start-ecosystem.ps1 -LanIp 192.168.1.10
```

Remplacer `192.168.1.10` par l'IPv4 réelle du PC. La première commande vérifie la configuration sans lancer les applications. La seconde démarre MySQL, Laravel, le worker et le web dans Docker, attend l'API, puis ouvre Expo et Tauri dans deux fenêtres interactives. Une clé `APP_KEY` absente est générée dans le `.env` local. Pour se passer temporairement de l'une des interfaces, utiliser `-SkipMobile` ou `-SkipDesktop`. `-NoBuild` évite de reconstruire les images Docker déjà disponibles.

Arrêter Expo et Tauri avec `Ctrl+C` dans leurs fenêtres, puis arrêter les conteneurs sans supprimer MySQL :

```powershell
.\scripts\stop-ecosystem.ps1
```

Les URL sont `http://localhost:5173/`, `http://localhost:5173/etudiant`, `http://localhost:8000/api/health` et `http://localhost:8000/api/ready`. Le code QR d'Expo apparaît dans sa fenêtre. Le rapport technique est dans [docs/sprint-4/rapport-technique](docs/sprint-4/rapport-technique/README.md).

Après le lancement, vérifier les services web et Expo avec `.\scripts\test-ecosystem.ps1`. Le lanceur exécute déjà la partie web/API de ce contrôle ; la fenêtre Tauri et les parcours avec comptes doivent être vérifiés manuellement. Le scénario étudiant → employé → gérant → plateforme est décrit dans le rapport technique.

## 1. Site public et applications web

Prérequis : Node.js et npm. À la première installation :

```powershell
cd frontend
npm ci
```

Pour les lancements suivants, depuis `frontend/` :

```powershell
npm run dev
```

Le serveur Vite affiche son adresse dans le terminal, normalement `http://localhost:5173`. Avec ce port, les entrées sont :

| Partie | Adresse |
| --- | --- |
| Site public | http://localhost:5173/ |
| Menu public | http://localhost:5173/menu |
| Promotions, événements et jeux publics | http://localhost:5173/promotions |
| Choix d’espace / accès | http://localhost:5173/acces |
| Espace étudiant web (API requise) | http://localhost:5173/etudiant |
| Administration | http://localhost:5173/admin |
| Administration de la plateforme | http://localhost:5173/plateforme |
| Gérant | http://localhost:5173/gerant |
| Employé | http://localhost:5173/employe |

**Un seul `npm run dev` suffit pour toutes ces pages.** Les espaces métier proposent encore un mode démonstration ; seuls les parcours connectés à Laravel utilisent les comptes et les données réelles.

Pour arrêter Vite : `Ctrl + C` dans son terminal.

## 2. Application mobile Expo (étudiant et employé)

Prérequis : Node.js 22.13+ ou 24.3+, npm, puis Expo Go compatible avec le SDK 58 sur le téléphone ou un émulateur configuré. À la première installation :

```powershell
cd mobile
npm ci
```

Pour lancer Expo depuis `mobile/` :

```powershell
npx expo start
```

Scanner le code QR affiché avec Expo Go. Pour demander directement Android, utiliser `npm run android` ; pour la prévisualisation dans un navigateur, `npm run web`. La prévisualisation web ne reproduit pas nécessairement les composants natifs, notamment la carte.

L’application mobile contient les espaces **étudiant** et **employé** dans le même projet ; il n’y a pas de deuxième serveur Expo à lancer. Avec `EXPO_PUBLIC_API_URL=http://IP_DU_PC:8000`, les parcours connectés utilisent l’API. Le téléphone doit pouvoir joindre l’IPv4 du PC sur le même réseau local.

Pour arrêter Expo : `Ctrl + C`.

## 3. Application bureau Tauri (admin, gérant, employé)

Prérequis Windows : Node.js/npm, Rust, Microsoft C++ Build Tools et WebView2. Tauri réutilise `frontend/`, mais démarre sur son entrée dédiée `desktop.html` : splash screen → choix du rôle → écran de connexion → choix du restaurant si le rôle y est affecté dans la démo → accès explicite à la démo.

À la première installation, depuis la racine du dépôt :

```powershell
cd frontend
npm ci
```

Pour lancer la fenêtre bureau depuis `frontend/` :

```powershell
npx @tauri-apps/cli@2 dev
```

Tauri vérifie si le Vite du projet tourne déjà sur le port 5173 et le réutilise. Lorsqu'il est lancé seul, il démarre Vite. Le site web et le bureau peuvent donc coexister sur le même serveur Vite. Pour arrêter Tauri : `Ctrl + C`.

Pour générer plus tard l’installateur Windows, depuis `frontend/` :

```powershell
npx @tauri-apps/cli@2 build
```

Cette commande compile l’application et produit un installateur NSIS. Le propriétaire du projet effectue lui-même cette étape. L'écran d'entrée Tauri contient encore un parcours de démonstration ; l'authentification réelle et les droits sont vérifiés dans les espaces connectés. Voir [frontend/DESKTOP.md](frontend/DESKTOP.md).

## 4. API Laravel (backend)

L’API est nécessaire aux parcours réels, notamment l'espace étudiant web, les commandes et les vues professionnelles connectées. Le mode démonstration reste consultable sans API. Pour tester l'administration de plateforme, suivre [le guide de recette plateforme](docs/sprint-3/03-administration/TEST_ADMIN_PLATEFORME.md).

Prérequis : PHP 8.2+, Composer 2 et MySQL 8+ avec une base locale `mon_miam_miam`. À la première installation, depuis la racine du dépôt :

```powershell
cd backend
composer install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

Renseigner ensuite `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` dans `backend/.env` selon votre installation MySQL. Si la base n’existe pas, la créer avant de l’utiliser. Ne pas publier ce fichier `.env`.

Pour lancer l’API depuis `backend/` :

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Dans un autre terminal, vérifier l’endpoint disponible :

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Si l’interface web doit appeler l’API, créer `frontend/.env.local` avec :

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Redémarrer Vite après une modification de `.env.local`. Voir [backend/INSTALLATION.md](backend/INSTALLATION.md) pour la configuration détaillée. Pour arrêter Laravel : `Ctrl + C`.

## 5. Lancer plusieurs parties ensemble

| Terminal | Dossier | Commande |
| --- | --- | --- |
| 1 | `backend/` | `php artisan serve --host=127.0.0.1 --port=8000` |
| 2 | `frontend/` | `npm run dev` |
| 3 | `mobile/` | `npx expo start` |

Pour lancer les trois interfaces avec MySQL, Laravel et la file de notifications, utiliser la commande unique de la première section. Tauri réutilise le serveur Vite du web ; aucun deuxième port web n'est nécessaire.

> Ce fichier documente les commandes. Aucun serveur ni aucune compilation n’a été lancé lors de sa rédaction.
