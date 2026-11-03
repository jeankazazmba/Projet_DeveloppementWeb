import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { previewCouriers } from './managerData.js'
import ManagerIcon from './ManagerIcon.jsx'

const center = [3.9701, 9.7922]
const statusColors = { 'En livraison': '#dfc698', Disponible: '#8bc9a8', 'Hors ligne': '#aaa99f' }

function CourierMap({ couriers, selectedId, onSelect, isDemo }) {
  const container = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  useEffect(() => {
    if (!container.current || map.current) return
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView(center, 15)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      maxZoom: 19,
    }).addTo(instance)
    map.current = instance
    layer.current = L.layerGroup().addTo(instance)
    return () => { instance.remove(); map.current = null; layer.current = null }
  }, [])
  useEffect(() => {
    if (!layer.current) return
    layer.current.clearLayers()
    couriers.forEach(courier => {
      if (!Number.isFinite(courier.latitude) || !Number.isFinite(courier.longitude)) return
      const color = statusColors[courier.status] || statusColors['Hors ligne']
      const marker = L.circleMarker([courier.latitude, courier.longitude], {
        radius: selectedId === courier.id ? 14 : 11,
        color: '#fff', weight: 2, fillColor: color, fillOpacity: 1,
      }).addTo(layer.current)
      const popup = document.createElement('div')
      const title = document.createElement('strong')
      title.textContent = courier.name
      const detail = document.createElement('p')
      detail.textContent = `${courier.status}${courier.orderId ? ` · ${courier.orderId}` : ''}${isDemo ? ' · position fictive' : ''}`
      popup.append(title, detail)
      marker.bindPopup(popup).on('click', () => onSelect(courier.id))
    })
  }, [couriers, selectedId, onSelect, isDemo])
  useEffect(() => {
    const selected = couriers.find(courier => courier.id === selectedId)
    if (selected && map.current) map.current.panTo([selected.latitude, selected.longitude])
  }, [couriers, selectedId])
  return <div className="manager-delivery-map" ref={container} role="region" aria-label={isDemo ? 'Carte de démonstration des livreurs autour de Yansoki' : 'Carte des livreurs autour de Yansoki'} />
}

export default function ManagerDeliveryMap({ couriers = previewCouriers, isDemo = true }) {
  const [filter, setFilter] = useState('Tous')
  const [selectedId, setSelectedId] = useState(couriers[0]?.id ?? null)
  const visible = couriers.filter(courier => filter === 'Tous' || courier.status === filter)
  const selected = couriers.find(courier => courier.id === selectedId)
  const chooseFilter = status => {
    const next = couriers.filter(courier => status === 'Tous' || courier.status === status)
    if (!next.some(courier => courier.id === selectedId)) setSelectedId(next[0]?.id ?? null)
    setFilter(status)
  }
  return <>
    <div className="manager-page-heading"><div><span className="manager-eyebrow">ESPACE GÉRANT · LIVRAISON</span><h1>Suivi des livreurs</h1><p>Visualisez les livreurs et les commandes affectées sur la carte.</p></div></div>
    {isDemo && <div className="manager-delivery-disclaimer" role="status"><ManagerIcon name="delivery" /><span>Carte de démonstration : les points sont fictifs et ne représentent aucun livreur en temps réel. L’API de géolocalisation n’est pas encore disponible.</span></div>}
    <div className="manager-metrics manager-metrics-three"><article className="manager-metric"><span>LIVREURS PRÉSENTÉS</span><strong>{couriers.length}</strong><small>{isDemo ? 'Données fictives' : 'Données du service'}</small></article><article className="manager-metric green"><span>DISPONIBLES</span><strong>{couriers.filter(courier => courier.status === 'Disponible').length}</strong><small>État des livreurs</small></article><article className="manager-metric"><span>EN LIVRAISON</span><strong>{couriers.filter(courier => courier.status === 'En livraison').length}</strong><small>Commandes affectées</small></article></div>
    <div className="manager-delivery-layout"><section className="manager-panel manager-delivery-map-panel"><div className="manager-panel-title"><div><h2>Carte du secteur Yansoki</h2><p>{isDemo ? 'Positions d’illustration' : 'Positions du service'} · fond © OpenStreetMap</p></div></div><CourierMap couriers={visible} selectedId={selectedId} onSelect={setSelectedId} isDemo={isDemo} /></section><aside className="manager-panel manager-delivery-sidebar"><div className="manager-panel-title"><div><h2>Livreurs</h2><p>{visible.length} sur la carte</p></div></div><div className="manager-delivery-filters" role="group" aria-label="Filtrer les livreurs">{['Tous', 'En livraison', 'Disponible'].map(status => <button type="button" key={status} className={filter === status ? 'active' : ''} aria-pressed={filter === status} onClick={() => chooseFilter(status)}>{status}</button>)}</div><div className="manager-delivery-list">{visible.map(courier => <button type="button" key={courier.id} className={selectedId === courier.id ? 'selected' : ''} onClick={() => setSelectedId(courier.id)}><span className="manager-delivery-dot" style={{ background: statusColors[courier.status] }} /><span><strong>{courier.name}</strong><small>{courier.status}{courier.orderId ? ` · ${courier.orderId}` : ''}</small></span><ManagerIcon name="chevron" size={15} /></button>)}</div>{selected && <div className="manager-delivery-detail"><span className="manager-eyebrow">POSITION SÉLECTIONNÉE</span><strong>{selected.name}</strong><p>{selected.orderId ? `Commande ${selected.orderId}` : 'Aucune commande liée'}</p><small>{selected.updatedAt ? `Position : ${new Date(selected.updatedAt).toLocaleString('fr-FR')}` : 'Dernière position réelle : indisponible'}</small></div>}</aside></div>
  </>
}
