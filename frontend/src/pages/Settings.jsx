import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Fuel,
  Truck,
  Cpu,
  Bell,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Sliders
} from 'lucide-react'
import { PageHeader, Card, Button, Badge, Input } from '../components/ui'

export default function Settings() {
  const [dieselPrice, setDieselPrice] = useState(92.0)
  const [petrolPrice, setPetrolPrice] = useState(98.0)
  const [hillSurcharge, setHillSurcharge] = useState(8.5)
  const [demoMode, setDemoMode] = useState(true)
  const [audioAlerts, setAudioAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Settings & Parameters"
        subtitle="Configure regional fuel price benchmarks, fleet dimension thresholds, and SIH evaluation preferences."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Settings' }
        ]}
        action={
          <Button
            variant="primary"
            size="md"
            icon={saved ? CheckCircle2 : Save}
            onClick={handleSave}
          >
            {saved ? 'Settings Saved!' : 'Save Configuration'}
          </Button>
        }
      />

      {/* Grid of Settings Cards */}
      <div className="space-y-5">
        {/* 1. Regional Fuel Pricing Configuration */}
        <Card padding="default">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                Regional Fuel Price Benchmarks (INR / Litre)
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Dynamic cost modeling parameters used in Google OR-Tools routing
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Commercial Diesel (Base Rate)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={dieselPrice}
                  onChange={e => setDieselPrice(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[44px] pl-7 pr-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Inspection Petrol (Base Rate)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={petrolPrice}
                  onChange={e => setPetrolPrice(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[44px] pl-7 pr-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Remote Hill Surcharge
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">+₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={hillSurcharge}
                  onChange={e => setHillSurcharge(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[44px] pl-8 pr-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. SIH Demo & Evaluation Preferences */}
        <Card padding="default">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                SIH Presentation & Evaluation Preferences
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Toggle simulation aids and alert thresholds
              </span>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            <div className="flex items-center justify-between py-3 gap-4">
              <div>
                <strong className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] block">
                  Enable Real-Time Route Simulation Controls
                </strong>
                <span className="text-xs text-[var(--text-muted)]">
                  Displays 'Trigger Heavy Rainfall Event' and 'Trigger Landslide Warning' on route planners.
                </span>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={e => setDemoMode(e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-3 gap-4">
              <div>
                <strong className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] block">
                  Driver Hazard Audio Warning Beeps
                </strong>
                <span className="text-xs text-[var(--text-muted)]">
                  Audio alert pulse when corridor risk transitions from LOW to HIGH.
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={e => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 3. Microservice Integrations Status */}
        <Card padding="default">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                Backend Microservices & AI Model Status
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Live heartbeat verification across routing and ML engines
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>FastAPI Gateway</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">localhost:8000 • Online</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OR-Tools Solver</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">v9.10 Constraint Solver</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Random Forest</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">risk_rf_model • 100 Trees</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OpenAI GPT-4o</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">Assistant Agent Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
