import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TouristPage from './pages/tourist'
import AdminPage from './pages/admin'
import ReactDOM from 'react-dom/client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/tourist" element={<TouristPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/tourist" replace />} />
    </Routes>
  </BrowserRouter>
)
