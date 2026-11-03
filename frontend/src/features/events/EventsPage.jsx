const events = [
  { title: 'Soirée Ligue des champions', detail: 'Diffusion et tapas sur la terrasse', image: '/images/campaigns/promotions-photo2.png' },
  { title: 'Tournoi de billard', detail: 'Rencontre conviviale au ZeDuc-Sp@ce', image: '/images/campaigns/promotions-photo3.png' },
]
export default function EventsPage() { return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">LA VIE DU RESTAURANT</span><h1>Événements & jeux</h1><p>Les dates et modalités de participation seront confirmées par le restaurant. Aucun jeu n’attribue de récompense dans cette démonstration.</p></div><div className="site-grid">{events.map((item) => <article className="site-product" key={item.title}><img src={item.image} alt="" /><div><span className="site-eyebrow">À VENIR</span><h2>{item.title}</h2><p>{item.detail}</p><span>Modalités à venir</span></div></article>)}</div></div> }
