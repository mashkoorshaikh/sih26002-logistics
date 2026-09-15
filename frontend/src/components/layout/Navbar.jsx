import React, { useState, useEffect } from 'react'
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
  Plus,
  Settings,
  ChevronRight,
  ChevronDown,
  MapPin,
  GitCompare,
  ShieldAlert,
  Hospital
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { useThemeStore } from '../../store/themeStore'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

// Core navigation items
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plan', label: 'Route Planner', icon: Route },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/trips', label: 'Trips', icon: Navigation },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: '2' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/admin', label: 'Gov Admin', icon: Building2, govBadge: true },
]

const SECONDARY_ITEMS = [
  { to: '/live-map', label: 'Live GIS Map', icon: MapPin },
  { to: '/comparison', label: 'Route Comparison', icon: GitCompare },
  { to: '/risk', label: 'Risk Analysis', icon: ShieldAlert },
  { to: '/accessibility', label: 'Lifelines & Hospitals', icon: Hospital },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  // Auto-close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false)
    setToolsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const userInitial = (user?.full_name || user?.email || 'Admin')[0].toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* ─── LEFT: Small Clean Logo + NERoute ─── */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 text-decoration-none group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-xs group-hover:bg-[var(--primary-hover)] transition-colors">
                <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)]">
                  NERoute
                </span>
                <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
                  SIH26002
                </span>
              </div>
            </Link>
          </div>

          {/* ─── CENTER: Desktop Navigation (Hidden on mobile/tablet) ─── */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 select-none
                    ${isActive
                      ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-danger)] text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                      {item.badge}
                    </span>
                  )}
                  {item.govBadge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)] ml-0.5">
                      Gov
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Desktop More / Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen(v => !v)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none
                  ${SECONDARY_ITEMS.some(i => location.pathname === i.to)
                    ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
                  }
                `}
              >
                <span>Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg z-50 animate-fade-in"
                  onMouseLeave={() => setToolsOpen(false)}
                >
                  {SECONDARY_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.to

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setToolsOpen(false)}
                        className={`
                          flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors
                          ${isActive
                            ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 text-current flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* ─── RIGHT: Theme Toggle, User/Sign In, Primary Route Button, Hamburger ─── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-xs cursor-pointer"
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Quick Alerts Bell (Desktop/Tablet only) */}
            <Link
              to="/alerts"
              title="Active Notifications"
              className="hidden sm:flex relative p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-xs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--bg-surface)]" />
            </Link>

            {/* Primary Action Button (Desktop/Tablet) */}
            <div className="hidden sm:block">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/plan')}
              >
                Plan a Route
              </Button>
            </div>

            {/* User Profile / Logout (Desktop) */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                <div
                  className="w-8 h-8 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-xs flex items-center justify-center select-none shadow-xs border border-[var(--primary)]/20"
                  title={user?.email || 'Authenticated Officer'}
                >
                  {userInitial}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--risk-high-bg)] transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE / TABLET DRAWER NAVIGATION ─── */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 space-y-3 shadow-lg animate-fade-in">
          {/* Primary Action Button inside Drawer for Mobile */}
          <div className="sm:hidden pb-2 border-b border-[var(--border-subtle)]">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              icon={Plus}
              onClick={() => { setMobileMenuOpen(false); navigate('/plan') }}
            >
              Plan a Route
            </Button>
          </div>

          {/* Nav List */}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4.5 h-4.5 text-current flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.govBadge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)]">
                        Gov
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Secondary Intelligence & Tools */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-1 block">
              Intelligence & Planning Tools
            </span>
            {SECONDARY_ITEMS.map((item) => {
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
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-current flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </Link>
              )
            })}
          </div>

          {/* User Section inside Drawer */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {user?.full_name || 'Authenticated Officer'}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">
                      {user?.email || 'Officer'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] rounded-lg hover:bg-[var(--risk-high-bg)] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
