import { Navigate, Route, Routes } from 'react-router-dom'
import AdminApp from './features/admin/AdminApp.jsx'
import ManagerApp from './features/manager/ManagerApp.jsx'
import PublicSite from './features/public/PublicSite.jsx'

export default function App() {
  return <Routes>
    <Route path="/" element={<PublicSite page="home" />} />
    <Route path="/menu" element={<PublicSite page="menu" />} />
    <Route path="/promotions" element={<PublicSite page="promotions" />} />
    <Route path="/acces" element={<PublicSite page="access" />} />
    <Route path="/admin" element={<AdminApp />} />
    <Route path="/gerant/*" element={<ManagerApp />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
