import { Routes, Route } from 'react-router-dom'
import ApiStatus from './features/ApiStatus.jsx';



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
    <Routes>
      <Route path="/" element={<Accueil />} />
    </Routes>
  )
}