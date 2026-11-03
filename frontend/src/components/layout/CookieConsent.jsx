import { useState } from 'react'

function readConsent() {
  try { return localStorage.getItem('mon-miam-miam-cookie-choice') } catch { return null }
}

export default function CookieConsent() {
  const [choice, setChoice] = useState(readConsent)
  const choose = (value) => {
    try { localStorage.setItem('mon-miam-miam-cookie-choice', value) } catch { /* Choix conservé pour cette session. */ }
    setChoice(value)
  }
  if (choice) return null
  return <aside className="site-cookie" aria-label="Choix des cookies"><span className="site-eyebrow">CONFIDENTIALITÉ</span><h2>Vos données, votre choix</h2><p>Cette démonstration utilise seulement le stockage local pour retenir vos préférences. Aucun traceur publicitaire n’est activé.</p><div><button className="site-button" onClick={() => choose('accepted')}>Accepter</button><button onClick={() => choose('refused')}>Refuser</button></div></aside>
}
