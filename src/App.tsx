import { Loader2 } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { CHUNK_RELOAD_GUARD_KEY } from '@/components/ErrorBoundary'
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
const GuardadosPage = lazy(() => import('@/pages/GuardadosPage').then((m) => ({ default: m.GuardadosPage })))
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const LegalNoticePage = lazy(() => import('@/pages/LegalNoticePage').then((m) => ({ default: m.LegalNoticePage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const NewDecaPage = lazy(() => import('@/pages/NewDecaPage').then((m) => ({ default: m.NewDecaPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const TeamPage = lazy(() => import('@/pages/TeamPage').then((m) => ({ default: m.TeamPage })))
const TermsPage = lazy(() => import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const VerifyEmailGate = lazy(() =>
  import('@/components/VerifyEmailGate').then((m) => ({ default: m.VerifyEmailGate })),
)

// Also lazy, and deliberately NOT wrapping the landing page: AuthProvider's
// module pulls in the whole Firebase SDK (auth + firestore + storage) as a
// static import, so — unlike the page components above, whose own weight
// stays out of the bundle regardless of where they're rendered from —
// keeping AuthProvider itself out of the landing page's chunk is what
// actually keeps Firebase off it. The landing page doesn't call useAuth() at
// all, so it loses nothing.
const AuthProvider = lazy(() => import('@/context/AuthContext').then((m) => ({ default: m.AuthProvider })))

function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default function App() {
  // Clears the ErrorBoundary's one-shot chunk-reload guard once the app has
  // been running normally for a bit, so a genuinely broken deploy (not just
  // stale chunks from one that happened while this tab was open) still ends
  // up showing the fallback UI instead of reloading forever.
  useEffect(() => {
    const timer = setTimeout(() => sessionStorage.removeItem(CHUNK_RELOAD_GUARD_KEY), 10_000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<SignupPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/aviso-legal" element={<LegalNoticePage />} />
            <Route element={<VerifyEmailGate />}>
              <Route path="/configurar-empresa" element={<CompanySetupPage />} />
            </Route>
            <Route path="/panel-admin" element={<AdminPanelPage />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<NewDecaPage />} />
                <Route path="historial" element={<HistoryPage />} />
                <Route path="historial/:id/corregir" element={<CorrectDecaPage />} />
                <Route path="guardados" element={<GuardadosPage />} />
                <Route path="equipo" element={<TeamPage />} />
                <Route path="facturacion" element={<BillingPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
