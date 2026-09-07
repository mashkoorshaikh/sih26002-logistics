import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Route,
  GitCompare,
  Map,
  ShieldAlert,
  Hospital,
  BarChart3,
  Bot,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Building2
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',     label: 'Overview',          icon: LayoutDashboard },
  { to: '/plan',          label: 'Route Planner',     icon: Route },
  { to: '/comparison',    label: 'Route Comparison',  icon: GitCompare, badge: 'Smart' },
  { to: '/live-map',      label: 'Live Map',          icon: Map },
  { to: '/risk',          label: 'Risk Analysis',     icon: ShieldAlert },
  { to: '/accessibility', label: 'Accessibility',     icon: Hospital },
  { to: '/analytics',     label: 'Analytics',         icon: BarChart3 },
  { to: '/assistant',     label: 'AI Assistant',      icon: Bot, badge: 'GPT-4o' },
  { to: '/alerts',        label: 'Alerts',            icon: Bell, badge: '2', badgeColor: '#ef4444' },
  { to: '/admin',         label: 'Admin Portal',      icon: Building2, badge: 'Gov', badgeColor: '#6366f1' },
  { to: '/settings',      label: 'Settings',          icon: Settings },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()

  return (
    <aside style={{
      width: collapsed ? '72px' : '250px',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(10, 15, 30, 0.98)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 90,
      userSelect: 'none'
    }}>
      {/* Brand Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {!collapsed ? (
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }}>
              <MapPin size={18} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: '#f1f5f9', lineHeight: 1.1 }}>
                NER <span style={{ color: '#6366f1' }}>Logistics</span>
              </span>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: 0.4 }}>
                SIH26002 • AI PLATFORM
              </span>
            </div>
          </Link>
        ) : (
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
            }}>
              <MapPin size={18} color="#ffffff" />
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: collapsed ? '12px 8px' : '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        {navItems.map(({ to, label, icon: Icon, badge, badgeColor }) => {
          const active = location.pathname === to || (to === '/dashboard' && location.pathname === '/')
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                padding: collapsed ? '10px 0' : '9px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                color: active ? '#ffffff' : '#94a3b8',
                background: active ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 100%)' : 'transparent',
                border: active ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                  e.currentTarget.style.color = '#f1f5f9'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94a3b8'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={17} color={active ? '#818cf8' : '#64748b'} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </div>

              {!collapsed && badge && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 12,
                  background: badgeColor ? `${badgeColor}20` : 'rgba(99, 102, 241, 0.2)',
                  color: badgeColor || '#818cf8',
                  border: badgeColor ? `1px solid ${badgeColor}40` : '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* SIH 2024 Footer Tag */}
      {!collapsed && (
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={12} color="#f59e0b" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>SIH 2024 Finalist</span>
          </div>
          <p style={{ fontSize: 10, color: '#64748b', margin: 0, lineHeight: 1.3 }}>
            Multimodal Mountain Logistics & Lifeline Resilience Engine
          </p>
        </div>
      )}
    </aside>
  )
}
