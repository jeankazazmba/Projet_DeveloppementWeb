# Contrôles de sécurité initiaux

## Inclus dans le socle

- Fichier `.env` ignoré par Git.
- `.env.example` sans clé applicative ni mot de passe réel.
- Origine CORS limitée à `FRONTEND_URL` et non à `*`.
- Aucun endpoint d'administration ni authentification fictive.
- Route de santé ne renvoyant aucune information sensible.

## Avant intégration en environnement partagé

- `APP_ENV=production`, `APP_DEBUG=false`.
- Configurer HTTPS, domaines autorisés, cookies sécurisés et secret d'application propre à l'environnement.
- Décider du mode Sanctum : cookies SPA ou jetons API.
- Appliquer autorisations serveur pour les quatre rôles.
- Mettre en place limites de débit, journalisation adaptée, gestion des erreurs et tests de sécurité.
- Exécuter `composer audit` et vérifier les dépendances verrouillées.
- Éviter de publier `phpinfo()`, dumps, traces d'exception et fichiers de configuration.

## Limites actuelles

La présence de `laravel/sanctum` dans `composer.json` **ne signifie pas** que les flux de connexion, de déconnexion, de permissions ou CSRF sont développés. Ils relèvent de l'issue #31.
