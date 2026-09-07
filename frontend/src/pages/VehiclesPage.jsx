import React, { useState } from 'react'
import {
  Truck,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Fuel,
  Info
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

// Initial operational fleet registered across NER freight corridors
const INITIAL_VEHICLES = [
  {
    id: 'veh-101',
    name: 'Tata Signa 2823.K',
    plate: 'AS-01-EC-4821',
    type: 'Multi-Axle Heavy Truck',
    weight_capacity_tonnes: 17.0,
    dimensions: '12.0m × 2.5m × 3.8m',
    mileage_kmpl: 3.8,
    status: 'ACTIVE',
    assigned_driver: 'R. K. Barman',
    current_corridor: 'Guwahati ➔ Shillong',
    last_inspection: '2026-09-02'
  },
  {
    id: 'veh-102',
    name: 'Eicher Pro 3015',
    plate: 'AS-11-BC-9042',
    type: 'Standard Freight Truck',
    weight_capacity_tonnes: 10.5,
    dimensions: '8.5m × 2.4m × 3.4m',
    mileage_kmpl: 5.2,
    status: 'ACTIVE',
    assigned_driver: 'B. Debbarma',
    current_corridor: 'Silchar ➔ Agartala',
    last_inspection: '2026-08-28'
  },
  {
    id: 'veh-103',
    name: 'Mahindra Furio 12 Reefer',
    plate: 'ML-05-A-6120',
    type: 'Refrigerated Reefer Truck',
    weight_capacity_tonnes: 11.0,
    dimensions: '10.5m × 2.5m × 3.6m',
    mileage_kmpl: 4.5,
    status: 'ACTIVE',
    assigned_driver: 'J. Sangma',
    current_corridor: 'Guwahati ➔ Shillong (Lifeline Cold Chain)',
    last_inspection: '2026-09-04'
  },
  {
    id: 'veh-104',
    name: 'Ashok Leyland Ecomet 1215',
    plate: 'NL-07-C-3389',
    type: 'Tipper / Mountain Cargo',
    weight_capacity_tonnes: 12.0,
    dimensions: '8.8m × 2.5m × 3.5m',
    mileage_kmpl: 4.1,
    status: 'MAINTENANCE',
    assigned_driver: 'T. Jamir',
    current_corridor: 'Dimapur Depot Workshop',
    last_inspection: '2026-08-15'
  },
  {
    id: 'veh-105',
    name: 'Tata 407 Gold SFC',
    plate: 'TR-01-D-7812',
    type: 'Mini Truck (LCV)',
    weight_capacity_tonnes: 3.5,
    dimensions: '4.8m × 1.8m × 2.4m',
    mileage_kmpl: 7.8,
    status: 'IDLE',
    assigned_driver: 'K. Nath',
    current_corridor: 'Agartala ICD Staging',
    last_inspection: '2026-09-01'
  }
]

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plate: '',
    type: 'Standard Freight Truck',
    weight_capacity_tonnes: 10,
    dimensions: '8.5m × 2.4m × 3.4m',
    mileage_kmpl: 5.0,
    assigned_driver: '',
    status: 'ACTIVE'
  })

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.assigned_driver.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'ALL' || v.type === filterType
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleDelete = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id))
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!newVehicle.name || !newVehicle.plate) return
    const created = {
      ...newVehicle,
      id: `veh-${Date.now().toString().slice(-4)}`,
      current_corridor: 'Assigned to Depot',
      last_inspection: new Date().toISOString().split('T')[0]
    }
    setVehicles([created, ...vehicles])
    setShowAddModal(false)
    setNewVehicle({
      name: '',
      plate: '',
      type: 'Standard Freight Truck',
      weight_capacity_tonnes: 10,
      dimensions: '8.5m × 2.4m × 3.4m',
      mileage_kmpl: 5.0,
      assigned_driver: '',
      status: 'ACTIVE'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <PageHeader
        title="Fleet & Vehicle Management"
        subtitle="Maintain physical clearances, bridge restrictions, fuel efficiency profiles, and real-time status across Northeast logistics assets."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Vehicles' }
        ]}
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Vehicle
          </Button>
        }
      />

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Truck className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Total Registered</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">{vehicles.length}</div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--risk-low-bg)] text-[var(--risk-low)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckCircle2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Active En Route</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {vehicles.filter(v => v.status === 'ACTIVE').length}
            </div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--risk-med-bg)] text-[var(--risk-med)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">In Maintenance</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </div>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Fuel className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-medium">Avg Fleet Mileage</div>
            <div className="text-xl font-bold text-[var(--text-primary)]">4.9 km/L</div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card padding="sm" className="mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search by vehicle, registration, or driver..."
              icon={Search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-44"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="Multi-Axle Heavy Truck">Multi-Axle Heavy Truck</option>
              <option value="Standard Freight Truck">Standard Freight Truck</option>
              <option value="Refrigerated Reefer Truck">Reefer Truck</option>
              <option value="Tipper / Mountain Cargo">Tipper / Mountain Cargo</option>
              <option value="Mini Truck (LCV)">Mini Truck (LCV)</option>
            </Select>

            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-32"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="IDLE">Idle</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Vehicle Table or Empty State */}
      {filteredVehicles.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vehicles match your filters"
          description="Try broadening your search query or reset filters to display all registered fleet carriers."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearchTerm(''); setFilterType('ALL'); setFilterStatus('ALL') }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Vehicle & Registration</TableHeader>
              <TableHeader>Category & Type</TableHeader>
              <TableHeader>Capacity / Dimensions</TableHeader>
              <TableHeader>Efficiency</TableHeader>
              <TableHeader>Driver & Corridor</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredVehicles.map(veh => (
              <TableRow key={veh.id}>
                <TableCell>
                  <div className="font-semibold text-[var(--text-primary)]">{veh.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">{veh.plate}</div>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{veh.type}</span>
                </TableCell>

                <TableCell>
                  <div className="font-medium text-[var(--text-primary)]">{veh.weight_capacity_tonnes} Tonnes</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{veh.dimensions}</div>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-[var(--text-primary)] font-medium">{veh.mileage_kmpl} km/L</span>
                </TableCell>

                <TableCell>
                  <div className="text-xs text-[var(--text-primary)] font-medium">{veh.assigned_driver}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{veh.current_corridor}</div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={veh.status === 'ACTIVE' ? 'low' : veh.status === 'MAINTENANCE' ? 'medium' : 'neutral'}
                    dot
                  >
                    {veh.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => alert(`Viewing telemetry details for ${veh.name}`)}
                      className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(veh.id)}
                      className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--risk-high-bg)]"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
              Add New Freight Vehicle
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Register truck axle weight, physical clearances, and mileage profile for OR-Tools compatibility.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Vehicle Model / Make"
                  placeholder="e.g. Tata Signa 2823"
                  required
                  value={newVehicle.name}
                  onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                />
                <Input
                  label="Registration Number"
                  placeholder="e.g. AS-01-XY-1234"
                  required
                  value={newVehicle.plate}
                  onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Vehicle Category"
                  value={newVehicle.type}
                  onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}
                >
                  <option value="Multi-Axle Heavy Truck">Multi-Axle Heavy Truck</option>
                  <option value="Standard Freight Truck">Standard Freight Truck</option>
                  <option value="Refrigerated Reefer Truck">Refrigerated Reefer Truck</option>
                  <option value="Tipper / Mountain Cargo">Tipper / Mountain Cargo</option>
                  <option value="Mini Truck (LCV)">Mini Truck (LCV)</option>
                </Select>

                <Input
                  label="Gross Weight Capacity (Tonnes)"
                  type="number"
                  step="0.5"
                  required
                  value={newVehicle.weight_capacity_tonnes}
                  onChange={e => setNewVehicle({ ...newVehicle, weight_capacity_tonnes: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Assigned Driver"
                  placeholder="e.g. R. Das"
                  value={newVehicle.assigned_driver}
                  onChange={e => setNewVehicle({ ...newVehicle, assigned_driver: e.target.value })}
                />
                <Input
                  label="Rated Mileage (km/L)"
                  type="number"
                  step="0.1"
                  value={newVehicle.mileage_kmpl}
                  onChange={e => setNewVehicle({ ...newVehicle, mileage_kmpl: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                >
                  Save Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
