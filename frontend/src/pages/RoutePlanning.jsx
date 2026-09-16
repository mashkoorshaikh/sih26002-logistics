import React, { useState, useEffect } from 'react'
import { Route, Navigation, Sparkles, MapPin, Compass, CheckCircle2, ChevronDown, ChevronUp, Layers } from 'lucide-react'
import RouteMap from '../components/map/RouteMap'
import RoutePlannerForm from '../components/routes/RoutePlannerForm'
import RouteResults, { RecommendedRouteCard } from '../components/routes/RouteResults'
import RouteMonitoringPanel from '../components/alerts/RouteMonitoringPanel'
import routeService from '../services/routeService'
import { PageHeader, Card, Badge } from '../components/ui'

export default function RoutePlanning() {
  const [routeData, setRouteData] = useState(null)
  const [selectedAltId, setSelectedAltId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isMapExpandedMobile, setIsMapExpandedMobile] = useState(true)

  const handleCalculateRoute = async (params) => {
    setLoading(true)
    setError(null)
    try {
      const result = await routeService.calculateRoute(params)
      setRouteData(result)
      setSelectedAltId(null)
    } catch (err) {
      console.error('Route calculation error:', err)
      const detail = err.response?.data?.detail || err.message || 'Failed to compute route. Please verify locations.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  // Preload Guwahati to Shillong on initial mount
  useEffect(() => {
    handleCalculateRoute({
      source: 'Guwahati',
      destination: 'Shillong',
      vehicle_type: 'Truck',
      vehicle_weight: 10,
      cargo_type: 'Vegetables',
      cargo_weight: 5
    })
  }, [])

  const scrollToMap = () => {
    setIsMapExpandedMobile(true)
    const mapEl = document.getElementById('route-map-container')
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Interactive Route Planning"
        subtitle="Multi-objective path optimization across Northeast India balancing mountain hazards, fuel economy, and bridge clearances."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Route Planning' }
        ]}
      />

      {/* ─── CSS GRID WITH INTENTIONAL MOBILE SEQUENCING ─────────────────── */}
      {/* On desktop (>= lg): 2-column split (Form 5 cols, Sticky Map 7 cols, Results below). */}
      {/* On mobile (< lg): Pure single-column flow: Form -> Recommended Card -> Map -> Results -> Monitoring. */}
      {/* Preserves SINGLE LEAFLET MAP INSTANCE rule to avoid container reuse errors. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* 1. ROUTE PLANNER FORM: Order 1 on mobile, 5 cols on desktop */}
        <div className="order-1 lg:col-span-5 space-y-4">
          <RoutePlannerForm
            onSubmit={handleCalculateRoute}
            loading={loading}
            error={error}
          />
        </div>

        {/* 2. MOBILE-ONLY RECOMMENDED ROUTE CARD: Order 2 on mobile, Hidden on desktop */}
        {routeData && (
          <div className="order-2 lg:hidden">
            <RecommendedRouteCard
              routeData={routeData}
              selectedAltId={selectedAltId}
              onViewMap={scrollToMap}
              onSelectAlternative={setSelectedAltId}
            />
          </div>
        )}

        {/* 3. INTERACTIVE GIS MAP: Order 3 on mobile, 7 cols on desktop */}
        <div id="route-map-container" className="order-3 lg:col-span-7">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xs lg:sticky lg:top-20">
            {/* Map Header Bar with Mobile Collapse Toggle */}
            <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2 min-w-0">
                <Compass className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                  Carto Mountain GIS • Elevation & Hazards
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Route Legend */}
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Primary
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Alt
                  </span>
                </div>

                {/* Mobile Map Height Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMapExpandedMobile(prev => !prev)}
                  className="lg:hidden text-xs font-semibold px-2 py-1 rounded-md bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer select-none"
                  aria-label="Toggle map view height"
                >
                  <Layers className="w-3 h-3 text-[var(--primary)]" />
                  <span>{isMapExpandedMobile ? 'Collapse' : 'Expand'}</span>
                  {isMapExpandedMobile ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Responsive map container: dynamic height on mobile, 540px sticky on desktop */}
            <div
              className={`
                w-full relative transition-all duration-300
                ${isMapExpandedMobile ? 'h-[300px] sm:h-[400px]' : 'h-[160px] sm:h-[220px]'}
                lg:h-[540px]
              `}
            >
              <RouteMap
                routeData={routeData}
                selectedAltId={selectedAltId}
                onSelectAlternative={setSelectedAltId}
                height="100%"
              />
            </div>
          </div>
        </div>

        {/* 4. COMPREHENSIVE ROUTE RESULTS & ALTERNATIVES: Order 4 on mobile, Full-width 12 cols on desktop */}
        {routeData && (
          <div className="order-4 lg:col-span-12">
            <RouteResults
              routeData={routeData}
              selectedAltId={selectedAltId}
              onSelectAlternative={setSelectedAltId}
              hideRecommendedCardOnMobile={true}
              onViewMap={scrollToMap}
            />
          </div>
        )}

        {/* 5. TELEMETRY & ROUTE DIVERSION SIMULATOR: Order 5 on mobile, Full-width 12 cols on desktop */}
        <div className="order-5 lg:col-span-12">
          <RouteMonitoringPanel
            source={routeData?.source?.name || 'Guwahati'}
            destination={routeData?.destination?.name || 'Shillong'}
            routeData={routeData}
            selectedAltId={selectedAltId}
            onSwitchToSaferRoute={(altId) => setSelectedAltId(altId || 'alt-1')}
            onRevertToPrimary={() => setSelectedAltId(null)}
          />
        </div>

      </div>
    </div>
  )
}
