# Lancer les différentes parties de Mon Miam Miam

Ce guide utilise **PowerShell sous Windows**. Ouvrir un terminal distinct pour chaque serveur à laisser actif. Les chemins ci-dessous partent de la racine du dépôt `Projet_DeveloppementWeb`.

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
| Administration | http://localhost:5173/admin |
| Administration de la plateforme | http://localhost:5173/plateforme |
| Gérant | http://localhost:5173/gerant |
| Employé | http://localhost:5173/employe |

**Un seul `npm run dev` suffit pour toutes ces pages.** Les espaces métier contiennent actuellement des données de démonstration ; ouvrir leur URL ne constitue pas une connexion sécurisée.

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

L’application mobile contient les espaces **étudiant** et **employé** dans le même projet. Le passage à l’espace employé se fait dans l’interface de démonstration ; il n’y a pas de deuxième serveur Expo à lancer. L’étudiant peut filtrer le catalogue par restaurant ; l’employé choisit son restaurant de travail en entrant dans son espace. Les données des deux espaces sont locales et ne se synchronisent pas encore avec le site ou le backend.

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

Tauri démarre Vite lui-même : **ne pas lancer `npm run dev` dans un autre terminal pour cette même session**, sauf configuration particulière des ports. Pour arrêter Tauri : `Ctrl + C`.

Pour générer plus tard l’installateur Windows, depuis `frontend/` :

```powershell
npx @tauri-apps/cli@2 build
```

Cette commande compile l’application et produit un installateur NSIS. Le propriétaire du projet effectue lui-même cette étape. La connexion réelle de la version bureau attend encore une API d’authentification ; le bouton « Explorer la démo » n’authentifie personne. Voir [frontend/DESKTOP.md](frontend/DESKTOP.md).

## 4. API Laravel (backend)

L’API n’est **pas nécessaire** pour consulter les interfaces de démonstration actuelles. Elle sert au futur échange de données et expose pour l’instant `GET /api/health`.

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

La version bureau Tauri se lance **à la place du terminal Vite** pour sa propre session : `npx @tauri-apps/cli@2 dev` depuis `frontend/`. Le site web et la version bureau peuvent coexister seulement si leurs serveurs Vite utilisent des ports distincts configurés explicitement.

> Ce fichier documente les commandes. Aucun serveur ni aucune compilation n’a été lancé lors de sa rédaction.
