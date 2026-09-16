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

// Primary core navigation items
const PRIMARY_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plan', label: 'Route Planner', icon: Route },
  { to: '/live-map', label: 'Live GIS Map', icon: MapPin },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

// Grouped secondary & operational features
const OPERATIONS_GROUPS = [
  {
    group: 'Fleet & Logistics',
    items: [
      { to: '/vehicles', label: 'Fleet Vehicles', desc: 'Active convoys & reefer telemetry', icon: Truck },
      { to: '/trips', label: 'Trips History', desc: 'Completed routes & cost audits', icon: Navigation },
    ]
  },
  {
    group: 'AI & Intelligence',
    items: [
      { to: '/assistant', label: 'AI Assistant', desc: 'Natural language route reasoning', icon: Bot },
      { to: '/risk', label: 'Risk Analysis', desc: 'Geological radar & rainfall indices', icon: ShieldAlert },
      { to: '/comparison', label: 'Route Comparison', desc: 'Multi-route tradeoff evaluation', icon: GitCompare },
      { to: '/accessibility', label: 'Lifelines & Hubs', desc: 'Emergency hospitals & fuel stations', icon: Hospital },
    ]
  },
  {
    group: 'Governance & Settings',
    items: [
      { to: '/admin', label: 'Gov Admin Portal', desc: 'DoNER & NDMA arterial oversight', icon: Building2, govBadge: true },
      { to: '/alerts', label: 'Alerts Center', desc: 'Live highway incident watch', icon: Bell, badge: '2' },
      { to: '/settings', label: 'System Settings', desc: 'Fuel benchmarks & API configurations', icon: Settings },
    ]
  }
]

export default function Navbar({ mobileDrawerOpen, setMobileDrawerOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { theme, toggleTheme } = useThemeStore()

  // Internal state if not controlled externally
  const [internalOpen, setInternalOpen] = useState(false)
  const isDrawerOpen = mobileDrawerOpen !== undefined ? mobileDrawerOpen : internalOpen
  const setIsDrawerOpen = setMobileDrawerOpen !== undefined ? setMobileDrawerOpen : setInternalOpen

  const [operationsOpen, setOperationsOpen] = useState(false)

  // Auto-close drawer & dropdowns when route changes
  useEffect(() => {
    setIsDrawerOpen(false)
    setOperationsOpen(false)
  }, [location.pathname])

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsDrawerOpen])

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  const handleLogout = () => {
    authService.logout()
    setIsDrawerOpen(false)
    navigate('/login')
  }

  const userInitial = (user?.full_name || user?.email || 'A')[0].toUpperCase()

  const isOperationsActive = OPERATIONS_GROUPS.some(g =>
    g.items.some(i => location.pathname === i.to)
  )

  return (
    <>
      {/* ─── STICKY HEADER (56px–64px height on mobile) ──────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* ─── LEFT: Compact Brand Logo ─── */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <Link
                to={user ? "/dashboard" : "/"}
                className="flex items-center gap-2.5 text-decoration-none group select-none flex-shrink-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-xs group-hover:bg-[var(--primary-hover)] transition-colors flex-shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
                      NERoute
                    </span>
                    <span className="hidden sm:inline-flex text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/25">
                      SIH26002
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium -mt-0.5 hidden lg:block">
                    Logistics Intelligence Platform
                  </span>
                </div>
              </Link>

              {/* ─── DESKTOP NAVIGATION (Hidden on mobile) ─── */}
              <nav className="hidden lg:flex items-center gap-1.5 ml-2">
                {PRIMARY_NAV.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`
                        flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150 select-none
                        ${isActive
                          ? 'bg-[var(--primary-subtle)] text-[var(--primary)] shadow-2xs font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                {/* Operations & More Dropdown on Desktop */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOperationsOpen(v => !v)}
                    className={`
                      flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer select-none
                      ${isOperationsActive
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
                      }
                    `}
                  >
                    <span>Operations</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${operationsOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                  </button>

                  {operationsOpen && (
                    <div
                      className="absolute left-0 mt-2 w-80 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl z-50 animate-fade-in"
                      onMouseLeave={() => setOperationsOpen(false)}
                    >
                      <div className="space-y-3">
                        {OPERATIONS_GROUPS.map((group) => (
                          <div key={group.group}>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2.5 py-1 block">
                              {group.group}
                            </span>
                            <div className="space-y-0.5 mt-0.5">
                              {group.items.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.to

                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setOperationsOpen(false)}
                                    className={`
                                      flex items-start gap-3 p-2 rounded-xl transition-colors
                                      ${isActive
                                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                                        : 'hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)]'
                                      }
                                    `}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold truncate">{item.label}</span>
                                        {item.badge && (
                                          <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-danger)] text-white text-[9px] font-bold">
                                            {item.badge}
                                          </span>
                                        )}
                                        {item.govBadge && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            Gov
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* ─── RIGHT CONTROLS: Mobile has ONLY [Theme] [Menu] ─────────── */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Theme Toggle (44px target on mobile) */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-2xs cursor-pointer flex items-center justify-center select-none"
                aria-label="Toggle dark/light theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* Desktop-Only Controls (Hidden on Mobile) */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Quick Alerts Bell */}
                <Link
                  to="/alerts"
                  title="Active Notifications (2)"
                  className="relative p-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-2xs"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--bg-surface)]" />
                </Link>

                {/* Plan Route CTA Button */}
                <Button
                  variant="primary"
                  size="md"
                  icon={Plus}
                  onClick={() => navigate('/plan')}
                  className="shadow-xs font-bold"
                >
                  Plan Route
                </Button>

                {/* Desktop User Profile */}
                {user ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                    <div
                      className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-sm flex items-center justify-center select-none shadow-2xs border border-[var(--primary)]/20"
                      title={user?.email || 'Authenticated Officer'}
                    >
                      {userInitial}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Log out"
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--color-danger)] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      aria-label="Log out"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary-subtle)] px-3.5 py-2 rounded-xl border border-[var(--primary)]/30 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Hamburger Button (44px Minimum Touch Target) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer transition-colors flex items-center justify-center select-none"
                aria-label={isDrawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              >
                {isDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE SLIDE-IN NAVIGATION DRAWER ────────────────────────────── */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <aside
        aria-label="Mobile Navigation Drawer"
        className={`
          fixed top-0 right-0 bottom-0 z-50 w-[86vw] max-w-[340px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
        `}
      >
        {/* Drawer Header with Close Button (44px target) */}
        <div className="h-14 sm:h-16 px-4 flex items-center justify-between border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-extrabold text-[var(--text-primary)]">
              NERoute
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] flex items-center justify-center cursor-pointer transition-colors select-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Quick Route Action Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center shadow-xs font-bold h-12 text-sm"
            icon={Plus}
            onClick={() => { setIsDrawerOpen(false); navigate('/plan') }}
          >
            Plan a Route →
          </Button>

          {/* Group 1: Core Platform */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 block mb-1">
              Core Platform
            </span>
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-3 min-h-[44px] text-sm font-semibold rounded-xl transition-colors
                    ${isActive
                      ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </Link>
              )
            })}
          </div>

          {/* Group 2 & 3: Categorized Operations & Intelligence */}
          {OPERATIONS_GROUPS.map((group) => (
            <div key={group.group} className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 block mb-1">
                {group.group}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.to

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`
                      flex items-center justify-between px-3.5 py-2.5 min-h-[44px] text-sm font-medium rounded-xl transition-colors
                      ${isActive
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                      {item.govBadge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Gov
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Drawer Footer: User Profile & Logout (44px target) */}
        <div
          className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/40 flex-shrink-0"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
        >
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {user?.full_name || 'Authenticated Officer'}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] truncate">
                    {user?.email || 'Officer'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 cursor-pointer flex items-center justify-center flex-shrink-0 transition-colors"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] text-sm font-bold min-h-[44px] flex items-center justify-center transition-colors"
            >
              Sign In to Account
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
