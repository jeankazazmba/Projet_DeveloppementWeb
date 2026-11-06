# Site public

Les pages `/`, `/menu` et `/promotions` reprennent les trois dossiers `--Public` de l'export `app1-tous-les-ecran222s/screens`. Les ressources et les aperçus d'origine sont dans `frontend/public/figma-public/`.

La navigation, la recherche, les filtres, le tri, la pagination, les favoris locaux, les conditions des offres et le choix des cookies fonctionnent côté navigateur. `/acces` propose désormais les quatre profils (étudiant, employé, gérant, administrateur). Les profils gérant et administrateur ouvrent leur espace web de démonstration. L'application étudiante est destinée au téléphone ; l'interface employé et la connexion par compte restent à relier. Aucun compte ou commande n'est créé depuis le portail sans backend.

L'accueil se parcourt verticalement par sections : présentation, aperçu du menu, promotions, événements, jeux et contact. Les liens du menu font défiler vers la section correspondante ; les pages `/menu` et `/promotions` restent disponibles pour consulter le détail. Le bouton du haut bascule tout le site public entre les thèmes sombre et clair, avec préférence mémorisée dans le navigateur.

L'adresse `contact@monmiammiam.cd` est **prévue**, mais aucune boîte réelle n'a encore été créée. Elle est affichée comme telle dans le contact et ne reçoit aucun message depuis le site. Lorsque l'équipe dispose d'une adresse active, renseigner `VITE_PUBLIC_CONTACT_EMAIL` dans l'environnement du frontend : le lien e-mail et la demande d'inscription aux actualités utilisent alors cette adresse via le logiciel de messagerie de l'utilisateur. Aucun message ni abonnement n'est enregistré dans une base de données.
