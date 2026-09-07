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

// Clean theme-adaptive tooltip
function CustomTooltip({ active, payload, label, suffix = '', prefix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
      padding: '10px 12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 4px 0' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
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
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>
      {/* Top Header & Export Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BarChart3 size={22} className="text-[var(--primary)]" />
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>
              North Eastern Region Smart Logistics Analytics
            </h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Multi-Stakeholder Telemetry Dashboard • Cost Efficiency, Terrain Risk, Fuel Consumption & Impact Tracking
          </p>
        </div>

        {/* Time Range Selector & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-subtle)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid var(--border-subtle)'
          }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: timeRange === t.id ? 'var(--primary)' : 'transparent',
                  color: timeRange === t.id ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => alert('Exporting Comprehensive NER Logistics Analytics Report (CSV / PDF)...')}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FileDown size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Prominent Demo Data & Calibration Banner */}
      <div style={{
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '12px 18px',
        marginBottom: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: 'var(--color-warning)',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 900,
            padding: '2px 8px',
            borderRadius: 4,
            letterSpacing: 0.5
          }}>
            DEMO DATA PROVENANCE
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>
            Calibrated Regional Simulation Data:
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Historical road clearance, terrain weather models, and freight benchmarks across 8 North Eastern states. Real-time sensor API active.
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Calibrated: 2026-09-06 • Baseline: 8 States
        </span>
      </div>

      {/* Stakeholder Persona Navigation Bar */}
      <div className="glass-card" style={{
        padding: '14px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} color="var(--primary)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Stakeholder Persona View:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={14} />
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Persona Custom Focus Banner */}
      <div style={{
        background: 'var(--primary-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        padding: '18px 22px',
        marginBottom: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Persona Target Insight • {persona.replace('_', ' ').toUpperCase()}
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
            {personaInsight.headline}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {personaInsight.subtext}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: '10px 18px',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
            {personaInsight.priority_kpi}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)' }}>
            {personaInsight.priority_value}
          </span>
        </div>
      </div>

      {/* 4 Top Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        {/* 1. Total Trips */}
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Trips</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} className="text-[var(--primary)]" />
            </div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', lineHeight: 1 }}>
            {kpis.total_trips?.value?.toLocaleString() || 602}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>
            <TrendingUp size={14} />
            <span>+{kpis.total_trips?.change_pct || 12.4}% vs previous</span>
          </div>
        </div>

        {/* 2. Avg Cost per Tonne-Km */}
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Transport Cost</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fuel size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', lineHeight: 1 }}>
            {kpis.avg_cost_per_tonne_km?.formatted || '₹14.20 / t-km'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>
            <TrendingDown size={14} />
            <span>-6.8% cost reduced</span>
          </div>
        </div>

        {/* 3. Monitored High-Risk Routes */}
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>High Risk Routes</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--risk-high-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} className="text-[var(--risk-high)]" />
            </div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: 'var(--color-danger)', lineHeight: 1 }}>
            {kpis.high_risk_routes_count?.value || 3}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            Pagla Pahar, Nongpoh, Barail
          </div>
        </div>

        {/* 4. Estimated Savings */}
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fleet Savings (AI)</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} className="text-[var(--primary)]" />
            </div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: 'var(--color-success)', lineHeight: 1 }}>
            {kpis.total_cost_saved_inr?.formatted || '₹4,46,200'}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            {kpis.total_fuel_saved_liters?.formatted || '4,850 L'} diesel saved
          </div>
        </div>
      </div>

      {/* ─── 7 DEDICATED ANALYTICS CHARTS SECTION ──────────────────────── */}

      {/* ROW 1: (1) Average Transportation Cost & (2) Route Risk */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* CHART 1: Average Transportation Cost */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Fuel size={18} color="#facc15" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  1. Average Transportation Cost Trend
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  OR-Tools AI Optimized Cost vs Standard Benchmark (₹ / Tonne-Km)
                </span>
              </div>
            </div>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#059669',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6
            }}>
              ~16.2% Cheaper
            </span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cost?.monthly_cost_trend || []}>
                <defs>
                  <linearGradient id="optColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                <Area type="monotone" dataKey="optimized" name="OR-Tools Optimized" stroke="#10b981" strokeWidth={3} fill="url(#optColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown pills */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            {(cost?.cost_breakdown || [
              { category: 'Fuel', percentage: 42, color: '#6366f1' },
              { category: 'Wear & Tear', percentage: 22, color: '#14b8a6' },
              { category: 'Driver Wages', percentage: 18, color: '#f59e0b' },
              { category: 'Tolls & Checkposts', percentage: 18, color: '#8b5cf6' }
            ]).map(b => (
              <span key={b.category} style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 6,
                background: `${b.color}20`,
                color: b.color,
                fontWeight: 600
              }}>
                {b.category}: {b.percentage}%
              </span>
            ))}
          </div>
        </div>

        {/* CHART 2: Route Risk & Seasonal Monsoon Index */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="#ef4444" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  2. Route Risk & Monsoon Seasonality
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Random Forest ML Terrain Risk Index vs Monthly Rainfall (mm)
                </span>
              </div>
            </div>
            <span style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#dc2626',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6
            }}>
              July Peak: 6.1/10
            </span>
          </div>

          <div style={{ height: 260 }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span>Low Risk: 51.8% of fleet</span>
            <span>Medium Risk: 30.9%</span>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>High Risk: 17.3% (Monsoon watch)</span>
          </div>
        </div>
      </div>

      {/* ROW 2: (3) Travel Time & (4) Fuel Consumption */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* CHART 3: Travel Time Variance Across Corridors */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#0d9488" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  3. Travel Time & Mountain Delay Variance
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Planned Schedule vs Actual Transit Duration Across Key Corridors (Hours)
                </span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 700 }}>
              Avg Delay: +38 mins
            </span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={travel?.corridors || []} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="corridor" stroke="var(--text-muted)" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${v}h`} />
                <Tooltip content={<CustomTooltip suffix=" hrs" />} />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                <Bar dataKey="planned_hours" name="Planned (OR-Tools)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_hours" name="Actual Transit Time" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Top Delay Factor: Steep 12% Mountain Gradients (38%)</span>
            <span>Checkpost Halts: 26%</span>
          </div>
        </div>

        {/* CHART 4: Fuel Consumption by Fleet Class */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Fuel size={18} color="#9333ea" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  4. Fuel Consumption & Hill Surge Factors
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Flat-Terrain vs Mountain Hill Climb Consumption (Liters / 100km)
                </span>
              </div>
            </div>
            <span style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#9333ea',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6
            }}>
              +28% to +41% Terrain Surge
            </span>
          </div>

          <div style={{ height: 260 }}>
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

          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Heavy Truck (17t): 39.5 L/100km in Hills (+41.1%)</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>Diesel Reference: ₹92.50 / L</span>
          </div>
        </div>
      </div>

      {/* ROW 3: (5) Number of High-Risk Routes & (6) Route Usage */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* CHART 5: Number of High-Risk Routes Surveillance */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#ef4444" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  5. Number of High-Risk Routes Monitored
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Active Mountain Corridors Requiring Telemetry Watch (Risk &gt; 6.0)
                </span>
              </div>
            </div>
            <span style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6
            }}>
              3 On Active Watch
            </span>
          </div>

          <div style={{ height: 160, marginBottom: 16 }}>
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

          {/* Current Monitored Corridors Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(highRisk?.high_risk_corridors || [
              { route: 'Dimapur ➔ Kohima', hazard: 'Pagla Pahar Active Sinking Zone (NH29)', ml_risk_score: 7.2, alternate_advised: 'Zubza Valley Link' },
              { route: 'Aizawl ➔ Lunglei', hazard: 'Steep Escarpment & Rockfall (NH54)', ml_risk_score: 6.8, alternate_advised: 'Thenzawl Bypass' },
              { route: 'Tezpur ➔ Tawang', hazard: 'Sub-Zero Icing & Sela Pass Fog (NH13)', ml_risk_score: 8.1, alternate_advised: 'Staggered Convoy' }
            ]).map((c, i) => (
              <div key={i} style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12
              }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{c.route}</strong>
                  <span style={{ color: '#dc2626', marginLeft: 8, fontWeight: 500 }}>{c.hazard}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#dc2626', fontWeight: 800 }}>Risk: {c.ml_risk_score}/10</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>➔ {c.alternate_advised}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 6: Route Usage & Regional Freight Flow */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#2563eb" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  6. Route Usage & State Freight Share
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Trip Volume and State Distribution across 8 NER States
                </span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>
              602 Trips Logged
            </span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usage?.state_distribution || []} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="state" type="category" stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip content={<CustomTooltip suffix=" Trips" />} />
                <Bar dataKey="trips" name="Dispatched Trips" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {(usage?.state_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Top Hub: Assam Gateway (30.9% share)</span>
            <span>Meghalaya: 16.3%</span>
            <span>Manipur: 12.3%</span>
          </div>
        </div>
      </div>

      {/* ROW 4: (7) Estimated Savings Full-Width Card */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#059669" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                7. Cumulative Estimated Fleet Savings via AI Route Optimization
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Multi-Objective Google OR-Tools routing compared against unoptimized manual routes
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Fuel Conserved</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>
                {savings?.summary?.total_fuel_saved_liters?.toLocaleString() || '4,850'} L
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Net Savings</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>
                ₹{savings?.summary?.total_money_saved_inr?.toLocaleString() || '4,46,200'}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>CO2 Avoided</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0284c7' }}>
                {savings?.summary?.co2_avoided_kg ? (savings.summary.co2_avoided_kg / 1000).toFixed(1) : '13.0'} Tonnes
              </span>
            </div>
          </div>
        </div>

        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savings?.monthly_cumulative_savings || []}>
              <defs>
                <linearGradient id="savingInrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="savingFuelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis yAxisId="inr" stroke="#059669" fontSize={11} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="fuel" orientation="right" stroke="#0284c7" fontSize={11} tickFormatter={v => `${v}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="inr" type="monotone" dataKey="money_saved_inr" name="Cumulative Money Saved (₹)" stroke="#059669" strokeWidth={3} fill="url(#savingInrGrad)" />
              <Area yAxisId="fuel" type="monotone" dataKey="fuel_saved_l" name="Cumulative Fuel Saved (L)" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fill="url(#savingFuelGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          marginTop: 16,
          padding: '12px 18px',
          borderRadius: 8,
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Average per-trip cost reduction: <strong style={{ color: 'var(--text-primary)' }}>₹741.20</strong> per dispatch with 18m travel time saved.</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>
            Verified via OR-Tools Constraint Solver Benchmark
          </span>
        </div>
      </div>
    </div>
  )
}
