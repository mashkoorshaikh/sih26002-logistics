import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Route,
  Clock,
  Fuel,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Truck,
  ArrowRight,
  Layers,
  Activity,
  CheckCircle2,
  Navigation,
  Plus,
  Loader2,
  Calendar,
  ExternalLink
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useAuthStore } from '../store/authStore'
import RouteMap from '../components/map/RouteMap'
import routeService from '../services/routeService'
import { monthlyTrends, riskDistribution } from '../data/analyticsData'
import { Card, CardHeader, StatCard, Button, Badge } from '../components/ui'

// Top active monitored logistics corridors across the 8 NER states
const ACTIVE_CORRIDORS = [
  {
    id: 'cor-1',
    origin: 'Guwahati',
    destination: 'Shillong',
    nh_number: 'NH6 Asian Highway 1',
    distance_km: 98.8,
    duration: '2h 42m',
    fuel_cost: '₹1,817.92',
    risk_tier: 'LOW',
    risk_score: '18/100',
    status: 'OPTIMAL',
    is_recommended: true,
    tonnage: '15.0 t'
  },
  {
    id: 'cor-2',
    origin: 'Silchar',
    destination: 'Agartala',
    nh_number: 'NH8 / NH208',
    distance_km: 275.2,
    duration: '7h 15m',
    fuel_cost: '₹4,876.00',
    risk_tier: 'MEDIUM',
    risk_score: '44/100',
    status: 'ACTIVE',
    is_recommended: false,
    tonnage: '10.0 t'
  },
  {
    id: 'cor-3',
    origin: 'Dimapur',
    destination: 'Kohima',
    nh_number: 'NH29 Naga Hill Pass',
    distance_km: 69.4,
    duration: '2h 30m',
    fuel_cost: '₹1,361.60',
    risk_tier: 'HIGH',
    risk_score: '72/100',
    status: 'WATCH',
    is_recommended: false,
    tonnage: '12.0 t'
  },
  {
    id: 'cor-4',
    origin: 'Tezpur',
    destination: 'Itanagar',
    nh_number: 'NH15 Foothills',
    distance_km: 140.2,
    duration: '4h 10m',
    fuel_cost: '₹2,852.00',
    risk_tier: 'LOW',
    risk_score: '24/100',
    status: 'OPTIMAL',
    is_recommended: true,
    tonnage: '10.0 t'
  }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedCorridor, setSelectedCorridor] = useState(ACTIVE_CORRIDORS[0])
  const routeCacheRef = useRef({})

  // Formatted date for header
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date())

  // Handler for selecting an active corridor
  const handleSelectCorridor = async (corridor) => {
    if (selectedCorridor.id === corridor.id && routeData) return
    setSelectedCorridor(corridor)

    const cacheKey = `${corridor.origin}_${corridor.destination}`
    if (routeCacheRef.current[cacheKey]) {
      setRouteData(routeCacheRef.current[cacheKey])
      return
    }

    setLoading(true)
    try {
      const res = await routeService.calculateRoute({
        source: corridor.origin,
        destination: corridor.destination,
        vehicle_type: 'Truck',
        vehicle_weight: 10,
        cargo_type: 'Vegetables',
        cargo_weight: 5
      })
      routeCacheRef.current[cacheKey] = res
      setRouteData(res)
    } catch (err) {
      console.warn('Could not load corridor route:', err)
    } finally {
      setLoading(false)
    }
  }

  // Pre-fetch initial corridor and pre-cache others in background
  useEffect(() => {
    let isMounted = true

    const preload = async () => {
      setLoading(true)
      try {
        const firstKey = `${ACTIVE_CORRIDORS[0].origin}_${ACTIVE_CORRIDORS[0].destination}`
        const res = await routeService.calculateRoute({
          source: ACTIVE_CORRIDORS[0].origin,
          destination: ACTIVE_CORRIDORS[0].destination,
          vehicle_type: 'Truck',
          vehicle_weight: 10,
          cargo_type: 'Vegetables',
          cargo_weight: 5
        })
        if (isMounted) {
          routeCacheRef.current[firstKey] = res
          setRouteData(res)
        }
      } catch (err) {
        console.warn('Could not preload initial corridor:', err)
      } finally {
        if (isMounted) setLoading(false)
      }

      for (const c of ACTIVE_CORRIDORS.slice(1)) {
        const key = `${c.origin}_${c.destination}`
        if (!routeCacheRef.current[key]) {
          try {
            const r = await routeService.calculateRoute({
              source: c.origin,
              destination: c.destination,
              vehicle_type: 'Truck',
              vehicle_weight: 10,
              cargo_type: 'Vegetables',
              cargo_weight: 5
            })
            routeCacheRef.current[key] = r
          } catch (_) {}
        }
      }
    }

    preload()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-[100vw] overflow-x-hidden">
      {/* ─── 1. WELCOME & MAIN ACTION (MOBILE-FIRST PRIORITY) ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 sm:pb-6 border-b border-[var(--border-subtle)]">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              OPERATIONS COMMAND
            </span>
            <span className="text-[var(--text-muted)] hidden sm:inline">•</span>
            <span className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {todayFormatted}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Officer'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Real-time corridor telemetry, mountain hazard tracking, and route optimization across the 8 NER states.
          </p>
        </div>

        {/* ─── 2. PLAN NEW ROUTE CTA (Prominent, High-Touch) ─── */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap pt-1 sm:pt-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/plan')}
            className="min-h-[44px] sm:h-11 px-4 sm:px-5 shadow-xs font-bold text-xs sm:text-sm flex-1 sm:flex-initial justify-center"
          >
            Plan New Route
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={Navigation}
            onClick={() => navigate('/trips')}
            className="min-h-[44px] sm:h-11 px-4 sm:px-5 font-semibold text-xs sm:text-sm flex-1 sm:flex-initial justify-center"
          >
            Trip History
          </Button>
        </div>
      </div>

      {/* ─── 3. IMPORTANT KPI: EXACT 2 COLUMNS ON MOBILE, 4 ON DESKTOP ──────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {/* Row 1: Trips | Vehicles */}
        <StatCard
          title="Trips"
          value="1,284"
          change="+12%"
          changeType="positive"
          subtitle="8 NER states"
          icon={Navigation}
        />

        <StatCard
          title="Vehicles"
          value="48"
          change="4 Live"
          changeType="positive"
          subtitle="Reefers active"
          icon={Truck}
        />

        {/* Row 2: High Risk | Savings */}
        <StatCard
          title="High Risk"
          value="3"
          change="Watch"
          changeType="negative"
          subtitle="Landslide radar"
          icon={AlertTriangle}
        />

        <StatCard
          title="Savings"
          value="₹2.4L"
          change="18.4%"
          changeType="positive"
          subtitle="OR-Tools saved"
          icon={TrendingUp}
        />
      </div>

      {/* ─── 4 & 5. RECENT ACTIVITY & GIS MAP COMMAND CENTER ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* 4. Monitored Corridors List (5 of 12 cols on desktop) */}
        <div className="lg:col-span-5 space-y-3.5">
          <Card padding="default" className="rounded-xl sm:rounded-2xl border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  Active Monitored Corridors
                </h2>
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">
                  Select an artery to preview terrain, geometry & risk
                </p>
              </div>
              <Badge variant="brand" size="sm" dot>
                Live Feed
              </Badge>
            </div>

            <div className="space-y-2.5">
              {ACTIVE_CORRIDORS.map(corridor => {
                const isSelected = selectedCorridor.id === corridor.id
                const riskVariant = corridor.risk_tier === 'LOW' ? 'low' : corridor.risk_tier === 'MEDIUM' ? 'medium' : 'high'

                return (
                  <div
                    key={corridor.id}
                    onClick={() => handleSelectCorridor(corridor)}
                    className={`
                      p-3 sm:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none min-h-[44px]
                      ${isSelected
                        ? 'bg-[var(--primary-subtle)] border-[var(--primary)] shadow-2xs'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {corridor.origin} ➔ {corridor.destination}
                        </span>
                        {corridor.is_recommended && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0">
                            OPTIMAL
                          </span>
                        )}
                      </div>
                      <Badge variant={riskVariant} size="sm" dot className="flex-shrink-0">
                        {corridor.risk_tier} ({corridor.risk_score})
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]/60">
                      <span className="font-medium truncate">{corridor.nh_number} • {corridor.distance_km} km</span>
                      <span className="font-bold text-[var(--text-primary)] flex-shrink-0 ml-2">{corridor.fuel_cost}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Custom calculations:</span>
              <Button
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
                onClick={() => navigate('/plan')}
                className="font-bold text-[var(--primary)] text-xs"
              >
                Open Planner →
              </Button>
            </div>
          </Card>
        </div>

        {/* 5. Corridor Map Preview (7 of 12 cols on desktop) */}
        <div className="lg:col-span-7">
          <Card padding="none" className="rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                      GIS: {selectedCorridor.origin} ➔ {selectedCorridor.destination}
                    </span>
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)] flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium truncate block">
                    Mountain Elevation & Risk Layer
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to="/live-map"
                  className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-subtle)]"
                >
                  <span>Full Map</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Responsive map container: 280px on mobile, 380px on tablet, 480px on desktop */}
            <div className="h-[280px] sm:h-[380px] lg:h-[480px] w-full relative">
              <RouteMap
                routeData={routeData}
                height="100%"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ─── 6 & 7. RISK INFORMATION & REGIONAL ANALYTICS CHARTS ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* 6. Corridor Risk Tier Distribution (Risk info first) */}
        <Card padding="default" className="rounded-xl sm:rounded-2xl border-[var(--border-subtle)] shadow-xs">
          <CardHeader
            title="Corridor Risk Tier Distribution"
            subtitle="Categorized by AI safety thresholds across monitored highways"
            icon={ShieldAlert}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/risk')}
                className="font-bold text-[var(--primary)] text-xs"
              >
                Risk Map →
              </Button>
            }
          />
          <div className="h-60 sm:h-72 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="tier" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Bar dataKey="routes" fill="#16845B" radius={[6, 6, 0, 0]} name="Monitored Corridors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 7. Monthly Freight Volume Analytics */}
        <Card padding="default" className="rounded-xl sm:rounded-2xl border-[var(--border-subtle)] shadow-xs">
          <CardHeader
            title="Monthly Freight Volume (Tonnes)"
            subtitle="Regional corridor dispatches across northeast hubs"
            icon={TrendingUp}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/analytics')}
                className="font-bold text-[var(--primary)] text-xs"
              >
                Deep Dive →
              </Button>
            }
          />
          <div className="h-60 sm:h-72 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16845B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16845B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Area type="monotone" dataKey="trips" stroke="#16845B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrips)" name="Freight Tonnes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
