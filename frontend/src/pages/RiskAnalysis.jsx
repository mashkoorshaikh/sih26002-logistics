import React, { useState } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  CloudRain,
  Mountain,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

// Elevation and slope profile for Guwahati ➔ Shillong
const ELEVATION_PROFILE = [
  { km: 0,   location: 'Guwahati (Paltan Bazar)', elevation: 55,   slope: 1.2, risk: 15 },
  { km: 15,  location: 'Khanapara (Assam Border)', elevation: 72,   slope: 2.1, risk: 18 },
  { km: 32,  location: 'Jorabat Junction (NH6)',   elevation: 140,  slope: 5.4, risk: 24 },
  { km: 48,  location: 'Burnihat Industrial Cut',  elevation: 290,  slope: 8.2, risk: 32 },
  { km: 64,  location: 'Nongpoh Checkpoint',       elevation: 580,  slope: 9.6, risk: 38 },
  { km: 78,  location: 'Umsning Valley Bypass',    elevation: 890,  slope: 7.1, risk: 26 },
  { km: 92,  location: 'Barapani / Umiam Lake',    elevation: 1020, slope: 8.5, risk: 35 },
  { km: 104, location: 'Mawlai Crest',             elevation: 1420, slope: 11.2, risk: 42 },
  { km: 112, location: 'Shillong (Police Bazar)',  elevation: 1525, slope: 3.4, risk: 20 },
]

const ML_FEATURE_IMPORTANCE = [
  { feature: 'Precipitation & Rain Saturation', importance: 32, color: '#38bdf8' },
  { feature: 'Mountain Slope Gradient',        importance: 26, color: '#818cf8' },
  { feature: 'Road Surface & Cut Quality',     importance: 18, color: '#2dd4bf' },
  { feature: 'Atmospheric Fog / Visibility',   importance: 12, color: '#facc15' },
  { feature: 'Elevation Variance (m)',         importance: 8,  color: '#fb923c' },
  { feature: 'Traffic Density & Congestion',    importance: 4,  color: '#f87171' },
]

export default function RiskAnalysis() {
  const [selectedCorridor, setSelectedCorridor] = useState('Guwahati ➔ Shillong (NH6)')

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ShieldAlert size={20} color="#ef4444" />
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>
            Machine Learning Route Risk Assessment
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Trained Random Forest Classifier (100 estimators) predicting dynamic terrain failure, landslide probability, and monsoon risk.
        </p>
      </div>

      {/* Top Risk Score Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Composite Risk Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 36, color: '#34d399', lineHeight: 1 }}>
              22.5
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>/ 100</span>
          </div>
          <span style={{
            display: 'inline-block',
            marginTop: 8,
            fontSize: 11,
            fontWeight: 800,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '2px 8px',
            borderRadius: 6
          }}>
            LEVEL: LOW RISK
          </span>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ML Model Confidence
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 36, color: '#818cf8', lineHeight: 1 }}>
              94.2%
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            Validated cross-entropy loss
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Max Slope Gradient
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 36, color: '#facc15', lineHeight: 1 }}>
              11.2%
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            Mawlai mountain cutting
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Critical Segments
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 36, color: '#34d399', lineHeight: 1 }}>
              0 / 8
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#34d399', marginTop: 8 }}>
            All segments nominal
          </div>
        </div>
      </div>

      {/* Elevation & Mountain Gradient Chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Corridor Elevation & Terrain Cross-Section (Guwahati ➔ Shillong)
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Elevation increases from 55m (Brahmaputra Valley) to 1,525m (Khasi Hills Plateau)
            </p>
          </div>
          <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Total Climb: +1,470m</span>
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ELEVATION_PROFILE}>
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="km" unit=" km" stroke="var(--text-muted)" fontSize={11} />
              <YAxis unit="m" stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}
                formatter={(val, name) => [name === 'elevation' ? `${val} m` : `${val}%`, name === 'elevation' ? 'Elevation' : 'Slope']}
                labelFormatter={(label) => `Checkpoint at km ${label}`}
              />
              <Area type="monotone" dataKey="elevation" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#elevationGrad)" name="elevation" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Importance & Segment Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Feature Importance */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Random Forest Feature Importance Weights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ML_FEATURE_IMPORTANCE.map(f => (
              <div key={f.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.feature}</span>
                  <span style={{ fontWeight: 700, color: f.color }}>{f.importance}%</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.importance}%`, background: f.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkpoint Risk Table */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Key Mountain Checkpoints & Risk Ratings
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 6px' }}>Checkpoint</th>
                  <th style={{ padding: '8px 6px' }}>Elev</th>
                  <th style={{ padding: '8px 6px' }}>Slope</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {ELEVATION_PROFILE.map(p => (
                  <tr key={p.km} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 6px', color: '#f1f5f9', fontWeight: 600 }}>{p.location}</td>
                    <td style={{ padding: '8px 6px', color: '#94a3b8' }}>{p.elevation}m</td>
                    <td style={{ padding: '8px 6px', color: '#facc15' }}>{p.slope}%</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                      <span style={{
                        background: p.risk < 25 ? 'rgba(16, 185, 129, 0.15)' : p.risk < 35 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: p.risk < 25 ? '#34d399' : p.risk < 35 ? '#facc15' : '#f87171',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {p.risk} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
