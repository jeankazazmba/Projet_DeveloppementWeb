# Tester l’administration de la plateforme en local

Ce guide concerne **ZeDuc-Sp@ce** à `/plateforme`, distinct de l’admin d’un restaurant à `/admin`. Il ne nécessite aucun déploiement. Les commandes sont à lancer manuellement par le propriétaire du projet.

## 1. Parcours visuel immédiat, sans API

Depuis la racine du dépôt, dans PowerShell :

```powershell
cd frontend
npm ci # seulement si les dépendances ne sont pas installées
npm run dev
```

Ouvrir `http://localhost:5173/plateforme`, puis choisir **Explorer la démonstration**. Le badge **Démo** doit rester visible. Parcourir Vue d’ensemble, Restaurants, Accès responsables, Admins plateforme, Publications, Activité des commandes, Escalades, Programmes, Journal d’audit et Mon compte. Tester aussi le filtre Restaurant, les dates, la navigation étroite et le thème clair/sombre.

Dans ce mode, les changements restent dans le navigateur. Les comptes et les invitations ne donnent aucun accès réel ; l’invitation est désactivée. Les chiffres sont des exemples locaux. Une fenêtre de navigation privée permet de recommencer sans toucher aux données de la session habituelle.

## 2. Parcours réel avec Laravel et MySQL locaux

Préparer `.env` à la racine :

```powershell
Copy-Item .env.example .env
```

Définir dans ce fichier deux mots de passe privés, différents, pour `DB_PASSWORD` et `MYSQL_ROOT_PASSWORD`. Ne pas versionner `.env`. Puis, à la racine :

```powershell
docker compose build
docker compose run --rm backend php artisan key:generate --show
```

Copier la clé affichée dans `APP_KEY` du `.env` racine. Continuer :

```powershell
docker compose up -d
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
docker compose exec backend php artisan mmm:create-platform-admin admin@exemple.cd
```

La dernière commande demande **dans le terminal** un mot de passe d’au moins 12 caractères. Remplacer `admin@exemple.cd` par une adresse de test que vous contrôlez. L’adresse n’a pas besoin de recevoir d’e-mail pour ce test local ; aucun message n’est envoyé. La commande ne modifie pas un compte déjà existant.

Ouvrir `http://localhost:5173/plateforme` et se connecter avec ce compte. Le badge doit afficher **Connecté**. Vérifier `http://localhost:8000/api/health` si la page ne rejoint pas Laravel. Le conteneur frontend inclut `VITE_API_URL=http://localhost:8000` au moment de sa construction ; après un changement de cette variable, il faut reconstruire ce conteneur.

Pour tester aussi les graphiques, escalades, points et parrainages en mode connecté, charger **facultativement** des lignes synthétiques :

```powershell
docker compose exec backend php artisan db:seed --class=PlatformRecetteSeeder --force
```

Ce seeder est répétable, ne fait pas partie de `DatabaseSeeder` et marque ses lignes `is_demo`. Le bandeau du tableau de bord signalera ces données de recette. Ne l’utiliser que sur une base de test.

Si vous préférez lancer Vite et Laravel directement sans Docker, installer les dépendances et configurer MySQL comme dans [LANCEMENT.md](../../../LANCEMENT.md), puis placer `VITE_API_URL=http://127.0.0.1:8000` dans `frontend/.env.local` et redémarrer Vite. Les migrations, le seeder et la création du premier admin restent nécessaires.

## 3. Recette des rubriques connectées

| Rubrique | Manipulation | Résultat attendu |
| --- | --- | --- |
| Vue d’ensemble | Comparer le total des restaurants et changer le filtre. | Deux exemples au départ : `Khalifa_food` et `sleepy hollow`. Les chiffres suivent le filtre. |
| Restaurants | Créer une fiche de test, la publier, puis la suspendre avec un motif. | Brouillon à la création ; visible dans le répertoire public après publication ; retirée après suspension. Chaque changement apparaît dans l’audit. |
| Accès responsables | Créer un admin de restaurant avec un mot de passe initial de 12 caractères, puis lui ajouter ou retirer une affectation. | Seuls les rôles **admin restaurant** sont proposés. Le compte n’acquiert pas le rôle plateforme. Les affectations apparaissent dans le compte et l’audit. |
| Admins plateforme | Créer une invitation pour une autre adresse, copier immédiatement le lien et l’ouvrir dans une fenêtre privée. | Inscription possible avec la bonne adresse et un mot de passe valide ; lien à usage unique, valable 48 h. La liste ne réaffiche jamais le jeton. Une invitation peut être révoquée. |
| Publications | Choisir chaque restaurant. | Volumes de plats, promotions, événements et jeux publiés ; aucun titre, prix ou brouillon interne. |
| Activité des commandes | Changer le restaurant et la période. | Totaux et tendances agrégés ; aucune commande nominative. Les montants sont des volumes de commandes, pas des encaissements confirmés. |
| Escalades | Changer le restaurant et la période. | Uniquement identifiant, restaurant, statut et date des dossiers escaladés ; aucun motif ni échange. |
| Programmes | Consulter les totaux. | Points et parrainages agrégés ; aucune opération individuelle. |
| Journal d’audit | Revoir les créations, suspensions et affectations. | Auteur, action, cible, date et motif ; pas de contenu interne. |
| Mon compte | Changer le mot de passe, quitter puis se reconnecter. | Le nouveau mot de passe fonctionne ; les autres sessions sont révoquées. |

Sans le seeder facultatif, les commandes, réclamations, points et parrainages peuvent afficher **zéro** en mode connecté : le seeder normal crée des restaurants et contenus, mais les API métier qui alimentent ces tables ne sont pas encore livrées. Cela n’empêche pas de vérifier les filtres et la séparation des données.

## 4. Vérifier les droits

Avec le compte plateforme, l’URL `/catalogue-pro` doit refuser l’accès au catalogue interne. Avec le compte admin restaurant créé à l’étape 3, la connexion à `/plateforme` doit être refusée ; il peut en revanche utiliser `/catalogue-pro` pour son restaurant affecté. Suspendre ce compte dans **Accès responsables**, puis vérifier que sa session professionnelle ne donne plus accès à l’API. Le site public ne montre que les restaurants actifs et publiés.

Pour vérifier les tests automatisés sans lancer l’application web :

```powershell
docker compose exec backend php artisan test --filter=Platform
docker compose exec backend php artisan test --filter=RestaurantIsolation
```

Ces commandes exécutent les tests Laravel dans le conteneur après installation des dépendances et migrations. Elles ne remplacent pas le parcours manuel de l’interface.

## 5. Arrêt

```powershell
docker compose down
```

Cette commande arrête les conteneurs et conserve la base dans le volume Docker. Ne pas ajouter `-v` si les données de test doivent être gardées.
