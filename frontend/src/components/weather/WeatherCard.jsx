import { CloudRain, Wind, Eye, Thermometer, AlertTriangle, ShieldCheck, ShieldAlert, Droplets, Info } from 'lucide-react'

export default function WeatherCard({ weatherData }) {
  if (!weatherData) return null

  const {
    corridor_risk_level = 'LOW',
    corridor_risk_score = 0,
    summary = 'Atmospheric conditions across corridor',
    advisories = [],
    checkpoints = []
  } = weatherData

  // Risk styling configuration
  const riskStyles = {
    LOW: {
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.35)',
      text: '#22c55e',
      glow: '0 0 20px rgba(34, 197, 94, 0.2)',
      icon: ShieldCheck,
      badgeLabel: 'LOW RISK'
    },
    MEDIUM: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      text: '#f59e0b',
      glow: '0 0 20px rgba(245, 158, 11, 0.2)',
      icon: AlertTriangle,
      badgeLabel: 'MEDIUM RISK'
    },
    HIGH: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      text: '#ef4444',
      glow: '0 0 25px rgba(239, 68, 68, 0.25)',
      icon: ShieldAlert,
      badgeLabel: 'HIGH RISK'
    }
  }

  const currentRisk = riskStyles[corridor_risk_level] || riskStyles.LOW
  const RiskIcon = currentRisk.icon

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-xs mt-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-3.5 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
              Atmospheric Telemetry
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-xs text-[var(--text-muted)]">Real-Time Radar & AWS Feed</span>
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Corridor Weather & Disruption Analysis
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {summary}
          </p>
        </div>

        {/* Risk Score Pill & Bar */}
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs"
            style={{
              background: currentRisk.bg,
              border: `1px solid ${currentRisk.border}`,
              color: currentRisk.text,
            }}
          >
            <RiskIcon size={18} />
            <span>{currentRisk.badgeLabel}</span>
            <span className="opacity-80 text-[11px]">({corridor_risk_score}/100)</span>
          </div>
          <div className="w-36 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(10, corridor_risk_score))}%`,
                background: currentRisk.text,
              }}
            />
          </div>
        </div>
      </div>

      {/* Checkpoints Weather Grid */}
      {checkpoints.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-5">
          {checkpoints.map((cp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--bg-surface-subtle)]/60 border border-[var(--border-subtle)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {cp.location_name}
                </span>
                <span className={`
                  text-[11px] font-bold px-2 py-0.5 rounded-md
                  ${cp.risk.risk_level === 'HIGH' ? 'bg-[var(--risk-high-bg)] text-[var(--risk-high)] border border-[var(--risk-high-border)]' : cp.risk.risk_level === 'MEDIUM' ? 'bg-[var(--risk-med-bg)] text-[var(--risk-med)] border border-[var(--risk-med-border)]' : 'bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)]'}
                `}>
                  {cp.risk.risk_level}
                </span>
              </div>

              {/* Temperature & Condition */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {cp.temperature_c}°C
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {cp.condition}
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <div>
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                    <Droplets size={14} className="text-sky-500" /> Rain
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">
                    {cp.precipitation_mm} mm
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                    <Wind size={14} className="text-indigo-500" /> Wind
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">
                    {cp.wind_speed_kmh} km/h
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                    <Eye size={14} className="text-teal-500" /> Visibility
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">
                    {cp.visibility_km} km
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advisories List */}
      {advisories.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)]/70 border border-[var(--border-subtle)] mb-4">
          <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: currentRisk.text }} /> Operational Weather Advisories:
          </span>
          <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
            {advisories.map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Deterministic Rules Documentation Note */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
        <Info size={16} className="text-[var(--primary)] flex-shrink-0" />
        <span>
          <strong>Rule-based Deterministic Scoring:</strong> Evaluated using physical thresholds for Precipitation (&gt;1mm, &gt;5mm, &gt;15mm/h), Visibility (&lt;1km, &lt;4km, &lt;8km), and Wind Speeds.
        </span>
      </div>
    </div>
  )
}
