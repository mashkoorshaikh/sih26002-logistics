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
import { PageHeader, Card, Badge, StatCard, Input } from '../components/ui'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Lifeline Emergency Infrastructure & Accessibility"
        subtitle="Geospatial proximity registry of emergency hospitals within the Golden Hour window, commercial fuel depots, and breakdown repair centers."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Lifeline Infrastructure' }
        ]}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hospitals Monitored"
          value="8 Facilities"
          change="✓ 100% Golden Hour Coverage"
          changeType="positive"
          icon={Hospital}
        />
        <StatCard
          title="Fuel & DEF Hubs"
          value="12 Stations"
          change="High-Speed Diesel along NH6"
          changeType="neutral"
          icon={Fuel}
        />
        <StatCard
          title="Breakdown Centers"
          value="5 Workshops"
          change="Heavy towing & cranes"
          changeType="neutral"
          icon={Wrench}
        />
        <StatCard
          title="Cold Storages"
          value="4 Hubs"
          change="Preserves perishable cargo"
          changeType="neutral"
          icon={Warehouse}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Lifelines' },
              { id: 'hospital', label: '🏥 Hospitals' },
              { id: 'fuel_station', label: '⛽ Fuel Hubs' },
              { id: 'repair_center', label: '🔧 Breakdown Workshops' },
              { id: 'warehouse', label: '📦 Warehouses' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                className={`
                  text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer
                  ${filterType === t.id
                    ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/30'
                    : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent'
                  }
                `}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              placeholder="Search facility or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(f => (
          <Card key={f.id} padding="default" className="flex flex-col justify-between hover:border-[var(--border-strong)] transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <Badge
                  variant={f.type === 'hospital' ? 'high' : f.type === 'fuel_station' ? 'warning' : 'brand'}
                  size="sm"
                >
                  {f.rating}
                </Badge>
                <span className="text-xs font-bold text-[var(--primary)]">
                  {f.distance_off_km} km off corridor
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-1">
                {f.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                <span>{f.city}</span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                {f.services}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <a
                href={`tel:${f.phone}`}
                className="flex items-center gap-1.5 font-semibold text-[var(--primary)] hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{f.phone}</span>
              </a>
              <span className="text-[11px] text-[var(--text-muted)]">
                Verified Record
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
