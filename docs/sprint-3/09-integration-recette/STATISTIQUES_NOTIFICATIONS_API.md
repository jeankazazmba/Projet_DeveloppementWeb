# Statistiques et notifications — étape 9

## Statistiques

`GET /api/staff/restaurants/{restaurant}/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD` est réservé à l'administrateur local et au gérant actif du restaurant. Il renvoie commandes confirmées, volumes CDF, répartition par statut et service, séries quotidiennes, dix plats les plus commandés, totaux de fidélité et parrainages. La période est exprimée en jours de Kinshasa et limitée à 366 jours ; par défaut, les 30 derniers jours. Les commandes `received` et `cancelled` sont exclues. Les statuts confirmés sont `accepted`, `preparing`, `ready`, `served`, `delivering`, `delivered` et `paid` pour les données historiques.

`GET /api/platform/insights` conserve seulement les totaux par restaurant et la tendance globale. Sa projection des réclamations escaladées contient uniquement `id`, `restaurant_id`, `status`, `created_at`. La plateforme n'a pas accès à la route détaillée, aux lignes de commande, aux noms, aux paiements, aux motifs ou aux mouvements individuels de points.

L'export CSV privé est demandé par `POST /api/staff/restaurants/{restaurant}/statistics/exports` avec les mêmes filtres de dates. La réponse `202` donne l'identifiant. `GET /api/me/statistics/exports/{id}` permet de suivre `pending`, `ready` ou `failed`. `GET /api/me/statistics/exports/{id}/download` livre le fichier lorsqu'il est prêt. Le propriétaire doit toujours être affecté au restaurant comme admin ou gérant ; une affectation révoquée bloque aussi un ancien export. Le fichier reste sur le disque privé Laravel et ne contient que des agrégats quotidiens.

## Notifications et file

Les événements de commande, réclamation et affectation de livraison créent des tâches `PersistDomainNotification` sur la file `notifications`. L'export utilise la file `exports`. Les tâches sont envoyées après validation de la transaction et vérifient encore l'activité et le périmètre du destinataire avant stockage. Une clé unique `(user_id, event_key)` rend leur traitement idempotent. Les notifications plateforme d'escalade ne contiennent que l'identifiant de la réclamation, le restaurant, le statut et la date.

`GET /api/me/notifications?after_id=<id>&per_page=25&unread=1` sert au polling authentifié ; `PATCH /api/me/notifications/{id}/read` marque une notification comme lue. L'API ne montre que les notifications du compte et de ses affectations encore actives. Aucun WebSocket ou envoi d'e-mail n'est inclus à ce stade.

La migration crée `app_notifications`, `jobs`, `failed_jobs` et `statistic_exports`. En local, définir `QUEUE_CONNECTION=database`, appliquer `php artisan migrate`, puis lancer manuellement `php artisan queue:work database --queue=notifications,exports --sleep=2 --tries=3` dans `backend/`. Le service `queue` des fichiers Compose utilise cette commande ; la compilation et le lancement restent à la charge de l'utilisateur. Les Feature tests gardent la file `sync` et SQLite en mémoire.
