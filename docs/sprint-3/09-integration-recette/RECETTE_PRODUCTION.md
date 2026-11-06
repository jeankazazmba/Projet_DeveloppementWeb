# Étape 11 — recette et préparation de production

Ce guide prépare l'exploitation. **Aucun déploiement n'a été réalisé.** Toutes les commandes ci-dessous sont à exécuter manuellement depuis la racine du dépôt. La composition `compose.production.yaml` est distincte de la composition locale `compose.yaml` et ne publie ni MySQL ni PHP-FPM directement.

## 1. Préparer l'environnement

En local, copier `.env.example` vers `.env`, remplacer les deux mots de passe MySQL, puis renseigner `APP_KEY` Laravel. Le frontend utilise `VITE_API_URL=http://localhost:8000` ; Expo sur téléphone utilise l'adresse IP LAN du PC dans `EXPO_PUBLIC_API_URL`.

En production, copier `.env.production.example` vers `.env.production` et remplacer **toutes** les valeurs factices. Préparer `deploy/certs/fullchain.pem` et `deploy/certs/privkey.pem` avec un certificat valide pour `PUBLIC_HOST`. Ces fichiers et `.env.production` sont ignorés par Git. Protéger leur lecture par le compte d'exploitation. Générer une clé Laravel unique de 32 octets (`php artisan key:generate --show`) et la conserver ; perdre `APP_KEY` invalide les données chiffrées et les jetons signés.

La composition de production configure `APP_ENV=production`, `APP_DEBUG=false`, `APP_REQUIRE_HTTPS=true`, `LOG_CHANNEL=json`, `PAYMENT_SANDBOX_ENABLED=false`, `CORS_ALLOWED_ORIGINS=https://PUBLIC_HOST`. Le navigateur utilise cette origine exacte. Expo et les clients API utilisent des jetons Bearer ; aucun secret de paiement ne doit être intégré dans React ou Expo. Le port 80 redirige vers HTTPS, et le port 443 termine TLS devant PHP-FPM.

## 2. Vérifier les fichiers Docker et les dépendances

```powershell
docker compose --env-file .env.example -f compose.yaml -f compose.dev.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml config --quiet
python backend/scripts/update_api_reference.py --check
```

`config --quiet` ne démarre ni conteneur ni compilation. Il vérifie la syntaxe et la résolution des variables Compose. Le contrôle avec le modèle `.env.production.example` a été effectué pendant l'implémentation ; il ne remplace pas un essai avec les secrets et certificats réels.

## 3. Démarrage local et recette

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up --build
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --class=RecetteSeeder --force
docker compose exec backend php artisan db:seed --class=DatabaseSeeder --force
docker compose exec backend php artisan db:seed --class=PlatformRecetteSeeder --force
```

La première commande locale de développement applique déjà les migrations au démarrage. Les trois seeders restent facultatifs, idempotents et **interdits en production**. `RecetteSeeder` crée deux restaurants fictifs isolés, leurs plats et créneaux. Pour nettoyer uniquement leurs données :

```powershell
docker compose exec backend php artisan mmm:recette:clear
docker compose exec backend php artisan mmm:recette:clear-platform
```

Le premier nettoyage refuse toute suppression si des commandes, réclamations, affectations ou autres données métier référencent ces restaurants. `DatabaseSeeder` crée les deux restaurants de démonstration historiques ; son nettoyage automatique n'est pas fourni car ces fiches peuvent déjà contenir des données de projet. Sauvegarder et examiner leurs références avant toute suppression manuelle.

## 4. Tests et critères de recette

```powershell
cd backend
C:\xampp\php\php.exe artisan test --testsuite=Feature
cd ..
```

Ou avec les dépendances dans Docker local :

```powershell
docker compose -f compose.yaml -f compose.dev.yaml exec backend php artisan test --testsuite=Feature
```

Les Feature tests vérifient l'authentification, la suspension, l'isolation entre restaurants, la publication, les commandes et versions, les réclamations privées, les statistiques séparées, les intentions de paiement, la signature et l'idempotence des webhooks, les seeders réversibles, CORS, HTTPS et la readiness. Les tests utilisent SQLite en mémoire ; une recette MySQL et des essais des interfaces web/Expo restent nécessaires avant une vraie publication.

Vérifier `GET /api/health` pour la vie du processus et `GET /api/ready` pour la connexion DB, les migrations et la table de queue. Une readiness non satisfaite renvoie `503` sans détail de connexion. Les réponses portent `X-Request-ID` pour retrouver la ligne JSON de journalisation correspondante. Aucune requête, adresse, mot de passe ni donnée de paiement n'est journalisée par le middleware de télémétrie.

## 5. Démarrage de production — commandes préparées, non exécutées

Après configuration du domaine, du certificat, des sauvegardes et des secrets :

```powershell
docker compose --env-file .env.production -f compose.production.yaml up -d --build db backend
python deploy/scripts/db_ops.py migrate
docker compose --env-file .env.production -f compose.production.yaml up -d --build queue gateway
docker compose --env-file .env.production -f compose.production.yaml ps
Invoke-WebRequest https://VOTRE_DOMAINE/api/ready
```

Ne pas exécuter `db:seed` en production. Vérifier ensuite les rôles, la navigation mobile, les commandes et les permissions sur chaque restaurant. Les données de paiement réelles restent indisponibles tant qu'un prestataire et ses contrats ne sont pas validés.

## 6. Sauvegarde MySQL et stockage privé

Les commandes suivantes utilisent les mots de passe **déjà présents dans le conteneur MySQL** et ne les affichent pas dans la ligne de commande hôte. Le script refuse d'écraser un fichier et crée un manifeste JSON avec empreinte SHA-256. Pour un point cohérent entre SQL et `storage` (pièces jointes privées et exports), arrêter les écritures pendant les deux sauvegardes :

```powershell
docker compose --env-file .env.production -f compose.production.yaml stop gateway queue
python deploy/scripts/db_ops.py backup backups/avant-migration.sql
python deploy/scripts/db_ops.py backup-storage backups/avant-migration-storage.tar.gz
docker compose --env-file .env.production -f compose.production.yaml start gateway queue
```

Pour l'environnement local, ajouter avant `backup` ou `restore` : `--compose-file compose.yaml --env-file .env`. Vérifier la taille, l'empreinte et le transfert chiffré des sauvegardes hors du serveur. Tester régulièrement une restauration sur un environnement isolé. Planifier une rétention et ne jamais committer `backups/`.

## 7. Migration et restauration contrôlée

Pour une migration de production, effectuer sauvegarde et migration pendant la même fenêtre sans écritures :

```powershell
docker compose --env-file .env.production -f compose.production.yaml stop gateway queue
python deploy/scripts/db_ops.py backup backups/avant-migration-2.sql
python deploy/scripts/db_ops.py backup-storage backups/avant-migration-2-storage.tar.gz
python deploy/scripts/db_ops.py migrate
docker compose --env-file .env.production -f compose.production.yaml start gateway queue
```

Pour restaurer, arrêter d'abord les écritures applicatives en coupant la passerelle et la queue, garder `backend` et `db` actifs pour les commandes, faire une sauvegarde de l'état courant dans un **nouveau nom**, puis restaurer les deux archives cohérentes :

```powershell
docker compose --env-file .env.production -f compose.production.yaml stop gateway queue
python deploy/scripts/db_ops.py backup backups/avant-restauration.sql
python deploy/scripts/db_ops.py backup-storage backups/avant-restauration-storage.tar.gz
python deploy/scripts/db_ops.py restore backups/avant-migration.sql --confirm-database mon_miam_miam
python deploy/scripts/db_ops.py restore-storage backups/avant-migration-storage.tar.gz --confirm-storage RESTORE_STORAGE
python deploy/scripts/db_ops.py migrate
docker compose --env-file .env.production -f compose.production.yaml start gateway queue
```

Remplacer `mon_miam_miam` par la valeur réelle de `DB_DATABASE`. Le script vérifie ce nom et les empreintes SHA-256 avant restauration. Il ne supprime aucun volume ; il réimporte le SQL et l'archive de stockage. Après restauration : contrôler `/api/ready`, une commande connue, une pièce jointe privée et les logs JSON. Une restauration SQL peut écraser des données récentes : elle doit être décidée dans la procédure d'incident, pas déclenchée automatiquement.

## Limites avant ouverture publique

- La configuration Compose de production et la passerelle TLS ont été validées **statiquement** ; aucune image de production n'a été construite ni aucun conteneur lancé dans cette étape.
- Les certificats, DNS, secrets, hébergement et mécanisme externe de rétention des sauvegardes restent à fournir.
- MySQL de recette, restauration à blanc, surveillance de la queue et essais de charge doivent être validés sur un environnement séparé avant ouverture publique.
- La référence de toutes les routes et des contrats est dans [REFERENCE_API.md](REFERENCE_API.md). Le paiement réel reste hors périmètre ; seul le paiement espèces et la sandbox locale sont codés.
