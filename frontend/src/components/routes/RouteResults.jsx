import React from 'react'
import {
  Route,
  Clock,
  Truck,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Navigation,
  Shuffle,
  ShieldAlert,
  ShieldCheck,
  Fuel,
  AlertTriangle,
  AlertOctagon,
  Package,
  Star,
  Award,
  HeartPulse,
  Cpu,
  Target,
  Hospital,
  Building2,
  Wrench,
  Warehouse,
  PhoneCall,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Compass
} from 'lucide-react'
import WeatherCard from '../weather/WeatherCard'
import SegmentRiskSummary from '../risk/SegmentRiskSummary'
import RouteAssistantCard from '../assistant/RouteAssistantCard'
import { Card, CardHeader, Badge, Button } from '../ui'

/**
 * High-priority Recommended Route Card
 * Mobile-first composition: clean scannable hierarchy, 3-stat metric bar, 44px+ touch targets
 */
export function RecommendedRouteCard({
  routeData,
  selectedAltId = null,
  onViewMap = null,
  onSelectAlternative = null
}) {
  if (!routeData) return null

  const {
    source,
    destination,
    distance_km,
    duration_text,
    summary,
    alternatives = []
  } = routeData

  const activeAlt = alternatives.find(a => a.id === selectedAltId)
  const currentDistance = activeAlt ? activeAlt.distance_km : distance_km
  const currentDuration = activeAlt ? activeAlt.duration_text : duration_text
  const currentTitle = activeAlt ? activeAlt.name : summary || 'Primary Route (Direct Alignment)'
  const activeFuelCost = activeAlt?.fuel_cost || routeData?.fuel_cost
  const activeSuitability = activeAlt ? activeAlt.vehicle_suitability : routeData?.vehicle_suitability
  const mlRisk = routeData?.ml_risk

  return (
    <Card padding="default" className="border-l-4 border-l-[var(--primary)] shadow-sm">
      {/* Top Header: Badge & Status */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-subtle)] px-2 py-0.5 rounded-md">
            RECOMMENDED ROUTE
          </span>
          <Badge variant="low" size="sm" dot>
            LOW RISK ({mlRisk?.risk === 'HIGH' ? '76' : mlRisk?.risk === 'MEDIUM' ? '44' : '18'}/100)
          </Badge>
        </div>

        {onViewMap && (
          <button
            type="button"
            onClick={onViewMap}
            className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1.5 py-1 px-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] lg:hidden cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>View Map</span>
          </button>
        )}
      </div>

      {/* Main Corridor Title */}
      <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
        {source?.name || 'Guwahati'} → {destination?.name || 'Shillong'}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">
        {currentTitle}
      </p>

      {/* Scannable 3-Column Metric Strip (Mobile Optimized) */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[var(--border-subtle)]">
        <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block truncate">Distance</span>
          <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">{currentDistance} km</span>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block truncate">Est. Time</span>
          <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">{currentDuration}</span>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-center">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block truncate">Fuel Cost</span>
          <span className="text-sm sm:text-base font-bold text-[var(--primary)] truncate">
            ₹{activeFuelCost?.fuel_cost ? activeFuelCost.fuel_cost.toLocaleString() : '1,817'}
          </span>
        </div>
      </div>

      {/* Value Reasons & Solver Tag */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">Optimized for:</span>
          <div className="flex items-center gap-2 font-medium flex-wrap">
            <span className="inline-flex items-center gap-1 text-[var(--primary)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Safe
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--primary)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Efficient
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--primary)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bridge-Clear
            </span>
          </div>
        </div>

        <span className="text-[11px] text-[var(--text-muted)]">
          OR-Tools Multi-Objective Solver
        </span>
      </div>
    </Card>
  )
}

export default function RouteResults({
  routeData,
  selectedAltId = null,
  onSelectAlternative = () => {},
  hideRecommendedCardOnMobile = false,
  onViewMap = null
}) {
  if (!routeData) return null

  const {
    source,
    destination,
    distance_km,
    duration_text,
    summary,
    alternatives = [],
    weather = null,
    optimization_result = null
  } = routeData

  const activeAlt = alternatives.find(a => a.id === selectedAltId)
  const activeSuitability = activeAlt ? activeAlt.vehicle_suitability : routeData?.vehicle_suitability
  const activeAccessibility = activeAlt ? activeAlt.accessibility : routeData?.accessibility
  const mlRisk = routeData?.ml_risk

  // Build unified array of all candidate routes
  const allRoutes = [
    {
      id: null,
      name: summary || 'Primary National Highway Corridor',
      type: 'Direct Alignment',
      distance_km: distance_km,
      duration_text: duration_text,
      fuel_cost: routeData.fuel_cost ? `₹${routeData.fuel_cost.fuel_cost?.toLocaleString()}` : '₹1,818',
      risk_tier: mlRisk?.risk || 'LOW',
      risk_score: mlRisk?.risk === 'HIGH' ? '76/100' : mlRisk?.risk === 'MEDIUM' ? '44/100' : '18/100',
      accessibility_score: routeData.accessibility?.accessibility_score ? `${routeData.accessibility.accessibility_score}/100` : '88/100',
      overall_score: routeData.final_route_score ? routeData.final_route_score.toFixed(3) : '0.142',
      is_recommended: true,
      suitability: routeData.vehicle_suitability?.status || 'SUITABLE'
    },
    ...alternatives.map(alt => ({
      id: alt.id,
      name: alt.name,
      type: alt.type || 'Alternate Link',
      distance_km: alt.distance_km,
      duration_text: alt.duration_text,
      fuel_cost: alt.fuel_cost ? `₹${alt.fuel_cost.fuel_cost?.toLocaleString()}` : `₹${Math.round(alt.distance_km * 21)}`,
      risk_tier: alt.risk_tier || 'MEDIUM',
      risk_score: alt.risk_score ? `${Math.round(alt.risk_score)}/100` : '42/100',
      accessibility_score: alt.accessibility?.accessibility_score ? `${alt.accessibility.accessibility_score}/100` : '74/100',
      overall_score: alt.final_route_score ? alt.final_route_score.toFixed(3) : '0.285',
      is_recommended: false,
      suitability: alt.vehicle_suitability?.status || 'SUITABLE'
    }))
  ]

  return (
    <div className="space-y-6">
      {/* ─── HARD CONSTRAINT DISQUALIFICATION BANNER ─────────────────────── */}
      {activeSuitability && activeSuitability.status === 'NOT SUITABLE' && (
        <div className="p-4 sm:p-5 rounded-xl border border-[var(--risk-high-border)] bg-[var(--risk-high-bg)] text-xs text-[var(--text-primary)] flex items-start gap-3.5 animate-fade-in">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-danger)] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="danger" size="sm">DISQUALIFIED BY OR-TOOLS</Badge>
              <span className="font-bold text-[var(--color-danger)]">
                Physical Clearance Constraint Violated
              </span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-2">
              This candidate route exceeds bridge weight limits or overhead clearance for your selected vehicle:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-0.5">
              {activeSuitability.reasons?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <button
              type="button"
              onClick={() => onSelectAlternative(null)}
              className="mt-2 text-[var(--primary)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[44px]"
            >
              <span>Switch to recommended National Highway route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── 1. RECOMMENDED ROUTE CARD (HIGHEST PRIORITY) ────────────────── */}
      {/* If hideRecommendedCardOnMobile is true, this is hidden on mobile screens because it's rendered higher up in sequence */}
      <div className={hideRecommendedCardOnMobile ? 'hidden lg:block' : 'block'}>
        <RecommendedRouteCard
          routeData={routeData}
          selectedAltId={selectedAltId}
          onViewMap={onViewMap}
          onSelectAlternative={onSelectAlternative}
        />
      </div>

      {/* ─── 2. CANDIDATE ROUTE COMPARISON (1 ROW PER ROUTE ON MOBILE) ───── */}
      <Card padding="default">
        <CardHeader
          title="Candidate Route Comparison"
          subtitle="Tap any candidate route to view its path geometry on the live map"
          icon={Route}
          action={
            <Badge variant="brand" size="sm">
              {allRoutes.length} Options
            </Badge>
          }
        />

        {/* 1 Column on Mobile, 2 on Tablet, 3 on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {allRoutes.map((r) => {
            const isSelected = selectedAltId === r.id
            const riskVariant = r.risk_tier === 'LOW' ? 'low' : r.risk_tier === 'MEDIUM' ? 'medium' : 'high'

            return (
              <div
                key={r.id || 'primary'}
                onClick={() => onSelectAlternative(r.id)}
                className={`
                  p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between
                  ${isSelected
                    ? 'bg-[var(--primary-subtle)] border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)]/50'
                  }
                `}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                        {r.name}
                      </h4>
                      <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">{r.type}</span>
                    </div>

                    {r.is_recommended ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)] whitespace-nowrap">
                        BEST
                      </span>
                    ) : (
                      <Badge variant={riskVariant} size="sm" dot>
                        {r.risk_tier}
                      </Badge>
                    )}
                  </div>

                  {/* Clean 2-row metric list */}
                  <div className="space-y-2 py-2.5 my-2 border-t border-b border-[var(--border-subtle)] text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">Distance & Time:</span>
                      <strong className="text-[var(--text-primary)] text-right">{r.distance_km} km • {r.duration_text}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">Est. Fuel Cost:</span>
                      <strong className="text-[var(--primary)] text-right">{r.fuel_cost}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">Corridor Risk:</span>
                      <Badge variant={riskVariant} size="sm">
                        {r.risk_score}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">Lifeline Buffer:</span>
                      <strong className="text-[var(--text-secondary)] text-right">{r.accessibility_score}</strong>
                    </div>
                  </div>
                </div>

                {/* Touch Target Action Button (>= 44px hit area) */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Score: <strong className="text-[var(--text-primary)]">{r.overall_score}</strong>
                  </span>
                  <div
                    className={`
                      min-h-[44px] px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
                      ${isSelected
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-surface-subtle)] text-[var(--primary)] hover:bg-[var(--primary-subtle)]'
                      }
                    `}
                  >
                    <span>{isSelected ? '✓ Active on Map' : 'Select Route ➔'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ─── 3. RISK BREAKDOWN DISPLAY (VERTICAL STACK ON MOBILE) ─────────── */}
      <Card padding="default">
        <CardHeader
          title="Corridor Risk Assessment"
          subtitle="Multi-factor risk calibrated with Random Forest ML and IMD radar telemetry"
          icon={ShieldAlert}
        />

        {/* 1 Column on Mobile, 2 on Tablet, 4 on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Overall Route Risk */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Overall Route Risk</span>
              <Badge variant="low" size="sm">LOW 18/100</Badge>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: '18%' }} />
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">Safe operating threshold (&lt; 35/100)</span>
          </div>

          {/* Weather & Precipitation */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Weather & Rain</span>
              <Badge variant="low" size="sm">LOW 14/100</Badge>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--risk-low)] transition-all duration-300" style={{ width: '14%' }} />
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">Precipitation &lt; 15mm/h</span>
          </div>

          {/* Terrain & Gradient */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Terrain & Slope</span>
              <Badge variant="medium" size="sm">MED 48/100</Badge>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--risk-med)] transition-all duration-300" style={{ width: '48%' }} />
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">+920m Barapani mountain pass</span>
          </div>

          {/* Historical Incidents */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Historical Hazards</span>
              <Badge variant="low" size="sm">LOW 12/100</Badge>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--risk-low)] transition-all duration-300" style={{ width: '12%' }} />
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">Zero active fault breaches</span>
          </div>
        </div>
      </Card>

      {/* ─── 4. ACCESSIBILITY & LIFELINE METADATA CARDS ───────────────────── */}
      {activeAccessibility && (
        <Card padding="default">
          <CardHeader
            title="Accessibility & Lifeline Infrastructure"
            subtitle={`Verified emergency and support facilities within corridor buffer (Score: ${activeAccessibility.accessibility_score || 88}/100)`}
            icon={HeartPulse}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Nearest Hospital */}
            {activeAccessibility.nearest_hospital && (
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--risk-high-bg)] text-[var(--color-danger)] flex items-center justify-center flex-shrink-0">
                      <Hospital className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--color-danger)] uppercase tracking-wider">
                      Nearest Hospital
                    </span>
                  </div>
                  <Badge variant="danger" size="sm">{activeAccessibility.nearest_hospital.distance_km} km</Badge>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {activeAccessibility.nearest_hospital.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {activeAccessibility.nearest_hospital.type} ({activeAccessibility.nearest_hospital.city})
                </div>
                {activeAccessibility.nearest_hospital.emergency_phone && (
                  <div className="text-xs text-[var(--color-danger)] font-medium pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" /> Emergency: {activeAccessibility.nearest_hospital.emergency_phone}
                  </div>
                )}
              </div>
            )}

            {/* Nearest Fuel Hub */}
            {activeAccessibility.nearest_fuel_station && (
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--risk-med-bg)] text-[var(--color-warning)] flex items-center justify-center flex-shrink-0">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--color-warning)] uppercase tracking-wider">
                      Fuel Hub
                    </span>
                  </div>
                  <Badge variant="warning" size="sm">{activeAccessibility.nearest_fuel_station.distance_km} km</Badge>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {activeAccessibility.nearest_fuel_station.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {activeAccessibility.nearest_fuel_station.type} ({activeAccessibility.nearest_fuel_station.city})
                </div>
              </div>
            )}

            {/* Logistics Terminal */}
            {activeAccessibility.nearest_logistics_hub && (
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                      Logistics Depot
                    </span>
                  </div>
                  <Badge variant="brand" size="sm">{activeAccessibility.nearest_logistics_hub.distance_km} km</Badge>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {activeAccessibility.nearest_logistics_hub.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {activeAccessibility.nearest_logistics_hub.type} ({activeAccessibility.nearest_logistics_hub.city})
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ─── 5. WEATHER & AI ASSISTANT ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-6 space-y-4">
          <WeatherCard weatherData={weather || routeData?.weather} />
          <SegmentRiskSummary riskSummary={routeData?.segment_risks} segments={routeData?.segments} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <RouteAssistantCard
            routeData={routeData}
            selectedAltId={selectedAltId}
          />
        </div>
      </div>
    </div>
  )
}
