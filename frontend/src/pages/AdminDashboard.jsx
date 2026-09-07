import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  MapPin,
  Filter,
  Layers,
  Truck,
  AlertTriangle,
  Clock,
  Compass,
  FileText,
  Activity,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Maximize2,
  Download,
  Globe,
  FileJson,
  Copy,
  Check,
  Mountain,
  CloudRain,
  Waves,
  Network,
  X,
  Shield
} from 'lucide-react'
import adminService from '../services/adminService'

// Custom sleek Leaflet markers
const createHubIcon = (hasColdStorage) => L.divIcon({
  className: 'custom-hub-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #3b82f6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 0 14px rgba(59, 130, 246, 0.7);
      border: 2px solid #ffffff;
      color: #ffffff;
    ">
      🏢
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
})

const createHazardIcon = (severity) => L.divIcon({
  className: 'custom-hazard-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.9);
      border: 2px solid #ffffff;
      animation: pulse 1.5s infinite;
    ">
      ⚠️
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
})

// Auto-adjust bounds when route list changes
function AdminMapBoundsController({ routes }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !routes || routes.length === 0) return
    map.invalidateSize()
    const allCoords = []
    routes.forEach(r => {
      if (r.coordinates && r.coordinates.length > 0) {
        allCoords.push(...r.coordinates)
      }
    })
    if (allCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoords)
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10, animate: true })
        }
      } catch (err) {
        console.warn('Map bounds fit error:', err)
      }
    }
  }, [map, routes])
  return null
}

const NER_STATES = [
  'ALL',
  'Assam',
  'Meghalaya',
  'Manipur',
  'Nagaland',
  'Tripura',
  'Mizoram',
  'Arunachal Pradesh',
  'Sikkim'
]

const STATE_DISTRICTS = {
  'Assam': ['ALL', 'Kamrup Metropolitan', 'Cachar', 'Sonitpur', 'Dima Hasao', 'Dibrugarh', 'Nagaon'],
  'Meghalaya': ['ALL', 'East Khasi Hills', 'Ri-Bhoi', 'West Garo Hills', 'West Jaintia Hills'],
  'Nagaland': ['ALL', 'Dimapur', 'Kohima', 'Mokokchung', 'Phek'],
  'Manipur': ['ALL', 'Imphal West', 'Imphal East', 'Churachandpur'],
  'Tripura': ['ALL', 'West Tripura', 'North Tripura', 'Dharmanagar'],
  'Mizoram': ['ALL', 'Aizawl', 'Lunglei', 'Champhai'],
  'Arunachal Pradesh': ['ALL', 'Papum Pare', 'Tawang', 'West Kameng', 'Pasighat'],
  'Sikkim': ['ALL', 'East Sikkim', 'South Sikkim', 'West Sikkim']
}

const DEFAULT_NER_CHALLENGES = [
  {
    id: "ch-terrain",
    title: "Mountainous Terrain & Gradient Constraints",
    category: "Topography",
    icon: "Mountain",
    severity_level: "SEVERE",
    description: "High altitude mountain passes and sharp escarpments characterize over 70% of the NER landmass. Steep road gradients (frequently exceeding 8% to 14%) and hairpin turns limit heavy axle vehicle passage, causing severe engine strain, brake overheating, and stringent gross vehicle weight (GVW) restrictions (often capped at 10 to 12 tonnes).",
    impact_on_logistics: "35% to 45% lower fuel efficiency, heavy brake wear, load splitting required at transshipment foothill points, and transit speeds constrained to 20-30 km/h.",
    mitigation_strategy: "OR-Tools payload and gradient-aware dispatching; hill-rate fuel surcharging; prioritizing multi-axle trailers only on widened four-lane corridors.",
    sample_affected_areas: ["Patkai Range (Nagaland/Arunachal)", "Khasi & Jaintia Hills (Meghalaya)", "Lushai Hills (Mizoram)", "Sikkim Himalayan Ridges"]
  },
  {
    id: "ch-rainfall",
    title: "Extreme Monsoon Rainfall & Precipitation Belts",
    category: "Meteorology",
    icon: "CloudRain",
    severity_level: "HIGH",
    description: "The North Eastern Region receives some of the highest precipitation on earth (Cherrapunji/Mawsynram belt exceeds 11,000 mm annually). Extended monsoon seasons lasting from May through October continuously saturate hill slopes and deteriorate asphalt subgrades.",
    impact_on_logistics: "Reduced tire traction, zero-visibility fog belts, unpaved shoulder collapse, and rapid road surface degradation requiring frequent convoy stops.",
    mitigation_strategy: "Real-time precipitation sensor integration with OpenWeatherMap; predictive speed throttling; dynamic rerouting via valley corridors.",
    sample_affected_areas: ["Sohra/Mawsynram (Meghalaya)", "Subansiri Basin (Arunachal)", "Tamenglong (Manipur)"]
  },
  {
    id: "ch-landslides",
    title: "Active Landslides & Sinking Subgrade Zones",
    category: "Geotechnical",
    icon: "AlertTriangle",
    severity_level: "CRITICAL",
    description: "The young, seismically active Himalayan and Indo-Burma ranges feature fractured sedimentary rock strata. Heavy rainwater percolation triggers periodic mudslides, rockfalls, and road subsidence that temporarily sever primary arterial links.",
    impact_on_logistics: "Complete corridor blockages lasting from several hours to multiple days; perishable cargo spoilage; single-lane alternating convoy bottlenecks.",
    mitigation_strategy: "Random Forest ML geological failure score prediction; early sensor warnings; pre-planned secondary bypass itineraries (e.g. Zubza link for Pagla Pahar).",
    sample_affected_areas: ["Pagla Pahar NH29 (Nagaland)", "Barail Range NH8 (Assam/Tripura border)", "Dzongu / North Sikkim Roads"]
  },
  {
    id: "ch-flooding",
    title: "River Valley Flooding & Submerged Causeways",
    category: "Hydro-Drainage",
    icon: "Waves",
    severity_level: "HIGH",
    description: "The Brahmaputra and Barak river basins, fed by hundreds of Himalayan tributaries, undergo severe annual flooding during peak monsoon months, inundating low-lying national highway sections and bridge approaches in plains and river junctions.",
    impact_on_logistics: "Submerged causeways, temporary ferry suspensions across river crossings, washed out culverts, and structural load caps on swollen river bridges.",
    mitigation_strategy: "Bridge clearance sensor telemetry; water-level flood gauge alerts; routing via elevated bypass alignments.",
    sample_affected_areas: ["Kaziranga NH715 sector (Assam)", "Dhemaji/Majuli (Assam)", "South Tripura river plains"]
  },
  {
    id: "ch-connectivity",
    title: "Remote Connectivity & Single-Artery Bottlenecks",
    category: "Network",
    icon: "Network",
    severity_level: "CRITICAL",
    description: "The entire North Eastern Region connects to mainland India through the narrow Siliguri Corridor ('Chicken's Neck', ~22 km wide). Beyond Guwahati, intra-regional state capital connections often depend on a single arterial highway corridor without redundant high-capacity expressways.",
    impact_on_logistics: "High network vulnerability: disruption at any single critical chokepoint forces detour routes of 150 to 300+ extra kilometers or isolates entire state supply lines.",
    mitigation_strategy: "Multi-objective corridor redundancy mapping; multimodal coordination combining railway transshipment and inland waterway links (NW-2).",
    sample_affected_areas: ["Siliguri Corridor gateway", "NH306 sole highway lifeline into Mizoram", "NH37 Jiribam corridor into Manipur"]
  },
  {
    id: "ch-infrastructure",
    title: "Limited Logistics Infrastructure & Cold Chains",
    category: "Infrastructure",
    icon: "Building2",
    severity_level: "MEDIUM",
    description: "While central hubs like Guwahati possess modern freight parks, remote mountain districts have a documented deficit of commercial temperature-controlled cold storages, automated transshipment cross-docks, and standardized truck repair hubs.",
    impact_on_logistics: "High transit spoilage rates for organic horticultural produce (ginger, kiwi, oranges, spices); empty backhaul running due to unbalanced inbound vs outbound freight.",
    mitigation_strategy: "Registry of lifeline emergency facilities (hospitals, fuel depots, reefer hubs); optimizing reefer fleet utilization; encouraging consolidated multi-drop dispatches.",
    sample_affected_areas: ["Tawang/Ziro (Arunachal Pradesh)", "Lunglei (Mizoram)", "Mon/Tuensang (Nagaland)", "Churachandpur (Manipur)"]
  },
  {
    id: "ch-transittime",
    title: "Extended Transit Durations & Driver Fatigue",
    category: "Operations",
    icon: "Clock",
    severity_level: "MEDIUM",
    description: "Due to hill topography, sharp curves, heavy vehicle speed restrictions, and checkpost documentation queues, long-haul freight in NER averages only 150-220 km per 24 hours, compared to 400-500 km per day on mainland golden quadrilateral highways.",
    impact_on_logistics: "Driver exhaustion, extended delivery lead times, tied-up working capital, and higher wage and per-diem operational overheads.",
    mitigation_strategy: "Automated driving hour caps; scheduled mandatory rest stops at designated safe logistic hubs; telemetry tracking of actual vs planned transit variance.",
    sample_affected_areas: ["Guwahati to Agartala (580 km takes ~22-26 hours)", "Tezpur to Tawang (takes ~14 hours for 320 km)"]
  },
  {
    id: "ch-accessibility",
    title: "Seasonal Road Accessibility & Sub-Zero Pass Closures",
    category: "Seasonal Access",
    icon: "Compass",
    severity_level: "HIGH",
    description: "High-altitude passes (such as Sela Pass at 13,700 ft in Arunachal Pradesh and Nathu La in Sikkim) face severe sub-zero winter temperatures, black ice, and snow accumulation from November to March, restricting conventional two-wheel-drive commercial trucks.",
    impact_on_logistics: "Mandatory snow-chaining, seasonal convoy operation under BRO guidance, payload rationing for essential winter fuel and medical reserves.",
    mitigation_strategy: "Pre-monsoon and pre-winter strategic buffer stocking at forward logistics depots; automated vehicle clearance classification.",
    sample_affected_areas: ["Sela Pass / Tawang corridor (Arunachal Pradesh)", "North Sikkim (Lachen / Lachung)", "Dzükou Valley approaches"]
  }
]

export default function AdminDashboard() {
  // Filter States
  const [selectedState, setSelectedState] = useState('ALL')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [selectedRisk, setSelectedRisk] = useState('ALL')
  const [selectedVehicle, setSelectedVehicle] = useState('ALL')
  const [selectedCargo, setSelectedCargo] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('30d')

  // Layer Toggles
  const [showLowRisk, setShowLowRisk] = useState(true)
  const [showMedRisk, setShowMedRisk] = useState(true)
  const [showHighRisk, setShowHighRisk] = useState(true)
  const [showHubs, setShowHubs] = useState(true)
  const [showHazards, setShowHazards] = useState(true)

  // Data & Loading
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRouteOnMap, setSelectedRouteOnMap] = useState(null)

  // 8 Documented NER Challenges State
  const [challenges, setChallenges] = useState(DEFAULT_NER_CHALLENGES)
  const [expandedChallengeId, setExpandedChallengeId] = useState('ch-terrain')
  const [challengeCategory, setChallengeCategory] = useState('ALL')

  // PM Gati Shakti GeoJSON Interoperability State
  const [exportingGeoJson, setExportingGeoJson] = useState(false)
  const [geoJsonPayload, setGeoJsonPayload] = useState(null)
  const [showGeoJsonModal, setShowGeoJsonModal] = useState(false)
  const [copiedGeoJson, setCopiedGeoJson] = useState(false)

  // Reset district when state changes
  useEffect(() => {
    setSelectedDistrict('ALL')
  }, [selectedState])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const data = await adminService.getDashboard({
        state: selectedState,
        district: selectedDistrict,
        risk: selectedRisk,
        vehicle: selectedVehicle,
        cargo: selectedCargo,
        dateRange: selectedDate
      })
      if (data) setDashboardData(data)
    } catch (err) {
      console.warn('Could not fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChallenges = async () => {
    try {
      const data = await adminService.getNerChallenges()
      if (data && data.challenges) {
        setChallenges(data.challenges)
      }
    } catch (err) {
      console.warn('Could not load NER challenges:', err)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [selectedState, selectedDistrict, selectedRisk, selectedVehicle, selectedCargo, selectedDate])

  useEffect(() => {
    fetchChallenges()
  }, [])

  // Handle GeoJSON Generation & Download
  const handleExportGeoJson = async () => {
    setExportingGeoJson(true)
    try {
      const geoData = await adminService.getNerGeoJson(selectedState)
      if (geoData) {
        const jsonStr = JSON.stringify(geoData, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/geo+json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `NER_Logistics_GIS_${selectedState === 'ALL' ? 'NorthEast_Region' : selectedState}.geojson`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('GeoJSON export failed:', err)
    } finally {
      setExportingGeoJson(false)
    }
  }

  // Handle GeoJSON Preview Modal
  const handlePreviewGeoJson = async () => {
    setExportingGeoJson(true)
    try {
      const geoData = await adminService.getNerGeoJson(selectedState)
      if (geoData) {
        setGeoJsonPayload(geoData)
        setShowGeoJsonModal(true)
      }
    } catch (err) {
      console.error('GeoJSON preview failed:', err)
    } finally {
      setExportingGeoJson(false)
    }
  }

  const handleCopyGeoJson = () => {
    if (!geoJsonPayload) return
    navigator.clipboard.writeText(JSON.stringify(geoJsonPayload, null, 2))
    setCopiedGeoJson(true)
    setTimeout(() => setCopiedGeoJson(false), 2500)
  }

  const handleResetFilters = () => {
    setSelectedState('ALL')
    setSelectedDistrict('ALL')
    setSelectedRisk('ALL')
    setSelectedVehicle('ALL')
    setSelectedCargo('ALL')
    setSelectedDate('30d')
  }

  const kpis = dashboardData?.summary_kpis || {
    active_corridors_count: 8,
    high_risk_count: 3,
    medium_risk_count: 2,
    low_risk_count: 3,
    active_alerts_count: 3,
    logistics_hubs_count: 8,
    hazards_count: 4,
    total_daily_freight_tonnes: 3480,
    fleet_compliance_rate_pct: 94.6
  }

  const routes = dashboardData?.routes || []
  const hubs = dashboardData?.logistics_hubs || []
  const hazards = dashboardData?.high_risk_areas || []
  const alerts = dashboardData?.active_alerts || []
  const transportStats = dashboardData?.transport_stats || {
    total_daily_tonnes: 3480,
    total_arterial_network_km: 1396.6,
    avg_freight_rate_per_tkm: 14.20,
    modal_share: [
      { mode: 'National & State Highways', percentage: 82.5, color: '#6366f1' },
      { mode: 'NFR Broad Gauge Rail', percentage: 13.8, color: '#14b8a6' },
      { mode: 'Inland Waterway (NW-2 Brahmaputra)', percentage: 3.7, color: '#f59e0b' }
    ],
    cargo_distribution: [
      { cargo: 'Agricultural & Perishables', share_pct: 34.2 },
      { cargo: 'Industrial Construction & Cement', share_pct: 28.5 },
      { cargo: 'Lifeline Pharmaceuticals & Meds', share_pct: 18.1 },
      { cargo: 'Petroleum & Fuel (POL)', share_pct: 12.4 },
      { cargo: 'FMCG & Consumer Goods', share_pct: 6.8 }
    ]
  }
  const systemUsage = dashboardData?.system_usage || {
    active_registered_carriers: 142,
    telemetry_connected_trucks: 1284,
    active_sensor_beacons: 48,
    telemetry_pings_per_min: 3840,
    compliance_rate_pct: 94.6,
    diverted_trips_to_safe_routes: 312,
    system_uptime_pct: 99.94
  }

  // Filter routes for map rendering based on layer checkboxes
  const visibleMapRoutes = routes.filter(r => {
    if (r.risk_tier === 'LOW' && !showLowRisk) return false
    if (r.risk_tier === 'MEDIUM' && !showMedRisk) return false
    if (r.risk_tier === 'HIGH' && !showHighRisk) return false
    return true
  })

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '26px 32px' }}>
      {/* Top Masthead: Ministry / Authority Header */}
      <div className="glass-card" style={{
        padding: '20px 26px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            flexShrink: 0
          }}>
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                background: '#6366f1',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: 0.5
              }}>
                SIH26002 GOV PORTAL
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Ministry of DoNER • North Eastern Council • State Transport Depts • NDMA
              </span>
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', margin: 0 }}>
              North Eastern Regional Logistics Administration & Surveillance Dashboard
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#059669',
            fontSize: 12,
            fontWeight: 700
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Live Telemetry Active
          </div>
          <button
            type="button"
            onClick={handleExportGeoJson}
            disabled={exportingGeoJson}
            title="Download PM Gati Shakti standard GeoJSON file"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 10px rgba(79, 70, 229, 0.35)',
              transition: 'opacity 0.2s'
            }}
          >
            <Download size={13} className={exportingGeoJson ? 'animate-bounce' : ''} />
            {exportingGeoJson ? 'Exporting...' : 'Export PM Gati Shakti GeoJSON'}
          </button>
          <button
            type="button"
            onClick={fetchDashboard}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ─── COMPREHENSIVE FILTER CONTROLS BAR ───────────────────────────── */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Government Planning & Surveillance Filters
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Reset All Filters
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12
        }}>
          {/* 1. State Filter */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
              State (NER)
            </label>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none'
              }}
            >
              {NER_STATES.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All 8 States' : s}</option>
              ))}
            </select>
          </div>

          {/* 2. District Filter */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              disabled={selectedState === 'ALL'}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: selectedState === 'ALL' ? 'var(--bg-base)' : 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: selectedState === 'ALL' ? 'var(--text-muted)' : 'var(--text-primary)',
                fontSize: 12,
                outline: 'none'
              }}
            >
              {(STATE_DISTRICTS[selectedState] || ['ALL']).map(d => (
                <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>
              ))}
            </select>
          </div>

          {/* 3. Risk Level Filter */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Risk Tier
            </label>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: selectedRisk === 'HIGH' ? '#dc2626' : selectedRisk === 'MEDIUM' ? '#d97706' : selectedRisk === 'LOW' ? '#059669' : 'var(--text-primary)',
                fontSize: 12,
                fontWeight: 700,
                outline: 'none'
              }}
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">🟢 Low Risk Only</option>
              <option value="MEDIUM">🟡 Medium Risk Only</option>
              <option value="HIGH">🔴 High Risk Only</option>
            </select>
          </div>

          {/* 4. Vehicle Filter */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Vehicle Type
            </label>
            <select
              value={selectedVehicle}
              onChange={e => setSelectedVehicle(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="ALL">All Vehicle Classes</option>
              <option value="Heavy Multi-Axle 17t">Heavy Multi-Axle (17t)</option>
              <option value="Truck 10t">Standard Truck (10t)</option>
              <option value="Reefer 11t">Refrigerated Reefer (11t)</option>
              <option value="Mini Truck 3.5t">Mini Truck (3.5t)</option>
            </select>
          </div>

          {/* 5. Cargo Filter */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Cargo Category
            </label>
            <select
              value={selectedCargo}
              onChange={e => setSelectedCargo(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="ALL">All Cargo Types</option>
              <option value="Perishables">Agricultural & Perishables</option>
              <option value="Pharma">Lifeline Pharmaceuticals</option>
              <option value="Machinery">Industrial Machinery & Cement</option>
              <option value="Fuel">Petroleum & POL Fuels</option>
              <option value="FMCG">FMCG & Consumer Goods</option>
            </select>
          </div>

          {/* 6. Date Range */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Observation Window
            </label>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (Standard)</option>
              <option value="90d">Current Quarter (90d)</option>
              <option value="1y">Full Year Telemetry</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── SUMMARY KPI TILES ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Monitored Corridors</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px 0' }}>
            {kpis.active_corridors_count}
          </div>
          <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Across 8 NER States</span>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>High Risk Watch</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626', margin: '6px 0 2px 0' }}>
            {kpis.high_risk_count}
          </div>
          <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>Pagla Pahar, Sela Pass</span>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Logistics Hubs</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0284c7', margin: '6px 0 2px 0' }}>
            {kpis.logistics_hubs_count}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Warehouses & ICDs</span>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Alerts</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#d97706', margin: '6px 0 2px 0' }}>
            {kpis.active_alerts_count}
          </div>
          <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>NDMA / MoRTH notices</span>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Fleet Compliance</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', margin: '6px 0 2px 0' }}>
            {kpis.fleet_compliance_rate_pct}%
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Route guideline fidelity</span>
        </div>
      </div>

      {/* ─── INTERACTIVE MULTI-RISK GIS MAP ────────────────────────────── */}
      <div className="glass-card" style={{ padding: 22, marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} color="#6366f1" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Regional Multi-Risk Corridor & Infrastructure Map
              </h3>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Color-coded by ML risk severity: 🟢 Low Risk • 🟡 Medium Risk • 🔴 High Risk • 🏢 Logistics Hubs • ⚠️ Hazard Hotspots
            </span>
          </div>

          {/* Layer Checkboxes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#059669', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={showLowRisk} onChange={e => setShowLowRisk(e.target.checked)} />
              Low Risk
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#d97706', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={showMedRisk} onChange={e => setShowMedRisk(e.target.checked)} />
              Medium Risk
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={showHighRisk} onChange={e => setShowHighRisk(e.target.checked)} />
              High Risk
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={showHubs} onChange={e => setShowHubs(e.target.checked)} />
              Logistics Hubs
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={showHazards} onChange={e => setShowHazards(e.target.checked)} />
              Hazards
            </label>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ height: '480px', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
          <MapContainer
            center={[25.8, 92.8]}
            zoom={7}
            style={{ width: '100%', height: '100%', background: '#090d16' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
              maxZoom={19}
            />

            {/* Render Risk Polylines */}
            {visibleMapRoutes.map(r => {
              const color = r.risk_tier === 'LOW' ? '#10b981' : r.risk_tier === 'MEDIUM' ? '#f59e0b' : '#ef4444'
              const isHighlighted = selectedRouteOnMap === r.id
              return (
                <Polyline
                  key={r.id}
                  positions={r.coordinates}
                  pathOptions={{
                    color,
                    weight: isHighlighted ? 8 : r.risk_tier === 'HIGH' ? 6 : 4,
                    opacity: isHighlighted ? 1.0 : 0.85,
                    dashArray: r.risk_tier === 'HIGH' ? '8, 6' : null
                  }}
                  eventHandlers={{
                    click: () => setSelectedRouteOnMap(r.id)
                  }}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', fontSize: 12, minWidth: 200 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{r.name}</div>
                      <div style={{ color: '#475569', marginBottom: 4 }}>{r.highway}</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <span style={{
                          background: color,
                          color: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 800
                        }}>
                          {r.risk_tier} RISK ({r.risk_score}/10)
                        </span>
                        <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>
                          {r.distance_km} km • {r.avg_duration}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#0f172a' }}>
                        Daily Dispatches: <strong>{r.daily_trips} trucks</strong><br />
                        Clearance: <strong>{r.vehicle_clearance}</strong><br />
                        Status: <span style={{ color: color, fontWeight: 700 }}>{r.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              )
            })}

            {/* Render Logistics Hubs */}
            {showHubs && hubs.map(h => (
              <Marker
                key={h.id}
                position={[h.lat, h.lon]}
                icon={createHubIcon(h.has_cold_storage)}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontSize: 12, minWidth: 220 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>{h.name}</div>
                    <div style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>
                      {h.city}, {h.state} ({h.district})
                    </div>
                    <div style={{ fontSize: 11, color: '#0f172a', lineHeight: 1.5 }}>
                      Role: <strong>{h.role}</strong><br />
                      Capacity: <strong>{h.capacity_tonnes.toLocaleString()} Tonnes</strong> ({h.utilization_pct}% utilized)<br />
                      Cold Storage: <strong>{h.has_cold_storage ? '✓ Available' : '✗ None'}</strong><br />
                      Railhead: <strong>{h.railhead_connected ? '✓ Connected' : 'Road only'}</strong><br />
                      Daily Dispatches: <strong>{h.daily_dispatches} trucks/day</strong>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Hazard Hotspots */}
            {showHazards && hazards.map(hz => (
              <Marker
                key={hz.id}
                position={[hz.lat, hz.lon]}
                icon={createHazardIcon(hz.severity)}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontSize: 12, minWidth: 220 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#ef4444', marginBottom: 2 }}>
                      ⚠️ {hz.name}
                    </div>
                    <div style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>
                      Highway: {hz.highway} ({hz.district}, {hz.state})
                    </div>
                    <div style={{ fontSize: 11, color: '#0f172a', lineHeight: 1.5 }}>
                      Hazard: <strong>{hz.hazard_type}</strong><br />
                      Status: <strong style={{ color: '#dc2626' }}>{hz.current_status}</strong><br />
                      Detour Advice: <span style={{ color: '#2563eb' }}>{hz.alternate_route}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            <AdminMapBoundsController routes={visibleMapRoutes} />
          </MapContainer>
        </div>
      </div>

      {/* ─── 2-COLUMN SECTION: ROUTES & HIGH-RISK AREAS ────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 20,
        marginBottom: 26
      }}>
        {/* Monitored Arterial Routes Table */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#818cf8" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Monitored Freight Arteries ({routes.length})
              </h3>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Filtered by State: {selectedState} • Risk: {selectedRisk}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 8px' }}>Corridor</th>
                  <th style={{ padding: '10px 8px' }}>Highway</th>
                  <th style={{ padding: '10px 8px' }}>Dist / Time</th>
                  <th style={{ padding: '10px 8px' }}>Risk Tier</th>
                  <th style={{ padding: '10px 8px' }}>Clearance</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => {
                  const isSelected = selectedRouteOnMap === r.id
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRouteOnMap(r.id)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div>{r.name}</div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.state_origin} ➔ {r.state_destination}</span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{r.highway}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                        {r.distance_km} km • {r.avg_duration}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          background: r.risk_tier === 'LOW' ? 'rgba(16, 185, 129, 0.15)' : r.risk_tier === 'MEDIUM' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: r.risk_tier === 'LOW' ? '#059669' : r.risk_tier === 'MEDIUM' ? '#d97706' : '#dc2626',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 800
                        }}>
                          {r.risk_tier} ({r.risk_score})
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: 11 }}>
                        {r.vehicle_clearance}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>
                        <span style={{
                          color: r.status === 'OPEN' ? '#059669' : r.status.includes('CAUTION') || r.status.includes('ALERT') ? '#dc2626' : '#d97706',
                          fontSize: 10
                        }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* High-Risk Geological Hazard Hotspots */}
        <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#ef4444" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                High-Risk Geological Areas ({hazards.length})
              </h3>
            </div>
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>
              NDMA Monitored
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {hazards.map(hz => (
              <div
                key={hz.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 10,
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{hz.name}</strong>
                  <span style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    color: '#dc2626',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4
                  }}>
                    {hz.severity}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 4, fontWeight: 500 }}>
                  {hz.highway} • {hz.district}, {hz.state}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Hazard: {hz.hazard_type}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Current: <strong style={{ color: '#dc2626' }}>{hz.current_status}</strong><br />
                  Diversion: <span style={{ color: '#0284c7' }}>{hz.alternate_route}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 3-COLUMN SECTION: ALERTS, HUBS, TRANSPORT STATS ────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20,
        marginBottom: 26
      }}>
        {/* Active Government Regulatory Alerts */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FileText size={18} color="#d97706" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Active Government Regulatory Alerts ({alerts.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(a => (
              <div
                key={a.id}
                style={{
                  background: a.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                  border: `1px solid ${a.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(234, 179, 8, 0.25)'}`,
                  borderRadius: 8,
                  padding: '10px 12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 12 }}>{a.title}</strong>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Source: {a.source} • Corridor: <strong style={{ color: 'var(--text-primary)' }}>{a.affected_corridor}</strong>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  {a.message}
                </p>
                <div style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>
                  Mandate: {a.action_required}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Logistics Hubs */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Building2 size={18} color="#2563eb" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Regional Logistics Hubs ({hubs.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {hubs.map(h => (
              <div
                key={h.id}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '10px 12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 12 }}>{h.name}</strong>
                  <span style={{ fontSize: 10, color: '#0284c7', fontWeight: 700 }}>
                    {h.daily_dispatches} dispatches/day
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 4px 0' }}>
                  {h.city}, {h.state} • {h.role}
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-secondary)' }}>
                  <span>Capacity: {h.capacity_tonnes.toLocaleString()} t</span>
                  <span>Utilized: {h.utilization_pct}%</span>
                  <span>{h.has_cold_storage ? '❄ Cold Storage' : 'Dry Only'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transportation Statistics & Modal Distribution */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Truck size={18} color="#0d9488" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Regional Transportation Statistics
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Daily Freight Volume:</span>
              <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{transportStats.total_daily_tonnes.toLocaleString()} Tonnes</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monitored Highway Network:</span>
              <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{transportStats.total_arterial_network_km} km</strong>
            </div>

            {/* Modal Share */}
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Regional Freight Modal Share:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {transportStats.modal_share.map(m => (
                  <div key={m.mode}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
                      <span>{m.mode}</span>
                      <strong>{m.percentage}%</strong>
                    </div>
                    <div style={{ width: '100%', height: 5, background: 'var(--border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${m.percentage}%`, height: '100%', background: m.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            </div>
          </div>
        </div>

      {/* ─── PM GATI SHAKTI GIS INTEROPERABILITY & GEOJSON EXPORT ───────── */}
      <div className="glass-card" style={{
        padding: 24,
        marginBottom: 26,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(79, 70, 229, 0.4)'
            }}>
              <Globe size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  RFC 7946 STANDARD
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  CRS: urn:ogc:def:crs:OGC:1.3:CRS84 (EPSG:4326)
                </span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                PM Gati Shakti National Master Plan — GIS Interoperability Export
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handlePreviewGeoJson}
              disabled={exportingGeoJson}
              style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <FileJson size={14} color="#818cf8" />
              Inspect GeoJSON
            </button>
            <button
              type="button"
              onClick={handleExportGeoJson}
              disabled={exportingGeoJson}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 12px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Download size={14} className={exportingGeoJson ? 'animate-bounce' : ''} />
              {exportingGeoJson ? 'Exporting GeoJSON...' : `Download ${selectedState === 'ALL' ? 'NER' : selectedState} GeoJSON`}
            </button>
          </div>
        </div>

        {/* Feature summary cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 14
        }}>
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Corridor Feature Vectors
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
              {routes.length} LineStrings
            </div>
            <span style={{ fontSize: 11, color: '#059669' }}>Standard [lon, lat] polyline coordinates</span>
          </div>

          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Strategic Logistics Nodes
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7', margin: '4px 0 2px 0' }}>
              {hubs.length} Hub Points
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Multi-modal yards, ICDs & cold storages</span>
          </div>

          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Geological Hazard Sinks
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', margin: '4px 0 2px 0' }}>
              {hazards.length} Critical Points
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Landslide belts & subgrade fault lines</span>
          </div>

          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              GIS Interoperability Target
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', margin: '4px 0 2px 0' }}>
              PM Gati Shakti NMP / QGIS
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Seamless integration into State GIS Portals</span>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Export conforms to <strong>RFC 7946</strong> standard with standard WGS84 coordinate ordering ([longitude, latitude]). GeoJSON layers can be directly dragged into <strong>QGIS, ArcGIS, Google Earth Pro</strong>, or imported into Ministry of Commerce's <strong>PM Gati Shakti National Master Plan</strong> platform for multi-modal corridor planning.
        </div>
      </div>

      {/* ─── 8 DOCUMENTED REGIONAL CHALLENGES SECTION ──────────────────── */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Mountain size={20} color="#6366f1" />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Regional Constraints Matrix: 8 Documented Geographic & Logistical Challenges
              </h3>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Comprehensive operational dossier of terrain, rainfall, landslide, connectivity, and infrastructure bottlenecks across the 8 NER states with algorithmic mitigation protocols.
            </span>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', 'Topography', 'Meteorology', 'Geotechnical', 'Hydro-Drainage', 'Network', 'Infrastructure', 'Operations', 'Seasonal Access'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setChallengeCategory(cat)}
                style={{
                  background: challengeCategory === cat ? '#6366f1' : 'var(--bg-surface-subtle)',
                  color: challengeCategory === cat ? '#ffffff' : 'var(--text-muted)',
                  border: `1px solid ${challengeCategory === cat ? '#6366f1' : 'var(--border-subtle)'}`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {cat === 'ALL' ? 'All 8 Challenges' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid / Accordion */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {(challenges || DEFAULT_NER_CHALLENGES)
            .filter(ch => {
              if (challengeCategory === 'ALL') return true
              return ch.category.toLowerCase().includes(challengeCategory.toLowerCase())
            })
            .map((ch, idx) => {
              const isExpanded = expandedChallengeId === ch.id
              const severityColor = ch.severity_level === 'CRITICAL' ? '#dc2626' : ch.severity_level === 'SEVERE' ? '#7c3aed' : ch.severity_level === 'HIGH' ? '#d97706' : '#2563eb'

              return (
                <div
                  key={ch.id}
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    border: `1px solid ${isExpanded ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-subtle)'}`,
                    borderRadius: 12,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: isExpanded ? '0 4px 20px rgba(0, 0, 0, 0.25)' : 'none'
                  }}
                >
                  <div
                    onClick={() => setExpandedChallengeId(isExpanded ? null : ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0
                      }}>
                        {ch.icon === 'Mountain' && <Mountain size={18} color="#818cf8" />}
                        {ch.icon === 'CloudRain' && <CloudRain size={18} color="#06b6d4" />}
                        {ch.icon === 'AlertTriangle' && <AlertTriangle size={18} color="#ef4444" />}
                        {ch.icon === 'Waves' && <Waves size={18} color="#0284c7" />}
                        {ch.icon === 'Network' && <Network size={18} color="#ec4899" />}
                        {ch.icon === 'Building2' && <Building2 size={18} color="#10b981" />}
                        {ch.icon === 'Clock' && <Clock size={18} color="#f59e0b" />}
                        {ch.icon === 'Compass' && <Compass size={18} color="#a855f7" />}
                        {!['Mountain','CloudRain','AlertTriangle','Waves','Network','Building2','Clock','Compass'].includes(ch.icon) && (
                          <Activity size={18} color="#818cf8" />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                            #{idx + 1} • {ch.category}
                          </span>
                          <span style={{
                            background: `${severityColor}18`,
                            color: severityColor,
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 4
                          }}>
                            {ch.severity_level}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {ch.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle details"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Concise Overview */}
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '10px 0 8px 0' }}>
                    {ch.description}
                  </p>

                  {/* Expanded Operational Breakdown */}
                  {isExpanded && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 12,
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}>
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 8,
                        padding: '8px 12px'
                      }}>
                        <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                          Quantified Impact on Regional Freight:
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {ch.impact_on_logistics}
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 8,
                        padding: '8px 12px'
                      }}>
                        <span style={{ fontSize: 10, color: '#059669', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                          Platform Algorithmic Mitigation Playbook:
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {ch.mitigation_strategy}
                        </div>
                      </div>

                      {ch.sample_affected_areas && ch.sample_affected_areas.length > 0 && (
                        <div>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                            Key Vulnerable Hotspots & Corridors:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {ch.sample_affected_areas.map(area => (
                              <span
                                key={area}
                                style={{
                                  background: 'var(--bg-base)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 4,
                                  padding: '2px 8px',
                                  fontSize: 10,
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                📍 {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* ─── DATASET PROVENANCE & BENCHMARK NOTICE ──────────────────────── */}
      <div className="glass-card" style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={16} color="#6366f1" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <strong>Dataset Provenance Notice:</strong> Benchmarked simulation calibrated for <strong>SIH26002 prototype evaluation</strong> across all 8 NER states. Standard GeoJSON endpoints are architected for real-time ingestion of MoRTH, State Transport, and NDMA geospatial APIs.
          </span>
        </div>
        <span style={{
          fontSize: 10,
          color: '#818cf8',
          fontWeight: 700,
          background: 'rgba(99, 102, 241, 0.15)',
          padding: '3px 8px',
          borderRadius: 4
        }}>
          BENCHMARK DEMO READY
        </span>
      </div>

      {/* ─── GEOJSON RAW INSPECTION MODAL ───────────────────────────────── */}
      {showGeoJsonModal && geoJsonPayload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#0b0f19',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            maxWidth: 820,
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileJson size={20} color="#818cf8" />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    PM Gati Shakti Standard GeoJSON Payload
                  </h3>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    RFC 7946 • CRS84 / EPSG:4326 • {geoJsonPayload.features?.length || 0} Features Exported
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleCopyGeoJson}
                  style={{
                    background: copiedGeoJson ? '#059669' : 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: copiedGeoJson ? '#ffffff' : '#818cf8',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  {copiedGeoJson ? <Check size={13} /> : <Copy size={13} />}
                  {copiedGeoJson ? 'Copied!' : 'Copy GeoJSON'}
                </button>

                <button
                  type="button"
                  onClick={handleExportGeoJson}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Download size={13} />
                  Download
                </button>

                <button
                  type="button"
                  onClick={() => setShowGeoJsonModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 6
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Code block */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              background: '#070a12',
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#38bdf8',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {JSON.stringify(geoJsonPayload, null, 2)}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 22px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--text-muted)'
            }}>
              <span>Coordinates order: <strong>[longitude, latitude]</strong></span>
              <button
                type="button"
                onClick={() => setShowGeoJsonModal(false)}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
