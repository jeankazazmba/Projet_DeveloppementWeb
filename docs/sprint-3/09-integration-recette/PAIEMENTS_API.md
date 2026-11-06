# Paiements — étape 8

## Périmètre

Les montants sont des entiers en CDF. Une intention appartient à une commande, un étudiant et un restaurant. Le montant est copié depuis la commande côté serveur. Les données de carte, de portefeuille mobile ou de crypto ne sont jamais collectées dans cette API.

`cash` est le seul moyen disponible normalement : l'intention commence en `cash_due` (« espèces à régler »). `sandbox_test` est un adaptateur local, sans appel réseau ni encaissement, désactivé par défaut. Visa, Mastercard, Airtel Money, M-Pesa, BTC et ETH sont référencés mais indisponibles tant que les contrats, sandbox, devises, contraintes légales et adaptateurs ne sont pas validés. Le simple changement de `is_enabled` ne les active pas dans l'API.

## Routes

| Route | Accès | Effet |
| --- | --- | --- |
| `GET /api/payment-methods` | public | Moyens et disponibilité réelle |
| `GET /api/me/orders/{order}/payment-intents` | étudiant propriétaire | Intentions de sa commande |
| `POST /api/me/orders/{order}/payment-intents` | étudiant propriétaire | Crée avec `{ "method": "cash" }` et en-tête `Idempotency-Key` (8 à 120 caractères) |
| `POST /api/me/payment-intents/{intent}/cancel` | étudiant propriétaire | Annule avec `{ "expected_version": 1 }` |
| `POST /api/webhooks/payments/test` | signature locale valide | Reçoit un événement de test |

Une clé d'idempotence répétée pour la même demande rend la même intention ; une utilisation différente renvoie `409`. Une commande ne peut pas avoir plusieurs intentions actives ou payées. `pending` et `requires_action` sont provisoires ; `failed` et `cancelled` sont terminaux. `cash_due` peut devenir `paid` uniquement par événement signé dans ce prototype local. Il n'existe aucun endpoint client qui accepte `paid`.

## Webhook local de test

La route renvoie `404` hors environnement Laravel `local` ou `testing`, si `PAYMENT_SANDBOX_ENABLED` est faux, ou si `PAYMENT_WEBHOOK_TEST_SECRET` contient moins de 32 caractères. Le secret reste exclusivement dans le `.env` du backend : jamais dans React, Expo, un dépôt Git ni une réponse API. Le corps JSON contient `event_id`, `intent_id`, `status` (`requires_action`, `paid`, `failed` ou `cancelled`) et éventuellement `external_reference`.

Signer **les octets exacts du corps HTTP** avec HMAC-SHA256 sur `<timestamp>.<corps>`, où `timestamp` est un entier Unix en secondes. Envoyer `X-Payment-Timestamp: <timestamp>` et `X-Payment-Signature: sha256=<digest hex>`. La fenêtre est de cinq minutes. Signature absente, incorrecte ou périmée : `401`, sans changement d'état. L'identifiant `event_id` est unique par fournisseur ; le même événement exact rend `duplicate`, un identifiant réutilisé avec un corps différent rend `409`. Chaque changement conserve son ancien et son nouvel état, la version et l'empreinte du corps. Le webhook refuse une commande annulée ou un montant modifié.

## Avant un prestataire réel

Valider ses contrats, sa sandbox, la devise CDF, les frais, les remboursements, les délais de confirmation, les événements webhook et la méthode officielle de signature. Implémenter ensuite un adaptateur propre au prestataire et une route webhook distincte, avec ses secrets exclusivement côté serveur. Ajouter des tests de rejouement, de signature, de transitions et de rapprochement financier. Le webhook local de test n'est pas un système d'encaissement.

Migration à appliquer manuellement dans l'environnement cible : `php artisan migrate` depuis `backend/`. Les Feature tests utilisent SQLite en mémoire ; ils ne migrent pas la base MySQL de l'utilisateur.
