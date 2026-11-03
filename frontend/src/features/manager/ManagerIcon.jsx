const iconPaths = {
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 13v-2a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75',
  stats: 'M3 20h18M6 16V9m6 7V4m6 12v-5',
  claims: 'M4 4h16v13H9l-5 4V4Zm4 5h8m-8 4h5',
  search: 'm20 20-4.4-4.4M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4',
  plus: 'M12 5v14M5 12h14',
  refresh: 'M20 11a8 8 0 1 1-2.3-5.7M20 4v6h-6',
  edit: 'm4 16 12-12 4 4L8 20H4v-4Zm10-10 4 4',
  close: 'M5 5 19 19M19 5 5 19',
  download: 'M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3',
  chevron: 'm9 5 7 7-7 7',
  menu: 'M3 6h18M3 12h18M3 18h18',
}

export default function ManagerIcon({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.dashboard} /></svg>
}
