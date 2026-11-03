import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDemoSession } from './DemoSession.jsx'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useDemoSession()
  const navigate = useNavigate()
  return <div className="site-auth"><form className="site-card site-form" onSubmit={(event) => { event.preventDefault(); if (!email || !password) return; signIn({ name: email.split('@')[0], email, role: 'student' }); navigate('/account') }}><span className="site-eyebrow">ESPACE ÉTUDIANT</span><h1>Connexion</h1><p>Session locale de démonstration. Aucune authentification réelle n’est disponible.</p><label>Adresse e-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Mot de passe<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="site-button">Continuer en démonstration</button><p><Link to="/forgot-password">Mot de passe oublié ?</Link> · <Link to="/register">Créer un compte</Link></p></form></div>
}
export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const { signIn } = useDemoSession()
  const navigate = useNavigate()
  return <div className="site-auth"><form className="site-card site-form" onSubmit={(event) => { event.preventDefault(); signIn({ name, email, role: 'student' }); navigate('/account') }}><span className="site-eyebrow">ESPACE ÉTUDIANT</span><h1>Inscription</h1><p>Profil temporaire de démonstration, sans création de compte serveur.</p><label>Nom complet<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Adresse e-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="site-button">Créer un profil de démonstration</button><Link to="/login">Déjà inscrit ? Se connecter</Link></form></div>
}
export function ForgotPasswordPage() { return <div className="site-auth"><form className="site-card site-form" onSubmit={(event) => { event.preventDefault() }}><span className="site-eyebrow">SÉCURITÉ</span><h1>Mot de passe oublié ?</h1><p>L’envoi du lien sera possible lorsque l’API d’authentification sera disponible.</p><label>Adresse e-mail<input required type="email" /></label><button className="site-button" disabled>Envoi indisponible pour le moment</button><Link to="/login">Retour à la connexion</Link></form></div> }
export function AccountPage() {
  const { user } = useDemoSession()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  if (!user) return <div className="site-container"><h1>Mon espace</h1><p>Connectez-vous pour afficher votre profil de démonstration.</p><Link className="site-button" to="/login">Connexion</Link></div>
  return <div className="site-container"><div className="site-page-intro"><span className="site-eyebrow">ESPACE ÉTUDIANT</span><h1>Bonjour, {user.name}</h1><p>Vos informations ne sont enregistrées que pour cette session.</p></div><div className="site-split"><div className="site-card site-form"><h2>Profil</h2><p>{user.email}</p><label>Téléphone<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Votre numéro" /></label><label>Adresse de livraison préférée<textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Résidence et repère…" /></label></div><div className="site-card site-stack"><h2>Accès rapide</h2><Link to="/orders">Mes commandes</Link><Link to="/loyalty">Fidélité</Link><Link to="/referrals">Parrainage</Link><Link to="/complaints">Réclamations</Link></div></div></div>
}
