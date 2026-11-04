import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AccessPortal from './AccessPortal.jsx'
import { dishes, events, formatPrice, homeImage, menuImage, offers, promoImage } from './publicData.js'
import './public.css'

const logo = homeImage(444)
const readSaved = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const navSections = {
  home: [['public-main', 'home'], ['a-propos', 'about'], ['apercu-menu', 'menu'], ['experience', 'home'], ['contact', 'contact']],
  menu: [['public-main', 'menu'], ['contact', 'contact']],
  promotions: [['public-main', 'promotions'], ['contact', 'contact']],
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

function Header({ page, activeSection }) {
  const [open, setOpen] = useState(false)
  const links = [
    { to: '/', label: 'Accueil', key: 'home' },
    { to: '/#a-propos', label: 'À propos', key: 'about' },
    { to: '/menu', label: 'Menu', key: 'menu' },
    { to: '/promotions', label: 'Promotions & Événements', key: 'promotions' },
    { to: '/#contact', label: 'Contact', key: 'contact' },
  ]
  return <header className="public-header">
    <Link to="/" className="public-brand" aria-label="Mon Miam Miam, accueil"><img src={logo} alt="Mon Miam Miam ZeDuc-Sp@ce" /></Link>
    <button type="button" className="public-menu-toggle" aria-expanded={open} aria-controls="public-nav" onClick={() => setOpen(!open)}>☰ <span className="public-sr-only">Menu</span></button>
    <nav id="public-nav" className={open ? 'public-nav is-open' : 'public-nav'} aria-label="Navigation publique">
      {links.map(link => <Link key={link.key} to={link.to} aria-current={activeSection === link.key ? (page === link.key ? 'page' : 'location') : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <div className="public-nav-access"><Link to="/acces" aria-current={activeSection === 'access' ? 'page' : undefined}>Connexion</Link><Link className="public-pill" to="/acces#inscription" aria-current={activeSection === 'signup' ? 'location' : undefined}>Inscription</Link></div>
    </nav>
  </header>
}

function Footer() {
  return <footer id="contact" className="public-footer">
    <div className="public-container public-footer-grid">
      <div><Link to="/"><img className="public-footer-logo" src={logo} alt="Mon Miam Miam" /></Link><p>Le climat du goût et du chill à Kinshasa. Cuisine congolaise, terrasse panoramique et moments conviviaux.</p></div>
      <div><h3>Liens rapides</h3><Link to="/">Accueil</Link><Link to="/menu">Menu</Link><Link to="/promotions">Promotions</Link><Link to="/promotions#evenements">Événements</Link></div>
      <div><h3>Assistance</h3><Link to="/acces">Choisir mon espace</Link><Link to="/acces#inscription">Créer un compte</Link><a href="mailto:contact@monmiammiam.cd">Contacter le restaurant</a></div>
      <div><h3>Contact</h3><p>Kinshasa, République démocratique du Congo · adresse exacte à confirmer</p><p>Numéro à confirmer</p><a href="mailto:contact@monmiammiam.cd">contact@monmiammiam.cd</a></div>
    </div>
    <div className="public-container public-footer-bottom"><span>© 2026 ZeDuc-Sp@ce. Tous droits réservés.</span><span>Mon Miam Miam · Le climat du goût et du chill</span></div>
  </footer>
}

function CookieChoice() {
  const [choice, setChoice] = useState(() => readSaved('mmm-cookie-choice', null))
  if (choice) return null
  const choose = value => { localStorage.setItem('mmm-cookie-choice', JSON.stringify(value)); setChoice(value) }
  return <aside className="public-cookie" aria-label="Choix des cookies"><p>Ce site mémorise votre choix de cookies pour améliorer votre visite.</p><div><button onClick={() => choose('refused')}>Refuser</button><button className="public-pill" onClick={() => choose('accepted')}>Accepter</button></div></aside>
}

const homeDishes = [
  { name: 'Poulet DG', description: 'Poulet fermier sauté, bananes plantains et légumes croquants.', price: 3500, image: homeImage(85), category: 'Plats' },
  { name: 'Ndolé aux crevettes', description: 'Feuilles de ndolé, arachides et crevettes tigrées.', price: 3000, image: homeImage(104), category: 'Plats' },
  { name: 'Poisson braisé et bobolo', description: 'Poisson au feu de bois et bâtons de manioc.', price: 4500, image: homeImage(123), category: 'Grillades' },
  { name: 'Brochettes de bœuf', description: 'Bœuf mariné aux épices du Nord et piment doux.', price: 1500, image: homeImage(142), category: 'Grillades' },
  { name: 'Riz sauté au poulet', description: 'Riz parfumé, poulet et légumes maraîchers.', price: 2500, image: homeImage(161), category: 'Plats' },
  { name: 'Beignets-haricots', description: 'Beignets dorés, haricots mijotés et piment maison.', price: 500, image: homeImage(180), category: 'Petit-déjeuner' },
]

function Home() {
  const [category, setCategory] = useState('Tout')
  const [testimonial, setTestimonial] = useState(0)
  const [email, setEmail] = useState('')
  const [mailReady, setMailReady] = useState(false)
  const filtered = category === 'Tout' ? homeDishes : homeDishes.filter(d => d.category === category)
  const reviews = [
    { quote: 'Les portions de Poulet DG sont ultra copieuses et commander depuis ma chambre pour récupérer sur la terrasse est un vrai bonheur.', name: 'Arsène T.', role: 'Étudiant, UCAC-ICAM' },
    { quote: 'Le poisson braisé du vendredi soir avec les matchs en direct : l’ambiance est tout simplement imbattable.', name: 'Clarisse M.', role: 'Étudiante à Kinshasa' },
    { quote: 'Service impeccable, prix adaptés à notre budget et de bons moments entre amis.', name: 'Brice K.', role: 'Master informatique' },
  ]
  const visibleReviews = [0, 1, 2].map(offset => reviews[(testimonial + offset) % reviews.length])
  return <>
    <main id="public-main">
      <section className="public-hero public-container"><div className="public-hero-copy"><h1><span>Le goût qui</span><br />rassemble les<br /><span>étudiants</span></h1><p>Préparé avec passion, servi avec soin : commandez en ligne, cumulez des points et profitez de la terrasse, de la vue sur la Dibamba et des matchs sur Canal+.</p><div className="public-actions"><Link className="public-pill" to="/acces">Commander maintenant <span aria-hidden="true">→</span></Link><Link className="public-pill public-pill-dark" to="/menu">Voir le menu <span aria-hidden="true">→</span></Link></div></div><div className="public-hero-art"><img src={homeImage(10)} alt="Poulet DG avec plantains et légumes" /><span className="public-hero-badge">✦ <small>Spécialité maison<br /><strong>Poulet DG Royal</strong></small></span></div></section>
      <section className="public-container public-feature-offers" aria-label="Offres en vedette"><Link to="/promotions" className="public-photo-offer"><img src={homeImage(401)} alt="Double plaisir du week-end" /></Link><Link to="/promotions" className="public-gift-offer"><small>✦ Chèque privilège</small><strong>5 000 CDF</strong><p>Bon d’achat pour les résidents et abonnés mensuels</p><span>Code : RESIDENT-2026 <b>En profiter →</b></span></Link><Link to="/promotions" className="public-photo-offer"><img src={homeImage(431)} alt="Offre famille et partage" /></Link></section>
      <section id="a-propos" className="public-container public-about"><div className="public-about-photo"><img src={homeImage(41)} alt="Terrasse panoramique du restaurant à Kinshasa" /><strong>500+<small>étudiants servis chaque semaine</small></strong></div><div><span className="public-kicker">À propos</span><h2>Plus qu’un restaurant, <em>un lieu de vie.</em></h2><p>Implanté à Kinshasa, en République démocratique du Congo, ZeDuc-Sp@ce réinvente le quotidien des étudiants et riverains avec son service gourmand « Mon Miam Miam ».</p><p>Savourez une cuisine congolaise authentique et généreuse sur notre terrasse aérée. Venez réviser au calme, vibrer devant les matchs ou défier vos collègues au billard.</p><a className="public-pill" href="#experience">En savoir plus →</a></div></section>
      <section id="apercu-menu" className="public-menu-preview"><div className="public-container"><div className="public-section-title"><span className="public-kicker">Choix du chef</span><h2>Notre <em>menu du jour</em></h2></div><div className="public-filters" role="group" aria-label="Filtrer le menu du jour">{['Tout', 'Petit-déjeuner', 'Plats', 'Grillades'].map(cat => <button key={cat} className={category === cat ? 'active' : ''} onClick={() => setCategory(cat)}>{cat}</button>)}</div><div className="public-mini-menu">{filtered.length ? filtered.map(d => <Link to="/menu" key={d.name} className="public-mini-dish"><img src={d.image} alt="" /><span><strong>{d.name}</strong><small>{d.description}</small></span><b>{formatPrice(d.price)}</b></Link>) : <p>Aucun plat dans cette catégorie aujourd’hui.</p>}</div><Link className="public-pill public-centered-cta" to="/menu">Voir tout le menu →</Link></div></section>
      <div className="public-container public-referral"><span>♛</span><div><strong>Parrainez un ami, gagnez des points fidélité !</strong><p>Chaque parrainage débloque des récompenses.</p></div><code>MIAM-ARS24</code><Link to="/acces">Découvrir le parrainage →</Link></div>
      <section id="experience" className="public-container public-experience"><div><span className="public-kicker">Expérience exclusive</span><h2>Une expérience <em>extraordinaire pour tous.</em></h2><ul><li><strong>Cuisine généreuse & rapide</strong><p>Des recettes soignées pour les appétits studieux.</p></li><li><strong>Produits 100 % frais</strong><p>Des produits locaux sélectionnés chaque jour.</p></li><li><strong>Ambiance mémorable</strong><p>Terrasse panoramique, billard et retransmissions sportives.</p></li></ul></div><div className="public-experience-cards"><Link to="/acces"><span>▣</span><strong>Commander pour arriver</strong><p>Choisissez votre heure d’arrivée sur la terrasse.</p><b>Accéder →</b></Link><Link to="/promotions#evenements"><span>✣</span><strong>Matchs et billard</strong><p>Canal+ et billard sur la terrasse festive.</p><b>Explorer →</b></Link><Link to="/acces" className="public-wide-card"><strong>Commander en ligne</strong><p>Pour profiter des services de l’application</p><b>Accéder à l’application →</b></Link></div></section>
      <section className="public-gallery"><div className="public-container"><div className="public-section-title"><span className="public-kicker">Galerie visuelle</span><h2>Notre <em>galerie</em></h2><p>Découvrez l’atmosphère vibrante et les créations gourmandes de ZeDuc-Sp@ce.</p></div><div className="public-gallery-grid">{[298, 300, 302, 304, 306, 308].map((layer, i) => <img key={layer} src={homeImage(layer)} alt={['Burger gourmand', 'Repas entre amis', 'Grillades braisées', 'Chef en cuisine', 'Terrasse au coucher du soleil', 'Dessert maison'][i]} loading="lazy" />)}</div></div></section>
      <section className="public-container public-testimonials"><div className="public-section-title"><span className="public-kicker">Témoignages</span><h2>Ce que disent nos <em>étudiants</em></h2><p>Avis des résidents et étudiants à Kinshasa.</p></div><div className="public-review-grid">{visibleReviews.map(review => <blockquote key={review.name}><span>★★★★★</span><p>« {review.quote} »</p><footer><strong>{review.name}</strong><small>{review.role}</small></footer></blockquote>)}</div><div className="public-carousel-actions"><button aria-label="Témoignages précédents" onClick={() => setTestimonial((testimonial + reviews.length - 1) % reviews.length)}>←</button><button aria-label="Témoignages suivants" onClick={() => setTestimonial((testimonial + 1) % reviews.length)}>→</button></div></section>
      <section className="public-newsletter"><div className="public-container"><div className="public-newsletter-box"><span>✉</span><h2>Restez informé de nos <em>promos</em></h2><p>Recevez les offres spéciales et soirées directement par e-mail.</p><form onSubmit={event => { event.preventDefault(); setMailReady(true); window.location.href = `mailto:contact@monmiammiam.cd?subject=Inscription%20aux%20actualit%C3%A9s&body=${encodeURIComponent(`Bonjour, je souhaite recevoir les actualités à cette adresse : ${email}`)}` }}><label className="public-sr-only" htmlFor="newsletter-email">Adresse e-mail</label><input id="newsletter-email" type="email" placeholder="Votre adresse e-mail" value={email} onChange={event => setEmail(event.target.value)} required /><button className="public-pill">Demander l’inscription →</button></form><small>{mailReady ? 'La demande a été ouverte dans votre messagerie.' : 'Votre messagerie s’ouvrira pour envoyer la demande au restaurant.'}</small></div></div></section>
    </main>
  </>
}

function Menu() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tout')
  const [sort, setSort] = useState('popularite')
  const [page, setPage] = useState(1)
  const [favorites, setFavorites] = useState(() => readSaved('mmm-public-favorites', []))
  const filtered = useMemo(() => {
    const list = dishes.filter(d => (category === 'Tout' || d.category === category) && `${d.name} ${d.description}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')))
    if (sort === 'prix-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'prix-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'nom') list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return list
  }, [query, category, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / 6))
  const toggleFavorite = id => { const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]; setFavorites(next); localStorage.setItem('mmm-public-favorites', JSON.stringify(next)) }
  return <main id="public-main" className="public-container public-menu-page"><div className="public-menu-heading"><div><h1>Le <em>menu</em> de ZeDuc-Sp@ce</h1><p>Spécialités congolaises mijotées avec passion, grillades au feu de bois et rafraîchissements artisanaux.</p></div><div className="public-menu-tools"><label><span className="public-sr-only">Rechercher un plat</span><input type="search" placeholder="Rechercher un plat ou une boisson…" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /></label><label><span className="public-sr-only">Trier les plats</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="popularite">Trier : Popularité</option><option value="prix-asc">Prix croissant</option><option value="prix-desc">Prix décroissant</option><option value="nom">Nom A–Z</option></select></label></div></div>
    <section className="public-menu-spotlight"><div><span className="public-kicker">✦ Plat du jour</span><h2>Poulet DG, plantains et légumes croquants</h2><p>Poulet fermier mijoté aux poivrons, carottes, haricots verts et plantains frits dorés.</p><strong>{formatPrice(3500)}</strong><Link className="public-pill" to="/acces">Se connecter pour commander →</Link></div><img src={menuImage(54)} alt="Assiette de Poulet DG" /></section>
    <div className="public-filters public-left-filters" role="group" aria-label="Catégories de plats">{['Tout', 'Plats', 'Grillades', 'Boissons', 'Desserts'].map(cat => <button key={cat} className={category === cat ? 'active' : ''} onClick={() => { setCategory(cat); setPage(1) }}>{cat}</button>)}</div>
    <div className="public-menu-grid">{filtered.slice((page - 1) * 6, page * 6).map(d => <article className={`public-dish-card ${d.unavailable ? 'is-unavailable' : ''}`} key={d.id}><div className="public-dish-image"><img src={d.image} alt={d.name} loading="lazy" />{d.badge && <span className="public-dish-badge">{d.badge}</span>}{d.rating && <span className="public-dish-rating">☆ {d.rating}</span>}<button className="public-favorite" type="button" aria-label={`${favorites.includes(d.id) ? 'Retirer' : 'Ajouter'} ${d.name} ${favorites.includes(d.id) ? 'des' : 'aux'} favoris`} aria-pressed={favorites.includes(d.id)} onClick={() => toggleFavorite(d.id)}>{favorites.includes(d.id) ? '♥' : '♡'}</button></div><div className="public-dish-body"><h2>{d.name}</h2><p>{d.description}</p><div className="public-dish-bottom"><div><small>Prix unitaire</small><strong>{formatPrice(d.price)}</strong>{d.originalPrice && <del>{formatPrice(d.originalPrice)}</del>}</div>{d.unavailable ? <button disabled>Momentanément épuisé</button> : <Link className="public-pill" to="/acces">Commander</Link>}</div></div></article>)}</div>
    {!filtered.length && <div className="public-empty">Aucun plat trouvé. Essayez une autre recherche ou catégorie.</div>}
    {pages > 1 && <nav className="public-pagination" aria-label="Pagination du menu"><button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>{Array.from({ length: pages }, (_, index) => <button key={index} className={page === index + 1 ? 'active' : ''} aria-current={page === index + 1 ? 'page' : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === pages} onClick={() => setPage(page + 1)}>›</button></nav>}
    <div className="public-menu-referral"><strong>Parrainez un ami étudiant et cumulez des points repas gratuits</strong><p>Code de la maquette : <code>MIAM-ARS24</code></p><button onClick={() => navigator.clipboard?.writeText('MIAM-ARS24')}>Copier le code</button></div>
  </main>
}

function Promotions() {
  const tab = useVisibleSection(promotionSections, 'promotions')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)
  const selectTab = next => document.getElementById(next)?.scrollIntoView({ behavior: 'smooth' })
  return <main id="public-main" className="public-container public-promotions-page"><div className="public-section-title"><h1>Promotions et <em>événements</em></h1><p>Découvrez les offres gourmandes étudiantes, nos packs du soir et l’ambiance nocturne sur le rooftop de Kinshasa, en RDC.</p></div><div className="public-filters" role="group" aria-label="Sections de promotions">{[['promotions','Promotions'],['evenements','Événements'],['jeux','Jeux MIAM']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} aria-pressed={tab === id} onClick={() => selectTab(id)}>{label}</button>)}</div>
    <section id="promotions" className="public-promo-hero"><img src={promoImage(24)} alt="Grillades sur le rooftop" /><div><span className="public-kicker">−20 % · Spécial week-end</span><h2>Double plaisir du week-end</h2><p>Profitez d’un tarif privilégié sur les plats à partager, planches dégustation et cocktails du rooftop.</p><ul><li>Accès libre aux tables de billard dès deux commandes</li><li>Double points de fidélité MIAM</li></ul><button className="public-pill" onClick={() => setSelected({ title: 'Double plaisir du week-end', terms: 'Cette offre est présentée dans la maquette. Disponibilité et dates à confirmer auprès du restaurant.' })}>Voir les conditions →</button></div></section>
    <section className="public-offers-section"><div className="public-section-heading"><div><span className="public-kicker">Sélection gourmande</span><h2>Les Formules & <em>Privilèges</em></h2></div><p>Tarifs en CDF à confirmer lors de votre commande.</p></div><div className="public-offers-grid">{offers.map(offer => <article className="public-offer-card" key={offer.title}><div className="public-offer-image"><img src={offer.image} alt="" loading="lazy" /><span>{offer.badge}</span><small>{offer.tag}</small></div><div><h3>{offer.title}</h3><p>{offer.description}</p><button onClick={() => setSelected(offer)}>Voir les conditions ›</button></div></article>)}</div></section>
    <section id="evenements" className="public-events-section"><div className="public-section-heading"><div><span className="public-kicker">Agenda ZeDuc-Sp@ce</span><h2>Événements <em>à venir</em></h2></div><p>Programmation issue de la maquette ; dates à confirmer.</p></div><div className="public-event-list">{events.map(event => { const closed = new Date(`2026-${event.month === 'OCT' ? '10' : '11'}-${event.day}T23:59:59`) < new Date(); return <article key={event.title}><div className="public-event-date"><small>{event.month}</small><strong>{event.day}</strong></div><div><small>{event.time} · {event.place}</small><h3>{event.title}</h3><p>{event.description}</p></div><div className="public-event-action"><span>{event.price}</span><button className="public-pill" disabled={closed} onClick={() => setSelected({ title: event.title, terms: `Participation à confirmer auprès du restaurant. ${event.price}.` })}>{closed ? 'Date passée' : 'Je participe'}</button></div></article> })}</div></section>
    <section id="jeux" className="public-games-banner"><div><span className="public-kicker">Fidélité & récompenses</span><h2>Jouez pour gagner des <em>points MIAM</em></h2><p>La roue gourmande et le quiz hebdomadaire sont accessibles depuis l’application.</p></div><Link className="public-pill" to="/acces">Accéder à l’application →</Link></section>
    {selected && <div className="public-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}><div className="public-modal" role="dialog" aria-modal="true" aria-label={selected.title}><button className="public-modal-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button><span className="public-kicker">Informations</span><h2>{selected.title}</h2><p>{selected.terms}</p><button className="public-pill" onClick={() => { navigator.clipboard?.writeText(`${selected.title} — ${selected.terms}`); setCopied(true) }}>{copied ? 'Copié' : 'Copier les informations'}</button></div></div>}
  </main>
}

export default function PublicSite({ page }) {
  const location = useLocation()
  const activeSection = useVisibleSection(navSections[page], page === 'home' ? 'home' : page, 'contact')
  useEffect(() => {
    document.title = `${page === 'home' ? 'Accueil' : page === 'menu' ? 'Menu' : page === 'promotions' ? 'Promotions et événements' : 'Accès'} · Mon Miam Miam`
    if (location.hash) window.setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 0)
    else window.scrollTo(0, 0)
  }, [location, page])
  return <div className="public-site"><a className="public-skip" href="#public-main">Aller au contenu</a><Header page={page} activeSection={activeSection} />{page === 'home' ? <Home /> : page === 'menu' ? <Menu /> : page === 'promotions' ? <Promotions /> : <AccessPortal />}<Footer /><CookieChoice /></div>
}
