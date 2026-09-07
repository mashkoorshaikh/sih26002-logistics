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
  DollarSign,
  Plus,
  Loader2,
  Radio
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { useAuthStore } from '../store/authStore'
import RouteMap from '../components/map/RouteMap'
import routeService from '../services/routeService'
import { monthlyTrends, riskDistribution, stateTrips } from '../data/analyticsData'
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

  // Current formatted date for the top greeting
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Handle instant corridor switching & pre-caching
  const handleSelectCorridor = async (corridor) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ─── TOP GREETING & PRIMARY ACTION ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
              Northeast Logistics Operations
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-xs text-[var(--text-muted)]">{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Controller'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Operational status: All 8 NER state arteries monitored • Google OR-Tools routing engine live.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="md"
            icon={Navigation}
            onClick={() => navigate('/trips')}
          >
            Trip History
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/plan')}
          >
            Plan New Route
          </Button>
        </div>
      </div>

      {/* ─── COMPACT KPI STAT CARDS (Section 7) ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Trips"
          value="1,284"
          change="+12% this wk"
          changeType="positive"
          subtitle="Across 8 NER states"
          icon={Navigation}
        />

        <StatCard
          title="Active Vehicles"
          value="48"
          change="4 En Route"
          changeType="positive"
          subtitle="Multi-axle & reefers"
          icon={Truck}
        />

        <StatCard
          title="High Risk Routes"
          value="3"
          change="Landslide Watch"
          changeType="negative"
          subtitle="Pagla Pahar & Sela Pass"
          icon={AlertTriangle}
        />

        <StatCard
          title="Estimated Savings"
          value="₹2.4L"
          change="18.4% cost saving"
          changeType="positive"
          subtitle="Via OR-Tools optimization"
          icon={TrendingUp}
        />
      </div>

      {/* ─── CORRIDOR MONITORING & MAP SPLIT ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Monitored Corridors List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Card padding="sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Active Monitored Corridors
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Click a corridor to preview real-time geometry & terrain
                </p>
              </div>
              <Badge variant="brand" size="sm">Live</Badge>
            </div>

            <div className="space-y-2">
              {ACTIVE_CORRIDORS.map(corridor => {
                const isSelected = selectedCorridor.id === corridor.id
                const riskVariant = corridor.risk_tier === 'LOW' ? 'low' : corridor.risk_tier === 'MEDIUM' ? 'medium' : 'high'

                return (
                  <div
                    key={corridor.id}
                    onClick={() => handleSelectCorridor(corridor)}
                    className={`
                      p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none
                      ${isSelected
                        ? 'bg-[var(--primary-subtle)] border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {corridor.origin} ➔ {corridor.destination}
                        </span>
                        {corridor.is_recommended && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)]">
                            BEST
                          </span>
                        )}
                      </div>
                      <Badge variant={riskVariant} size="sm" dot>
                        {corridor.risk_tier} ({corridor.risk_score})
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>{corridor.nh_number} • {corridor.distance_km} km</span>
                      <span className="font-semibold text-[var(--text-primary)]">{corridor.fuel_cost}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between px-1">
              <span className="text-xs text-[var(--text-muted)]">Looking for custom waypoints?</span>
              <Button
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
                onClick={() => navigate('/plan')}
              >
                Custom Planner
              </Button>
            </div>
          </Card>
        </div>

        {/* Corridor Map Preview (7 cols) */}
        <div className="lg:col-span-7">
          <Card padding="none" className="overflow-hidden border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Live GIS View: {selectedCorridor.origin} ➔ {selectedCorridor.destination}
                </span>
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)] ml-1" />}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/live-map"
                  className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  Full Mountain GIS <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="h-[380px] w-full relative">
              <RouteMap
                routeData={routeData}
                height="380px"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ─── REGIONAL TRENDS & ANALYTICS PREVIEW ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card padding="default">
          <CardHeader
            title="Monthly Freight Volume (Tonnes)"
            subtitle="Regional corridor dispatches over the past 6 months"
            icon={TrendingUp}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/analytics')}
              >
                Deep Dive
              </Button>
            }
          />
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Area type="monotone" dataKey="trips" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" name="Freight Tonnes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="default">
          <CardHeader
            title="Corridor Risk Tier Distribution"
            subtitle="Categorized by AI safety thresholds across monitored highways"
            icon={ShieldAlert}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/risk')}
              >
                View Risk Map
              </Button>
            }
          />
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="tier" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Bar dataKey="routes" fill="#0d9488" radius={[6, 6, 0, 0]} name="Monitored Corridors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
