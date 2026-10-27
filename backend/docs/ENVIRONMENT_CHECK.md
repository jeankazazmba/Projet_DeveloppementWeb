# Vérification de l'environnement

Avant de démarrer, vérifier :

```powershell
php -v
composer --version
php -m
mysql --version
git --version
```

Extensions PHP attendues selon l'installation Laravel : mbstring, openssl, pdo_mysql, tokenizer, xml, ctype, fileinfo et autres extensions requises par Composer.

## Vérification effectuée dans l'environnement de préparation

- PHP CLI 8.4.24 : présent.
- Git 2.47.3 : présent.
- Composer : absent.
- MySQL et pilote `pdo_mysql` : non disponibles pour un test d'intégration.

**Conséquence :** aucune installation Composer, connexion MySQL ni exécution de Laravel n'est déclarée réussie ici. L'installation et les tests doivent être exécutés dans l'environnement de développement du projet.

## Règles Git

- Branche de travail : `feat/28-backend-init`.
- PR vers `main`, sans fusion automatique.
- Ne jamais committer `.env`, `vendor/`, journaux, caches ou secrets.
