# Conteneurs de développement et d’intégration

La plateforme se répartit en quatre services : le frontend web React/Vite, l’API Laravel, MySQL et le serveur Expo. Le bureau Tauri n’est pas conteneurisé : il dépend de WebView2 et des outils Windows de compilation, et doit rester lancé sur la machine hôte.

## Intégration complète

Créer `.env` depuis `.env.example`, avec des secrets propres pour `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` et une `APP_KEY` Laravel. Puis exécuter :

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

L’API applique ses migrations au démarrage. Le frontend répond sur `http://localhost:5173`, l’API sur `http://localhost:8000` et MySQL est disponible sur `localhost:3306`. Pour initialiser les restaurants d’exemple et les chiffres de recette :

```powershell
docker compose exec backend php artisan db:seed --force
docker compose exec backend php artisan db:seed --class=PlatformRecetteSeeder --force
docker compose exec backend php artisan mmm:create-platform-admin admin@zeduc-space.local
```

La première commande admin demande le mot de passe dans le terminal et ne l’écrit pas dans le dépôt.

## Mobile Expo

Ajouter le profil mobile :

```powershell
$env:EXPO_PUBLIC_API_URL='http://ADRESSE_IP_DU_PC:8000'
docker compose -f compose.yaml -f compose.dev.yaml --profile mobile up --build
```

Pour Expo Go sur téléphone, remplacer `ADRESSE_IP_DU_PC` par l’adresse IPv4 du poste sur le même Wi-Fi. `host.docker.internal` est approprié seulement depuis le conteneur, pas depuis le téléphone. Expo sert Metro sur les ports 8081, 19000 et 19001.

## Images de livraison

`compose.yaml` reste la composition de livraison : frontend statique Nginx, API Laravel et MySQL. Le frontend est construit avec `VITE_API_URL` ; une API publique HTTPS est donc requise avant publication Vercel. Les environnements locaux ne doivent jamais être utilisés comme URL d’API de production.

Les volumes nommés conservent les dépendances et les données MySQL. Pour arrêter sans les supprimer :

```powershell
docker compose down
```
