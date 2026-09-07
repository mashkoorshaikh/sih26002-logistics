import React, { useState } from 'react'
import {
  Hospital,
  Fuel,
  Wrench,
  Warehouse,
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  Award
} from 'lucide-react'

const LIFELINE_FACILITIES = [
  {
    id: 'h-1',
    name: 'Civil Hospital Nongpoh',
    type: 'hospital',
    distance_off_km: 0.82,
    city: 'Nongpoh',
    phone: '03638-232230',
    services: '24/7 Emergency ICU, Trauma Center, Blood Bank, Oxygen Supply',
    golden_hour: true,
    rating: 'A+ (Govt Regional)'
  },
  {
    id: 'h-2',
    name: 'NEIGRIHMS Shillong',
    type: 'hospital',
    distance_off_km: 2.10,
    city: 'Mawdiangdiang / Shillong',
    phone: '0364-2538025',
    services: 'Apex Tertiary Super-Specialty Medical Institute (24x7)',
    golden_hour: true,
    rating: 'Apex Referral Center'
  },
  {
    id: 'h-3',
    name: 'Gauhati Medical College & Hospital (GMCH)',
    type: 'hospital',
    distance_off_km: 3.40,
    city: 'Guwahati',
    phone: '0361-2529457',
    services: 'Level 1 Trauma Care, Heavy Burns Unit, Regional Lifeline',
    golden_hour: true,
    rating: 'Apex Level 1'
  },
  {
    id: 'f-1',
    name: 'IOCL Highway Service Station Jorabat',
    type: 'fuel_station',
    distance_off_km: 0.12,
    city: 'Jorabat (NH6 Start)',
    phone: '0361-2897211',
    services: 'High Speed Diesel (HSD), AdBlue DEF Dispensary, 24/7 Air Pump',
    golden_hour: false,
    rating: 'Verified Fleet Hub'
  },
  {
    id: 'f-2',
    name: 'BPCL City Service Station Police Bazar',
    type: 'fuel_station',
    distance_off_km: 0.15,
    city: 'Shillong Central',
    phone: '0364-2223401',
    services: 'Commercial Diesel, EV Fast Charging (60kW), Fleet Card Terminal',
    golden_hour: false,
    rating: '24/7 Operational'
  },
  {
    id: 'r-1',
    name: 'Tata Motors Authorized Heavy Commercial Service',
    type: 'repair_center',
    distance_off_km: 1.20,
    city: 'Burnihat',
    phone: '03638-278100',
    services: 'Heavy Truck Breakdown Towing, Hydraulic Crane, Multi-Axle Alignment',
    golden_hour: false,
    rating: 'Heavy Freight Certified'
  },
  {
    id: 'w-1',
    name: 'Assam State Warehousing Hub Khanapara',
    type: 'warehouse',
    distance_off_km: 0.90,
    city: 'Khanapara / Guwahati',
    phone: '0361-2228410',
    services: 'Cold Storage (Vegetables/Medicine), 10,000 MT Covered Dry Storage',
    golden_hour: false,
    rating: 'Multi-Modal Depot'
  }
]

export default function AccessibilityPage() {
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = LIFELINE_FACILITIES.filter(f => {
    const matchesType = filterType === 'all' || f.type === filterType
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.services.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Hospital size={20} color="#f43f5e" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>
            Lifeline Emergency Infrastructure & Accessibility
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Geospatial proximity registry of emergency hospitals within the Golden Hour window, commercial fuel depots, and breakdown repair centers.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Hospital size={18} color="#f43f5e" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>Hospitals Monitored</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#ffffff' }}>8 Facilities</div>
          <div style={{ fontSize: 11, color: '#34d399', marginTop: 4 }}>✓ 100% Golden Hour Coverage</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Fuel size={18} color="#facc15" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fde047' }}>Fuel & DEF Hubs</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#ffffff' }}>12 Stations</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>High-Speed Diesel along NH6</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Wrench size={18} color="#2dd4bf" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#99f6e4' }}>Breakdown Centers</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#ffffff' }}>5 Workshops</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Heavy towing & hydraulic cranes</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Warehouse size={18} color="#818cf8" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#c7d2fe' }}>Cold Storages</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#ffffff' }}>4 Hubs</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Preserves perishable perishables</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Lifeline Facilities' },
            { id: 'hospital', label: '🏥 Hospitals' },
            { id: 'fuel_station', label: '⛽ Fuel Hubs' },
            { id: 'repair_center', label: '🔧 Breakdown Workshops' },
            { id: 'warehouse', label: '📦 Warehouses & Cold Chain' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterType(t.id)}
              style={{
                background: filterType === t.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: filterType === t.id ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                color: filterType === t.id ? '#ffffff' : '#94a3b8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 260 }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search facility name or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: 8,
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Facilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {filtered.map(f => (
          <div key={f.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: f.type === 'hospital' ? '#f43f5e' : f.type === 'fuel_station' ? '#d97706' : '#0d9488',
                  background: 'var(--bg-surface-subtle)',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  {f.rating}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                  {f.distance_off_km} km off corridor
                </span>
              </div>

              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                {f.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                <MapPin size={13} color="#6366f1" />
                <span>{f.city}</span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                {f.services}
              </p>
            </div>

            <div style={{
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
                <PhoneCall size={13} />
                <span>{f.phone}</span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Verified Emergency Record</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
