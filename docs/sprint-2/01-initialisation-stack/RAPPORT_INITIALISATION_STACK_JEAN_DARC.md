# Rapport technique — Initialisation de la stack (Sprint 2)

**Projet :** Mon Miam Miam / ZeDuc@Space  
**Issue :** [#28](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/28) — [Jira PMEE-14](https://2030-team-lz0shg5m.atlassian.net/browse/PMEE-14)  
**Responsable :** Jean d'Arc Kazamba (`@jeankazazmba`)  
**Binôme :** Christian ONOKOLA (`@Ono206`)  
**État de ce rapport :** preuves de dépôt et de fusion vérifiées ; exécution locale et validation par binôme non attestées ici.

## 1. Objectif du travail

Mettre à disposition un socle commun React/Vite côté interface et Laravel côté API, avec conventions de développement, configuration reproductible et première route de diagnostic. Les fonctionnalités métier complètes sont hors du périmètre de l'issue #28 et relèvent du Sprint 3.

## 2. Réalisations observables sur `main`

| Livrable | Preuve vérifiable | État |
| --- | --- | --- |
| Socle Laravel 12 | [`backend/`](../../../backend/), [`backend/README.md`](../../../backend/README.md) | Présent |
| Guide de démarrage backend | [`backend/INSTALLATION.md`](../../../backend/INSTALLATION.md) | Présent |
| Exemple de configuration backend | [`backend/.env.example`](../../../backend/.env.example) | Présent |
| API de diagnostic | [`backend/routes/api.php`](../../../backend/routes/api.php), route `GET /api/health` | Présente dans le code |
| Socle React/Vite | [`frontend/`](../../../frontend/), [`frontend/package.json`](../../../frontend/package.json) | Présent |
| Guide frontend et intégration | [`frontend/README.md`](../../../frontend/README.md), [`frontend/INITIALISATION.md`](../../../frontend/INITIALISATION.md) | Présents |
| Composant de diagnostic API | [`frontend/src/features/ApiStatus.jsx`](../../../frontend/src/features/ApiStatus.jsx) | Présent |
| Conventions de contribution | [`CONTRIBUTING.md`](../../../CONTRIBUTING.md) | Présentes |

## 3. Historique des contributions et intégration

- [PR #59](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/59) — socle Laravel, fusionnée le 28 octobre 2026.
- [PR #57](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/57) — initialisation Laravel et préparation de l'intégration React, fusionnée le 2 novembre 2026.
- [PR #77](https://github.com/jeankazazmba/Projet_DeveloppementWeb/pull/77) — initialisation du frontend, fusionnée le 2 novembre 2026. Le README frontend attribue l'initialisation de React à Christian et celle du backend à Jean d'Arc.
- [Issue #28](https://github.com/jeankazazmba/Projet_DeveloppementWeb/issues/28) — fermée au moment du relevé du 4 novembre 2026 ; la fermeture ne remplace pas les preuves de recette.

## 4. Architecture et responsabilités

```text
frontend/  → React, Vite, React Router, Tailwind, ESLint
       │
       └── GET /api/health → backend/ Laravel 12
                               └── futurs services métier et base de données
```

Le backend dispose d'une route de diagnostic. Les routes métier de commande, panier, fidélité, etc. ne sont pas attestées comme opérationnelles dans `main` par ce rapport. Le fichier `docs/ARCHITECTURE.md` décrit une cible de conception et comporte des formulations antérieures à l'installation effective de la stack.

## 5. Installation et vérifications à reproduire

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

### Backend

Consulter [`backend/INSTALLATION.md`](../../../backend/INSTALLATION.md) pour les prérequis, la configuration locale et les commandes exactes. Ne jamais publier un `.env` réel.

**Critères de recette à documenter :** lancement local des deux services, réponse HTTP de `GET /api/health`, affichage du diagnostic côté React, résultat de `npm run build`, résultat de `npm run lint`, tests backend, captures ou logs datés.

**Attention :** les commandes ci-dessus sont des procédures de vérification, **pas des tests que ce rapport prétend avoir exécutés**.

## 6. Écarts et validation

- [x] Socle frontend/backend et documentation présents sur `main`.
- [x] PR d'initialisation fusionnées.
- [x] Issue #28 fermée.
- [ ] Fournir un journal d'exécution locale complet et daté.
- [ ] Attester le test de connexion frontend/backend avec le binôme.
- [ ] Joindre la relecture nominative et la décision de recette.

**Conclusion :** dépôt documentaire du travail d'initialisation réalisé ; validation pratique finale à confirmer par l'équipe.
