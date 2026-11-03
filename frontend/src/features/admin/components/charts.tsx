import type { ChartPoint } from '../operations'
import { money } from '../data'

const colors = ['#cfbd97', '#70634a', '#8ab8e9', '#71d3a2']

export function SalesChart({ data, title }: { data: ChartPoint[]; title: string }) {
  const width = 760, height = 300, left = 56, right = 20, top = 24, bottom = 48
  const chartWidth = width - left - right, chartHeight = height - top - bottom
  const maximum = Math.max(10000, Math.ceil(Math.max(...data.map(point => point.value), 0) / 10000) * 10000)
  const xy = data.map((point, index) => ({ x: left + index * chartWidth / Math.max(1, data.length - 1), y: top + chartHeight * (1 - point.value / maximum), ...point }))
  const line = xy.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${xy.at(-1)?.x ?? left} ${top + chartHeight} L ${left} ${top + chartHeight} Z`
  const labelEvery = data.length > 15 ? 5 : 1
  return <div className="admin-chart-wrap"><svg className="admin-sales-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}. ${data.map(point => `${point.label} : ${money(point.value)} FCFA`).join(', ')}`}>
    <title>{title}</title>
    <defs><linearGradient id="admin-sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#cfbd97" stopOpacity=".42" /><stop offset="100%" stopColor="#cfbd97" stopOpacity="0" /></linearGradient></defs>
    {[0, 1, 2, 3, 4].map(index => { const value = maximum * (4 - index) / 4; const y = top + chartHeight * index / 4; return <g key={index}><line x1={left} x2={width - right} y1={y} y2={y} stroke="var(--line)" strokeDasharray="4 6" /><text x={left - 8} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="11">{money(value / 1000)}k</text></g> })}
    <path d={area} fill="url(#admin-sales-fill)" /><path d={line} fill="none" stroke="#cfbd97" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    {xy.map((point, index) => <g key={`${point.label}-${index}`}><circle cx={point.x} cy={point.y} r="4.5" fill="#cfbd97"><title>{point.label} : {money(point.value)} FCFA, {point.count} commandes</title></circle>{(index % labelEvery === 0 || index === data.length - 1) && <text x={point.x} y={height - 15} textAnchor="middle" fill="var(--muted)" fontSize="11">{point.label}</text>}</g>)}
  </svg><details className="admin-chart-data"><summary>Voir les données du diagramme</summary><table><thead><tr><th>Période</th><th>Ventes</th><th>Commandes</th></tr></thead><tbody>{data.map((point, index) => <tr key={`${point.label}-${index}`}><td>{point.label}</td><td>{money(point.value)} FCFA</td><td>{point.count}</td></tr>)}</tbody></table></details></div>
}

export function DonutChart({ data, title, totalLabel }: { data: { name: string; value: number }[]; title: string; totalLabel: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = 70, circumference = 2 * Math.PI * radius
  let offset = 0
  return <div className="admin-donut-layout"><svg className="admin-donut-chart" viewBox="0 0 220 220" role="img" aria-label={`${title} : ${data.map(item => `${item.name} ${item.value}`).join(', ')}`}><title>{title}</title><circle cx="110" cy="110" r={radius} fill="none" stroke="var(--line)" strokeWidth="22" />{data.map((item, index) => { const length = total ? item.value / total * circumference : 0; const start = offset; offset += length; return <circle key={item.name} cx="110" cy="110" r={radius} fill="none" stroke={colors[index % colors.length]} strokeWidth="22" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-start} transform="rotate(-90 110 110)"><title>{item.name} : {item.value} ({total ? Math.round(item.value / total * 100) : 0} %)</title></circle> })}<text x="110" y="108" textAnchor="middle" fill="var(--text)" fontSize="27" fontWeight="700">{money(total)}</text><text x="110" y="128" textAnchor="middle" fill="var(--muted)" fontSize="11">{totalLabel}</text></svg><div className="admin-donut-labels">{data.map((item, index) => <div key={item.name}><span className="admin-legend-dot" style={{ background: colors[index % colors.length] }} /><span>{item.name}</span><strong>{total ? Math.round(item.value / total * 100) : 0} %</strong><small>{money(item.value)} {totalLabel === 'FCFA' ? 'FCFA' : ''}</small></div>)}</div></div>
}
