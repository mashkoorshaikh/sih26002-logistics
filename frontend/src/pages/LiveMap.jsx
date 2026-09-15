import React, { useState, useEffect } from 'react'
import {
  Map as MapIcon,
  Layers,
  Hospital,
  Fuel,
  Wrench,
  ShieldAlert,
  Compass,
  Navigation,
  RefreshCw,
  Maximize2
} from 'lucide-react'
import RouteMap from '../components/map/RouteMap'
import routeService from '../services/routeService'
import { Badge, Select } from '../components/ui'

const CORRIDORS = [
  { source: 'Guwahati', destination: 'Shillong', label: 'Guwahati ➔ Shillong (NH6)' },
  { source: 'Silchar', destination: 'Agartala', label: 'Silchar ➔ Agartala (NH8 / NH208)' },
  { source: 'Tezpur', destination: 'Itanagar', label: 'Tezpur ➔ Itanagar (NH15)' },
  { source: 'Dimapur', destination: 'Kohima', label: 'Dimapur ➔ Kohima (NH29)' }
]

export default function LiveMap() {
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0])
  const [routeData, setRouteData] = useState(null)
  const [selectedAltId, setSelectedAltId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Layer filter toggles
  const [layers, setLayers] = useState({
    hospitals: true,
    fuel: true,
    repairs: true,
    riskSegments: true,
  })

  useEffect(() => {
    let isMounted = true
    const fetchRoute = async () => {
      setLoading(true)
      try {
        const res = await routeService.calculateRoute({
          source: selectedCorridor.source,
          destination: selectedCorridor.destination,
          vehicle_type: 'Truck',
          vehicle_weight: 10,
          cargo_type: 'Vegetables',
          cargo_weight: 4
        })
        if (isMounted) {
          setRouteData(res)
          setSelectedAltId(null)
        }
      } catch (err) {
        console.warn('Live map route error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchRoute()
    return () => { isMounted = false }
  }, [selectedCorridor])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--bg-app)]">
      {/* Top Floating Controls Bar */}
      <div className="px-4 sm:px-6 py-3 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-3 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
              Live GIS Mountain Logistics Map
            </h2>
            <span className="text-[11px] text-[var(--text-muted)]">
              Leaflet Cartography • High-Altitude Satellite & Lifeline Telemetry
            </span>
          </div>
        </div>

        {/* Corridor Picker & Layers */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select
            value={selectedCorridor.source}
            onChange={e => {
              const match = CORRIDORS.find(c => c.source === e.target.value)
              if (match) setSelectedCorridor(match)
            }}
            className="h-8 px-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
          >
            {CORRIDORS.map(c => (
              <option key={c.source} value={c.source}>{c.label}</option>
            ))}
          </select>

          {/* Layer Filter Toggles */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
            <span className="text-[10px] text-[var(--text-muted)] font-bold px-1.5 hidden sm:inline">LAYERS:</span>
            <button
              type="button"
              onClick={() => setLayers(l => ({ ...l, hospitals: !l.hospitals }))}
              className={`
                text-[11px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer
                ${layers.hospitals
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                }
              `}
            >
              🏥 Hospitals
            </button>
            <button
              type="button"
              onClick={() => setLayers(l => ({ ...l, fuel: !l.fuel }))}
              className={`
                text-[11px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer
                ${layers.fuel
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                }
              `}
            >
              ⛽ Fuel
            </button>
            <button
              type="button"
              onClick={() => setLayers(l => ({ ...l, repairs: !l.repairs }))}
              className={`
                text-[11px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer
                ${layers.repairs
                  ? 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                }
              `}
            >
              🔧 Repairs
            </button>
          </div>
        </div>
      </div>

      {/* Main Fullscreen Map Container */}
      <div className="flex-1 relative w-full h-full min-h-0">
        <RouteMap
          routeData={routeData}
          selectedAltId={selectedAltId}
          onSelectAlternative={setSelectedAltId}
          height="100%"
        />

        {/* Floating Telemetry Badge */}
        {routeData && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs z-[1000] bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <strong className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {selectedAltId ? 'Alternative Bypass' : 'Active Primary Route'}
              </strong>
              <Badge variant="low" size="sm" dot>
                MONITORED
              </Badge>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
              <div>Distance: <strong className="text-[var(--text-primary)]">{selectedAltId ? routeData.alternatives?.find(a => a.id === selectedAltId)?.distance_km : routeData.distance_km} km</strong></div>
              <div>Transit Time: <strong className="text-[var(--text-primary)]">{selectedAltId ? routeData.alternatives?.find(a => a.id === selectedAltId)?.duration_text : routeData.duration_text}</strong></div>
              <div>Terrain ML Risk: <strong className="text-[var(--primary)]">LOW (Score: 22.5/100)</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
