import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CloudRain,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Check,
  Route,
  Info
} from 'lucide-react'
import RouteMonitoringPanel from '../components/alerts/RouteMonitoringPanel'
import routeService from '../services/routeService'
import { PageHeader, Card, CardHeader, Badge, Button, Tabs } from '../components/ui'

const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    severity: 'HIGH',
    title: 'Heavy rainfall detected on current route (>75 mm/h)',
    corridor: 'Guwahati ➔ Shillong (NH6 km 34)',
    time: '3 min ago',
    unread: true,
    action: 'Divert to Umsning East Bypass'
  },
  {
    id: 'alt-2',
    severity: 'MEDIUM',
    title: 'Visibility reduced near mountain ridge segment (< 50m fog)',
    corridor: 'Silchar ➔ Agartala (NH8 / NH208)',
    time: '24 min ago',
    unread: true,
    action: 'Caution convoy speed: 30 km/h'
  },
  {
    id: 'alt-3',
    severity: 'LOW',
    title: 'Alternative faster route available (Save 18 mins, -₹210 fuel)',
    corridor: 'Tezpur ➔ Itanagar (NH15)',
    time: '1 hour ago',
    unread: false,
    action: 'Review suggested alternative'
  },
  {
    id: 'alt-4',
    severity: 'HIGH',
    title: 'Active sinking subgrade & rockfall warning',
    corridor: 'Dimapur ➔ Kohima (NH29 Pagla Pahar)',
    time: '3 hours ago',
    unread: false,
    action: 'Weighbridge restriction: 10t cap'
  }
]

export default function AlertsPage() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [source, setSource] = useState('Guwahati')
  const [destination, setDestination] = useState('Shillong')
  const [routeData, setRouteData] = useState(null)
  const [selectedAltId, setSelectedAltId] = useState(null)

  useEffect(() => {
    routeService.calculateRoute({
      source,
      destination,
      vehicle_type: 'Truck',
      vehicle_weight: 10,
      cargo_type: 'Vegetables',
      cargo_weight: 4
    }).then(setRouteData).catch(() => {})
  }, [source, destination])

  const handleMarkAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, unread: false } : a))
  }

  const handleMarkAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, unread: false })))
  }

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'UNREAD') return a.unread
    if (activeFilter === 'HIGH') return a.severity === 'HIGH'
    if (activeFilter === 'MEDIUM') return a.severity === 'MEDIUM'
    if (activeFilter === 'LOW') return a.severity === 'LOW'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <PageHeader
        title="Active Alerts & Corridor Monitoring Center"
        subtitle="Real-time incident detection, weather thresholds, and automated diversion advisories across North Eastern freight corridors."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Alerts' }
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Check}
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        }
      />

      {/* Simulator Test Bench (Phase 12 functionality preserved) */}
      <RouteMonitoringPanel
        source={source}
        destination={destination}
        routeData={routeData}
        selectedAltId={selectedAltId}
        onSwitchToSaferRoute={(altId) => setSelectedAltId(altId || 'alt-1')}
        onRevertToPrimary={() => setSelectedAltId(null)}
      />

      {/* Notification Center Cards */}
      <Card padding="default">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Operational Regulatory & Safety Feed
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              ({alerts.filter(a => a.unread).length} unread notices)
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
            {['ALL', 'UNREAD', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`
                  text-xs font-semibold px-3 py-2 sm:py-1 rounded-md transition-all whitespace-nowrap cursor-pointer min-h-[38px]
                  ${activeFilter === f
                    ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/30'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5">
          {filteredAlerts.map(item => (
            <div
              key={item.id}
              className={`
                p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3
                ${item.unread
                  ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-xs'
                  : 'bg-[var(--bg-surface-subtle)]/50 border-[var(--border-subtle)] opacity-85'
                }
              `}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`
                  w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs
                  ${item.severity === 'HIGH' ? 'bg-[var(--risk-high-bg)] text-[var(--risk-high)]' : item.severity === 'MEDIUM' ? 'bg-[var(--risk-med-bg)] text-[var(--risk-med)]' : 'bg-[var(--risk-low-bg)] text-[var(--risk-low)]'}
                `}>
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      variant={item.severity === 'HIGH' ? 'high' : item.severity === 'MEDIUM' ? 'medium' : 'low'}
                      size="sm"
                      dot
                    >
                      {item.severity} RISK
                    </Badge>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                      {item.title}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)]">
                    Corridor: <strong>{item.corridor}</strong> • Mandate: <span className="text-[var(--primary)] font-medium">{item.action}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 sm:self-center flex-shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] w-full sm:w-auto">
                <span className="text-[11px] text-[var(--text-muted)]">{item.time}</span>
                <div className="flex items-center gap-2">
                  {item.unread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="min-h-[44px]"
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Route}
                    onClick={() => navigate('/plan')}
                    className="min-h-[44px]"
                  >
                    View route
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
