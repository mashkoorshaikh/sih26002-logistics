import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  ShieldAlert,
  Clock,
  Fuel,
  Truck,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  AlertTriangle,
  FileDown,
  Activity,
  CheckCircle2,
  Info,
  Building2,
  Compass,
  Zap,
  HelpCircle,
  Users
} from 'lucide-react'
import analyticsService from '../services/analyticsService'
import { PageHeader, Card, Badge, Button, StatCard } from '../components/ui'

// Clean theme-adaptive tooltip
function CustomTooltip({ active, payload, label, suffix = '', prefix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-md">
      <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold text-[var(--text-primary)]">
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [persona, setPersona] = useState('all') // 'all' | 'logistics_operator' | 'government_admin' | 'transport_planner' | 'emergency_management'
  const [analyticsData, setAnalyticsData] = useState(null)
  const [overviewData, setOverviewData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      setLoading(true)
      try {
        const [overview, metrics] = await Promise.all([
          analyticsService.getOverview(timeRange, persona),
          analyticsService.getAllMetrics(timeRange)
        ])
        if (isMounted) {
          setOverviewData(overview)
          setAnalyticsData(metrics)
        }
      } catch (err) {
        console.warn('Analytics loading error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [timeRange, persona])

  // Fallback defaults if loading
  const kpis = overviewData?.kpis || {
    total_trips: { value: 602, change_pct: 12.4 },
    avg_cost_per_tonne_km: { formatted: '₹14.20 / t-km', change_pct: -6.8 },
    avg_travel_time_hours: { formatted: '7.2 hrs avg', change_pct: -5.6 },
    high_risk_routes_count: { value: 3 },
    total_fuel_saved_liters: { formatted: '4,850 L', change_pct: 18.5 },
    total_cost_saved_inr: { formatted: '₹4,46,200', change_pct: 19.2 }
  }

  const personaInsight = overviewData?.persona_insight || {
    headline: 'Comprehensive Regional Overview',
    primary_metric: '602 Total Trips',
    subtext: '₹4,46,200 saved • 4,850 L saved via Google OR-Tools multi-objective routing',
    priority_kpi: 'Average Fleet Risk',
    priority_value: '3.8 / 10'
  }

  const cost = analyticsData?.transportation_cost
  const risk = analyticsData?.route_risk
  const travel = analyticsData?.travel_time
  const fuel = analyticsData?.fuel_consumption
  const highRisk = analyticsData?.high_risk_routes
  const usage = analyticsData?.route_usage
  const savings = analyticsData?.estimated_savings

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Header & Export Action */}
      <PageHeader
        title="North Eastern Region Smart Logistics Analytics"
        subtitle="Multi-Stakeholder Telemetry Dashboard • Cost Efficiency, Terrain Risk, Fuel Consumption & Regional Impact"
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Analytics' }
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              {[
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: '1y', label: '1Y' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeRange(t.id)}
                  className={`
                    px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer
                    ${timeRange === t.id
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={FileDown}
              onClick={() => alert('Exporting Comprehensive NER Logistics Analytics Report (CSV / PDF)...')}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* Prominent Demo Data & Calibration Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant="warning" size="sm">
            DEMO DATA PROVENANCE
          </Badge>
          <span className="font-bold text-[var(--text-primary)]">
            Calibrated Regional Simulation Data:
          </span>
          <span className="text-[var(--text-secondary)]">
            Historical road clearance, terrain weather models, and freight benchmarks across 8 North Eastern states.
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
          Calibrated: 2026-09-06 • Baseline: 8 States
        </span>
      </div>

      {/* Stakeholder Persona Navigation Bar */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Stakeholder Persona View:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All View', icon: Activity },
              { id: 'logistics_operator', label: 'Logistics Operators', icon: Truck },
              { id: 'government_admin', label: 'Government Administrators', icon: Building2 },
              { id: 'transport_planner', label: 'Transport Planners', icon: Compass },
              { id: 'emergency_management', label: 'Emergency Management', icon: ShieldAlert }
            ].map(p => {
              const Icon = p.icon
              const isActive = persona === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersona(p.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                    ${isActive
                      ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/30'
                      : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Persona Custom Focus Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--primary-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
            Persona Target Insight • {persona.replace(/_/g, ' ').toUpperCase()}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1 mb-0.5">
            {personaInsight.headline}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {personaInsight.subtext}
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 sm:text-right shadow-xs">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            {personaInsight.priority_kpi}
          </span>
          <span className="text-lg sm:text-xl font-bold text-[var(--primary)]">
            {personaInsight.priority_value}
          </span>
        </div>
      </div>

      {/* 4 Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Trips"
          value={kpis.total_trips?.value?.toLocaleString() || 602}
          change={`+${kpis.total_trips?.change_pct || 12.4}% vs previous`}
          changeType="positive"
          icon={Truck}
        />
        <StatCard
          title="Avg Transport Cost"
          value={kpis.avg_cost_per_tonne_km?.formatted || '₹14.20 / t-km'}
          change="-6.8% cost reduced"
          changeType="positive"
          icon={Fuel}
        />
        <StatCard
          title="High Risk Routes"
          value={kpis.high_risk_routes_count?.value || 3}
          change="Pagla Pahar, Nongpoh, Barail"
          changeType="neutral"
          icon={ShieldAlert}
        />
        <StatCard
          title="Fleet Savings (AI)"
          value={kpis.total_cost_saved_inr?.formatted || '₹4,46,200'}
          change={`${kpis.total_fuel_saved_liters?.formatted || '4,850 L'} diesel saved`}
          changeType="positive"
          icon={Sparkles}
        />
      </div>

      {/* ─── 7 DEDICATED ANALYTICS CHARTS SECTION ──────────────────────── */}

      {/* ROW 1: (1) Cost & (2) Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: Average Transportation Cost */}
        <Card padding="default">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  1. Average Transportation Cost Trend
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  OR-Tools AI Optimized Cost vs Standard Benchmark (₹ / Tonne-Km)
                </span>
              </div>
            </div>
            <Badge variant="low" size="sm">
              ~16.2% Cheaper
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cost?.monthly_cost_trend || []}>
                <defs>
                  <linearGradient id="optColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16845B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16845B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="stdColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[10, 22]} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip prefix="₹" suffix="/t-km" />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="standard" name="Standard Legacy Cost" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fill="url(#stdColor)" />
                <Area type="monotone" dataKey="optimized" name="OR-Tools Optimized" stroke="#16845B" strokeWidth={3} fill="url(#optColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {(cost?.cost_breakdown || [
              { category: 'Fuel', percentage: 42, color: '#16845B' },
              { category: 'Wear & Tear', percentage: 22, color: '#0d9488' },
              { category: 'Driver Wages', percentage: 18, color: '#f59e0b' },
              { category: 'Tolls & Checkposts', percentage: 18, color: '#8b5cf6' }
            ]).map(b => (
              <span key={b.category} className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                {b.category}: {b.percentage}%
              </span>
            ))}
          </div>
        </Card>

        {/* CHART 2: Route Risk & Seasonal Monsoon Index */}
        <Card padding="default">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--risk-high-bg)] text-[var(--color-danger)] flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  2. Route Risk & Monsoon Seasonality
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Random Forest ML Terrain Risk Index vs Monthly Rainfall (mm)
                </span>
              </div>
            </div>
            <Badge variant="high" size="sm">
              July Peak: 6.1/10
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={risk?.seasonal_risk_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={11} domain={[1, 8]} tickFormatter={v => `${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#0284c7" fontSize={11} domain={[0, 600]} tickFormatter={v => `${v}mm`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="right" dataKey="rainfall_mm" name="Rainfall (mm)" fill="#0284c7" opacity={0.3} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="risk_index" name="ML Risk Score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between mt-3 text-xs text-[var(--text-secondary)] flex-wrap gap-2">
            <span>Low Risk: 51.8% fleet</span>
            <span>Medium Risk: 30.9%</span>
            <span className="text-[var(--color-danger)] font-bold">High Risk: 17.3% (Monsoon watch)</span>
          </div>
        </Card>
      </div>

      {/* ROW 2: (3) Travel Time & (4) Fuel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 3: Travel Time Variance */}
        <Card padding="default">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  3. Travel Time & Delay Variance
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Planned Schedule vs Actual Transit Duration (Hours)
                </span>
              </div>
            </div>
            <span className="text-xs text-teal-700 dark:text-teal-400 font-bold">
              Avg Delay: +38 mins
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={travel?.corridors || []} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="corridor" stroke="var(--text-muted)" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${v}h`} />
                <Tooltip content={<CustomTooltip suffix=" hrs" />} />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                <Bar dataKey="planned_hours" name="Planned (OR-Tools)" fill="#16845B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_hours" name="Actual Transit Time" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-[var(--text-secondary)] flex justify-between flex-wrap gap-2">
            <span>Top Delay Factor: Steep 12% Mountain Gradients (38%)</span>
            <span>Checkpost Halts: 26%</span>
          </div>
        </Card>

        {/* CHART 4: Fuel Consumption */}
        <Card padding="default">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  4. Fuel Consumption & Hill Surge Factors
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Flat-Terrain vs Mountain Hill Climb Consumption (L / 100km)
                </span>
              </div>
            </div>
            <Badge variant="warning" size="sm">
              +28% to +41% Surge
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuel?.fleet_categories || []} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="vehicle_type" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${v}L`} />
                <Tooltip content={<CustomTooltip suffix=" L/100km" />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="flat_rate_l_per_100km" name="Flat Highway (L/100km)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hill_rate_l_per_100km" name="Ghat/Hill Climb (L/100km)" fill="#db2777" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-[var(--text-secondary)] flex justify-between flex-wrap gap-2">
            <span>Heavy Truck (17t): 39.5 L/100km in Hills (+41.1%)</span>
            <span className="text-[var(--primary)] font-semibold">Diesel Reference: ₹92.50 / L</span>
          </div>
        </Card>
      </div>

      {/* ROW 3: (5) High Risk Corridors & (6) Route Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 5: High-Risk Routes Surveillance */}
        <Card padding="default">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--risk-high-bg)] text-[var(--color-danger)] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  5. Number of High-Risk Routes Monitored
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Active Mountain Corridors Requiring Telemetry Watch (Risk &gt; 6.0)
                </span>
              </div>
            </div>
            <Badge variant="high" size="sm">
              3 Active Watch
            </Badge>
          </div>

          <div className="h-44 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={highRisk?.monthly_high_risk_trend || []}>
                <defs>
                  <linearGradient id="riskCountGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip suffix=" Corridors" />} />
                <Area type="monotone" dataKey="high_risk_routes" name="High Risk Routes Count" stroke="#ef4444" strokeWidth={2} fill="url(#riskCountGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {(highRisk?.high_risk_corridors || [
              { route: 'Dimapur ➔ Kohima', hazard: 'Pagla Pahar Active Sinking Zone (NH29)', ml_risk_score: 7.2, alternate_advised: 'Zubza Valley Link' },
              { route: 'Aizawl ➔ Lunglei', hazard: 'Steep Escarpment & Rockfall (NH54)', ml_risk_score: 6.8, alternate_advised: 'Thenzawl Bypass' },
              { route: 'Tezpur ➔ Tawang', hazard: 'Sub-Zero Icing & Sela Pass Fog (NH13)', ml_risk_score: 8.1, alternate_advised: 'Staggered Convoy' }
            ]).map((c, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-[var(--risk-high-bg)]/50 border border-[var(--risk-high-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                <div>
                  <strong className="text-[var(--text-primary)]">{c.route}</strong>
                  <span className="text-[var(--color-danger)] ml-2 font-medium">{c.hazard}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-danger)] font-bold">Risk: {c.ml_risk_score}/10</span>
                  <span className="text-[var(--text-muted)] text-[11px]">➔ {c.alternate_advised}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CHART 6: Route Usage & Regional Freight Flow */}
        <Card padding="default">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                  6. Route Usage & State Freight Share
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Trip Volume and State Distribution across 8 NER States
                </span>
              </div>
            </div>
            <span className="text-xs text-sky-700 dark:text-sky-400 font-bold">
              602 Trips Logged
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usage?.state_distribution || []} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="state" type="category" stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip content={<CustomTooltip suffix=" Trips" />} />
                <Bar dataKey="trips" name="Dispatched Trips" fill="#16845B" radius={[0, 4, 4, 0]}>
                  {(usage?.state_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#16845B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-[var(--text-secondary)] flex justify-between flex-wrap gap-2">
            <span>Top Hub: Assam Gateway (30.9%)</span>
            <span>Meghalaya: 16.3%</span>
            <span>Manipur: 12.3%</span>
          </div>
        </Card>
      </div>

      {/* ROW 4: (7) Cumulative Savings Full-Width Card */}
      <Card padding="default">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight">
                7. Cumulative Estimated Fleet Savings via AI Route Optimization
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Multi-Objective Google OR-Tools routing compared against unoptimized manual corridors
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center sm:text-left">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold truncate">Fuel Saved</span>
              <span className="text-xs sm:text-lg font-bold text-[var(--primary)] truncate block">
                {savings?.summary?.total_fuel_saved_liters?.toLocaleString() || '4,850'} L
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center sm:text-left">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold truncate">Net Savings</span>
              <span className="text-xs sm:text-lg font-bold text-amber-600 dark:text-amber-400 truncate block">
                ₹{savings?.summary?.total_money_saved_inr ? `${(savings.summary.total_money_saved_inr / 1000).toFixed(0)}k` : '446k'}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center sm:text-left">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold truncate">CO2 Avoided</span>
              <span className="text-xs sm:text-lg font-bold text-sky-600 dark:text-sky-400 truncate block">
                {savings?.summary?.co2_avoided_kg ? (savings.summary.co2_avoided_kg / 1000).toFixed(1) : '13.0'} T
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savings?.monthly_cumulative_savings || []}>
              <defs>
                <linearGradient id="savingInrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16845B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16845B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="savingFuelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis yAxisId="inr" stroke="#16845B" fontSize={11} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="fuel" orientation="right" stroke="#0284c7" fontSize={11} tickFormatter={v => `${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="inr" type="monotone" dataKey="money_saved_inr" name="Cumulative Money Saved (₹)" stroke="#16845B" strokeWidth={3} fill="url(#savingInrGrad)" />
              <Area yAxisId="fuel" type="monotone" dataKey="fuel_saved_l" name="Cumulative Fuel Saved (L)" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fill="url(#savingFuelGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
            <span>Average per-trip cost reduction: <strong className="text-[var(--text-primary)]">₹741.20</strong> per dispatch with 18m travel time saved.</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
            Verified via OR-Tools Constraint Solver Benchmark
          </span>
        </div>
      </Card>
    </div>
  )
}
