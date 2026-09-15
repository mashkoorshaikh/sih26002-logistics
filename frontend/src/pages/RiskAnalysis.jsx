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
import { PageHeader, Card, Badge, StatCard } from '../components/ui'

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
  { feature: 'Precipitation & Rain Saturation', importance: 32, color: '#0284c7' },
  { feature: 'Mountain Slope Gradient',        importance: 26, color: '#16845B' },
  { feature: 'Road Surface & Cut Quality',     importance: 18, color: '#0d9488' },
  { feature: 'Atmospheric Fog / Visibility',   importance: 12, color: '#eab308' },
  { feature: 'Elevation Variance (m)',         importance: 8,  color: '#f97316' },
  { feature: 'Traffic Density & Congestion',    importance: 4,  color: '#ef4444' },
]

export default function RiskAnalysis() {
  const [selectedCorridor, setSelectedCorridor] = useState('Guwahati ➔ Shillong (NH6)')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Machine Learning Route Risk Assessment"
        subtitle="Trained Random Forest Classifier (100 estimators) predicting dynamic terrain failure, landslide probability, and monsoon risk."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'Risk Analysis' }
        ]}
        badge={
          <Badge variant="low" size="sm" dot>
            ML Model Online
          </Badge>
        }
      />

      {/* Top Risk Score Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Composite Risk Score"
          value="22.5 / 100"
          change="LEVEL: LOW RISK"
          changeType="positive"
          icon={ShieldCheck}
        />
        <StatCard
          title="ML Model Confidence"
          value="94.2%"
          change="Validated cross-entropy loss"
          changeType="neutral"
          icon={TrendingUp}
        />
        <StatCard
          title="Max Slope Gradient"
          value="11.2%"
          change="Mawlai mountain cutting"
          changeType="warning"
          icon={Mountain}
        />
        <StatCard
          title="Critical Segments"
          value="0 / 8"
          change="All segments nominal"
          changeType="positive"
          icon={CheckCircle2}
        />
      </div>

      {/* Elevation & Mountain Gradient Chart */}
      <Card padding="default">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
              Corridor Elevation & Terrain Cross-Section (Guwahati ➔ Shillong)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Elevation increases from 55m (Brahmaputra Valley) to 1,525m (Khasi Hills Plateau)
            </p>
          </div>
          <span className="text-xs text-[var(--primary)] font-bold">
            Total Climb: +1,470m
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ELEVATION_PROFILE}>
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16845B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#16845B" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="km" unit=" km" stroke="var(--text-muted)" fontSize={11} />
              <YAxis unit="m" stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                formatter={(val, name) => [name === 'elevation' ? `${val} m` : `${val}%`, name === 'elevation' ? 'Elevation' : 'Slope']}
                labelFormatter={(label) => `Checkpoint at km ${label}`}
              />
              <Area type="monotone" dataKey="elevation" stroke="#16845B" strokeWidth={2.5} fillOpacity={1} fill="url(#elevationGrad)" name="elevation" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Feature Importance & Segment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feature Importance */}
        <Card padding="default">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-4">
            Random Forest Feature Importance Weights
          </h3>
          <div className="space-y-3">
            {ML_FEATURE_IMPORTANCE.map(f => (
              <div key={f.feature}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">{f.feature}</span>
                  <span className="font-bold text-[var(--text-primary)]">{f.importance}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${f.importance}%`, backgroundColor: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Checkpoint Risk Table */}
        <Card padding="default">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-4">
            Key Mountain Checkpoints & Risk Ratings
          </h3>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
                  <th className="py-2.5 px-2">Checkpoint</th>
                  <th className="py-2.5 px-2">Elev</th>
                  <th className="py-2.5 px-2">Slope</th>
                  <th className="py-2.5 px-2 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {ELEVATION_PROFILE.map(p => (
                  <tr key={p.km} className="hover:bg-[var(--bg-surface-subtle)] transition-colors">
                    <td className="py-2.5 px-2 text-[var(--text-primary)] font-medium">{p.location}</td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)]">{p.elevation}m</td>
                    <td className="py-2.5 px-2 text-amber-600 dark:text-amber-400 font-semibold">{p.slope}%</td>
                    <td className="py-2.5 px-2 text-right">
                      <Badge
                        variant={p.risk < 25 ? 'low' : p.risk < 35 ? 'medium' : 'high'}
                        size="sm"
                      >
                        {p.risk} / 100
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
