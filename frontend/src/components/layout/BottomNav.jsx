import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Route, MapPin, Bell, Menu } from 'lucide-react'

/**
 * Mobile-First Bottom Navigation (Native App Ergonomics)
 * Visible only on mobile (< 1024px).
 * Provides one-tap thumb access to the 4 core actions + "More" drawer trigger.
 */
export default function BottomNav({ onOpenDrawer, unreadAlertsCount = 2 }) {
  const location = useLocation()
  const pathname = location.pathname

  const navItems = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard' || pathname === '/'
    },
    {
      to: '/plan',
      label: 'Routes',
      icon: Route,
      isActive: pathname === '/plan' || pathname === '/comparison'
    },
    {
      to: '/live-map',
      label: 'Tracking',
      icon: MapPin,
      isActive: pathname === '/live-map'
    },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: Bell,
      isActive: pathname === '/alerts',
      badge: unreadAlertsCount
    }
  ]

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] transition-colors duration-150 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-15 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center justify-center min-h-[44px] py-1 text-center select-none transition-colors rounded-xl
                ${active
                  ? 'text-[var(--primary)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--bg-surface)]" />
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'font-bold text-[var(--primary)]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* 5th Tab: "More" Menu Button (Opens Full Slide-in Drawer) */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 text-center select-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-xl cursor-pointer"
          aria-label="Open full menu"
        >
          <Menu className="w-5 h-5 stroke-[1.8px]" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            More
          </span>
        </button>
      </div>
    </nav>
  )
}
