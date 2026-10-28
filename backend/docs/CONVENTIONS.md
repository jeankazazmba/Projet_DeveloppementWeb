# Conventions de développement backend

## Organisation

- `routes/api.php` : routes HTTP de l'API.
- `app/Http/Controllers/` : orchestration des requêtes et réponses.
- `app/Http/Requests/` : validation des entrées.
- `app/Models/` : modèles Eloquent.
- `app/Services/` : logique métier réutilisable.
- `app/Http/Middleware/` : contrôles d'accès transversaux.
- `database/migrations/` : évolution reproductible du schéma (Caleb).
- `database/seeders/` : données de développement anonymisées.
- `tests/Feature/` : parcours HTTP et réponses JSON.
- `tests/Unit/` : logique indépendante du framework.

## Règles de code

- Une instruction claire par ligne lorsque cela améliore la lecture.
- Noms explicites et responsabilités limitées.
- Commentaires pour expliquer les décisions non évidentes, pas pour paraphraser chaque ligne.
- Valider les entrées dans des Form Requests.
- Garder les calculs de commande et de fidélité côté serveur.
- Ne pas utiliser `env()` directement dans la logique métier ; passer par la configuration.
- Ne jamais journaliser mots de passe, tokens ou données personnelles inutiles.
- Préférer les réponses JSON cohérentes avec les contrats API du Sprint 1.

## Collaboration

- Une branche par tâche, issue référencée dans la PR.
- Ne pas modifier le frontend de Christian dans cette PR.
- Pas de merge sans revue.
- Ne pas ajouter de fausses migrations ni d'endpoints métier avant validation.
