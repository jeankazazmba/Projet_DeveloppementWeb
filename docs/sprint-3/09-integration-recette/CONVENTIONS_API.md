# Convention API v1

Les routes existantes qui renvoient directement une collection continuent de le faire afin de préserver les interfaces déjà connectées. Une liste paginée est demandée explicitement avec `?paginate=1&per_page=25` ; `per_page` est limité à 100.

## Réponses

Une ressource créée ou lue conserve sa forme existante. Une liste paginée répond :

```json
{
  "data": [],
  "meta": { "current_page": 1, "per_page": 25, "total": 0, "last_page": 1 }
}
```

Les erreurs des routes `/api/*` suivent le format :

```json
{
  "message": "Description lisible par l’interface",
  "error": {
    "code": "validation_failed",
    "message": "Description lisible par l’interface",
    "details": { "champ": ["Message de validation"] }
  }
}
```

`message` reste à la racine afin de rester compatible avec les clients existants.

| Statut | Code | Usage |
| --- | --- | --- |
| 401 | `unauthenticated` | Jeton absent, invalide ou expiré. |
| 403 | `forbidden` | Compte suspendu ou droit absent. |
| 404 | `not_found` | Ressource inexistante ou inaccessible dans le périmètre du compte. |
| 409 | `conflict` | Version de ressource obsolète. Le client recharge puis demande une nouvelle confirmation. |
| 422 | `validation_failed` | Données invalides ; `error.details` indique les champs. |

## Versionnement optimiste

Les ressources déjà modifiables `restaurants`, `restaurant_contents` et `users` portent `version`, initialisé à `1`. Une mutation peut envoyer `expected_version` :

```json
{ "is_available": false, "expected_version": 3 }
```

Le serveur verrouille la ligne, compare la version et incrémente la version dans la même transaction. Si elle ne correspond plus, il répond `409`. L’absence de `expected_version` reste temporairement acceptée pour ne pas casser les interfaces actuelles ; les nouveaux clients web et mobiles doivent l’envoyer après intégration.

## Filtres autorisés maintenant

- `GET /api/restaurants?q=...&paginate=1&per_page=...`
- `GET /api/platform/restaurants?q=...&status=draft|active|suspended&paginate=1&per_page=...`
- `GET /api/platform/users?q=...&active=true|false&paginate=1&per_page=...`
- `GET /api/platform/audit?restaurant_id=...&paginate=1&per_page=...`

Les filtres sont validés côté serveur. Les listes professionnelles sans `paginate=1` gardent leur format historique jusqu’au raccordement des interfaces.
