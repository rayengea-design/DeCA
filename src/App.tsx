import { Loader2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { LandingPage } from '@/pages/LandingPage'

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink-300">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}

// Code-split everything except the landing page: it's the route that has to
// rank and load fast (Core Web Vitals is a ranking factor), and it has no
// business shipping the auth/Stripe/PDF-generation code that only the app
// behind login actually needs.
const AppLayout = lazy(() => import('@/components/layout/AppLayout').then((m) => ({ default: m.AppLayout })))
const ProtectedRoute = lazy(() =>
  import('@/components/layout/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute })),
)
const AdminPanelPage = lazy(() => import('@/pages/admin/AdminPanelPage').then((m) => ({ default: m.AdminPanelPage })))
const BillingPage = lazy(() => import('@/pages/BillingPage').then((m) => ({ default: m.BillingPage })))
const CompanySetupPage = lazy(() => import('@/pages/CompanySetupPage').then((m) => ({ default: m.CompanySetupPage })))
const CorrectDecaPage = lazy(() => import('@/pages/CorrectDecaPage').then((m) => ({ default: m.CorrectDecaPage })))
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const NewDecaPage = lazy(() => import('@/pages/NewDecaPage').then((m) => ({ default: m.NewDecaPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const TeamPage = lazy(() => import('@/pages/TeamPage').then((m) => ({ default: m.TeamPage })))
const TermsPage = lazy(() => import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<SignupPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/configurar-empresa" element={<CompanySetupPage />} />
            <Route path="/panel-admin" element={<AdminPanelPage />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<NewDecaPage />} />
                <Route path="historial" element={<HistoryPage />} />
                <Route path="historial/:id/corregir" element={<CorrectDecaPage />} />
                <Route path="equipo" element={<TeamPage />} />
                <Route path="facturacion" element={<BillingPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
