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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Total Trips</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">{trips.length}</div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--risk-low-bg)] text-[var(--risk-low)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Live In Transit</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {trips.filter(t => t.status === 'IN_TRANSIT').length}
            </div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--risk-med-bg)] text-[var(--risk-med)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Diverted En Route</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {trips.filter(t => t.status === 'DIVERTED').length}
            </div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Total Distance</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {Math.round(trips.reduce((acc, t) => acc + t.distance_km, 0))} km
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Sorting Toolbar */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by trip ID, corridor, vehicle, or cargo..."
              icon={Search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <Select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="w-full sm:w-36"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </Select>

            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-36"
            >
              <option value="ALL">All Status</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
              <option value="DIVERTED">Diverted</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Desktop Table View (>= 768px) */}
      {sortedTrips.length === 0 ? (
        <EmptyState
          icon={Navigation}
          title="No dispatches found"
          description="Try modifying your search criteria or resetting filters to show complete trip history."
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
          <div className="hidden md:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>
                    <button
                      type="button"
                      onClick={() => toggleSort('id')}
                      className="inline-flex items-center gap-1 font-semibold uppercase hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Trip ID <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHeader>
                  <TableHeader>Corridor</TableHeader>
                  <TableHeader>Vehicle & Cargo</TableHeader>
                  <TableHeader>
                    <button
                      type="button"
                      onClick={() => toggleSort('distance_km')}
                      className="inline-flex items-center gap-1 font-semibold uppercase hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Distance & Fuel <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHeader>
                  <TableHeader>Risk Score</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Live Telemetry</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {sortedTrips.map(trip => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="font-bold font-mono text-[var(--text-primary)]">{trip.id}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{trip.date}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {trip.source} ➔ {trip.destination}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{trip.current_location}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-[var(--text-primary)]">{trip.cargo}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate max-w-xs">{trip.vehicle}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-[var(--text-primary)]">{trip.distance_km} km</div>
                      <div className="text-[11px] text-[var(--primary)] font-medium">{trip.fuel_cost}</div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={trip.risk_tier === 'LOW' ? 'low' : trip.risk_tier === 'MEDIUM' ? 'medium' : 'high'}
                        size="sm"
                        dot
                      >
                        {trip.risk_tier} ({trip.risk_score})
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={trip.status === 'IN_TRANSIT' ? 'low' : trip.status === 'DIVERTED' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {trip.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Radio}
                        onClick={() => setSelectedLiveTrip(trip)}
                      >
                        Track
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View (< 768px: Zero Horizontal Scroll) */}
          <div className="md:hidden space-y-3">
            {sortedTrips.map(trip => (
              <Card key={trip.id} padding="sm" className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{trip.id}</span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                      {trip.source} ➔ {trip.destination}
                    </h3>
                  </div>
                  <Badge
                    variant={trip.status === 'IN_TRANSIT' ? 'low' : trip.status === 'DIVERTED' ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {trip.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Cargo</span>
                    <span className="font-semibold text-[var(--text-primary)] truncate block">{trip.cargo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Distance</span>
                    <span className="font-semibold text-[var(--text-primary)]">{trip.distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Fuel Cost</span>
                    <span className="font-semibold text-[var(--primary)]">{trip.fuel_cost}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase block">Risk</span>
                    <Badge
                      variant={trip.risk_tier === 'LOW' ? 'low' : trip.risk_tier === 'MEDIUM' ? 'medium' : 'high'}
                      size="sm"
                      dot
                    >
                      {trip.risk_tier} ({trip.risk_score})
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="text-[11px] truncate max-w-[200px]">{trip.current_location}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Radio}
                    onClick={() => setSelectedLiveTrip(trip)}
                  >
                    Track
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Live Telemetry Modal */}
      {selectedLiveTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[var(--primary)] animate-pulse" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Live Dispatch Telemetry: {selectedLiveTrip.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLiveTrip(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block">Corridor</span>
                  <strong className="text-sm text-[var(--text-primary)]">
                    {selectedLiveTrip.source} ➔ {selectedLiveTrip.destination}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block">Current Speed</span>
                  <strong className="text-sm text-[var(--primary)]">{selectedLiveTrip.speed_kmh} km/h</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block">Last Sensor Ping</span>
                  <span className="text-[var(--text-secondary)] font-medium">{selectedLiveTrip.last_ping}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block">Estimated Fuel</span>
                  <span className="text-[var(--primary)] font-semibold">{selectedLiveTrip.fuel_cost}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-2">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                  Current Checkpoint Location
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <MapPin className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                  <span>{selectedLiveTrip.current_location}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Vehicle: {selectedLiveTrip.vehicle} • Assigned Cargo: {selectedLiveTrip.cargo}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedLiveTrip(null)}
                >
                  Close Telemetry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
