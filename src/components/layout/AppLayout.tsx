import { FileText, History, LogOut, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const baseNavItems = [
  { to: '/app', label: 'Nuevo DeCA', icon: FileText, end: true },
  { to: '/app/historial', label: 'Historial', icon: History, end: false },
]

const adminNavItems = [{ to: '/app/equipo', label: 'Equipo', icon: Users, end: false }]

export function AppLayout() {
  const { user, profile, company, logout } = useAuth()
  const navItems = profile?.role === 'admin' ? [...baseNavItems, ...adminNavItems] : baseNavItems

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <p className="hidden text-xs leading-tight text-ink-400 sm:block">{company?.nombre ?? 'Documento electrónico de Control Administrativo'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-400 sm:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4 pb-2 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
