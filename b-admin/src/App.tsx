import { Routes, Route } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import TouristPage from './pages/TouristPage'
import KnowledgePage from './pages/KnowledgePage'
import ConfigPage from './pages/ConfigPage'
import DashboardPage from './pages/DashboardPage'
import ReportPage from './pages/ReportPage'

function App() {
  return (
    <Routes>
      <Route path="/tourist" element={<TouristPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>
      <Route path="*" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
