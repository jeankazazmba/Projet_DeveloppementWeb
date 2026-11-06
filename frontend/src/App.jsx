import { Navigate, Route, Routes } from 'react-router-dom'
import AdminApp from './features/admin/AdminApp.jsx'
import ManagerApp from './features/manager/ManagerApp.jsx'
import EmployeeApp from './features/employee/EmployeeApp.jsx'
import PublicSite from './features/public/PublicSite.jsx'
import PlatformAdminApp from './features/platform/PlatformAdminApp.jsx'
import StaffCatalog from './features/shared/StaffCatalog.jsx'
import StudentApp from './features/student/StudentApp.jsx'

export default function App() {
  return <Routes>
    <Route path="/" element={<PublicSite page="home" />} />
    <Route path="/menu" element={<PublicSite page="menu" />} />
    <Route path="/restaurants/:id" element={<PublicSite page="restaurant" />} />
    <Route path="/promotions" element={<PublicSite page="promotions" />} />
    <Route path="/acces" element={<PublicSite page="access" />} />
    <Route path="/etudiant/*" element={<StudentApp />} />
    <Route path="/admin" element={<AdminApp />} />
    <Route path="/plateforme" element={<PlatformAdminApp />} />
    <Route path="/catalogue-pro" element={<StaffCatalog />} />
    <Route path="/gerant/*" element={<ManagerApp />} />
    <Route path="/employe/*" element={<EmployeeApp />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
