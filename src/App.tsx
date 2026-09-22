import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'
import { CompanySetupPage } from '@/pages/CompanySetupPage'
import { CorrectDecaPage } from '@/pages/CorrectDecaPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NewDecaPage } from '@/pages/NewDecaPage'
import { TeamPage } from '@/pages/TeamPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/configurar-empresa" element={<CompanySetupPage />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<NewDecaPage />} />
              <Route path="historial" element={<HistoryPage />} />
              <Route path="historial/:id/corregir" element={<CorrectDecaPage />} />
              <Route path="equipo" element={<TeamPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
