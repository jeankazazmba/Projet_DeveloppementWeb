# Application bureau Mon Miam Miam

L’entrée Tauri est `desktop.html`. Elle affiche le splash screen, le choix Admin restaurant / Gérant / Employé / Admin plateforme, puis un écran de connexion et un accès explicite à chaque démo. Le gérant et l’employé choisissent ensuite un restaurant parmi les établissements autorisés dans le profil de démonstration. Les espaces web existants sont réutilisés. Le site public continue d’utiliser `index.html`.

Le backend expose maintenant l'authentification et les droits des espaces connectés. L'écran d'entrée propre à Tauri conserve un parcours de démonstration : le bouton « Explorer la démo » n'authentifie personne. Les applications intégrées demandent une session réelle pour leurs fonctions connectées. L'écran d'entrée doit encore être relié aux comptes et aux rôles avant une mise en production.

## Lancement par le propriétaire du projet

Depuis `frontend/`, installer les dépendances habituelles, puis les prérequis Tauri 2 pour Windows (Rust, Microsoft C++ Build Tools et WebView2). Lancer ensuite :

```powershell
npx @tauri-apps/cli@2 dev
```

Si le web du projet est déjà servi sur le port 5173, Tauri le réutilise. Pour démarrer web, API, MySQL, Expo et Tauri ensemble, voir [LANCEMENT.md](../LANCEMENT.md).

Pour produire l’installateur NSIS Windows :

```powershell
npx @tauri-apps/cli@2 build
```

Ces commandes n’ont pas été exécutées ici, conformément à la demande de laisser le lancement et la compilation au propriétaire. Le premier lancement générera `src-tauri/Cargo.lock` ; l’ajouter au dépôt après vérification pour figer les versions Rust.
