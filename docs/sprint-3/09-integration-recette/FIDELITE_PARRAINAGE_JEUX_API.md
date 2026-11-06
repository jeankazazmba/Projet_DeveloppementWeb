# Fidélité, parrainage, jeux et classement — étape 7

Toutes les routes utilisent le préfixe `/api`. Les règles sont propres à chaque restaurant ; les points ne traversent pas les établissements. Les montants de commande restent en CDF.

## Règles et attribution

L'admin restaurant crée une règle en brouillon (`points_per_order`, `referral_points`) avec `POST /staff/restaurants/{restaurant}/loyalty-rules`. Il la valide explicitement par `POST /staff/restaurants/{restaurant}/loyalty-rules/{rule}/validate` avec `validation_note` et `expected_version`, puis l'active par `POST /staff/restaurants/{restaurant}/loyalty-rules/{rule}/activate`. Une règle sans validation métier enregistrée ne peut pas être activée (409). Une seule règle est active par restaurant. `GET /staff/restaurants/{restaurant}/loyalty-rules` permet à l'admin local de consulter les versions et validations. Le gérant, l'employé et l'admin plateforme ne modifient pas ces règles.

À la transition d'une commande vers `served` ou `delivered`, le serveur attribue les points dans la **même transaction** que la commande. Chaque mouvement garde le restaurant, l'utilisateur, la règle, la commande et un `event_key` unique par restaurant. Une deuxième exécution de l'événement ne peut pas attribuer les points de nouveau. Une commande annulée ne produit pas de points. Aucun point n'est attribué si aucune règle validée et active n'existe à cet instant. `GET /me/loyalty` renvoie les soldes complets par restaurant et les 100 derniers mouvements du compte étudiant uniquement.

## Parrainage

`POST /restaurants/{restaurant}/referral-code` obtient ou crée le code personnel de l'étudiant. `POST /restaurants/{restaurant}/referrals` avec `code` enregistre le filleul avant sa première commande éligible. Le code doit appartenir au même restaurant et l'auto-parrainage est refusé. Un étudiant n'a qu'un parrain par restaurant. Le parrain reçoit `referral_points` une seule fois, à la première commande éligible du filleul, si une règle validée est active. `GET /me/referrals` montre les codes et statuts du parrain sans divulguer l'identité du filleul.

## Jeux et classement

`POST /restaurants/{restaurant}/games/{game}/participations` enregistre une participation unique à un jeu publié, actif et non expiré du restaurant. `GET /me/game-participations` liste les participations de l'étudiant. Cette étape n'attribue aucun point ni gain de jeu : les conditions de victoire et récompenses demandent une règle métier validée.

`GET /restaurants/{restaurant}/leaderboard?period=day|week|month` compte les **commandes réellement passées au statut `served` ou `delivered` pendant la période**, selon l'heure de Kinshasa. Il renvoie au plus dix entrées triées par nombre de commandes éligibles. Chaque entrée contient rang, alias stable propre au restaurant et nombre de commandes ; aucun nom, courriel, identifiant utilisateur ou détail de commande n'est exposé. `leaderboard_snapshots` n'est pas nécessaire : le classement est calculé sur `order_events` et `orders`.

Les Feature tests `LoyaltyGamesTest.php` vérifient l'activation après validation, les droits, l'attribution unique, la séparation des restaurants, la confidentialité et les dix premiers profils.
