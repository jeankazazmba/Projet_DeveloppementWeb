# Politique de sécurité

## Signalement

N'ouvrez pas d'Issue publique pour divulguer une vulnérabilité exploitable, un secret ou des données privées. Contactez le responsable du dépôt [@jeankazazmba](https://github.com/jeankazazmba) directement via un canal privé convenu par l'équipe. Si GitHub Private Vulnerability Reporting devient disponible, privilégiez ce mécanisme.

## Règles obligatoires de l'équipe

- Ne jamais versionner de fichiers `.env`, mots de passe, jetons, clés privées ou identifiants de production.
- Vérifier les dépendances et appliquer les correctifs de sécurité.
- Utiliser des variables d'environnement pour toute configuration sensible.
- Ne pas enregistrer de données personnelles réelles dans des fichiers de test ou des captures.
- Ne pas donner d'accès administrateur lorsque des droits plus limités suffisent.
- Révoquer immédiatement un secret exposé et le remplacer ; supprimer le fichier du dernier commit ne suffit pas à le rendre secret.
- Exiger une revue des changements d'authentification, d'autorisations et de base de données.

## Statut

Le projet est en initialisation. Aucun audit de sécurité complet ni test de pénétration n'a été réalisé.
