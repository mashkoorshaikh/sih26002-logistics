import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, Maximize2, Compass, HeartPulse } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

// Custom sleek Leaflet markers
const createCustomIcon = (color, text) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        color: #ffffff;
        font-weight: 700;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid #ffffff;
      ">
        <span style="transform: rotate(45deg); display: block; margin-top: -1px;">${text}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  })
}

const createFacilityIcon = (category) => {
  let emoji = '🏢'
  let bg = '#16845B'
  if (category === 'hospital') {
    emoji = '🏥'
    bg = '#B91C1C'
  } else if (category === 'fuel_station') {
    emoji = '⛽'
    bg = '#B45309'
  } else if (category === 'warehouse') {
    emoji = '📦'
    bg = '#1D6FB8'
  } else if (category === 'repair_center') {
    emoji = '🔧'
    bg = '#2FA36F'
  } else if (category === 'emergency_service') {
    emoji = '🚑'
    bg = '#8B5CF6'
  }

  return L.divIcon({
    className: `custom-facility-${category}`,
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${bg};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        border: 1.5px solid #ffffff;
        cursor: pointer;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
}

const startIcon = createCustomIcon('#16845B', 'A')
const endIcon = createCustomIcon('#B91C1C', 'B')
const waypointIcon = L.divIcon({
  className: 'custom-waypoint-marker',
  html: `
    <div style="
      width: 10px;
      height: 10px;
      background: #2FA36F;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
})

// Auto-adjust bounds when route geometry changes
function MapBoundsController({ coordinates, sourceCoords, destCoords }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    map.invalidateSize()

    let points = []
    if (coordinates && coordinates.length > 0) {
      points = coordinates
    } else if (sourceCoords && destCoords) {
      points = [
        [sourceCoords.lat, sourceCoords.lon],
        [destCoords.lat, destCoords.lon]
      ]
    }

    if (points.length > 0) {
      try {
        const bounds = L.latLngBounds(points)
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true })
        }
      } catch (err) {
        console.warn('Map fitBounds error:', err)
      }
    }
  }, [map, coordinates, sourceCoords, destCoords])

  return null
}

export default function RouteMap({
  routeData,
  selectedAltId = null,
  onSelectAlternative = () => {},
  height = '500px'
}) {
  const mapRef = useRef(null)
  const { theme } = useThemeStore()

  // Default center: Guwahati / Meghalaya region (NER Hub)
  const defaultCenter = [25.9, 91.8]
  const defaultZoom = 8

  // Extract coordinates for primary route (GeoJSON [lon, lat] -> Leaflet [lat, lon])
  const primaryCoordinates = routeData?.geometry?.coordinates
    ? routeData.geometry.coordinates.map(c => [c[1], c[0]])
    : []

  // Extract source and destination points
  const sourcePoint = routeData?.source
    ? { lat: routeData.source.latitude, lon: routeData.source.longitude, name: routeData.source.name }
    : null

  const destPoint = routeData?.destination
    ? { lat: routeData.destination.latitude, lon: routeData.destination.longitude, name: routeData.destination.name }
    : null

  // Extract alternatives
  const alternatives = routeData?.alternatives || []
  const activeAlt = alternatives.find(a => a.id === selectedAltId)
  const nearbyFacilities = (activeAlt?.accessibility?.nearby_facilities || routeData?.accessibility?.nearby_facilities) || []
  const [showFacilities, setShowFacilities] = useState(true)

  const handleRecenter = () => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (primaryCoordinates.length > 0) {
      const bounds = L.latLngBounds(primaryCoordinates)
      map.fitBounds(bounds, { padding: [40, 40], animate: true })
    } else {
      map.setView(defaultCenter, defaultZoom)
    }
  }

  // Choose CartoDB tiles dynamically based on light/dark mode
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      style={{ height }}
    >
      {/* ─── MAP TOP LEFT INFO OVERLAY ─── */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] shadow-xs select-none pointer-events-auto">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">
          {routeData ? `${routeData.source.name} ➔ ${routeData.destination.name}` : 'NER Logistics GIS'}
        </span>
        {routeData && (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--primary-subtle)] text-[var(--primary)]">
            {routeData.distance_km} km
          </span>
        )}
      </div>

      {/* ─── MAP TOP RIGHT CONTROLS ─── */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto">
        {nearbyFacilities.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFacilities(prev => !prev)}
            title="Toggle Lifeline Infrastructure Facilities"
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-md transition-colors cursor-pointer shadow-xs select-none
              ${showFacilities
                ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)]/30'
                : 'bg-[var(--bg-surface)]/90 text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
              }
            `}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Facilities</span>
            <span>({nearbyFacilities.length})</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleRecenter}
          title="Reset map view"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer shadow-xs select-none"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* ─── MAP BOTTOM LEFT ROUTE LEGEND ─── */}
      {routeData && (
        <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1.5 p-2.5 rounded-lg bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] shadow-xs select-none pointer-events-auto max-w-[280px] sm:max-w-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-[var(--primary)] rounded-full flex-shrink-0" />
            <span className={`truncate font-medium ${selectedAltId ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-bold'}`}>
              Primary Route ({routeData.distance_km} km)
            </span>
          </div>

          {alternatives.map((alt) => {
            const isSelected = selectedAltId === alt.id
            return (
              <div
                key={alt.id}
                onClick={() => onSelectAlternative(isSelected ? null : alt.id)}
                className="flex items-center gap-2 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="w-4 h-1 border-t-2 border-dashed border-amber-500 flex-shrink-0" />
                <span className={`truncate ${isSelected ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                  {alt.name} (+{alt.difference_km} km) {isSelected ? '✓' : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── LEAFLET MAP CONTAINER ─── */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%', background: 'var(--bg-surface-subtle)' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Alternative Routes Polylines */}
        {alternatives.map(alt => {
          const altCoords = alt.geometry?.coordinates
            ? alt.geometry.coordinates.map(c => [c[1], c[0]])
            : []
          const isSelected = selectedAltId === alt.id

          return (
            <Polyline
              key={alt.id}
              positions={altCoords}
              pathOptions={{
                color: isSelected ? '#B45309' : '#D97706',
                weight: isSelected ? 5 : 3.5,
                opacity: isSelected ? 0.95 : 0.6,
                dashArray: isSelected ? null : '6, 8',
                lineJoin: 'round'
              }}
              eventHandlers={{
                click: () => onSelectAlternative(isSelected ? null : alt.id)
              }}
            >
              <Popup>
                <div className="p-1 text-xs text-[var(--text-primary)]">
                  <strong>{alt.name}</strong><br />
                  Distance: {alt.distance_km} km<br />
                  Duration: {alt.duration_text}<br />
                  <em>{isSelected ? 'Currently Selected' : 'Click to select this alternative'}</em>
                </div>
              </Popup>
            </Polyline>
          )
        })}

        {/* Primary Route Polylines */}
        {routeData?.segments && routeData.segments.length > 0 ? (
          routeData.segments.map((seg, sIdx) => {
            const segPoints = seg.coordinates.map(c => [c[1], c[0]])
            const segColor = seg.risk === 'HIGH' ? '#B91C1C' : seg.risk === 'MEDIUM' ? '#B45309' : '#16845B'

            return (
              <span key={seg.segment_id || sIdx}>
                <Polyline
                  positions={segPoints}
                  pathOptions={{
                    color: segColor,
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs text-[var(--text-primary)] min-w-[180px]">
                      <div className="font-bold mb-1">{seg.name}</div>
                      <div className="text-[11px] mb-2 font-semibold text-[var(--text-secondary)]">
                        {seg.risk} RISK ({seg.risk_score}/100) • {seg.distance_km} km
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-1 space-y-0.5">
                        <div>🌧️ Rain: {seg.weather?.rainfall_mm} mm</div>
                        <div>👁️ Visibility: {seg.weather?.visibility_km} km</div>
                        <div>💨 Wind: {seg.weather?.wind_speed_kmh} km/h</div>
                      </div>
                    </div>
                  </Popup>
                </Polyline>

                {sIdx > 0 && segPoints.length > 0 && (
                  <Marker position={segPoints[0]} icon={waypointIcon}>
                    <Popup>
                      <div className="p-1 text-xs text-[var(--text-primary)]">
                        <strong>Waypoint:</strong> {seg.start_node}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </span>
            )
          })
        ) : (
          primaryCoordinates.length > 0 && (
            <Polyline
              positions={primaryCoordinates}
              pathOptions={{
                color: '#16845B',
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            >
              <Popup>
                <div className="p-1 text-xs text-[var(--text-primary)]">
                  <strong>{routeData.summary || 'Primary National Highway'}</strong><br />
                  Distance: {routeData.distance_km} km • {routeData.duration_text}
                </div>
              </Popup>
            </Polyline>
          )
        )}

        {/* Start Point Marker (A) */}
        {sourcePoint && (
          <Marker position={[sourcePoint.lat, sourcePoint.lon]} icon={startIcon}>
            <Popup>
              <div className="p-1 text-xs text-[var(--text-primary)]">
                <strong className="text-[var(--primary)]">Origin (A):</strong> {sourcePoint.name}
              </div>
            </Popup>
          </Marker>
        )}

        {/* End Point Marker (B) */}
        {destPoint && (
          <Marker position={[destPoint.lat, destPoint.lon]} icon={endIcon}>
            <Popup>
              <div className="p-1 text-xs text-[var(--text-primary)]">
                <strong className="text-[var(--color-danger)]">Destination (B):</strong> {destPoint.name}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Lifeline Facilities */}
        {showFacilities && nearbyFacilities.map((fac, fIdx) => {
          if (!fac.latitude || !fac.longitude) return null
          return (
            <Marker
              key={fac.id || fIdx}
              position={[fac.latitude, fac.longitude]}
              icon={createFacilityIcon(fac.category || fac.type)}
            >
              <Popup>
                <div className="p-1 text-xs text-[var(--text-primary)]">
                  <div className="font-bold">{fac.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{fac.city} • {fac.distance_km} km away</div>
                  {fac.phone && <div className="text-[11px] text-[var(--primary)] font-semibold mt-1">📞 {fac.phone}</div>}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Auto Bounds Controller */}
        <MapBoundsController
          coordinates={primaryCoordinates}
          sourceCoords={sourcePoint}
          destCoords={destPoint}
        />
      </MapContainer>
    </div>
  )
}
