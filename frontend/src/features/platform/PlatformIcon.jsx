// Même dessin au trait et mêmes dimensions que les pictogrammes du gérant.
const paths = {
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  restaurant: 'M4 10h16l-1-6H5l-1 6Zm1 0v10h14V10M9 20v-6h6v6',
  team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 13v-2a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75',
  catalog: 'M4 5h16v15H4zM8 5V3h8v2M8 10h8M8 14h8',
  orders: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm3 5h8m-8 4h8m-8 4h5',
  claims: 'M4 4h16v13H9l-5 4V4Zm4 5h8m-8 4h5',
  loyalty: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  audit: 'M12 3 4 6v5c0 5.1 3.2 8.5 8 10 4.8-1.5 8-4.9 8-10V6l-8-3Zm-3 9 2 2 4-4',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M5 5 19 19M19 5 5 19',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  logout: 'M10 4H4v16h6m5-4 4-4-4-4m4 4H9',
}

export default function PlatformIcon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.dashboard} /></svg>
}
