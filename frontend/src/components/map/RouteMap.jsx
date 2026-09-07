import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, Maximize2, Compass, HeartPulse } from 'lucide-react'

// Custom sleek glowing SVG DivIcons for Leaflet
const createCustomIcon = (color, text, glowColor) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        color: #ffffff;
        font-weight: 800;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 0 16px ${glowColor || color}80, 0 4px 10px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
      ">
        <span style="transform: rotate(45deg); display: block; margin-top: -2px;">${text}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  })
}

const createFacilityIcon = (category) => {
  let emoji = '🏢'
  let bg = '#6366f1'
  if (category === 'hospital') {
    emoji = '🏥'
    bg = '#f43f5e'
  } else if (category === 'fuel_station') {
    emoji = '⛽'
    bg = '#eab308'
  } else if (category === 'warehouse') {
    emoji = '📦'
    bg = '#3b82f6'
  } else if (category === 'repair_center') {
    emoji = '🔧'
    bg = '#14b8a6'
  } else if (category === 'emergency_service') {
    emoji = '🚑'
    bg = '#a855f7'
  }

  return L.divIcon({
    className: `custom-facility-${category}`,
    html: `
      <div style="
        width: 26px;
        height: 26px;
        background: ${bg};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        box-shadow: 0 0 10px ${bg}90, 0 2px 6px rgba(0,0,0,0.6);
        border: 2px solid #ffffff;
        cursor: pointer;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  })
}

const startIcon = createCustomIcon('#10b981', 'A', '#10b981')
const endIcon = createCustomIcon('#ef4444', 'B', '#ef4444')
const waypointIcon = L.divIcon({
  className: 'custom-waypoint-marker',
  html: `
    <div style="
      width: 12px;
      height: 12px;
      background: #38bdf8;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 8px #38bdf8;
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

// Auto-adjust bounds when route geometry or endpoints change
function MapBoundsController({ coordinates, sourceCoords, destCoords }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    map.invalidateSize()

    let points = []
    if (coordinates && coordinates.length > 0) {
      // coordinates are already passed as [lat, lon] pairs from RouteMap
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
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13, animate: true })
        }
      } catch (err) {
        console.warn('Map fitBounds calculation error:', err)
      }
    }
  }, [map, coordinates, sourceCoords, destCoords])

  return null
}

export default function RouteMap({
  routeData,
  selectedAltId = null,
  onSelectAlternative = () => {},
  height = '480px'
}) {
  const mapRef = useRef(null)

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
      map.fitBounds(bounds, { padding: [45, 45], animate: true })
    } else {
      map.setView(defaultCenter, defaultZoom)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Map Header Overlay */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        color: '#f8fafc',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }}>
        <Navigation size={14} color="#6366f1" />
        <span style={{ fontWeight: 600 }}>
          {routeData ? `${routeData.source.name} ➔ ${routeData.destination.name}` : 'NER Regional Freight Map'}
        </span>
        {routeData && (
          <span style={{
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700
          }}>
            {routeData.distance_km} km
          </span>
        )}
      </div>

      {/* Recenter & Map Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 1000,
        display: 'flex',
        gap: 8
      }}>
        {/* Toggle Infrastructure Facilities */}
        {nearbyFacilities.length > 0 && (
          <button
            onClick={() => setShowFacilities(prev => !prev)}
            title="Toggle Lifeline Infrastructure Facilities"
            style={{
              background: showFacilities ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${showFacilities ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 8,
              color: showFacilities ? '#93c5fd' : '#94a3b8',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <HeartPulse size={14} color={showFacilities ? '#60a5fa' : '#94a3b8'} />
            Facilities ({nearbyFacilities.length})
          </button>
        )}

        <button
          onClick={handleRecenter}
          title="Reset map view"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#94a3b8',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#6366f1' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          <Compass size={14} /> Recenter
        </button>
      </div>

      {/* Route Legend Overlay */}
      {routeData && (
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 12,
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 4, background: '#6366f1', borderRadius: 2 }}></span>
            <span style={{ fontWeight: selectedAltId ? 400 : 700, color: selectedAltId ? '#94a3b8' : '#f8fafc' }}>
              Primary Route ({routeData.distance_km} km • {routeData.duration_text})
            </span>
          </div>
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              onClick={() => onSelectAlternative(alt.id === selectedAltId ? null : alt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                opacity: selectedAltId === alt.id ? 1 : 0.75,
                transition: 'opacity 0.2s'
              }}
            >
              <span style={{ width: 18, height: 3, borderTop: '3px dashed #f59e0b' }}></span>
              <span style={{ fontWeight: selectedAltId === alt.id ? 700 : 400, color: selectedAltId === alt.id ? '#fbbf24' : '#94a3b8' }}>
                {alt.name} (+{alt.difference_km} km) {selectedAltId === alt.id ? '✓ Selected' : '(Click to view)'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%', background: '#090d16' }}
        ref={mapRef}
        zoomControl={false}
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Alternative Routes Polylines (Rendered under primary route) */}
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
                color: isSelected ? '#fbbf24' : '#f59e0b',
                weight: isSelected ? 6 : 4,
                opacity: isSelected ? 0.95 : 0.65,
                dashArray: isSelected ? null : '6, 8',
                lineJoin: 'round'
              }}
              eventHandlers={{
                click: () => onSelectAlternative(isSelected ? null : alt.id)
              }}
            >
              <Popup>
                <div style={{ color: '#0f172a', fontSize: 13 }}>
                  <strong>{alt.name}</strong><br />
                  Distance: {alt.distance_km} km<br />
                  Est. Time: {alt.duration_text}<br />
                  <em>{isSelected ? 'Currently Selected' : 'Click to select this alternative route'}</em>
                </div>
              </Popup>
            </Polyline>
          )
        })}

        {/* Primary Route Polylines: Segment-by-segment Risk Color Coding */}
        {routeData?.segments && routeData.segments.length > 0 ? (
          routeData.segments.map((seg, sIdx) => {
            const segPoints = seg.coordinates.map(c => [c[1], c[0]])
            const segColor = seg.color || '#22c55e'

            return (
              <span key={seg.segment_id || sIdx}>
                {/* Glow layer */}
                <Polyline
                  positions={segPoints}
                  pathOptions={{
                    color: segColor,
                    weight: 8,
                    opacity: 0.35,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
                {/* Core colored segment line: GREEN=LOW, YELLOW=MEDIUM, RED=HIGH */}
                <Polyline
                  positions={segPoints}
                  pathOptions={{
                    color: segColor,
                    weight: 5,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', fontSize: 13, minWidth: 200, padding: 2 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>
                        {seg.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: segColor === '#ef4444' ? '#fee2e2' : segColor === '#eab308' ? '#fef9c3' : '#dcfce7',
                          color: segColor === '#ef4444' ? '#b91c1c' : segColor === '#eab308' ? '#a16207' : '#15803d'
                        }}>
                          {seg.risk} RISK ({seg.risk_score}/100)
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{seg.distance_km} km</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                        <div>🌧️ <strong>Rainfall:</strong> {seg.weather?.rainfall_mm} mm</div>
                        <div>👁️ <strong>Visibility:</strong> {seg.weather?.visibility_km} km</div>
                        <div>💨 <strong>Wind:</strong> {seg.weather?.wind_speed_kmh} km/h</div>
                        <div>🌡️ <strong>Temp:</strong> {seg.weather?.temperature_c}°C</div>
                        {seg.slope_degrees && <div>⛰️ <strong>Slope:</strong> {seg.slope_degrees}°</div>}
                      </div>
                    </div>
                  </Popup>
                </Polyline>

                {/* Waypoint milestone marker between segments */}
                {sIdx > 0 && segPoints.length > 0 && (
                  <Marker position={segPoints[0]} icon={waypointIcon}>
                    <Popup>
                      <div style={{ color: '#0f172a', fontSize: 12 }}>
                        <strong>Waypoint Milestone:</strong> {seg.start_node}<br />
                        Segment Transition Point
                      </div>
                    </Popup>
                  </Marker>
                )}
              </span>
            )
          })
        ) : (
          primaryCoordinates.length > 0 && (
            <>
              {/* Glow / Outline effect */}
              <Polyline
                positions={primaryCoordinates}
                pathOptions={{
                  color: '#4f46e5',
                  weight: selectedAltId ? 5 : 8,
                  opacity: selectedAltId ? 0.3 : 0.35,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Core Route Line */}
              <Polyline
                positions={primaryCoordinates}
                pathOptions={{
                  color: selectedAltId ? '#64748b' : '#6366f1',
                  weight: selectedAltId ? 4 : 5,
                  opacity: selectedAltId ? 0.6 : 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontSize: 13 }}>
                    <strong>Primary Logistics Corridor</strong><br />
                    Distance: {routeData?.distance_km} km<br />
                    Est. Travel Time: {routeData?.duration_text}<br />
                    Gross Weight: {routeData?.vehicle_info?.gross_weight_tonnes} tonnes
                  </div>
                </Popup>
              </Polyline>
            </>
          )
        )}

        {/* Source Marker */}
        {sourcePoint && (
          <Marker position={[sourcePoint.lat, sourcePoint.lon]} icon={startIcon}>
            <Popup>
              <div style={{ color: '#0f172a', fontSize: 13 }}>
                <span style={{ color: '#10b981', fontWeight: 800 }}>SOURCE ORIGIN</span><br />
                <strong>{sourcePoint.name}</strong><br />
                Coordinates: {sourcePoint.lat.toFixed(4)}, {sourcePoint.lon.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destPoint && (
          <Marker position={[destPoint.lat, destPoint.lon]} icon={endIcon}>
            <Popup>
              <div style={{ color: '#0f172a', fontSize: 13 }}>
                <span style={{ color: '#ef4444', fontWeight: 800 }}>DESTINATION TERMINAL</span><br />
                <strong>{destPoint.name}</strong><br />
                Coordinates: {destPoint.lat.toFixed(4)}, {destPoint.lon.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Lifeline Infrastructure Markers (Phase 10: Accessibility Intelligence) */}
        {showFacilities && nearbyFacilities.map(fac => {
          if (!fac.latitude || !fac.longitude) return null
          return (
            <Marker
              key={fac.id}
              position={[fac.latitude, fac.longitude]}
              icon={createFacilityIcon(fac.category)}
            >
              <Popup>
                <div style={{ color: '#0f172a', fontSize: 12, minWidth: 180 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
                    {fac.name}
                  </div>
                  <div style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>
                    {fac.type} ({fac.city || 'Corridor'})
                  </div>
                  <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                    📍 {fac.distance_km} km off corridor
                  </div>
                  <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>
                    ✓ {fac.data_source === 'REAL_OVERPASS_API' ? 'Live OpenStreetMap Node' : 'Verified Public Registry'}
                  </div>
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
