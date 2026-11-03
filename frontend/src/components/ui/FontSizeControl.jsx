import { useEffect, useState } from 'react'

const FONT_SIZES = [
  { value: '0.9375', label: 'Petit' },
  { value: '1', label: 'Standard' },
  { value: '1.125', label: 'Grand' },
]

function readPreference() {
  try {
    const stored = localStorage.getItem('mon-miam-miam-font-scale')
    return FONT_SIZES.some((size) => size.value === stored) ? stored : '1'
  } catch {
    return '1'
  }
}

export default function FontSizeControl() {
  const [fontScale, setFontScale] = useState(readPreference)

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale)
    try {
      localStorage.setItem('mon-miam-miam-font-scale', fontScale)
    } catch {
      // Le choix reste actif pour la session lorsque le stockage est indisponible.
    }
  }, [fontScale])

  const currentIndex = FONT_SIZES.findIndex((size) => size.value === fontScale)
  const change = (offset) => {
    const nextIndex = Math.min(Math.max(currentIndex + offset, 0), FONT_SIZES.length - 1)
    setFontScale(FONT_SIZES[nextIndex].value)
  }

  return (
    <div className="font-size-control" aria-label="Taille de police">
      <button type="button" onClick={() => change(-1)} disabled={currentIndex === 0} aria-label="Réduire la taille de police">A−</button>
      <span aria-live="polite">{FONT_SIZES[currentIndex].label}</span>
      <button type="button" onClick={() => change(1)} disabled={currentIndex === FONT_SIZES.length - 1} aria-label="Augmenter la taille de police">A+</button>
    </div>
  )
}
