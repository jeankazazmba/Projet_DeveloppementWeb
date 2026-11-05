import { useEffect } from 'react'
import AdminPrototype from './App.tsx'
import adminBaseCss from './index.css?inline'
import adminPageCss from './App.css?inline'
import staffApiCss from '../shared/staffApi.css?inline'

export default function AdminApp() {
  useEffect(() => {
    const style = document.createElement('style')
    style.dataset.adminStyles = 'true'
    style.textContent = `${adminBaseCss}\n${adminPageCss}\n${staffApiCss}`
    document.head.append(style)
    return () => style.remove()
  }, [])

  return <AdminPrototype />
}
