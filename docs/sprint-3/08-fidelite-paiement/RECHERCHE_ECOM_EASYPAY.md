# e-COM EasyPay — recherche préalable à l'intégration

**Relevé du 4 novembre 2026. Statut : recherche ; aucune intégration réalisée.** Ce document concerne **e-COM EasyPay d'e-COM SAS**, présenté à `e-com-easypay.com`. Il ne faut pas le confondre avec les autres services appelés « Easypay » : leurs API et conditions ne sont pas interchangeables.

## Informations confirmées par les pages accessibles

| Point | Observation | Source |
| --- | --- | --- |
| Usage | Module de paiement annoncé pour sites web et applications mobiles marchands. | [Accueil e-COM EasyPay](https://e-com-easypay.com/) |
| Moyens annoncés | Visa, Mastercard et Mobile Money sont cités. Les opérateurs Mobile Money actifs pour notre marchand ne sont pas détaillés. | [Présentation officielle](https://e-com-easypay.com/) |
| Sécurité annoncée | Le site revendique 3D Secure et PCI DSS ; ces affirmations commerciales demandent une confirmation contractuelle et technique. | [Avantages annoncés](https://e-com-easypay.com/) |
| Compte marchand | Une [page d'inscription](https://merchant.e-com-easypay.com/user/register) demande nom, e-mail, téléphone et mot de passe. Elle ne donne pas à elle seule un contrat API ni des clés. | [Inscription marchand](https://merchant.e-com-easypay.com/user/register) |
| Test public | « Tester Easypay » ouvre une [page de test](https://e-com-easypay.com/sandbox/payment/test) affichant 1 USD et une carte de test. Elle démontre un paiement hébergé, pas son intégration dans notre application. | [Page de test](https://e-com-easypay.com/sandbox/payment/test) |

Le site consulté ne confirme **ni Bitcoin ni Ethereum**. Ces choix restent désactivés tant qu'un autre prestataire éventuel n'est pas validé. Le test à 1 USD ne confirme pas non plus la prise en charge du **FCFA** affiché dans notre maquette, du **CDF** ou de la devise de règlement du marchand.

## Adresse « sandbox-developper »

L'adresse fournie, [sandbox-developper.e-com-easypay.com](https://sandbox-developper.e-com-easypay.com/), n'a pas pu être lue par l'outil web. Une requête HTTP directe effectuée le 4 novembre 2026 a reçu `200 OK`, mais le HTML portait le titre **« PCE-Core — Ville-Province de Kinshasa / Maximum B SARL »** et ne contenait aucune occurrence d'« EasyPay ». Cela peut relever d'une mauvaise configuration, d'une réaffectation du domaine ou d'un routage temporaire. **Ne pas utiliser le contenu actuel comme documentation EasyPay et ne pas y saisir d'identifiants** avant confirmation de l'URL par e-COM SAS.

## Informations à obtenir avant tout code de paiement

1. Compte marchand de test activé, URL officielle du portail développeur, hôtes sandbox/production, clés propres à chaque environnement et procédure de rotation.
2. Contrat API : authentification, création de transaction, format du montant et de la devise, référence de commande, page de paiement, URL de retour, notification serveur et consultation de statut.
3. Moyens effectivement activés : cartes, opérateurs Mobile Money, pays, devises, frais, délais de règlement et conditions de remboursement.
4. Cycle : statuts, expiration, échecs, annulations, remboursements, litiges, idempotence, exemple de payload et d'erreurs.
5. Sécurité : signature et vérification des notifications, HTTPS, responsabilités PCI/3D Secure, données personnelles et stockage des secrets côté backend.
6. Jeux de test officiels : succès, échec, expiration, rappel en double ou hors ordre et éventuel simulateur Mobile Money.

Ne publier aucune clé dans GitHub, React ou Expo. Le backend seul doit conserver les secrets.

## Flux cible pour Mon Miam Miam — proposition à valider

1. Étudiant choisit un moyen **activé**. L'API recalcule panier, remise, frais et total ; elle crée une commande et une tentative de paiement `pending` avec références distinctes.
2. Le backend crée la transaction auprès d'e-COM EasyPay et transmet à l'interface seulement l'URL ou le jeton retourné, suivant le contrat réel.
3. L'étudiant règle sur la page du fournisseur si ce mode est confirmé. Le retour dans l'application affiche « vérification en cours » : **le retour navigateur ne confirme pas le paiement**.
4. Le backend vérifie notification et/ou statut distant selon la documentation. Il compare référence, marchand, montant, devise, authenticité et traitement antérieur ; il marque `paid` uniquement après confirmation vérifiée.
5. Mobile étudiant, web/mobile employé, gérant et admin lisent le même statut depuis l'API. Échec, expiration et remboursement restent tracés.

Ce flux prépare l'architecture. Il **ne décrit pas une API EasyPay vérifiée** : aucun endpoint, nom de champ, mécanisme de signature ou callback n'a pu être confirmé sur les pages accessibles.

## Décision actuelle

Le cahier des charges classe le paiement en ligne en **bonus optionnel**. Conserver Visa, Mastercard et Mobile Money désactivés dans l'interface jusqu'à réception du contrat technique et d'un compte sandbox fiable ; le règlement à la caisse/à la livraison demeure la démonstration actuelle. La mise en production demandera une recette de paiement et de rapprochement des commandes.
