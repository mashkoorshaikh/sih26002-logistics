import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Compass,
  LayoutDashboard,
  Route,
  Truck,
  Navigation,
  Bell,
  BarChart3,
  Bot,
  Building2,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { useThemeStore } from '../../store/themeStore'
import { Button } from '../ui/Button'

// Primary navigation items requested for SaaS / Logistics dashboard
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plan', label: 'Routes', icon: Route },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/trips', label: 'Trips', icon: Navigation },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: '2' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/admin', label: 'Gov Admin', icon: Building2, govBadge: true },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* LEFT: Logo + Brand */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 text-decoration-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs group-hover:bg-[var(--primary-hover)] transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                    NER Logistics
                  </span>
                  <span className="text-[10px] font-semibold font-mono px-1.5 py-0.2 rounded bg-[var(--primary-subtle)] text-[var(--primary)]">
                    SIH26002
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER: Main Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150
                    ${isActive
                      ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-danger)] text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                      {item.badge}
                    </span>
                  )}
                  {item.govBadge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--risk-low-bg)] text-[var(--risk-low)] ml-0.5">
                      Gov
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* RIGHT: Actions, Theme, User, Primary CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>

            {/* Quick Alerts Bell */}
            <Link
              to="/alerts"
              title="Active Notifications"
              className="relative p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-xs"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--bg-surface)]" />
            </Link>

            {/* Primary Action Button (Plan Route) */}
            <div className="hidden sm:block">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => navigate('/plan')}
              >
                Plan Route
              </Button>
            </div>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
              <div
                className="w-8 h-8 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-xs flex items-center justify-center select-none shadow-xs"
                title={user?.email || 'Authenticated Officer'}
              >
                {(user?.full_name || 'Admin')[0].toUpperCase()}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--risk-high-bg)] transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors
                  ${isActive
                    ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon={Plus}
              onClick={() => { setMobileMenuOpen(false); navigate('/plan') }}
            >
              Plan New Route
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
