# Installation du backend (Sprint 2, Issue #28)

## 1. Prérequis

- PHP 8.2 ou supérieur, extensions requises par Laravel, notamment PDO MySQL.
- Composer 2.
- MySQL 8+ et une base locale `mon_miam_miam`.
- Git.
- Pour les tests isolés avec SQLite : extension `pdo_sqlite`.

## 2. Récupérer le projet

Depuis le dépôt :

```powershell
git fetch origin
git checkout feat/28-backend-init
cd backend
```

## 3. Installer les dépendances

Le squelette a été préparé sans Composer dans l'environnement de génération ; **aucun `composer.lock` n'est fourni**.
La première installation résout les versions autorisées par `composer.json` :

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Après installation, **committer `composer.lock`** dans une PR de suivi pour figer les versions exactes.

## 4. Préparer MySQL

Créer une base locale, par exemple via MySQL CLI :

```sql
CREATE DATABASE mon_miam_miam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Adapter ensuite dans `.env` les paramètres `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
Ne jamais committer le fichier `.env`.

Tester la connexion avec :

```powershell
php artisan db:show
```

**Attention :** les migrations métier de Caleb ne sont pas encore intégrées. Ne pas inventer des tables métier à ce stade.

## 5. Démarrer l'API

```powershell
php artisan serve
```

Vérifier dans un navigateur ou avec PowerShell :

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

## 6. Vérifier les tests et le formatage

```powershell
php artisan test
./vendor/bin/pint --test
```

Le test `HealthEndpointTest` n'accède pas à la base de données. La configuration PHPUnit utilise SQLite en mémoire pour les futurs tests isolés.

## 7. Tester avec Christian

Le frontend Vite démarre typiquement sur `http://localhost:5173`.
Dans `.env` :

```dotenv
FRONTEND_URL=http://localhost:5173
```

En cas de changement d'origine, mettre à jour cette valeur, puis exécuter :

```powershell
php artisan config:clear
```

Tester `fetch('http://127.0.0.1:8000/api/health')` depuis React.
Les appels authentifiés Sanctum devront faire l'objet d'une décision distincte sur les cookies, CSRF et domaines.

## 8. Travail restant avant validation

- Exécuter réellement `composer install` et enregistrer le lockfile.
- Vérifier MySQL sur la machine du développeur.
- Exécuter les tests et le contrôle de formatage.
- Faire tester l'API par Christian depuis React.
- Faire relire la PR et recueillir la validation du binôme.

Cette documentation ne vaut pas preuve d'exécution.
