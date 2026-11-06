import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AccessPortal from './AccessPortal.jsx'
import { formatPrice, homeImage, menuImage } from './publicData.js'
import { demoCatalog, loadPublicCatalog } from '../../data/remoteCatalog.js'
import { logoutAuthSession, readAuthSession, rolePath } from '../shared/authSession.js'
import './public.css'

const logo = homeImage(444)
const plannedContactEmail = 'contact@monmiammiam.cd'
const contactEmailCandidate = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim() || ''
const activeContactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmailCandidate) ? contactEmailCandidate : ''
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
const readSaved = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const restaurantName = (catalog, id) => catalog.restaurants.find(item => item.id === id)?.name || 'Restaurant'

const navSections = {
  home: [['public-main', 'home'], ['restaurants', 'restaurants'], ['a-propos', 'about'], ['apercu-menu', 'menu'], ['promotions', 'promotions'], ['evenements', 'events'], ['jeux', 'games'], ['contact', 'contact']],
  menu: [['public-main', 'menu'], ['contact', 'contact']],
  restaurant: [['public-main', 'restaurants'], ['restaurant-menu', 'menu'], ['restaurant-promotions', 'promotions'], ['restaurant-events', 'events'], ['restaurant-games', 'games'], ['contact', 'contact']],
  promotions: [['public-main', 'promotions'], ['evenements', 'events'], ['jeux', 'games'], ['contact', 'contact']],
  access: [['public-main', 'access'], ['inscription', 'signup'], ['contact', 'contact']],
}
const promotionSections = [['promotions', 'promotions'], ['evenements', 'evenements'], ['jeux', 'jeux']]

function useVisibleSection(sections, fallback, lastSection) {
  const [active, setActive] = useState(fallback)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const focusLine = Math.min(window.innerHeight * 0.38, 360)
      let current = fallback
      for (const [id, key] of sections) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= focusLine) current = key
      }
      if (lastSection && window.scrollY > 30 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) current = lastSection
      setActive(previous => previous === current ? previous : current)
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sections, fallback, lastSection])

  return active
}

function Header({ page, activeSection, theme, onThemeChange }) {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(() => readAuthSession())
  const links = [
    { to: '/', label: 'Accueil', key: 'home' },
    { to: '/#restaurants', label: 'Restaurants', key: 'restaurants' },
    { to: '/#a-propos', label: 'À propos', key: 'about' },
    { to: page === 'home' ? '/#apercu-menu' : '/menu', label: 'Menu', key: 'menu' },
    { to: page === 'home' ? '/#promotions' : '/promotions', label: 'Promotions', key: 'promotions' },
    { to: page === 'promotions' ? '/promotions#evenements' : '/#evenements', label: 'Événements', key: 'events' },
    { to: page === 'promotions' ? '/promotions#jeux' : '/#jeux', label: 'Jeux', key: 'games' },
    { to: '/#contact', label: 'Contact', key: 'contact' },
  ]
  return <header className="public-header">
    <Link to="/" className="public-brand" aria-label="Mon Miam Miam, accueil"><img src={logo} alt="Mon Miam Miam ZeDuc-Sp@ce" /></Link>
    <button type="button" className="public-menu-toggle" aria-expanded={open} aria-controls="public-nav" onClick={() => setOpen(!open)}>☰ <span className="public-sr-only">Menu</span></button>
    <nav id="public-nav" className={open ? 'public-nav is-open' : 'public-nav'} aria-label="Navigation publique">
      {links.map(link => <Link key={link.key} to={link.to} aria-current={activeSection === link.key ? (page === link.key ? 'page' : 'location') : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <div className="public-nav-access">{session ? <><Link to={rolePath(session.role)}>Mon espace</Link><button type="button" onClick={() => { void logoutAuthSession(); setSession(null); setOpen(false) }}>Déconnexion</button></> : <><Link to="/acces" aria-current={activeSection === 'access' ? 'page' : undefined}>Connexion</Link><Link className="public-pill" to="/acces#inscription" aria-current={activeSection === 'signup' ? 'location' : undefined}>Inscription</Link></>}</div>
    </nav>
    <button type="button" className="public-theme-toggle" onClick={onThemeChange} aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'} aria-pressed={theme === 'light'} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span></button>
  </header>
}

function Footer() {
  return <footer className="public-footer">
    <div className="public-container public-footer-grid">
      <div><Link to="/"><img className="public-footer-logo" src={logo} alt="Mon Miam Miam" /></Link><p>Le climat du goût et du chill à Kinshasa. Cuisine congolaise, terrasse panoramique et moments conviviaux.</p></div>
      <div><h3>Liens rapides</h3><Link to="/">Accueil</Link><Link to="/#restaurants">Restaurants</Link><Link to="/menu">Menu</Link><Link to="/promotions">Promotions</Link><Link to="/promotions#evenements">Événements</Link></div>
      <div><h3>Assistance</h3><Link to="/acces">Choisir mon espace</Link><Link to="/acces#inscription">Créer un compte</Link><Link to="/#contact">Coordonnées du projet</Link></div>
      <div><h3>Contact</h3><p>Kinshasa, République démocratique du Congo · adresse exacte à confirmer</p><p>Numéro à confirmer</p><p>{activeContactEmail || plannedContactEmail}</p><small>{activeContactEmail ? 'Adresse de contact configurée' : 'Adresse prévue · boîte à activer'}</small></div>
    </div>
    <div className="public-container public-footer-bottom"><span>© 2026 ZeDuc-Sp@ce. Tous droits réservés.</span><span>Mon Miam Miam · Le climat du goût et du chill</span></div>
  </footer>
}

function ContactSection() {
  const [copyStatus, setCopyStatus] = useState('')
  const copyPlannedEmail = async () => {
    try { await navigator.clipboard.writeText(plannedContactEmail); setCopyStatus('Adresse copiée.') }
    catch { setCopyStatus('Sélectionnez l’adresse affichée pour la copier.') }
  }
  return <section id="contact" className="public-contact" aria-labelledby="public-contact-title"><div className="public-container public-contact-inner"><div><span className="public-kicker">RESTONS EN CONTACT</span><h2 id="public-contact-title">Parlons de <em>Mon Miam Miam.</em></h2><p>Une question sur les restaurants, les commandes ou le projet ? Retrouvez ici les coordonnées du site.</p></div><div className="public-contact-card"><span>ADRESSE E-MAIL DU PROJET</span><strong>{activeContactEmail || plannedContactEmail}</strong><small>{activeContactEmail ? 'Adresse active configurée pour ce site.' : 'Adresse prévue : la boîte mail doit encore être créée et activée.'}</small>{activeContactEmail ? <a className="public-pill" href={`mailto:${activeContactEmail}?subject=Contact%20Mon%20Miam%20Miam`}>Écrire un e-mail →</a> : <button type="button" className="public-pill public-pill-dark" onClick={copyPlannedEmail}>Copier l’adresse prévue</button>}{copyStatus && <small role="status">{copyStatus}</small>}<p>Kinshasa, RDC · adresse de la plateforme à confirmer</p></div></div></section>
}

function CookieChoice() {
  const [choice, setChoice] = useState(() => readSaved('mmm-cookie-choice', null))
  if (choice) return null
  const choose = value => { localStorage.setItem('mmm-cookie-choice', JSON.stringify(value)); setChoice(value) }
  return <aside className="public-cookie" aria-label="Choix des cookies"><p>Ce site mémorise votre choix de cookies pour améliorer votre visite.</p><div><button onClick={() => choose('refused')}>Refuser</button><button className="public-pill" onClick={() => choose('accepted')}>Accepter</button></div></aside>
}

function RestaurantDirectory({ catalog }) {
  const [query, setQuery] = useState('')
  const restaurants = catalog.restaurants.filter(item => `${item.name} ${item.location}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')))
  return <section id="restaurants" className="public-container public-restaurants" aria-labelledby="public-restaurants-title"><div className="public-section-title"><span className="public-kicker">NOS ÉTABLISSEMENTS</span><h2 id="public-restaurants-title">Choisissez votre <em>restaurant</em></h2><p>Les plats, promotions, événements et jeux sont propres à chaque restaurant.</p></div><label className="public-restaurant-search">Rechercher par nom ou localisation<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Restaurant, ville, quartier…" /></label><div className="public-restaurant-grid">{restaurants.map(item => <article className="public-restaurant-card" key={item.id}><span className="public-kicker">{item.example ? 'RESTAURANT DE DÉMONSTRATION' : 'RESTAURANT'}</span><h3>{item.name}</h3><p>{item.description}</p><dl><div><dt>Localisation</dt><dd>{item.location}</dd></div><div><dt>Horaires</dt><dd>{item.hours}</dd></div></dl><Link className="public-pill" to={`/restaurants/${encodeURIComponent(item.id)}`}>Découvrir le restaurant →</Link></article>)}</div>{!restaurants.length && <p>Aucun restaurant ne correspond à cette recherche.</p>}</section>
}

function RestaurantDetail({ catalog }) {
  const { id } = useParams()
  const restaurant = catalog.restaurants.find(item => item.id === id)
  if (!restaurant) return <main id="public-main" className="public-container public-restaurant-detail"><h1>Restaurant introuvable</h1><p>Cet établissement n'est pas publié.</p><Link className="public-pill" to="/#restaurants">Voir les restaurants →</Link></main>
  const menu = catalog.dishes.filter(item => item.restaurantId === restaurant.id)
  const promotions = catalog.offers.filter(item => item.restaurantId === restaurant.id)
  const agenda = catalog.events.filter(item => item.restaurantId === restaurant.id)
  const games = catalog.games.filter(item => item.restaurantId === restaurant.id)
  return <main id="public-main" className="public-container public-restaurant-detail">
    <Link className="public-text-link" to="/#restaurants">← Tous les restaurants</Link>
    <section className="public-restaurant-detail-hero"><span className="public-kicker">{restaurant.example ? 'RESTAURANT DE DÉMONSTRATION' : 'RESTAURANT'}</span><h1>{restaurant.name}</h1><p>{restaurant.description}</p><dl><div><dt>Localisation</dt><dd>{restaurant.location}</dd></div><div><dt>Horaires</dt><dd>{restaurant.hours}</dd></div></dl><Link className="public-pill" to={`/menu?restaurant=${encodeURIComponent(restaurant.id)}`}>Explorer la carte →</Link></section>
    <section id="restaurant-menu"><h2>Les plats de <em>{restaurant.name}</em></h2>{menu.length ? <div className="public-restaurant-detail-grid">{menu.slice(0, 6).map(item => <article key={item.id}><img src={item.image} alt="" /><h3>{item.name}</h3><p>{item.description}</p><strong>{formatPrice(item.price)}</strong></article>)}</div> : <p>Aucun plat publié pour cet établissement.</p>}</section>
    <section id="restaurant-promotions"><h2>Promotions</h2>{promotions.length ? <div className="public-restaurant-detail-grid">{promotions.map(item => <article key={item.title}><img src={item.image} alt="" /><h3>{item.title}</h3><p>{item.description}</p></article>)}</div> : <p>Aucune promotion publiée pour cet établissement.</p>}</section>
    <section id="restaurant-events"><h2>Événements</h2>{agenda.length ? <div className="public-restaurant-detail-grid">{agenda.map(item => <article key={item.title}>{item.image && <img src={item.image} alt="" loading="lazy" />}<h3>{item.title}</h3><p>{item.description}</p><small>{item.day} {item.month} · {item.time}</small></article>)}</div> : <p>Aucun événement publié pour cet établissement.</p>}</section>
    <section id="restaurant-games"><h2>Jeux</h2>{games.length ? games.map(item => <article key={item.id}><h3>{item.title}</h3><p>{item.description}</p></article>) : <p>Aucun jeu publié pour cet établissement.</p>}</section>
  </main>
}

function Home({ catalog }) {
  const { offers, events } = catalog
  const [category, setCategory] = useState('Tout')
  const [testimonial, setTestimonial] = useState(0)
  const [email, setEmail] = useState('')
  const [mailReady, setMailReady] = useState(false)
  const showcase = catalog.restaurants.flatMap(restaurant => catalog.dishes.filter(dish => dish.restaurantId === restaurant.id).slice(0, 3))
  const filtered = category === 'Tout' ? showcase : showcase.filter(d => d.category === category)
  const reviews = [
    { quote: 'Les portions de Poulet DG sont ultra copieuses et commander depuis ma chambre pour récupérer sur la terrasse est un vrai bonheur.', name: 'Arsène T.', role: 'Étudiant à Kinshasa' },
    { quote: 'Le poisson braisé du vendredi soir avec les matchs en direct : l’ambiance est tout simplement imbattable.', name: 'Clarisse M.', role: 'Étudiante à Kinshasa' },
    { quote: 'Service impeccable, prix adaptés à notre budget et de bons moments entre amis.', name: 'Brice K.', role: 'Master informatique' },
  ]
  const visibleReviews = [0, 1, 2].map(offset => reviews[(testimonial + offset) % reviews.length])
  return <>
    <main id="public-main">
      <section className="public-hero public-container"><div className="public-hero-copy"><h1><span>Le goût qui</span><br />rassemble les<br /><span>étudiants</span></h1><p>Préparé avec passion, servi avec soin : découvrez le menu, les événements et les avantages proposés à Kinshasa.</p><div className="public-actions"><Link className="public-pill" to="/acces">Découvrir les espaces <span aria-hidden="true">→</span></Link><Link className="public-pill public-pill-dark" to="/#apercu-menu">Voir le menu <span aria-hidden="true">→</span></Link></div></div><div className="public-hero-art"><img src={homeImage(10)} alt="Poulet DG avec plantains et légumes" /><span className="public-hero-badge">✦ <small>Spécialité maison<br /><strong>Poulet DG Royal</strong></small></span></div></section>
      <RestaurantDirectory catalog={catalog} />
      <section className="public-container public-feature-offers" aria-label="Offres en vedette"><Link to="/promotions" className="public-photo-offer"><img src={homeImage(401)} alt="Double plaisir du week-end" /></Link><Link to="/promotions" className="public-gift-offer"><small>✦ Chèque privilège</small><strong>5 000 CDF</strong><p>Bon d’achat pour les résidents et abonnés mensuels</p><span>Code : RESIDENT-2026 <b>En profiter →</b></span></Link><Link to="/promotions" className="public-photo-offer"><img src={homeImage(431)} alt="Offre famille et partage" /></Link></section>
      <section id="a-propos" className="public-container public-about"><div className="public-about-photo"><img src={homeImage(41)} alt="Espace gourmand à Kinshasa" /><strong>{catalog.restaurants.length}<small>restaurants à découvrir</small></strong></div><div><span className="public-kicker">À propos</span><h2>Plusieurs restaurants, <em>une expérience.</em></h2><p>Implanté à Kinshasa, en République démocratique du Congo, ZeDuc-Sp@ce réunit les restaurants de Mon Miam Miam pour les étudiants et riverains.</p><p>Découvrez les cartes, les promotions et les activités de chaque établissement avant de choisir où commander.</p><a className="public-pill" href="#experience">En savoir plus →</a></div></section>
      <section id="apercu-menu" className="public-menu-preview"><div className="public-container"><div className="public-section-title"><span className="public-kicker">Choix du chef</span><h2>Notre <em>menu du jour</em></h2></div><div className="public-filters" role="group" aria-label="Filtrer le menu du jour">{['Tout', 'Petit-déjeuner', 'Plats', 'Grillades'].map(cat => <button key={cat} className={category === cat ? 'active' : ''} onClick={() => setCategory(cat)}>{cat}</button>)}</div><div className="public-mini-menu">{filtered.length ? filtered.map(d => <Link to={`/menu?restaurant=${encodeURIComponent(d.restaurantId)}`} key={d.id || d.name} className="public-mini-dish"><img src={d.image} alt="" /><span><strong>{d.name}</strong><small>{restaurantName(catalog, d.restaurantId)} · {d.description}</small></span><b>{formatPrice(d.price)}</b></Link>) : <p>Aucun plat dans cette catégorie aujourd’hui.</p>}</div><Link className="public-pill public-centered-cta" to="/menu">Voir tout le menu →</Link></div></section>
      <div className="public-container public-referral"><span>♛</span><div><strong>Parrainez un ami, gagnez des points fidélité !</strong><p>Chaque parrainage débloque des récompenses.</p></div><code>MIAM-ARS24</code><Link to="/acces">Découvrir le parrainage →</Link></div>
      <section id="experience" className="public-container public-experience"><div><span className="public-kicker">Expérience exclusive</span><h2>Une expérience <em>extraordinaire pour tous.</em></h2><ul><li><strong>Cuisine généreuse & rapide</strong><p>Des recettes soignées pour les appétits studieux.</p></li><li><strong>Produits 100 % frais</strong><p>Des produits locaux sélectionnés chaque jour.</p></li><li><strong>Ambiance mémorable</strong><p>Terrasse panoramique, billard et retransmissions sportives.</p></li></ul></div><div className="public-experience-cards"><Link to="/acces"><span>▣</span><strong>Commander pour arriver</strong><p>Choisissez votre heure d’arrivée sur la terrasse.</p><b>Accéder →</b></Link><Link to="/promotions#evenements"><span>✣</span><strong>Matchs et billard</strong><p>Canal+ et billard sur la terrasse festive.</p><b>Explorer →</b></Link><Link to="/acces" className="public-wide-card"><strong>Commander en ligne</strong><p>Pour profiter des services de l’application</p><b>Accéder à l’application →</b></Link></div></section>
      <section className="public-gallery"><div className="public-container"><div className="public-section-title"><span className="public-kicker">Galerie visuelle</span><h2>Notre <em>galerie</em></h2><p>Découvrez l’atmosphère et les plats des restaurants présents sur la plateforme.</p></div><div className="public-gallery-grid">{[298, 300, 302, 304, 306, 308].map((layer, i) => <img key={layer} src={homeImage(layer)} alt={['Burger gourmand', 'Repas entre amis', 'Grillades braisées', 'Chef en cuisine', 'Terrasse au coucher du soleil', 'Dessert maison'][i]} loading="lazy" />)}</div></div></section>
      <section className="public-container public-testimonials"><div className="public-section-title"><span className="public-kicker">Témoignages</span><h2>Ce que disent nos <em>étudiants</em></h2><p>Avis illustratifs des maquettes, à remplacer par des avis vérifiés.</p></div><div className="public-review-grid">{visibleReviews.map(review => <blockquote key={review.name}><span>★★★★★</span><p>« {review.quote} »</p><footer><strong>{review.name}</strong><small>{review.role}</small></footer></blockquote>)}</div><div className="public-carousel-actions"><button aria-label="Témoignages précédents" onClick={() => setTestimonial((testimonial + reviews.length - 1) % reviews.length)}>←</button><button aria-label="Témoignages suivants" onClick={() => setTestimonial((testimonial + 1) % reviews.length)}>→</button></div></section>
      <section id="promotions" className="public-home-section public-home-promotions"><div className="public-container"><div className="public-section-title"><span className="public-kicker">Offres à découvrir</span><h2>Nos <em>promotions</em></h2><p>Une sélection des offres présentées dans la maquette. Disponibilités et tarifs à confirmer.</p></div><div className="public-offers-grid">{catalog.restaurants.flatMap(restaurant => offers.filter(offer => offer.restaurantId === restaurant.id).slice(0, 2)).slice(0, 4).map(offer => <article className="public-offer-card" key={offer.title}><div className="public-offer-image"><img src={offer.image} alt="" loading="lazy" /><span>{offer.badge}</span></div><div><small className="public-restaurant-name">{restaurantName(catalog, offer.restaurantId)}</small><h3>{offer.title}</h3><p>{offer.description}</p><Link className="public-text-link" to="/promotions">Voir les conditions →</Link></div></article>)}</div><Link className="public-pill public-centered-cta" to="/promotions">Toutes les promotions →</Link></div></section>
      <section id="evenements" className="public-home-section public-home-events"><div className="public-container"><div className="public-section-title"><span className="public-kicker">Agenda des restaurants</span><h2>Les <em>événements</em></h2><p>{catalog.connected ? 'Événements publiés par les restaurants.' : 'Programmation de démonstration à confirmer auprès de chaque restaurant.'}</p></div><div className="public-event-list">{events.map(event => <article key={event.title}><div className="public-event-date"><small>{event.month}</small><strong>{event.day}</strong></div><div>{event.image && <img className="public-event-visual" src={event.image} alt="" loading="lazy" />}<small className="public-restaurant-name">{restaurantName(catalog, event.restaurantId)}</small><small>{event.time} · {event.place}</small><h3>{event.title}</h3><p>{event.description}</p></div><div className="public-event-action"><span>{event.price}</span><Link className="public-pill" to="/promotions#evenements">En savoir plus →</Link></div></article>)}</div></div></section>
      <section id="jeux" className="public-home-section public-home-games"><div className="public-container public-home-games-inner"><div><span className="public-kicker">Fidélité & découvertes</span><h2>Découvrez les <em>jeux MIAM</em></h2><p>{catalog.games.length} jeu(x) publiés par les restaurants. Les récompenses réelles restent à confirmer.</p></div><Link className="public-pill" to="/promotions#jeux">Voir les jeux →</Link></div></section>
      <section className="public-newsletter"><div className="public-container"><div className="public-newsletter-box"><span>✉</span><h2>Restez informé de nos <em>promos</em></h2><p>Les offres et soirées seront envoyées par e-mail après activation de l’adresse du projet.</p>{activeContactEmail ? <><form onSubmit={event => { event.preventDefault(); setMailReady(true); window.location.href = `mailto:${activeContactEmail}?subject=Inscription%20aux%20actualit%C3%A9s&body=${encodeURIComponent(`Bonjour, je souhaite recevoir les actualités à cette adresse : ${email}`)}` }}><label className="public-sr-only" htmlFor="newsletter-email">Adresse e-mail</label><input id="newsletter-email" type="email" placeholder="Votre adresse e-mail" value={email} onChange={event => setEmail(event.target.value)} required /><button className="public-pill">Demander l’inscription →</button></form><small>{mailReady ? 'La demande a été ouverte dans votre messagerie.' : 'Votre messagerie s’ouvrira pour préparer la demande.'}</small></> : <p className="public-newsletter-pending">Adresse de contact en préparation : {plannedContactEmail}</p>}</div></div></section>
    </main>
  </>
}

function Menu({ catalog }) {
  const { dishes } = catalog
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRestaurantId = searchParams.get('restaurant')
  const restaurantId = catalog.restaurants.some(item => item.id === requestedRestaurantId) ? requestedRestaurantId : 'all'
  const currentRestaurant = restaurantId === 'all' ? null : catalog.restaurants.find(item => item.id === restaurantId)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tout')
  const [sort, setSort] = useState('popularite')
  const [page, setPage] = useState(1)
  const [favorites, setFavorites] = useState(() => readSaved('mmm-public-favorites', []))
  const filtered = useMemo(() => {
    const publicIds = new Set(catalog.restaurants.map(item => item.id))
    const list = dishes.filter(d => publicIds.has(d.restaurantId) && (restaurantId === 'all' || d.restaurantId === restaurantId) && (category === 'Tout' || d.category === category) && `${d.name} ${d.description}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')))
    if (sort === 'prix-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'prix-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'nom') list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return list
  }, [query, category, sort, restaurantId, dishes, catalog.restaurants])
  const pages = Math.max(1, Math.ceil(filtered.length / 6))
  const toggleFavorite = id => { const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]; setFavorites(next); localStorage.setItem('mmm-public-favorites', JSON.stringify(next)) }
  return <main id="public-main" className="public-container public-menu-page"><div className="public-menu-heading"><div><h1>Le <em>menu</em> {currentRestaurant ? `de ${currentRestaurant.name}` : 'des restaurants'}</h1><p>Choisissez un établissement pour consulter sa carte. Les menus non publiés sont indiqués comme tels.</p></div><div className="public-menu-tools"><label><span className="public-sr-only">Rechercher un plat</span><input type="search" placeholder="Rechercher un plat ou une boisson…" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /></label><label><span className="public-sr-only">Trier les plats</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="popularite">Trier : Popularité</option><option value="prix-asc">Prix croissant</option><option value="prix-desc">Prix décroissant</option><option value="nom">Nom A–Z</option></select></label></div></div>
    <label className="public-restaurant-filter">Restaurant <select value={restaurantId} onChange={event => { setSearchParams(event.target.value === 'all' ? {} : { restaurant: event.target.value }); setPage(1) }}><option value="all">Tous les restaurants</option>{catalog.restaurants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {!catalog.connected && catalog.restaurants.some(item => item.id === 'khalifa-food') && (restaurantId === 'all' || restaurantId === 'khalifa-food') && <section className="public-menu-spotlight"><div><span className="public-kicker">✦ Plat du jour · Khalifa_food</span><h2>Poulet DG, plantains et légumes croquants</h2><p>Poulet fermier mijoté aux poivrons, carottes, haricots verts et plantains frits dorés.</p><strong>{formatPrice(3500)}</strong><Link className="public-pill" to="/acces">Se connecter pour commander →</Link></div><img src={menuImage(54)} alt="Assiette de Poulet DG" /></section>}
    <div className="public-filters public-left-filters" role="group" aria-label="Catégories de plats">{['Tout', 'Plats', 'Grillades', 'Boissons', 'Desserts'].map(cat => <button key={cat} className={category === cat ? 'active' : ''} onClick={() => { setCategory(cat); setPage(1) }}>{cat}</button>)}</div>
    <div className="public-menu-grid">{filtered.slice((page - 1) * 6, page * 6).map(d => <article className={`public-dish-card ${d.unavailable ? 'is-unavailable' : ''}`} key={d.id}><div className="public-dish-image"><img src={d.image} alt={d.name} loading="lazy" />{d.badge && <span className="public-dish-badge">{d.badge}</span>}{d.rating && <span className="public-dish-rating">☆ {d.rating}</span>}<button className="public-favorite" type="button" aria-label={`${favorites.includes(d.id) ? 'Retirer' : 'Ajouter'} ${d.name} ${favorites.includes(d.id) ? 'des' : 'aux'} favoris`} aria-pressed={favorites.includes(d.id)} onClick={() => toggleFavorite(d.id)}>{favorites.includes(d.id) ? '♥' : '♡'}</button></div><div className="public-dish-body"><small className="public-restaurant-name">{restaurantName(catalog, d.restaurantId)}</small><h2>{d.name}</h2><p>{d.description}</p><div className="public-dish-bottom"><div><small>Prix unitaire</small><strong>{formatPrice(d.price)}</strong>{d.originalPrice && <del>{formatPrice(d.originalPrice)}</del>}</div>{d.unavailable ? <button disabled>Momentanément épuisé</button> : <Link className="public-pill" to="/acces">Commander</Link>}</div></div></article>)}</div>
    {!filtered.length && <div className="public-empty">{currentRestaurant?.example ? 'Aucun autre plat publié pour cet établissement exemple.' : 'Aucun plat trouvé. Essayez une autre recherche ou catégorie.'}</div>}
    {pages > 1 && <nav className="public-pagination" aria-label="Pagination du menu"><button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>{Array.from({ length: pages }, (_, index) => <button key={index} className={page === index + 1 ? 'active' : ''} aria-current={page === index + 1 ? 'page' : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === pages} onClick={() => setPage(page + 1)}>›</button></nav>}
    <div className="public-menu-referral"><strong>Parrainez un ami étudiant et cumulez des points repas gratuits</strong><p>Code de la maquette : <code>MIAM-ARS24</code></p><button onClick={() => navigator.clipboard?.writeText('MIAM-ARS24')}>Copier le code</button></div>
  </main>
}

function Promotions({ catalog }) {
  const { offers, events, games } = catalog
  const tab = useVisibleSection(promotionSections, 'promotions')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)
  const selectTab = next => document.getElementById(next)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
  return <main id="public-main" className="public-container public-promotions-page"><div className="public-section-title"><h1>Promotions et <em>événements</em></h1><p>Découvrez les offres gourmandes étudiantes, nos packs du soir et l’ambiance nocturne sur le rooftop de Kinshasa, en RDC.</p></div><div className="public-filters" role="group" aria-label="Sections de promotions">{[['promotions','Promotions'],['evenements','Événements'],['jeux','Jeux MIAM']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} aria-pressed={tab === id} onClick={() => selectTab(id)}>{label}</button>)}</div>
    {offers[0] ? <section id="promotions" className="public-promo-hero"><img src={offers[0].image} alt="" /><div><span className="public-kicker">{restaurantName(catalog, offers[0].restaurantId)}</span><h2>{offers[0].title}</h2><p>{offers[0].description}</p><button className="public-pill" onClick={() => setSelected(offers[0])}>Voir les conditions →</button></div></section> : <section id="promotions"><p>Aucune promotion publiée.</p></section>}
    <section className="public-offers-section"><div className="public-section-heading"><div><span className="public-kicker">Sélection gourmande</span><h2>Les Formules & <em>Privilèges</em></h2></div><p>Tarifs en CDF à confirmer lors de votre commande.</p></div><div className="public-offers-grid">{offers.map(offer => <article className="public-offer-card" key={offer.title}><div className="public-offer-image"><img src={offer.image} alt="" loading="lazy" /><span>{offer.badge}</span><small>{offer.tag}</small></div><div><small className="public-restaurant-name">{restaurantName(catalog, offer.restaurantId)}</small><h3>{offer.title}</h3><p>{offer.description}</p><button onClick={() => setSelected(offer)}>Voir les conditions ›</button></div></article>)}</div></section>
    <section id="evenements" className="public-events-section"><div className="public-section-heading"><div><span className="public-kicker">Agenda des restaurants</span><h2>Événements <em>à venir</em></h2></div><p>{catalog.connected ? 'Événements publiés par les restaurants.' : 'Programmation issue de la maquette ; dates à confirmer.'}</p></div><div className="public-event-list">{events.map(event => { const closed = !catalog.connected && new Date(`2026-${event.month === 'OCT' ? '10' : '11'}-${event.day}T23:59:59`) < new Date(); return <article key={event.title}><div className="public-event-date"><small>{event.month}</small><strong>{event.day}</strong></div><div>{event.image && <img className="public-event-visual" src={event.image} alt="" loading="lazy" />}<small className="public-restaurant-name">{restaurantName(catalog, event.restaurantId)}</small><small>{event.time} · {event.place}</small><h3>{event.title}</h3><p>{event.description}</p></div><div className="public-event-action"><span>{event.price}</span><button className="public-pill" disabled={closed} onClick={() => setSelected({ title: event.title, terms: `Participation à confirmer auprès du restaurant. ${event.price}.` })}>{closed ? 'Date passée' : 'Voir les détails'}</button></div></article> })}</div></section>
    <section id="jeux" className="public-games-banner"><div><span className="public-kicker">Fidélité & récompenses</span><h2>Jouez pour gagner des <em>points MIAM</em></h2><p>{games.length} jeu(x) publiés par les restaurants. Consultez la fiche de chaque établissement.</p></div><Link className="public-pill" to="/acces">Accéder à l’application →</Link></section>
    {selected && <div className="public-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}><div className="public-modal" role="dialog" aria-modal="true" aria-label={selected.title}><button className="public-modal-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button><span className="public-kicker">Informations</span><h2>{selected.title}</h2><p>{selected.terms}</p><button className="public-pill" onClick={() => { navigator.clipboard?.writeText(`${selected.title} — ${selected.terms}`); setCopied(true) }}>{copied ? 'Copié' : 'Copier les informations'}</button></div></div>}
  </main>
}

export default function PublicSite({ page }) {
  const location = useLocation()
  const [theme, setTheme] = useState(() => readSaved('mmm-public-theme', 'dark') === 'light' ? 'light' : 'dark')
  const [catalog, setCatalog] = useState(demoCatalog)
  const [catalogError, setCatalogError] = useState(false)
  useEffect(() => { let active = true; loadPublicCatalog().then(result => { if (active && result) setCatalog(result) }).catch(() => { if (active) setCatalogError(true) }); return () => { active = false } }, [])
  const activeSection = useVisibleSection(navSections[page], page === 'home' ? 'home' : page, 'contact')
  useEffect(() => { try { localStorage.setItem('mmm-public-theme', JSON.stringify(theme)) } catch { /* Theme remains active for this visit. */ } }, [theme])
  useEffect(() => {
    document.title = `${page === 'home' ? 'Accueil' : page === 'menu' ? 'Menu' : page === 'restaurant' ? 'Restaurant' : page === 'promotions' ? 'Promotions et événements' : 'Accès'} · Mon Miam Miam`
    if (location.hash) window.setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }), 0)
    else window.scrollTo(0, 0)
  }, [location, page])
  return <div className="public-site" data-theme={theme}><a className="public-skip" href="#public-main">Aller au contenu</a><Header page={page} activeSection={activeSection} theme={theme} onThemeChange={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />{catalogError && <p className="public-catalog-notice" role="status">Catalogue serveur indisponible · aperçu de démonstration affiché.</p>}{page === 'home' ? <Home catalog={catalog} /> : page === 'menu' ? <Menu catalog={catalog} /> : page === 'restaurant' ? <RestaurantDetail catalog={catalog} /> : page === 'promotions' ? <Promotions catalog={catalog} /> : <AccessPortal />}<ContactSection /><Footer /><CookieChoice /></div>
}
