# student

Espace étudiant web sous `/etudiant`, accessible depuis `/acces`. `StudentApp.jsx` utilise les routes Laravel : compte, restaurants, menu, panier, devis, commande, suivi, paiement espèces à régler, réclamations, fidélité, parrainage, classement, jeux et notifications. `studentApi.js` centralise le transport et les erreurs. Le style glass est dans `student.css`.

Renseigner `VITE_API_URL` pour accéder à l'espace ; aucun compte ou commande de démonstration n'est créé côté web. Une session réelle utilise un jeton Sanctum en mémoire. Les commandes, réclamations, notifications et points sont relus toutes les quatre secondes lorsque l'onglet est visible. Les mutations attendent la réponse du serveur. Les statistiques de service ne sont pas des paiements encaissés.

Le transport push WebSocket et les paiements autres que les espèces restent à intégrer. Voir le rapport technique dans `docs/sprint-3/09-integration-recette/`.
