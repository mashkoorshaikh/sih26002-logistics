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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <SettingsIcon size={20} color="#6366f1" />
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>
              Platform Settings & Parameters
            </h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Configure regional fuel price benchmarks, fleet dimension thresholds, and SIH 2024 evaluation preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'Settings Saved!' : 'Save Configuration'}
        </button>
      </div>

      {/* Grid of Settings Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. Regional Fuel Pricing Configuration */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Fuel size={18} color="#d97706" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Regional Fuel Price Benchmarks (INR / Litre)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Commercial Freight Diesel (Base Rate)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={dieselPrice}
                  onChange={e => setDieselPrice(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{ paddingLeft: 24 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Inspection Pilot Petrol (Base Rate)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={petrolPrice}
                  onChange={e => setPetrolPrice(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{ paddingLeft: 24 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Remote Hill Surcharge (Mizoram / Arunachal)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>+₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={hillSurcharge}
                  onChange={e => setHillSurcharge(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  style={{ paddingLeft: 28 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. SIH 2024 Demo & Evaluation Preferences */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Sparkles size={18} color="#6366f1" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              SIH 2024 Presentation & Demo Mode Flags
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>
                  Enable Real-Time Route Simulation Buttons
                </strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Displays 'Trigger Heavy Rainfall Event' and 'Trigger Landslide Warning' on route planners.
                </span>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={e => setDemoMode(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>
                  Driver Hazard Audio Warning Beeps
                </strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Audio alert pulse when corridor risk transitions from LOW to HIGH.
                </span>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={e => setAudioAlerts(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Microservice Integrations Status */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Cpu size={18} color="#0d9488" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Backend Microservices & AI Model Status
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 700, marginBottom: 4 }}>
                <CheckCircle2 size={14} /> FastAPI Gateway
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>http://localhost:8000 • Online</span>
            </div>

            <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 700, marginBottom: 4 }}>
                <CheckCircle2 size={14} /> Google OR-Tools Solver
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>v9.10 Composite Optimization</span>
            </div>

            <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 700, marginBottom: 4 }}>
                <CheckCircle2 size={14} /> ML Random Forest Model
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>risk_rf_model.joblib • 100 Trees</span>
            </div>

            <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 700, marginBottom: 4 }}>
                <CheckCircle2 size={14} /> OpenAI GPT-4o-Mini
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tool Calling Dispatcher Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
