import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/login'
import TouristPage from './pages/tourist'
import AdminPage from './pages/admin'
import ReactDOM from 'react-dom/client'
import './index.css'

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null)

  const handleLogin = useCallback((t: string, u: { id: number; username: string; role: string }) => {
    setToken(t)
    setUser(u)
  }, [])

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tourist" element={<TouristPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/tourist" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
