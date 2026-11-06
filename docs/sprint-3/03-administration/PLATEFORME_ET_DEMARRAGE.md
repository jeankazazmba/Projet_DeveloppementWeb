# Administration ZeDuc-Sp@ce : API, données et démarrage

## Périmètre livré

Le frontend `/plateforme` propose la connexion, l'inscription sur invitation, la vue du réseau, les fiches restaurants, les comptes des administrateurs locaux et leurs affectations, les invitations d'administrateurs de plateforme, les volumes de contenus/commandes, les tendances mensuelles, les seules réclamations escaladées, les totaux de programmes, l'audit et le changement de mot de passe.

Les routes `/api/platform/*` exigent `auth:sanctum` et `is_platform_admin`, sauf l'inscription avec un jeton d'invitation à usage unique. Le premier compte plateforme se crée avec `mmm:create-platform-admin` en console. Une inscription publique sans invitation n'accorde jamais ce rôle. Les liens d'invitation expirent en 48 heures ; seule l'empreinte SHA-256 est stockée. Le lien n'est affiché qu'à sa création et doit être transmis directement à son destinataire. Aucun envoi d'e-mail n'est simulé.

La base sépare restaurants, affectations, contenus, commandes, réclamations, mouvements de fidélité, parrainages, invitations et audit. Les montants sont en CDF. L'API plateforme expose les fiches publiques des restaurants, des comptes administrateurs, des agrégats par restaurant et mois, et les métadonnées minimales des réclamations escaladées. Elle ne retourne ni identité de client, ni dossier de réclamation, ni articles et paiements individuels. Un compte plateforme est refusé par les routes internes `/api/staff/*`, même si une affectation ancienne existe.

Les tables de commandes, fidélité, parrainage et réclamations sont prêtes pour les autres parcours. Leurs chiffres restent à zéro tant que les services métier correspondants ne les alimentent pas. Les règles exactes de fidélité et parrainage restent à valider ; le volume de commandes ne prouve pas un encaissement.

## Démarrage manuel par le propriétaire du projet

Depuis la racine du dépôt, dans PowerShell :

```powershell
Copy-Item .env.example .env
# Éditer .env : définir DB_PASSWORD et MYSQL_ROOT_PASSWORD avec des valeurs privées.
docker compose build
docker compose run --rm backend php artisan key:generate --show
# Copier la clé affichée dans APP_KEY du fichier .env, puis :
docker compose up -d
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
docker compose exec backend php artisan mmm:create-platform-admin admin@votre-domaine.cd
```

Le site public sera accessible à `http://localhost:5173/`, l'administration plateforme à `http://localhost:5173/plateforme` et l'API à `http://localhost:8000/api/health`. La commande de création du premier administrateur demande le mot de passe de manière interactive (12 caractères minimum). Aucun compte privilégié ni secret n'est fourni dans le dépôt. Le volume Docker `mmm_mysql` conserve la base entre deux démarrages. L'app mobile Expo n'est pas lancée par Compose.

Si le seul administrateur perd son mot de passe, l'opérateur disposant de la console serveur peut exécuter `docker compose exec backend php artisan mmm:reset-platform-password admin@votre-domaine.cd`. Cette opération révoque les sessions et laisse une trace d'audit. Aucune récupération par e-mail n'est activée sans service d'envoi configuré.

## Vercel

Le site public et `/plateforme` utilisent **le même frontend Vite**, donc un seul projet Vercel suffit. Son répertoire racine doit être `frontend/` ; `frontend/vercel.json` réécrit les routes React vers `index.html`. La variable `VITE_API_URL` doit contenir l'URL HTTPS publique de Laravel **avant la construction** du frontend. Dans l'API, `FRONTEND_URL` doit autoriser l'origine Vercel correspondante pour CORS. Le conteneur local et `localhost:8000` ne sont pas joignables par les visiteurs du site déployé. Sans API publiée, `/plateforme` reste une démonstration locale dans le navigateur, sans connexion réelle.

Le déploiement Vercel nécessite un projet lié à un compte autorisé. Aucune URL de production n'est inscrite ici tant qu'un déploiement réel n'est pas vérifié.
