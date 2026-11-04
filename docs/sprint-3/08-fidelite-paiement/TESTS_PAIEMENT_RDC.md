# Paiements de démonstration — RDC

## Décision d'implantation

À la demande du propriétaire, les interfaces actives présentent désormais **ZeDuc-Sp@ce** comme plateforme, avec **Khalifa_food** et **sleepy hollow** comme restaurants de démonstration à Kinshasa, RDC. Les adresses précises et les coordonnées restent à fournir. Les cartes montrent des **repères fictifs** autour de Kinshasa. La monnaie affichée est le **franc congolais (CDF)** ; les nombres des maquettes sont conservés comme **tarifs fictifs**, sans conversion de FCFA vers CDF. Le cahier des charges original, qui situe le restaurant à Douala, reste inchangé comme document historique : cette décision de projet s'en écarte.

## Ce qui est testable tout de suite dans le mobile

Dans `mobile/src/PaymentMethods.js`, sélectionner un moyen puis un scénario : **Réussite**, **Refus** ou **En attente**. Le module `mobile/src/paymentSandbox.js` renvoie un reçu local avec `reference`, `methodId`, `amount`, `currency: CDF`, `country: CD`, `status` et `provider: simulation_locale`.

| Moyen | Réussite | Refus / attente |
| --- | --- | --- |
| Orange Money, Airtel Money, Vodacom M-Pesa | Commande locale enregistrée avec mention « Test réussi · aucun débit » et référence `TEST-...`. | Message de résultat, aucune commande créée. |
| Visa, Mastercard | Même simulation, sans saisir ni stocker de numéro de carte. | Même comportement. |
| Bitcoin, Ethereum | Même simulation, sans adresse de portefeuille ni transfert blockchain. | Même comportement. |
| Espèces à la caisse / livraison | Commande locale enregistrée « À régler ». | Aucun scénario en ligne. |

La simulation locale **n'est pas la sandbox d'un prestataire**. Elle ne contacte aucun service externe, ne confirme aucun paiement marchand et ne transmet pas les commandes au restaurant. Le test permet de vérifier le choix du moyen, les trois issues et l'affichage de la référence dans la confirmation et l'historique.

## Pour brancher de vraies sandboxes plus tard

| Parcours | Sandbox à étudier | État de disponibilité |
| --- | --- | --- |
| Mobile Money RDC | [pawaPay](https://www.pawapay.io/plans) : sandbox gratuite ; sa [couverture RDC](https://www.pawapay.io/markets) affiche Airtel, Orange et Vodacom M-Pesa. | Aucun compte ni jeton pawaPay n'est configuré dans le dépôt. Vérifier la devise de collecte, les opérateurs et les conditions du compte marchand. |
| Cartes | [Flutterwave](https://developer.flutterwave.com/docs/quickstart) : environnement de test gratuit et [cartes de test](https://developer.flutterwave.com/docs/testing). | Aucun compte ni jeton Flutterwave n'est configuré ; l'éligibilité d'un marchand RDC pour le passage en production reste à confirmer. |
| BTC / ETH | Simulation locale seulement. | Aucun fournisseur de paiement crypto compatible avec ce projet et son pays d'exploitation n'a été retenu. Ne pas utiliser des fonds ou adresses réels pour cette démo. |

Pour une intégration réelle, faire créer et vérifier la commande par **Laravel**, puis déclencher la session de paiement côté serveur avec des clés de **test** en variables d'environnement. Le serveur doit recevoir la notification du prestataire, vérifier aussi le statut auprès de son API, contrôler montant/devise/référence, puis enregistrer une seule transition de paiement pour la commande. Le mobile lit ensuite cet état serveur. Les secrets, numéros complets de carte et clés privées n'appartiennent jamais au code mobile. Les boutons admin actuels restent des réglages visuels et n'activent aucun prestataire.

## Vérification de recette attendue

1. Tester chaque moyen en réussite : la commande locale apparaît avec le bon moyen, le total en CDF et une référence `TEST-...`.
2. Tester refus et attente : le panier reste disponible et aucune commande supplémentaire n'apparaît.
3. Tester les espèces : commande « À régler », sans référence de transaction en ligne.
4. Après raccordement à une vraie sandbox, refaire ces cas via l'API serveur, plus notifications dupliquées, montant différent, délai d'expiration et reprise après fermeture de l'application.
