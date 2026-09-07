import React, { useState, useEffect } from 'react'
import { Route, Navigation, Sparkles, MapPin, Compass } from 'lucide-react'
import RouteMap from '../components/map/RouteMap'
import RoutePlannerForm from '../components/routes/RoutePlannerForm'
import RouteResults from '../components/routes/RouteResults'
import RouteMonitoringPanel from '../components/alerts/RouteMonitoringPanel'
import routeService from '../services/routeService'
import { PageHeader, Card } from '../components/ui'

export default function RoutePlanning() {
  const [routeData, setRouteData] = useState(null)
  const [selectedAltId, setSelectedAltId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Interactive Route Planning"
        subtitle="Multi-objective path optimization across the North Eastern Region balancing mountain hazards, fuel economy, and bridge clearances."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Route Planning' }
        ]}
      />

      {/* Real-time Route Diversion Simulator Panel (Phase 12) */}
      <RouteMonitoringPanel
        source={routeData?.source?.name || 'Guwahati'}
        destination={routeData?.destination?.name || 'Shillong'}
        routeData={routeData}
        selectedAltId={selectedAltId}
        onSwitchToSaferRoute={(altId) => setSelectedAltId(altId || 'alt-1')}
        onRevertToPrimary={() => setSelectedAltId(null)}
      />

      {/* ─── PROFESSIONAL SPLIT LAYOUT (Section 8) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Route Planning Controls (5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <RoutePlannerForm
            onSubmit={handleCalculateRoute}
            loading={loading}
            error={error}
          />
        </div>

        {/* RIGHT COLUMN: Interactive GIS Map (7 of 12 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xs sticky top-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Carto Mountain GIS • Elevation & Segment Hazards
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span>Green: Primary</span>
                <span>•</span>
                <span>Amber/Red: Alternative</span>
              </div>
            </div>

            <div className="h-[520px] w-full relative">
              <RouteMap
                routeData={routeData}
                selectedAltId={selectedAltId}
                onSelectAlternative={setSelectedAltId}
                height="520px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── RESULTS & ALTERNATIVES COMPARISON SECTION ───────────────────── */}
      {routeData && (
        <div className="pt-4">
          <RouteResults
            routeData={routeData}
            selectedAltId={selectedAltId}
            onSelectAlternative={setSelectedAltId}
          />
        </div>
      )}
    </div>
  )
}
