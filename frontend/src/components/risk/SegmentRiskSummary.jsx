import { AlertTriangle, ShieldCheck, ShieldAlert, Thermometer, CloudRain, Wind, Eye, Compass, TrendingUp } from 'lucide-react'

export default function SegmentRiskSummary({ riskSummary, segments = [] }) {
  if (!riskSummary && (!segments || segments.length === 0)) return null

  const overallRisk = riskSummary?.overall_risk || 'MEDIUM'
  const highestSeg = riskSummary?.highest_risk_segment
  const highRiskCount = riskSummary?.high_risk_segments_count ?? 0
  const avgScore = riskSummary?.average_risk_score ?? 40.0

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH':
        return '#ef4444' // Red
      case 'MEDIUM':
        return '#eab308' // Yellow
      case 'LOW':
      default:
        return '#22c55e' // Green
    }
  }

  const getRiskBg = (risk) => {
    switch (risk) {
      case 'HIGH':
        return 'rgba(239, 68, 68, 0.15)'
      case 'MEDIUM':
        return 'rgba(234, 179, 8, 0.15)'
      case 'LOW':
      default:
        return 'rgba(34, 197, 94, 0.15)'
    }
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-xs mt-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3.5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs" style={{ background: getRiskBg(overallRisk) }}>
            {overallRisk === 'HIGH' ? (
              <ShieldAlert size={22} color={getRiskColor(overallRisk)} />
            ) : (
              <ShieldCheck size={22} color={getRiskColor(overallRisk)} />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Route Risk Intelligence & Waypoint Segments
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Multi-point corridor risk calculated using Random Forest ML & real-time weather
            </p>
          </div>
        </div>

        {/* Map Color Legend */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            LOW
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            MEDIUM
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            HIGH
          </span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Metric 1: Overall Risk */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1.5">Overall Route Risk</div>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold"
              style={{
                background: getRiskBg(overallRisk),
                color: getRiskColor(overallRisk),
                border: `1px solid ${getRiskColor(overallRisk)}`,
              }}
            >
              {overallRisk} RISK
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2">
            Composite evaluation across sectors
          </div>
        </div>

        {/* Metric 2: Highest-Risk Segment */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1.5">Highest-Risk Sector</div>
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">
            {highestSeg ? highestSeg.name : 'None'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
            Score: <strong className="text-[var(--text-primary)]">{highestSeg?.risk_score ?? '--'}/100</strong> ({highestSeg?.risk ?? '--'})
          </div>
        </div>

        {/* Metric 3: Number of High-Risk Segments */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1.5">High-Risk Sectors</div>
          <div className="text-xl font-bold text-[var(--text-primary)]">
            <span style={{ color: highRiskCount > 0 ? '#ef4444' : '#10b981' }}>{highRiskCount}</span>
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ {segments.length} segments</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
            {highRiskCount > 0 ? 'Mandatory caution advised' : 'All sectors within safe thresholds'}
          </div>
        </div>

        {/* Metric 4: Average Risk Score */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1.5">Average Corridor Score</div>
          <div className="text-xl font-bold text-[var(--text-primary)]">
            {avgScore} <span className="text-xs font-normal text-[var(--text-muted)]">/ 100</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--border-subtle)] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, avgScore))}%`,
                background: avgScore >= 60 ? '#ef4444' : avgScore >= 35 ? '#eab308' : '#10b981',
              }}
            />
          </div>
        </div>
      </div>

      {/* Segment-by-Segment Waypoint Cards */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
        Corridor Waypoint Breakdown
      </h4>

      <div className="flex flex-col gap-2.5">
        {segments.map((seg, idx) => {
          const segColor = getRiskColor(seg.risk)
          const segBg = getRiskBg(seg.risk)

          return (
            <div
              key={seg.segment_id || idx}
              className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-surface-subtle)]/50 border border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-3"
            >
              {/* Left: Waypoint Node & Info */}
              <div className="flex items-center gap-3 min-w-[240px]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: segBg,
                    border: `2px solid ${segColor}`,
                    color: segColor,
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {seg.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {seg.start_node} ➔ {seg.end_node} • {seg.distance_km} km
                  </div>
                </div>
              </div>

              {/* Middle: Weather & Terrain Attributes */}
              <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Thermometer size={16} className="text-amber-500" />
                  <span>{seg.weather?.temperature_c}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CloudRain size={16} className="text-sky-500" />
                  <span>{seg.weather?.rainfall_mm} mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind size={16} className="text-indigo-500" />
                  <span>{seg.weather?.wind_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-teal-500" />
                  <span>{seg.weather?.visibility_km} km</span>
                </div>
                {seg.slope_degrees && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-amber-500" />
                    <span>Slope: {seg.slope_degrees}°</span>
                  </div>
                )}
              </div>

              {/* Right: Risk Badge & Score */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-[var(--text-muted)]">
                  Score: <strong className="text-[var(--text-primary)]">{seg.risk_score}/100</strong>
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                  style={{
                    background: segBg,
                    color: segColor,
                    border: `1px solid ${segColor}`,
                  }}
                >
                  {seg.risk}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
