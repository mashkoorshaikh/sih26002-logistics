import React, { useState } from 'react'
import {
  Navigation,
  Search,
  Filter,
  ArrowUpDown,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Truck,
  Fuel,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react'
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  PageHeader,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  EmptyState
} from '../components/ui'

// Realistic trip dispatch history across NER corridors
const TRIP_HISTORY_DATA = [
  {
    id: 'TRIP-8492',
    date: '2026-09-07 08:30',
    source: 'Guwahati',
    destination: 'Shillong',
    vehicle: 'Tata Signa (AS-01-EC-4821)',
    cargo: 'Lifeline Medicines & Vaccines',
    distance_km: 98.8,
    fuel_cost: '₹1,817.92',
    risk_tier: 'LOW',
    risk_score: '18/100',
    status: 'IN_TRANSIT',
    speed_kmh: 42,
    current_location: 'Jorabat Foothills (NH6 km 24)',
    last_ping: '5 sec ago'
  },
  {
    id: 'TRIP-8491',
    date: '2026-09-07 06:15',
    source: 'Silchar',
    destination: 'Agartala',
    vehicle: 'Eicher Pro 3015 (AS-11-BC-9042)',
    cargo: 'Fresh Vegetables & Perishables',
    distance_km: 275.2,
    fuel_cost: '₹4,876.00',
    risk_tier: 'MEDIUM',
    risk_score: '44/100',
    status: 'IN_TRANSIT',
    speed_kmh: 36,
    current_location: 'Badarpur Ridge Pass (NH8 km 68)',
    last_ping: '12 sec ago'
  },
  {
    id: 'TRIP-8490',
    date: '2026-09-06 14:20',
    source: 'Tezpur',
    destination: 'Itanagar',
    vehicle: 'Tata 407 Gold (TR-01-D-7812)',
    cargo: 'Consumer Packaged Goods',
    distance_km: 140.2,
    fuel_cost: '₹2,852.00',
    risk_tier: 'LOW',
    risk_score: '22/100',
    status: 'COMPLETED',
    speed_kmh: 0,
    current_location: 'Itanagar Civil Depot',
    last_ping: 'Completed'
  },
  {
    id: 'TRIP-8489',
    date: '2026-09-06 10:45',
    source: 'Dimapur',
    destination: 'Kohima',
    vehicle: 'Ashok Leyland (NL-07-C-3389)',
    cargo: 'Structural Cement & Rebar',
    distance_km: 69.4,
    fuel_cost: '₹1,361.60',
    risk_tier: 'HIGH',
    risk_score: '76/100',
    status: 'DIVERTED',
    speed_kmh: 28,
    current_location: 'Zubza Alternate Link (Detour Active)',
    last_ping: '45 sec ago'
  },
  {
    id: 'TRIP-8488',
    date: '2026-09-05 16:00',
    source: 'Guwahati',
    destination: 'Tezpur',
    vehicle: 'Mahindra Furio Reefer (ML-05-A-6120)',
    cargo: 'Dairy & Cold Chain Supplies',
    distance_km: 182.0,
    fuel_cost: '₹3,210.00',
    risk_tier: 'LOW',
    risk_score: '15/100',
    status: 'COMPLETED',
    speed_kmh: 0,
    current_location: 'Tezpur Food Logistics Terminal',
    last_ping: 'Completed'
  }
]

export default function TripsPage() {
  const [trips, setTrips] = useState(TRIP_HISTORY_DATA)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [sortField, setSortField] = useState('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedLiveTrip, setSelectedLiveTrip] = useState(null)

  // Filtering
  const filteredTrips = trips.filter(t => {
    const query = searchTerm.toLowerCase()
    const matchesSearch = t.id.toLowerCase().includes(query) ||
                          t.source.toLowerCase().includes(query) ||
                          t.destination.toLowerCase().includes(query) ||
                          t.cargo.toLowerCase().includes(query) ||
                          t.vehicle.toLowerCase().includes(query)
    const matchesRisk = filterRisk === 'ALL' || t.risk_tier === filterRisk
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus
    return matchesSearch && matchesRisk && matchesStatus
  })

  // Sorting
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    if (sortField === 'distance_km') {
      aVal = a.distance_km
      bVal = b.distance_km
    }
    if (aVal < bVal) return sortAsc ? -1 : 1
    if (aVal > bVal) return sortAsc ? 1 : -1
    return 0
  })

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <PageHeader
        title="Freight Trips & Dispatch History"
        subtitle="Auditable records of corridor dispatches, terrain-adjusted fuel expenditure, and live telemetry tracking."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Trips' }
        ]}
      />

      {/* Trips Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Navigation className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Total Dispatched</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">{trips.length}</div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--risk-low-bg)] text-[var(--risk-low)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Radio className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Live In Transit</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {trips.filter(t => t.status === 'IN_TRANSIT').length}
            </div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--risk-med-bg)] text-[var(--risk-med)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Diverted En Route</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {trips.filter(t => t.status === 'DIVERTED').length}
            </div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Fuel className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Corridor Distance</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {Math.round(trips.reduce((acc, t) => acc + t.distance_km, 0))} km
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card padding="sm" className="mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search by Trip ID, route, vehicle, or cargo..."
              icon={Search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="w-36"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </Select>

            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
              <option value="DIVERTED">Diverted</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Responsive Trips View */}
      {sortedTrips.length === 0 ? (
        <EmptyState
          icon={Navigation}
          title="No trips found"
          description="Try changing your search keywords or reset the risk and status filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearchTerm(''); setFilterRisk('ALL'); setFilterStatus('ALL') }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader onClick={() => toggleSort('id')} className="cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <span>Trip ID & Date</span>
                      <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                    </div>
                  </TableHeader>
                  <TableHeader>Corridor</TableHeader>
                  <TableHeader>Vehicle & Cargo</TableHeader>
                  <TableHeader onClick={() => toggleSort('distance_km')} className="cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <span>Distance / Cost</span>
                      <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                    </div>
                  </TableHeader>
                  <TableHeader>Risk Assessment</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Live Tracking</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {sortedTrips.map(trip => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="font-semibold text-[var(--text-primary)] font-mono">{trip.id}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{trip.date}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>{trip.source}</span>
                        <span className="text-[var(--text-muted)]">➔</span>
                        <span>{trip.destination}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-[var(--text-primary)] text-xs">{trip.cargo}</div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{trip.vehicle}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-[var(--text-primary)]">{trip.distance_km} km</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{trip.fuel_cost}</div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={trip.risk_tier === 'LOW' ? 'low' : trip.risk_tier === 'MEDIUM' ? 'medium' : 'high'}
                        dot
                      >
                        {trip.risk_tier} ({trip.risk_score})
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className={`text-[11px] font-semibold ${trip.status === 'IN_TRANSIT' ? 'text-[var(--primary)]' : trip.status === 'DIVERTED' ? 'text-[var(--risk-med)]' : 'text-[var(--text-muted)]'}`}>
                        {trip.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={trip.status === 'IN_TRANSIT' ? Radio : Eye}
                        onClick={() => setSelectedLiveTrip(trip)}
                      >
                        {trip.status === 'IN_TRANSIT' ? 'Track Live' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Compact Cards View (Hidden on desktop) */}
          <div className="md:hidden space-y-3">
            {sortedTrips.map(trip => (
              <Card key={trip.id} padding="sm" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{trip.id}</span>
                  <Badge
                    variant={trip.risk_tier === 'LOW' ? 'low' : trip.risk_tier === 'MEDIUM' ? 'medium' : 'high'}
                    dot
                  >
                    {trip.risk_tier}
                  </Badge>
                </div>

                <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>{trip.source}</span>
                  <span className="text-[var(--text-muted)]">➔</span>
                  <span>{trip.destination}</span>
                </div>

                <div className="text-xs text-[var(--text-secondary)]">
                  <div><strong>Cargo:</strong> {trip.cargo}</div>
                  <div className="truncate"><strong>Vehicle:</strong> {trip.vehicle}</div>
                  <div><strong>Dist/Cost:</strong> {trip.distance_km} km • {trip.fuel_cost}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)]">{trip.date}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Radio}
                    onClick={() => setSelectedLiveTrip(trip)}
                  >
                    Live Telemetry
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Live Vehicle Tracking Modal (Section 16 requirement) */}
      {selectedLiveTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shadow-xs">
                  <Radio className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Real-Time Telemetry: {selectedLiveTrip.id}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedLiveTrip.vehicle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLiveTrip(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracking Status Card */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-ping" />
                  <span className="text-xs font-bold text-[var(--primary)]">
                    {selectedLiveTrip.status === 'IN_TRANSIT' ? 'MOVING ON ROUTE' : selectedLiveTrip.status}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Ping: {selectedLiveTrip.last_ping}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">Current Velocity:</span>
                  <div className="font-bold text-[var(--text-primary)] text-sm">{selectedLiveTrip.speed_kmh} km/h</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Current Location:</span>
                  <div className="font-bold text-[var(--text-primary)] text-sm">{selectedLiveTrip.current_location}</div>
                </div>
              </div>
            </div>

            {/* Map Simulator Container */}
            <div className="relative h-44 rounded-xl bg-slate-900 border border-[var(--border-subtle)] overflow-hidden flex flex-col items-center justify-center text-center p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
              
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/25 border-2 border-[var(--primary)] flex items-center justify-center text-white mb-2 shadow-lg animate-bounce">
                <Truck className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="text-xs font-semibold text-white">
                {selectedLiveTrip.source} ➔ {selectedLiveTrip.destination}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                GPS Position: Lat 25.8201° N, Lon 91.8890° E • Altitude: 840m
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-[var(--border-subtle)]">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedLiveTrip(null)}
              >
                Close Tracking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
