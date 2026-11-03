import { useEffect } from 'react'
import AdminPrototype from './App.tsx'
import adminBaseCss from './index.css?inline'
import adminPageCss from './App.css?inline'

export default function AdminApp() {
  useEffect(() => {
    const style = document.createElement('style')
    style.dataset.adminStyles = 'true'
    style.textContent = `${adminBaseCss}\n${adminPageCss}`
    document.head.append(style)
    return () => style.remove()
  }, [])

  return <AdminPrototype />
}
