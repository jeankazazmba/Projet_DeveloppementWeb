# Application bureau Mon Miam Miam

L’entrée Tauri est `desktop.html`. Elle affiche le splash screen, le choix Admin restaurant / Gérant / Employé / Admin plateforme, puis un écran de connexion et un accès explicite à chaque démo. Le gérant et l’employé choisissent ensuite un restaurant parmi les établissements autorisés dans le profil de démonstration. Les espaces web existants sont réutilisés. Le site public continue d’utiliser `index.html`.

La connexion réelle n’est pas active : le backend actuel n’expose pas de service d’authentification. Le bouton « Explorer la démo » ouvre les données locales de démonstration sans vérifier d’identifiants. Avant une mise en production, connecter l’écran aux comptes, aux rôles et aux sessions du backend, puis protéger les API côté serveur.

## Lancement par le propriétaire du projet

Depuis `frontend/`, installer les dépendances habituelles, puis les prérequis Tauri 2 pour Windows (Rust, Microsoft C++ Build Tools et WebView2). Lancer ensuite :

```powershell
npx @tauri-apps/cli@2 dev
```

Pour produire l’installateur NSIS Windows :

```powershell
npx @tauri-apps/cli@2 build
```

Ces commandes n’ont pas été exécutées ici, conformément à la demande de laisser le lancement et la compilation au propriétaire. Le premier lancement générera `src-tauri/Cargo.lock` ; l’ajouter au dépôt après vérification pour figer les versions Rust.
