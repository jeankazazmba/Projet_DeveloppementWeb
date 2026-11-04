# Dossier de preuves — Issue #28 / PMEE-14

**Responsable :** Jean d'Arc ; **binôme :** Christian. **Périmètre :** Sprint 2.

## Preuves documentaires vérifiées

- Backend Laravel 12 : [code](../../../backend/), [guide d'installation](../../../backend/INSTALLATION.md), [configuration exemple](../../../backend/.env.example).
- Frontend React/Vite : [code](../../../frontend/), [guide](../../../frontend/INITIALISATION.md), [package.json](../../../frontend/package.json).
- Intégration de diagnostic : [route backend](../../../backend/routes/api.php) et [composant React](../../../frontend/src/features/ApiStatus.jsx).
- PR fusionnées : [#59](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/59), [#57](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/57), [#77](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/77).
- [Issue #28](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/28) fermée ; la fermeture n'est pas une preuve d'essai sur machine.

## Protocole de recette à exécuter avec Christian

1. Installer les dépendances selon les guides versionnés ; configurer des variables locales sans publier de secrets.
2. Démarrer Laravel et vérifier la réponse JSON de `GET /api/health`.
3. Démarrer React et vérifier que `ApiStatus` détecte le backend.
4. Exécuter `npm run lint` et `npm run build` dans `frontend/`.
5. Exécuter les tests PHP selon `backend/INSTALLATION.md` et consigner leurs résultats.
6. Déposer les captures/logs datés, les versions des outils et le nom du relecteur.

| Contrôle | Résultat | Preuve | Relecteur |
| --- | --- | --- | --- |
| Laravel démarré | À vérifier | À déposer | — |
| `GET /api/health` | À vérifier | À déposer | — |
| React démarré | À vérifier | À déposer | — |
| Diagnostic React ↔ API | À vérifier | À déposer | — |
| Lint / build | À vérifier | À déposer | — |
| Revue du binôme | À vérifier | À déposer | — |

**Conclusion :** preuves de livraison Git et documentation déposées ; recette locale non simulée.
