import React, { useState } from 'react'
import {
  Truck,
  Weight,
  Package,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Ruler,
  ChevronDown,
  ChevronUp,
  Fuel
} from 'lucide-react'
import { Input, Select, Button, Badge } from '../ui'

const VEHICLE_OPTIONS = [
  'Truck',
  'Mini truck',
  'Car',
  'Light Commercial Vehicle (LCV)',
  'Multi-Axle Heavy Truck',
  'Semi-Trailer',
  'Refrigerated Reefer Truck',
  'Tipper / Dumper'
]

const VEHICLE_SPECS_MAP = {
  'Truck': { height: 3.4, width: 2.4, length: 8.5, weight: 10 },
  'Mini truck': { height: 2.4, width: 1.8, length: 4.8, weight: 3.5 },
  'Car': { height: 1.6, width: 1.8, length: 4.2, weight: 1.5 },
  'Light Commercial Vehicle (LCV)': { height: 2.8, width: 2.1, length: 6.0, weight: 5.0 },
  'Multi-Axle Heavy Truck': { height: 3.8, width: 2.5, length: 12.0, weight: 12.0 },
  'Semi-Trailer': { height: 4.2, width: 2.6, length: 16.5, weight: 14.0 },
  'Refrigerated Reefer Truck': { height: 3.6, width: 2.5, length: 10.5, weight: 11.0 },
  'Tipper / Dumper': { height: 3.5, width: 2.5, length: 8.8, weight: 15.0 }
}

const CARGO_OPTIONS = [
  'Medicine',
  'Perishable goods',
  'Heavy equipment',
  'Vegetables',
  'Fruits',
  'General goods'
]

const QUICK_ROUTES = [
  { source: 'Guwahati', destination: 'Shillong', vehicle: 'Truck', vWeight: 10, cargo: 'Medicine', cWeight: 2, label: 'Guwahati ➔ Shillong (Lifeline Medicines)' },
  { source: 'Silchar', destination: 'Agartala', vehicle: 'Truck', vWeight: 10, cargo: 'General goods', cWeight: 6, label: 'Silchar ➔ Agartala (FMCG Freight)' },
  { source: 'Tezpur', destination: 'Itanagar', vehicle: 'Truck', vWeight: 10, cargo: 'Vegetables', cWeight: 4, label: 'Tezpur ➔ Itanagar (Foothills Corridor)' },
  { source: 'Dimapur', destination: 'Kohima', vehicle: 'Multi-Axle Heavy Truck', vWeight: 12, cargo: 'Heavy equipment', cWeight: 5, label: 'Dimapur ➔ Kohima (Bridge Limit Test)' },
]

export default function RoutePlannerForm({
  onSubmit,
  loading = false,
  error = null,
  initialValues = null
}) {
  const initialType = initialValues?.vehicle_type || 'Truck'
  const initialSpec = VEHICLE_SPECS_MAP[initialType] || VEHICLE_SPECS_MAP['Truck']

  const [formData, setFormData] = useState({
    source: initialValues?.source || 'Guwahati',
    destination: initialValues?.destination || 'Shillong',
    vehicle_type: initialType,
    vehicle_weight: initialValues?.vehicle_weight ?? initialSpec.weight,
    cargo_type: initialValues?.cargo_type || 'Medicine',
    cargo_weight: initialValues?.cargo_weight ?? 3,
    vehicle_height: initialSpec.height,
    vehicle_width: initialSpec.width,
    vehicle_length: initialSpec.length,
    fuel_price: initialValues?.fuel_price ?? 92.0,
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'vehicle_type' && VEHICLE_SPECS_MAP[value]) {
        const spec = VEHICLE_SPECS_MAP[value]
        updated.vehicle_height = spec.height
        updated.vehicle_width = spec.width
        updated.vehicle_length = spec.length
        updated.vehicle_weight = spec.weight
      }
      return updated
    })
  }

  const handleApplyQuickRoute = (preset) => {
    const spec = VEHICLE_SPECS_MAP[preset.vehicle] || VEHICLE_SPECS_MAP['Truck']
    setFormData(prev => ({
      ...prev,
      source: preset.source,
      destination: preset.destination,
      vehicle_type: preset.vehicle,
      vehicle_weight: preset.vWeight,
      cargo_type: preset.cargo,
      cargo_weight: preset.cWeight,
      vehicle_height: spec.height,
      vehicle_width: spec.width,
      vehicle_length: spec.length,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.source.trim() || !formData.destination.trim()) return

    const vWeight = parseFloat(formData.vehicle_weight) || 10
    const cWeight = parseFloat(formData.cargo_weight) || 3
    const grossTonnes = vWeight + cWeight

    onSubmit({
      source: formData.source.trim(),
      destination: formData.destination.trim(),
      vehicle_type: formData.vehicle_type,
      vehicle_weight: vWeight,
      cargo_type: formData.cargo_type,
      cargo_weight: cWeight,
      vehicle_height: parseFloat(formData.vehicle_height) || undefined,
      vehicle_width: parseFloat(formData.vehicle_width) || undefined,
      vehicle_length: parseFloat(formData.vehicle_length) || undefined,
      vehicle_weight_kg: grossTonnes * 1000.0,
      fuel_price: formData.fuel_price ? parseFloat(formData.fuel_price) : undefined,
    })
  }

  const grossWeight = ((parseFloat(formData.vehicle_weight) || 0) + (parseFloat(formData.cargo_weight) || 0)).toFixed(1)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Route Parameters
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Configure origin, destination, chassis and cargo load
          </p>
        </div>
        <Badge variant="neutral" size="sm">
          Gross: {grossWeight} t
        </Badge>
      </div>

      {/* Quick Presets */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Preset Corridors
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ROUTES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyQuickRoute(preset)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all select-none"
            >
              {preset.source} ➔ {preset.destination}
            </button>
          ))}
        </div>
      </div>

      {/* Form Controls */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="From (Origin)"
            placeholder="e.g. Guwahati"
            required
            value={formData.source}
            onChange={e => handleChange('source', e.target.value)}
          />

          <Input
            label="To (Destination)"
            placeholder="e.g. Shillong"
            required
            value={formData.destination}
            onChange={e => handleChange('destination', e.target.value)}
          />
        </div>

        {/* Vehicle Type & Vehicle Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Vehicle Type"
            value={formData.vehicle_type}
            onChange={e => handleChange('vehicle_type', e.target.value)}
            options={VEHICLE_OPTIONS}
          />

          <Input
            label="Vehicle Tare Weight (Tonnes)"
            type="number"
            step="0.5"
            min="0.5"
            required
            value={formData.vehicle_weight}
            onChange={e => handleChange('vehicle_weight', e.target.value)}
          />
        </div>

        {/* Cargo Type & Cargo Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cargo Type"
            value={formData.cargo_type}
            onChange={e => handleChange('cargo_type', e.target.value)}
            options={CARGO_OPTIONS}
          />

          <Input
            label="Cargo Net Weight (Tonnes)"
            type="number"
            step="0.5"
            min="0.1"
            required
            value={formData.cargo_weight}
            onChange={e => handleChange('cargo_weight', e.target.value)}
          />
        </div>

        {/* Advanced Options Accordion */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none"
          >
            <span>Advanced Clearances & Fuel Options</span>
            {showAdvanced ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 rounded-lg bg-[var(--bg-surface-subtle)]/50 border border-[var(--border-subtle)] space-y-3 animate-fade-in">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Height (m)"
                  type="number"
                  step="0.1"
                  value={formData.vehicle_height}
                  onChange={e => handleChange('vehicle_height', e.target.value)}
                />
                <Input
                  label="Width (m)"
                  type="number"
                  step="0.1"
                  value={formData.vehicle_width}
                  onChange={e => handleChange('vehicle_width', e.target.value)}
                />
                <Input
                  label="Length (m)"
                  type="number"
                  step="0.1"
                  value={formData.vehicle_length}
                  onChange={e => handleChange('vehicle_length', e.target.value)}
                />
              </div>

              <Input
                label="Diesel Fuel Price (₹/Litre)"
                type="number"
                step="0.5"
                value={formData.fuel_price}
                onChange={e => handleChange('fuel_price', e.target.value)}
                helperText="Applied for accurate terrain consumption calculations."
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-lg bg-[var(--risk-high-bg)] border border-[var(--color-danger)]/20 text-xs text-[var(--color-danger)] font-medium flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          icon={ArrowRight}
        >
          {loading ? 'Calculating Best Route...' : 'Find Best Route'}
        </Button>
      </form>
    </div>
  )
}
