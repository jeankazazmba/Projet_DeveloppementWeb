import { useId, useState } from 'react'

const chartColors = { gold: 'var(--mg-gold)', muted: 'var(--mg-muted)', green: 'var(--mg-green)', line: 'var(--mg-line)', text: 'var(--mg-text)' }

export function AreaChart({ values, labels, suffix = '', compact = false }) {
  const gradientId = useId().replaceAll(':', '')
  const [active, setActive] = useState(values.length - 1)
  const activeIndex = Math.min(active, values.length - 1)
  const maximum = Math.max(1, ...values) * 1.18
  const points = values.map((value, index) => ({
    x: 36 + index * 532 / Math.max(1, values.length - 1),
    y: 193 - value / maximum * 148,
    value,
  }))
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const area = `${line} L568 193 L36 193 Z`
  return <div className={`manager-chart ${compact ? 'compact' : ''}`}>
    <svg viewBox="0 0 604 220" role="img" aria-label="Évolution des commandes et ventes">
      <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={chartColors.gold} stopOpacity=".28" /><stop offset="100%" stopColor={chartColors.gold} stopOpacity=".01" /></linearGradient></defs>
      {[48, 96, 144, 193].map(y => <line key={y} x1="36" x2="568" y1={y} y2={y} stroke={chartColors.line} strokeDasharray={y === 193 ? undefined : '4 5'} />)}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={chartColors.gold} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => <g key={index}>
        <circle cx={point.x} cy={point.y} r="11" fill="transparent" tabIndex="0" aria-label={`${labels[index] || `Point ${index + 1}`} : ${point.value}${suffix}`} onFocus={() => setActive(index)} onMouseEnter={() => setActive(index)} />
        {activeIndex === index && <circle cx={point.x} cy={point.y} r="4.5" fill={chartColors.gold} stroke={chartColors.text} strokeWidth="2" />}
        {(compact || index % Math.max(1, Math.floor(labels.length / 6)) === 0 || index === labels.length - 1) && <text x={point.x} y="213" textAnchor="middle" fill={chartColors.muted} fontSize="10">{labels[index]}</text>}
      </g>)}
    </svg>
    {!compact && <p className="chart-readout">{labels[activeIndex] || `Point ${activeIndex + 1}`} · <strong>{values[activeIndex]?.toLocaleString('fr-FR')}{suffix}</strong></p>}
  </div>
}

export function LoyaltyBars({ issued, used }) {
  const maximum = Math.max(...issued, ...used, 1) * 1.2
  return <div className="manager-chart"><svg viewBox="0 0 390 220" role="img" aria-label="Points de fidélité distribués et utilisés par semaine">
    {[55, 100, 145, 190].map(y => <line key={y} x1="25" x2="365" y1={y} y2={y} stroke={chartColors.line} strokeDasharray="4 5" />)}
    {issued.map((value, index) => {
      const x = 47 + index * 85
      const issuedHeight = value / maximum * 155
      const usedHeight = used[index] / maximum * 155
      return <g key={index}>
        <rect x={x} y={190 - issuedHeight} width="22" height={issuedHeight} rx="5" fill={chartColors.gold}><title>{`Semaine ${index + 1} : ${value} points distribués`}</title></rect>
        <rect x={x + 25} y={190 - usedHeight} width="22" height={usedHeight} rx="5" fill="#7d7057"><title>{`Semaine ${index + 1} : ${used[index]} points utilisés`}</title></rect>
        <text x={x + 23} y="212" textAnchor="middle" fill={chartColors.muted} fontSize="11">Sem {index + 1}</text>
      </g>
    })}
  </svg><div className="chart-legend"><span><i className="gold" /> Distribués</span><span><i className="bronze" /> Utilisés</span></div></div>
}

export function ServiceDonut({ onsite, delivery }) {
  const total = onsite + delivery
  const onsitePercent = total ? Math.round(onsite / total * 100) : 0
  const deliveryPercent = 100 - onsitePercent
  return <div className="manager-donut"><svg viewBox="0 0 160 160" role="img" aria-label={`${onsitePercent} % sur place et ${deliveryPercent} % en livraison`}>
    <circle cx="80" cy="80" r="55" fill="none" stroke={chartColors.line} strokeWidth="19" />
    <circle cx="80" cy="80" r="55" fill="none" stroke={chartColors.gold} strokeWidth="19" strokeDasharray={`${onsitePercent * 3.456} 346`} transform="rotate(-90 80 80)" />
    <circle cx="80" cy="80" r="55" fill="none" stroke={chartColors.green} strokeWidth="19" strokeDasharray={`${deliveryPercent * 3.456} 346`} strokeDashoffset={-onsitePercent * 3.456} transform="rotate(-90 80 80)" />
    <text x="80" y="77" textAnchor="middle" fill={chartColors.text} fontSize="24" fontWeight="700">{total}</text>
    <text x="80" y="96" textAnchor="middle" fill={chartColors.muted} fontSize="10">commandes</text>
  </svg><div className="manager-donut-legend"><span><i className="gold" /> Sur place <strong>{onsitePercent} %</strong></span><span><i className="green" /> Livraison <strong>{deliveryPercent} %</strong></span></div></div>
}

export function ReferralFunnel({ values }) {
  const labels = ['Codes partagés', 'Inscriptions', 'Premières commandes']
  return <div className="manager-funnel">{values.map((value, index) => <div key={labels[index]} className="manager-funnel-step"><div><span>{labels[index]}</span><strong>{value}</strong></div><div className="manager-funnel-track"><span style={{ width: `${Math.max(9, value / Math.max(values[0], 1) * 100)}%` }} /></div></div>)}</div>
}
