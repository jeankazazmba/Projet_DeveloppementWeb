import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadPublicCatalog } from '../../data/remoteCatalog.js'
import { studentApi, studentApiConfigured, studentDownload, asList, formatCdf } from './studentApi.js'
import { clearAuthSession, readAuthSession, saveAuthSession } from '../shared/authSession.js'
import './student.css'

const statusText = { received: 'Reçue', accepted: 'Acceptée', preparing: 'En préparation', ready: 'Prête', served: 'Servie', delivering: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée', cash_due: 'Espèces à régler' }
const tabs = [['restaurants', 'Restaurants'], ['menu', 'Carte'], ['cart', 'Panier'], ['orders', 'Commandes'], ['discover', 'Découvrir'], ['loyalty', 'Avantages'], ['complaints', 'Réclamations'], ['profile', 'Profil']]
const firstMessage = error => error instanceof Error ? error.message : 'Action impossible. Réessayez.'
const localDateTime = value => value ? `${value}:00+01:00` : ''
const lineItems = cart => (cart?.items || []).map(item => ({ content_id: item.content_id, quantity: item.quantity, ...(item.variant_id ? { variant_id: item.variant_id } : {}), supplement_ids: item.supplement_ids || [] }))
const cartKey = item => `${item.content_id}:${item.variant_id || ''}:${(item.supplement_ids || []).join(',')}`

export default function StudentApp() {
  const storedSession = readAuthSession()
  const [token, setToken] = useState(() => storedSession?.role === 'student' ? storedSession.token : null)
  const [profile, setProfile] = useState(() => storedSession?.role === 'student' ? storedSession.profile : null)
  const [authMode, setAuthMode] = useState('login')
  const [auth, setAuth] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '', reset_token: '' })
  const [catalog, setCatalog] = useState(null)
  const [restaurantId, setRestaurantId] = useState(null)
  const [menu, setMenu] = useState([])
  const [slots, setSlots] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState(null)
  const [orders, setOrders] = useState([])
  const [complaints, setComplaints] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loyalty, setLoyalty] = useState({ balances: {}, movements: [] })
  const [referrals, setReferrals] = useState({ codes: [], referrals: [] })
  const [addresses, setAddresses] = useState([])
  const [payments, setPayments] = useState({ orderId: null, items: [] })
  const [leaderboard, setLeaderboard] = useState([])
  const [participations, setParticipations] = useState([])
  const [view, setView] = useState('restaurants')
  const [selectedDish, setSelectedDish] = useState(null)
  const [variant, setVariant] = useState('')
  const [supplements, setSupplements] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [checkout, setCheckout] = useState({ service: 'pickup', requested_at: '', service_slot_id: '', dining_table_id: '', party_size: 1, delivery_address_id: '' })
  const [addressDraft, setAddressDraft] = useState({ label: '', address_line: '', district: '', phone: '' })
  const [quote, setQuote] = useState(null)
  const [quotedInput, setQuotedInput] = useState(null)
  const [claimReason, setClaimReason] = useState('')
  const [claimOrderId, setClaimOrderId] = useState('')
  const [claimMessages, setClaimMessages] = useState({})
  const [referralCode, setReferralCode] = useState('')
  const [period, setPeriod] = useState('week')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [lastSync, setLastSync] = useState(null)
  const orderKey = useRef(null)
  const paymentKey = useRef(null)
  const pollBusy = useRef(false)

  const restaurant = catalog?.restaurants.find(item => item.id === restaurantId)
  const selectedOrder = orders.find(item => item.id === selectedOrderId)
  const currentPayments = payments.orderId === selectedOrderId ? payments.items : []
  const currentTracking = tracking?.id === selectedOrderId ? tracking : null
  const dishes = catalog?.dishes.filter(item => item.restaurantId === restaurantId) || []
  const offers = catalog?.offers.filter(item => item.restaurantId === restaurantId) || []
  const events = catalog?.events.filter(item => item.restaurantId === restaurantId) || []
  const games = catalog?.games.filter(item => item.restaurantId === restaurantId) || []
  const menuDish = selectedDish && menu.find(item => item.id === Number(String(selectedDish.id).replace('api-', '')))

  const perform = async (task, message) => {
    setBusy(true); setError(''); setNotice('')
    try { const result = await task(); if (message && result !== false) setNotice(message); return result }
    catch (reason) { setError(firstMessage(reason)); return null }
    finally { setBusy(false) }
  }

  const refreshPrivate = useCallback(async (quiet = false) => {
    if (!token || pollBusy.current) return
    pollBusy.current = true
    if (!quiet) setLoading(true)
    try {
      if (quiet) {
        const [currentOrders, currentComplaints, currentNotifications, currentLoyalty] = await Promise.all([
          studentApi('/me/orders?per_page=100', token), studentApi('/me/complaints?per_page=100', token),
          studentApi('/me/notifications?per_page=100', token), studentApi('/me/loyalty', token),
        ])
        setOrders(asList(currentOrders)); setComplaints(asList(currentComplaints))
        setNotifications(asList(currentNotifications.notifications)); setLoyalty(currentLoyalty)
        setLastSync(new Date()); setError('')
        return
      }
      const [me, currentCart, currentOrders, currentComplaints, currentNotifications, currentLoyalty, currentReferrals, currentAddresses, currentParticipations] = await Promise.all([
        studentApi('/me', token), studentApi('/me/cart', token), studentApi('/me/orders?per_page=100', token),
        studentApi('/me/complaints?per_page=100', token), studentApi('/me/notifications?per_page=100', token),
        studentApi('/me/loyalty', token), studentApi('/me/referrals', token),
        studentApi('/me/delivery-addresses', token), studentApi('/me/game-participations', token),
      ])
      if (me.account_type !== 'student') throw new Error('Ce compte ne possède pas le rôle étudiant.')
      setProfile(me); setCart(currentCart); setOrders(asList(currentOrders)); setComplaints(asList(currentComplaints))
      setNotifications(asList(currentNotifications.notifications)); setLoyalty(currentLoyalty); setReferrals(currentReferrals)
      setAddresses(asList(currentAddresses)); setParticipations(asList(currentParticipations))
      setLastSync(new Date()); setError('')
    } catch (reason) {
      setError(firstMessage(reason))
      if (reason.status === 401 || reason.status === 403) { clearAuthSession(); setToken(null); setProfile(null) }
    } finally { pollBusy.current = false; setLoading(false) }
  }, [token])

  useEffect(() => {
    if (!studentApiConfigured) return
    let active = true
    loadPublicCatalog().then(value => { if (active) setCatalog(value) }).catch(reason => { if (active) setError(firstMessage(reason)) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!token) return
    const initial = window.setTimeout(() => void refreshPrivate(), 0)
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refreshPrivate(true) }, 4000)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [token, refreshPrivate])
  useEffect(() => {
    if (!restaurantId) return
    let active = true
    Promise.all([
      studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/menu`),
      studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/service-slots`),
      studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/tables`),
    ]).then(([card, availableSlots, availableTables]) => {
      if (active) { setMenu(card.dishes || []); setSlots(availableSlots); setTables(availableTables) }
    }).catch(reason => { if (active) setError(firstMessage(reason)) })
    return () => { active = false }
  }, [restaurantId])
  useEffect(() => {
    if (!restaurantId || view !== 'loyalty') return
    studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/leaderboard?period=${period}`)
      .then(value => setLeaderboard(value.top || [])).catch(reason => setError(firstMessage(reason)))
  }, [restaurantId, period, view, orders])
  useEffect(() => {
    if (!token || !selectedOrderId || selectedOrder?.service !== 'delivery') return
    studentApi(`/me/orders/${encodeURIComponent(selectedOrderId)}/tracking`, token)
      .then(setTracking).catch(reason => setError(firstMessage(reason)))
  }, [token, selectedOrderId, selectedOrder?.service, selectedOrder?.status, lastSync])
  useEffect(() => {
    if (!token || !selectedOrderId) return
    studentApi(`/me/orders/${encodeURIComponent(selectedOrderId)}/payment-intents`, token)
      .then(items => setPayments({ orderId: selectedOrderId, items })).catch(reason => setError(firstMessage(reason)))
  }, [token, selectedOrderId, lastSync])

  const submitAuth = event => {
    event.preventDefault()
    if (authMode === 'forgot') return void perform(() => studentApi('/auth/password/forgot', null, { method: 'POST', body: { email: auth.email } }), 'Si le compte existe, le jeton est inscrit dans le journal local du serveur.')
    if (authMode === 'reset') return void perform(async () => {
      await studentApi('/auth/password/reset', null, { method: 'POST', body: { email: auth.email, token: auth.reset_token, password: auth.password, password_confirmation: auth.password_confirmation } })
      setAuthMode('login')
    }, 'Mot de passe modifié. Connectez-vous.')
    void perform(async () => {
      const response = await studentApi(authMode === 'register' ? '/auth/register' : '/auth/login', null, {
        method: 'POST', body: authMode === 'register' ? { name: auth.name, email: auth.email, password: auth.password, password_confirmation: auth.password_confirmation, phone: auth.phone || null } : { email: auth.email, password: auth.password },
      })
      const me = await studentApi('/me', response.token)
      if (me.account_type !== 'student') { await studentApi('/auth/logout', response.token, { method: 'POST' }); throw new Error('Ce compte ne possède pas le rôle étudiant.') }
      saveAuthSession({ token: response.token, role: 'student', profile: me })
      setProfile(me); setToken(response.token); setView('restaurants'); setAuth(current => ({ ...current, password: '', password_confirmation: '' }))
    })
  }
  const logout = () => {
    if (token) void studentApi('/auth/logout', token, { method: 'POST' }).catch(() => {})
    clearAuthSession(); setToken(null); setProfile(null); setCart(null); setOrders([]); setNotifications([]); setView('restaurants')
  }
  const selectRestaurant = id => { setRestaurantId(id); setView('menu'); setQuote(null); setSelectedDish(null) }
  const saveCart = async (items, targetId, replace = false) => {
    if (!items.length) { await studentApi('/me/cart', token, { method: 'DELETE' }); setCart(null); return }
    const response = await studentApi('/me/cart', token, { method: 'PUT', body: {
      restaurant_id: targetId, items, ...(cart ? { expected_version: cart.version } : {}), ...(replace ? { replace_restaurant: true } : {}),
    } })
    setCart(response); setQuote(null); setQuotedInput(null)
  }
  const addDish = () => void perform(async () => {
    const targetId = selectedDish.restaurantId
    const replace = Boolean(cart?.restaurant_id && cart.restaurant_id !== targetId)
    if (replace && !window.confirm('Votre panier contient un autre restaurant. Le vider et passer à celui-ci ?')) return false
    const item = { content_id: Number(String(selectedDish.id).replace('api-', '')), quantity: 1,
      ...(variant ? { variant_id: Number(variant) } : {}), supplement_ids: supplements.map(Number) }
    const items = replace ? [] : lineItems(cart)
    const existing = items.find(line => cartKey(line) === cartKey(item))
    if (existing) existing.quantity += 1
    else items.push(item)
    await saveCart(items, targetId, replace)
    setSelectedDish(null); setVariant(''); setSupplements([]); setView('cart')
  }, 'Panier enregistré par le serveur.')
  const changeQuantity = (item, delta) => void perform(async () => {
    const items = lineItems(cart).map(line => ({ ...line }))
    const row = items.find(line => cartKey(line) === cartKey(item))
    row.quantity += delta
    await saveCart(items.filter(line => line.quantity > 0), cart.restaurant_id)
  })
  const checkoutBody = () => ({
    service: checkout.service, requested_at: localDateTime(checkout.requested_at), service_slot_id: Number(checkout.service_slot_id),
    ...(checkout.service === 'delivery' ? { delivery_address_id: Number(checkout.delivery_address_id) } : {}),
    ...(checkout.service === 'dine_in' ? { dining_table_id: Number(checkout.dining_table_id), party_size: Number(checkout.party_size) } : {}),
  })
  const requestQuote = event => { event.preventDefault(); void perform(async () => {
    const result = await studentApi(`/restaurants/${encodeURIComponent(cart.restaurant_id)}/quotes`, token, { method: 'POST', body: checkoutBody() })
    setQuote(result); setQuotedInput(JSON.stringify(checkoutBody()))
  }, 'Devis recalculé par le serveur.') }
  const placeOrder = () => void perform(async () => {
    if (JSON.stringify(checkoutBody()) !== quotedInput) throw new Error('Le service ou l’horaire a changé. Recalculez le devis.')
    if (!orderKey.current) orderKey.current = `web-order-${crypto.randomUUID()}`
    const order = await studentApi(`/restaurants/${encodeURIComponent(cart.restaurant_id)}/orders`, token, {
      method: 'POST', body: checkoutBody(), headers: { 'Idempotency-Key': orderKey.current },
    })
    orderKey.current = null; setQuote(null); setQuotedInput(null); setCart(null)
    setOrders(current => [order, ...current.filter(item => item.id !== order.id)])
    setSelectedOrderId(order.id); setView('orders')
    await refreshPrivate()
  }, 'Commande confirmée par le serveur. Le paiement reste à régler.')
  const makeCashIntent = () => void perform(async () => {
    if (!paymentKey.current) paymentKey.current = `web-cash-${crypto.randomUUID()}`
    const intent = await studentApi(`/me/orders/${encodeURIComponent(selectedOrderId)}/payment-intents`, token, {
      method: 'POST', body: { method: 'cash' }, headers: { 'Idempotency-Key': paymentKey.current },
    })
    paymentKey.current = null; setPayments(current => ({ orderId: selectedOrderId, items: [intent, ...(current.orderId === selectedOrderId ? current.items : [])] }))
  }, 'Espèces à régler : aucun encaissement confirmé.')
  const addAddress = event => { event.preventDefault(); void perform(async () => {
    const value = await studentApi('/me/delivery-addresses', token, { method: 'POST', body: { ...addressDraft, city: 'Kinshasa' } })
    setAddresses(current => [value, ...current]); setCheckout(current => ({ ...current, delivery_address_id: String(value.id) }))
    setAddressDraft({ label: '', address_line: '', district: '', phone: '' })
  }, 'Adresse enregistrée.') }
  const addComplaint = event => { event.preventDefault(); void perform(async () => {
    await studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/complaints`, token, {
      method: 'POST', body: { reason: claimReason, ...(claimOrderId ? { order_id: claimOrderId } : {}) },
    })
    setClaimReason(''); setClaimOrderId(''); await refreshPrivate()
  }, 'Réclamation reçue par le restaurant.') }
  const refer = event => { event.preventDefault(); void perform(async () => {
    await studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/referrals`, token, { method: 'POST', body: { code: referralCode.trim() } })
    setReferralCode(''); await refreshPrivate()
  }, 'Parrainage enregistré ; les points attendent une commande éligible.') }
  const replyToComplaint = (event, claimId) => { event.preventDefault(); void perform(async () => {
    const value = await studentApi(`/me/complaints/${encodeURIComponent(claimId)}/messages`, token, {
      method: 'POST', body: { body: claimMessages[claimId] },
    })
    setClaimMessages(current => ({ ...current, [claimId]: '' }))
    setComplaints(current => current.map(item => item.id === claimId ? { ...item, messages: [...(item.messages || []), value] } : item))
  }, 'Message transmis au restaurant.') }
  const uploadComplaintFile = (claimId, file) => {
    if (!file) return
    void perform(async () => {
      const body = new FormData(); body.append('file', file)
      const value = await studentApi(`/complaints/${encodeURIComponent(claimId)}/attachments`, token, { method: 'POST', body })
      setComplaints(current => current.map(item => item.id === claimId ? { ...item, attachments: [...(item.attachments || []), value] } : item))
    }, 'Pièce jointe transmise au restaurant.')
  }
  const downloadComplaintFile = (claimId, attachment) => void perform(async () => {
    const signed = await studentApi(`/complaints/${encodeURIComponent(claimId)}/attachments/${attachment.id}/url`, token)
    await studentDownload(signed.url, token, attachment.original_name)
  })

  if (!studentApiConfigured) return <main className="student-app student-gate"><h1>Espace étudiant</h1><p>Cette application demande l’API Laravel. Renseignez <code>VITE_API_URL</code> dans le frontend, puis ouvrez cet espace.</p><Link to="/">Retour au site</Link></main>
  if (!token) return <main className="student-app student-gate"><div className="student-auth"><Link to="/">← Site public</Link><span className="student-eyebrow">MON MIAM MIAM · KINSHASA</span><h1>{authMode === 'register' ? 'Créer mon compte' : authMode === 'forgot' ? 'Mot de passe oublié' : authMode === 'reset' ? 'Réinitialiser le mot de passe' : 'Bienvenue étudiant'}</h1><p>Vos restaurants, commandes et avantages sont synchronisés avec le serveur.</p><form onSubmit={submitAuth}>{authMode === 'register' && <label>Nom complet<input required value={auth.name} onChange={event => setAuth({ ...auth, name: event.target.value })} /></label>}<label>Adresse e-mail<input type="email" required value={auth.email} onChange={event => setAuth({ ...auth, email: event.target.value })} /></label>{authMode === 'reset' && <label>Jeton du journal local<input required value={auth.reset_token} onChange={event => setAuth({ ...auth, reset_token: event.target.value })} /></label>}{!['forgot'].includes(authMode) && <label>Mot de passe<input type="password" minLength={authMode === 'login' ? undefined : 12} required value={auth.password} onChange={event => setAuth({ ...auth, password: event.target.value })} /></label>}{['register', 'reset'].includes(authMode) && <label>Confirmer le mot de passe<input type="password" minLength={12} required value={auth.password_confirmation} onChange={event => setAuth({ ...auth, password_confirmation: event.target.value })} /></label>}{authMode === 'register' && <label>Téléphone (facultatif)<input type="tel" value={auth.phone} onChange={event => setAuth({ ...auth, phone: event.target.value })} /></label>}<button disabled={busy}>{busy ? 'Patientez…' : authMode === 'register' ? 'Créer le compte' : authMode === 'forgot' ? 'Demander un jeton' : authMode === 'reset' ? 'Modifier le mot de passe' : 'Se connecter'}</button></form>{error && <p className="student-error" role="alert">{error}</p>}{notice && <p className="student-notice" role="status">{notice}</p>}<div className="student-auth-links">{[['login', 'Connexion'], ['register', 'Inscription'], ['forgot', 'Mot de passe oublié'], ['reset', 'J’ai un jeton']].map(([mode, label]) => <button key={mode} type="button" onClick={() => { setAuthMode(mode); setError(''); setNotice('') }}>{label}</button>)}</div></div></main>

  return <div className="student-app"><header className="student-top"><Link to="/" className="student-brand"><span>✦</span> Mon Miam Miam <small>Étudiant</small></Link><div><span>{profile?.name}</span><Link to="/">Site public</Link><button type="button" onClick={logout}>Déconnexion</button></div></header><div className="student-layout"><nav className="student-nav" aria-label="Navigation étudiant">{tabs.map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>{label}{id === 'cart' && cart?.items?.length ? ` · ${cart.items.reduce((sum, item) => sum + item.quantity, 0)}` : ''}{id === 'orders' && orders.some(item => ['received', 'accepted', 'preparing', 'ready', 'delivering'].includes(item.status)) ? ' ●' : ''}</button>)}<Link to="/">Site public ↗</Link></nav><main className="student-main"><div className="student-heading"><div><span className="student-eyebrow">{restaurant?.name || 'KINSHASA · RDC'}</span><h1>{tabs.find(([id]) => id === view)?.[1]}</h1></div><small>{loading ? 'Synchronisation…' : lastSync ? `Synchronisé ${lastSync.toLocaleTimeString('fr-CD')}` : 'Connexion en cours'}</small></div>{error && <p className="student-error" role="alert">{error} <button onClick={() => void refreshPrivate()}>Réessayer</button></p>}{notice && <p className="student-notice" role="status">{notice}</p>}

    {view === 'restaurants' && <section className="student-grid">{catalog?.restaurants.map(item => <article className="student-card" key={item.id}><span className="student-eyebrow">{item.is_demo ? 'RESTAURANT DE RECETTE' : 'RESTAURANT'}</span><h2>{item.name}</h2><p>{item.description}</p><p>{item.location}</p><small>{item.hours}</small><button onClick={() => selectRestaurant(item.id)}>Explorer ce restaurant →</button></article>)}{!catalog && <p>Chargement du répertoire…</p>}{catalog && !catalog.restaurants.length && <p>Aucun restaurant publié pour le moment.</p>}</section>}

    {view === 'menu' && <>{!restaurant ? <p>Choisissez d’abord un restaurant.</p> : <><div className="student-section-line"><p>La carte de {restaurant.name}. Les prix définitifs sont calculés dans le devis.</p><button onClick={() => setView('restaurants')}>Changer</button></div><div className="student-grid">{dishes.map(dish => <article key={dish.id} className="student-card student-food"><img src={dish.image} alt="" /><div><span className="student-eyebrow">{dish.category} · {restaurant.name}</span><h2>{dish.name}</h2><p>{dish.description}</p><strong>{formatCdf(dish.price)}</strong><button disabled={dish.unavailable || busy} onClick={() => { setSelectedDish(dish); setVariant(''); setSupplements([]) }}>{dish.unavailable ? 'Indisponible' : 'Choisir le plat'}</button></div></article>)}</div>{!dishes.length && <p>Aucun plat publié dans ce restaurant.</p>}</>}</>}

    {view === 'cart' && <section className="student-card"><h2>Votre panier</h2>{cart?.items?.length ? <><p>Restaurant : <strong>{catalog?.restaurants.find(item => item.id === cart.restaurant_id)?.name || cart.restaurant_id}</strong></p>{cart.items.map(item => { const dish = catalog?.dishes.find(entry => entry.id === `api-${item.content_id}`); return <div className="student-cart-line" key={cartKey(item)}><span>{dish?.name || `Plat #${item.content_id}`}{item.variant_id && <small> · variante #{item.variant_id}</small>}</span><div><button onClick={() => changeQuantity(item, -1)} disabled={busy}>−</button><strong>{item.quantity}</strong><button onClick={() => changeQuantity(item, 1)} disabled={busy || item.quantity >= 20}>+</button></div></div> })}<p>Le devis confirme les prix, stocks et frais de livraison.</p><button className="student-muted-button" disabled={busy} onClick={() => void perform(async () => { await saveCart([], cart.restaurant_id) }, 'Panier vidé sur le serveur.')}>Vider le panier</button><h3>Service et horaire</h3><form className="student-form-grid" onSubmit={requestQuote}><label>Service<select value={checkout.service} onChange={event => { setCheckout({ ...checkout, service: event.target.value, service_slot_id: '' }); setQuote(null) }}><option value="pickup">À emporter</option><option value="dine_in">Sur place</option><option value="delivery">Livraison</option></select></label><label>Heure à Kinshasa<input type="datetime-local" required value={checkout.requested_at} onChange={event => { setCheckout({ ...checkout, requested_at: event.target.value }); setQuote(null) }} /></label><label>Créneau<select required value={checkout.service_slot_id} onChange={event => { setCheckout({ ...checkout, service_slot_id: event.target.value }); setQuote(null) }}><option value="">Choisir</option>{slots.filter(slot => slot.service === checkout.service).map(slot => <option key={slot.id} value={slot.id}>{['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][slot.weekday]} · {slot.starts_at?.slice(0, 5)}–{slot.ends_at?.slice(0, 5)}</option>)}</select></label>{checkout.service === 'dine_in' && <><label>Table<select required value={checkout.dining_table_id} onChange={event => { setCheckout({ ...checkout, dining_table_id: event.target.value }); setQuote(null) }}><option value="">Choisir</option>{tables.map(table => <option key={table.id} value={table.id}>{table.code} · {table.capacity} places</option>)}</select></label><label>Convives<input type="number" min="1" max="20" required value={checkout.party_size} onChange={event => setCheckout({ ...checkout, party_size: event.target.value })} /></label></>}{checkout.service === 'delivery' && <label>Adresse<select required value={checkout.delivery_address_id} onChange={event => { setCheckout({ ...checkout, delivery_address_id: event.target.value }); setQuote(null) }}><option value="">Choisir</option>{addresses.map(address => <option key={address.id} value={address.id}>{address.label} · {address.district}</option>)}</select></label>}<button disabled={busy}>Calculer le devis</button></form>{checkout.service === 'delivery' && <form className="student-form-grid student-address" onSubmit={addAddress}><h3>Nouvelle adresse · Kinshasa</h3>{[['label', 'Libellé'], ['address_line', 'Adresse'], ['district', 'Commune'], ['phone', 'Téléphone']].map(([key, label]) => <label key={key}>{label}<input required value={addressDraft[key]} onChange={event => setAddressDraft({ ...addressDraft, [key]: event.target.value })} /></label>)}<button disabled={busy}>Enregistrer l’adresse</button></form>}{quote && <div className="student-quote"><h3>Devis confirmé par le serveur</h3><p>Sous-total : {formatCdf(quote.subtotal_cdf)}</p><p>Livraison : {formatCdf(quote.delivery_fee_cdf)}</p><strong>Total : {formatCdf(quote.total_cdf)}</strong><button disabled={busy} onClick={placeOrder}>Confirmer la commande</button></div>}</> : <p>Votre panier est vide. Choisissez un restaurant et ses plats.</p>}</section>}

    {view === 'orders' && <div className="student-two-columns"><section className="student-card"><h2>Historique</h2>{orders.map(order => <button className={`student-list-button ${selectedOrderId === order.id ? 'active' : ''}`} key={order.id} onClick={() => setSelectedOrderId(order.id)}><strong>#{order.id}</strong><span>{statusText[order.status] || order.status} · {formatCdf(order.amount_cdf)}</span><small>{catalog?.restaurants.find(item => item.id === order.restaurant_id)?.name || order.restaurant_id}</small></button>)}{!orders.length && <p>Aucune commande confirmée par le serveur.</p>}</section><section className="student-card">{selectedOrder ? <><h2>Commande #{selectedOrder.id}</h2><p>{statusText[selectedOrder.status] || selectedOrder.status} · {formatCdf(selectedOrder.amount_cdf)}</p><p>Restaurant : {catalog?.restaurants.find(item => item.id === selectedOrder.restaurant_id)?.name}</p>{selectedOrder.lines?.map(line => <p key={line.id}>{line.title_snapshot} × {line.quantity} · {formatCdf(line.line_total_cdf)}</p>)}{selectedOrder.service === 'delivery' && <div className="student-tracking"><h3>Suivi de livraison</h3><p>{currentTracking?.position ? `Dernière position : ${currentTracking.position.latitude}, ${currentTracking.position.longitude} · ${new Date(currentTracking.position.recorded_at).toLocaleString('fr-CD')}` : 'Position en attente de l’employé affecté.'}</p>{currentTracking?.position && <a target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${currentTracking.position.latitude}&mlon=${currentTracking.position.longitude}#map=16/${currentTracking.position.latitude}/${currentTracking.position.longitude}`}>Voir la position sur la carte ↗</a>}</div>}<h3>Paiement</h3>{currentPayments.map(intent => <p key={intent.id}>{statusText[intent.status] || intent.status} · {formatCdf(intent.amount_cdf)}</p>)}{!currentPayments.length && selectedOrder.status !== 'cancelled' && <button disabled={busy} onClick={makeCashIntent}>Choisir le règlement en espèces</button>}<button className="student-muted-button" onClick={() => { setRestaurantId(selectedOrder.restaurant_id); setClaimOrderId(selectedOrder.id); setView('complaints') }}>Signaler un problème</button></> : <p>Sélectionnez une commande.</p>}</section></div>}

    {view === 'discover' && (!restaurant ? <p>Choisissez un restaurant.</p> : <><h2>Promotions de {restaurant.name}</h2><div className="student-grid">{offers.map(offer => <article className="student-card student-food" key={offer.id}><img src={offer.image} alt="" /><div><h3>{offer.title}</h3><p>{offer.description}</p><small>{offer.terms}</small></div></article>)}</div>{!offers.length && <p>Aucune promotion publiée.</p>}<h2>Événements</h2><div className="student-grid">{events.map(event => <article className="student-card student-food" key={event.id}><img src={event.image} alt="" /><div><h3>{event.title}</h3><p>{event.description}</p><small>{event.day} {event.month} · {event.time} · {event.place}</small></div></article>)}</div>{!events.length && <p>Aucun événement publié.</p>}<h2>Jeux</h2><div className="student-grid">{games.map(game => <article className="student-card" key={game.id}><h3>{game.title}</h3><p>{game.description}</p><button disabled={busy || participations.some(item => item.game_content_id === game.id)} onClick={() => void perform(async () => { await studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/games/${game.id}/participations`, token, { method: 'POST' }); await refreshPrivate() }, 'Participation enregistrée. Aucun gain automatique.')}>{participations.some(item => item.game_content_id === game.id) ? 'Déjà inscrit' : 'Participer'}</button></article>)}</div>{!games.length && <p>Aucun jeu publié.</p>}</>)}

    {view === 'loyalty' && <section className="student-card"><h2>Fidélité et parrainage</h2><p>Solde chez {restaurant?.name || 'ce restaurant'} : <strong>{restaurantId ? loyalty.balances?.[restaurantId] || 0 : '—'} points</strong></p><p>Les points suivent chaque restaurant et les règles validées côté serveur.</p>{loyalty.movements?.filter(row => !restaurantId || row.restaurant_id === restaurantId).slice(0, 12).map(row => <p key={row.id}>{row.points > 0 ? '+' : ''}{row.points} · {row.reason} · {new Date(row.created_at).toLocaleDateString('fr-CD')}</p>)}{restaurantId && <><h3>Parrainage</h3><p>Votre code : <strong>{referrals.codes?.find(row => row.restaurant_id === restaurantId)?.code || 'Pas encore créé'}</strong></p><button disabled={busy} onClick={() => void perform(async () => { const code = await studentApi(`/restaurants/${encodeURIComponent(restaurantId)}/referral-code`, token, { method: 'POST' }); setReferrals(current => ({ ...current, codes: [...current.codes.filter(item => item.restaurant_id !== restaurantId), code] })) }, 'Code créé par le serveur.')}>Obtenir mon code</button><form className="student-inline-form" onSubmit={refer}><label>Utiliser un code<input required value={referralCode} onChange={event => setReferralCode(event.target.value)} /></label><button disabled={busy}>Enregistrer</button></form><h3>Classement</h3><select aria-label="Période du classement" value={period} onChange={event => setPeriod(event.target.value)}><option value="day">Jour</option><option value="week">Semaine</option><option value="month">Mois</option></select>{leaderboard.map(row => <p key={row.rank}>{row.rank}. {row.display_name} · {row.eligible_orders} commandes</p>)}{!leaderboard.length && <p>Aucune commande éligible sur cette période.</p>}</>}</section>}

    {view === 'complaints' && <div className="student-two-columns"><section className="student-card"><h2>Déposer une réclamation</h2>{restaurant ? <form onSubmit={addComplaint}><label>Commande (facultatif)<select value={claimOrderId} onChange={event => setClaimOrderId(event.target.value)}><option value="">Sans commande</option>{orders.filter(order => order.restaurant_id === restaurantId).map(order => <option key={order.id} value={order.id}>{order.id}</option>)}</select></label><label>Motif<textarea required minLength={10} maxLength={255} value={claimReason} onChange={event => setClaimReason(event.target.value)} /></label><button disabled={busy}>Transmettre au restaurant</button></form> : <p>Choisissez un restaurant avant de déposer une réclamation.</p>}</section><section className="student-card"><h2>Mes dossiers</h2>{complaints.map(claim => <article className="student-claim" key={claim.id}><strong>{claim.id} · {claim.status}</strong><p>{claim.reason}</p><small>{catalog?.restaurants.find(item => item.id === claim.restaurant_id)?.name}</small>{claim.messages?.map(message => <blockquote key={message.id}>{message.body}</blockquote>)}{claim.attachments?.map(file => <button type="button" key={file.id} onClick={() => downloadComplaintFile(claim.id, file)}>Télécharger {file.original_name}</button>)}<form onSubmit={event => replyToComplaint(event, claim.id)}><label>Ajouter un message<textarea required value={claimMessages[claim.id] || ''} onChange={event => setClaimMessages(current => ({ ...current, [claim.id]: event.target.value }))} /></label><button disabled={busy}>Envoyer le message</button></form><label>Joindre un document (JPEG, PNG ou PDF, 5 Mo max.)<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={event => { uploadComplaintFile(claim.id, event.target.files?.[0]); event.target.value = '' }} /></label></article>)}{!complaints.length && <p>Aucune réclamation.</p>}</section></div>}

    {view === 'profile' && <section className="student-card"><h2>Mon compte</h2><p>{profile?.email}</p><form onSubmit={event => { event.preventDefault(); void perform(async () => { const me = await studentApi('/me', token, { method: 'PATCH', body: { name: auth.name || profile.name, phone: auth.phone || profile.phone || null, expected_version: profile.version } }); setProfile(me) }, 'Profil confirmé par le serveur.') }}><label>Nom<input value={auth.name || profile?.name || ''} onChange={event => setAuth({ ...auth, name: event.target.value })} /></label><label>Téléphone<input value={auth.phone || profile?.phone || ''} onChange={event => setAuth({ ...auth, phone: event.target.value })} /></label><button disabled={busy}>Enregistrer</button></form><h3>Notifications</h3>{notifications.map(item => <div className="student-notification" key={item.id}><span>{item.type || 'Information'} · {new Date(item.created_at).toLocaleString('fr-CD')}</span>{!item.read_at && <button onClick={() => void perform(async () => { await studentApi(`/me/notifications/${item.id}/read`, token, { method: 'PATCH' }); await refreshPrivate() })}>Marquer lue</button>}</div>)}{!notifications.length && <p>Aucune notification.</p>}</section>}
  </main></div>{selectedDish && <div className="student-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedDish(null) }}><section className="student-modal" role="dialog" aria-modal="true" aria-label={selectedDish.name}><button className="student-close" onClick={() => setSelectedDish(null)} aria-label="Fermer">×</button><img src={selectedDish.image} alt="" /><h2>{selectedDish.name}</h2><p>{selectedDish.description}</p><strong>{formatCdf(selectedDish.price)}</strong>{menuDish?.options?.some(option => option.kind === 'variant') && <label>Variante<select value={variant} onChange={event => setVariant(event.target.value)}><option value="">Choisir</option>{menuDish.options.filter(option => option.kind === 'variant').map(option => <option key={option.id} value={option.id}>{option.name} · +{formatCdf(option.price_delta_cdf)}</option>)}</select></label>}{menuDish?.options?.filter(option => option.kind === 'supplement').map(option => <label key={option.id} className="student-check"><input type="checkbox" checked={supplements.includes(option.id)} onChange={event => setSupplements(current => event.target.checked ? [...current, option.id] : current.filter(id => id !== option.id))} />{option.name} · +{formatCdf(option.price_delta_cdf)}</label>)}<button disabled={busy || (menuDish?.options?.some(option => option.kind === 'variant') && !variant)} onClick={addDish}>Ajouter au panier</button></section></div>}</div>
}
