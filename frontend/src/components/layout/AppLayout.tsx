import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, CalendarDays, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const now = new Date()
const currentMonthPath = `/month/${now.getFullYear()}/${now.getMonth() + 1}`

const navItems = [
  { to: '/overview', label: 'Overview', icon: BarChart3 },
  { to: currentMonthPath, label: 'This Month', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ to, label, icon: Icon }: (typeof navItems)[0]) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-card px-4 py-6">
        <div className="mb-6 px-3">
          <h1 className="text-lg font-bold">Finance Tracker</h1>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <Button variant="ghost" className="justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar — mobile */}
        <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-card">
          <h1 className="text-base font-bold">Finance Tracker</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-card flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-2 text-xs gap-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
