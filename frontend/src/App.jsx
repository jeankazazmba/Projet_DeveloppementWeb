import { Navigate, Routes, Route } from 'react-router-dom'
import ApiStatus from './features/ApiStatus.jsx';
import AdminApp from './features/admin/AdminApp.jsx'
import FontSizeControl from './components/ui/FontSizeControl.jsx'



function Accueil() {
  return (
    <div>
      <h1 className="p-8 text-3xl font-bold text-amber-300 bg-black">Mon Miam Miam</h1>
      <ApiStatus />
    </div>
  )
}


export default function App() {
  return (
    <>
      <div className="application-accessibility-tools"><FontSizeControl /></div>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
