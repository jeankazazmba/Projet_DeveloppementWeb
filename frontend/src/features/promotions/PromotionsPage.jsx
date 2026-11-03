import { Link } from 'react-router-dom'
const campaigns = [
  { title: 'Bar braisé −15 %', detail: 'Offre sur place et à emporter', image: '/images/campaigns/promotions-photo0.png' },
  { title: 'Avantage étudiant', detail: 'Présentez votre carte au restaurant', image: '/images/campaigns/promotions-photo1.png' },
]
export default function PromotionsPage() { return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">OFFRES DU MOMENT</span><h1>Promotions</h1><p>Offres présentées à titre de démonstration. Vérifiez leur disponibilité auprès du restaurant.</p></div><div className="site-grid">{campaigns.map((item) => <article className="site-product" key={item.title}><img src={item.image} alt="" /><div><span className="site-eyebrow">OFFRE</span><h2>{item.title}</h2><p>{item.detail}</p><Link to="/menu">Découvrir la carte</Link></div></article>)}</div></div> }
