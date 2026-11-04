# État du projet face au cahier des charges

Référence : `CAHIER DE CHARGE PROJET Mon Miam Miam.docx`, version 1.0.2 du 16 septembre 2024. Relevé du code du 4 novembre 2026. « Interface » signifie qu’un parcours est visible et utilisable avec des données de démonstration ; cela ne signifie pas que la fonction est reliée aux autres applications.

| Exigence du cahier | État actuel | Travail restant |
| --- | --- | --- |
| Accueil avec menu du jour, promotions et événements | Interfaces site et mobile présentes. Le catalogue API sait publier ces contenus par restaurant. | Mettre le backend en service, confirmer les données, dates et prix réels. |
| Inscription, connexion et récupération étudiant | Écrans présents dans Expo, mais connexion et inscription locales sans vérification serveur ; récupération non fonctionnelle. Le formulaire demande 6 caractères, alors que le cahier exige au moins une majuscule et un chiffre, ainsi que nom, téléphone et localisation. | Authentification étudiante, validation conforme, récupération du mot de passe, profil persistant. |
| Menu, panier, commande sur place ou en livraison | Parcours mobile interactif ; choix de l’heure et adresse ; panier limité à un restaurant. Les commandes sont enregistrées sur l’appareil. | API des commandes, statuts partagés, prix et disponibilité validés côté serveur, transmission au restaurant et livraison réelle. |
| Paiement en ligne | Choix de moyens et simulateur local ; aucun débit réel. | Intégration sécurisée d’un agrégateur si retenue. Le cahier classe explicitement cette intégration comme bonus facultatif. |
| Fidélité et parrainage | Écrans et points de démonstration locaux. | Tables et calcul serveur à chaque commande, conversion des points, expiration, code unique et récompense à la première commande du filleul. |
| Historique et réclamations | Interfaces mobiles et backoffice présentes avec données locales distinctes. | Synchronisation des commandes et réclamations, réponses du personnel et suivi des états. |
| Jeux et événements | Roue, quiz et paires gourmandes côté étudiant ; jeux et événements filtrés par restaurant ; publication possible dans le catalogue API. | Règles de participation, calendrier réel, récompenses validées côté serveur et prévention des abus. Les scores du quiz et des paires sont locaux. |
| Classement des 10 meilleurs clients par jour, semaine et mois | Écran avec filtres et cinq profils d’exemple. | Calculer les dix premiers depuis les commandes réelles ; rendre les filtres effectifs. |
| Employé : commandes, menu, réclamations et statistiques hebdomadaires | Interfaces web et mobile. Le mobile employé peut lire le menu de son restaurant après connexion à l’API. | Relier les actions, commandes, réponses et statistiques à la même base ; appliquer les droits à chaque opération. |
| Gérant : supervision, employés, statistiques, réclamations | Interfaces web de démonstration. | Comptes et droits réels, données partagées, validation des réponses et indicateurs calculés. |
| Admin : employés, menu, promotions, événements, statistiques, paramètres | Interfaces web de démonstration. Le catalogue professionnel partagé permet la publication de plats, promotions, événements et jeux. | Relier les écrans historiques à l’API, gérer les comptes employés depuis le backoffice, statistiques et paramètres persistants. |
| Temps réel et tableaux actualisés automatiquement | Non opérationnel ; les chiffres des tableaux sont des exemples. | API métier, actualisation périodique ou événements temps réel et calculs fondés sur les données. |
| Plusieurs restaurants | Le cahier le prévoit comme évolution. Répertoire, fiches, contenus et affectations par restaurant existent dans l’API ; les écrans historiques restent en démonstration locale. | Ajouter `restaurant_id` et contrôles d’accès à toutes les commandes, stocks, tables, livraisons, réclamations, points et statistiques. |
| Sécurité, RGPD et consentement aux cookies | API professionnelle avec jetons et contrôle d’appartenance au restaurant ; choix de cookies simple sur le site. Les espaces historiques de démonstration restent accessibles sans vraie connexion. | Authentification pour tous les rôles, politique de confidentialité, gestion des données personnelles et consentement conforme avant production. |
| Tests, GitHub et Vercel | Branche de développement et commits poussés ; tests backend santé et isolation écrits mais non exécutés. Projet Vercel créé, sans déploiement. | Tests de commande, fidélité, paiement et parcours de bout en bout ; relier GitHub à Vercel et obtenir une Preview. |
| Architecture, documentation et suivi Jira | React/Expo, Laravel et une première migration sont présents. Des guides et plans existent dans `docs/`, mais plusieurs décrivent encore un backend non installé ; aucun état Jira récent n’a été vérifié. | Actualiser les documents d’architecture et de tests, compléter les manuels par rôle et vérifier le backlog Jira avec l’équipe. |

## Éléments ajoutés au-delà du minimum

Application Expo (le cahier décrit l’extension mobile comme possible), application mobile employé, application bureau Tauri, administrateur de plateforme, thèmes clair et sombre sur le site et certaines interfaces web, suivi cartographique de démonstration, architecture multi-restaurants anticipée et modes de paiement supplémentaires. Ces ajouts ne remplacent pas les fonctions métier et la sécurité encore manquantes. Le paiement réel reste facultatif selon le cahier.

## Écart de contexte à arbitrer

Le cahier décrit ZeDuc@Space près d’UCAC-ICAM à Yansoki et évoque la Dibamba. Les interfaces actuelles situent le service à Kinshasa en RDC, conformément à une demande ultérieure du propriétaire du projet. L’équipe doit fixer la localisation officielle, la monnaie, les coordonnées et les mentions légales avant la publication.

## Prochain ordre de travail suggéré

1. Déployer l’API et la base, puis connecter la Preview Vercel à l’API.
2. Implémenter l’authentification étudiante et les affectations réelles du personnel dans les écrans existants.
3. Partager commandes, livraisons, réclamations, fidélité et parrainage entre les applications.
4. Remplacer les statistiques et le classement fictifs par des calculs serveur ; tester les parcours complets.
