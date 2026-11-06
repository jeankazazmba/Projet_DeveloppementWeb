const paths = {
  orders: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6M9 9h6M9 13h6M9 17h4" /></>,
  menu: <><path d="M4 3v8m3-8v8m-3 0h3m-1.5 0v10M15 3c-2 3-2 7-2 10h4V3m0 10v8" /></>,
  hamburger: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  claims: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
  stats: <><path d="M4 20V11m5 9V5m5 15v-8m5 8V8M2 20h20" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  refresh: <><path d="M20 11a8 8 0 1 1-2.3-5.7M20 4v6h-6" /></>,
  chevron: <><path d="m9 5 7 7-7 7" /></>,
  close: <><path d="M5 5 19 19M19 5 5 19" /></>,
  check: <><path d="m4 12 5 5L20 6" /></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  star: <><path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1L12 2Z" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
}

export default function EmployeeIcon({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.orders}</svg>
}
