import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  ArrowRight,
  Route,
  CloudRain,
  Truck,
  Radio,
  Building2,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

// 4 Core Features requested in Section 6
const CORE_FEATURES = [
  {
    icon: Route,
    title: 'AI Route Planning',
    desc: 'Multi-objective path generation trained on mountain terrain data and monsoon historical disruption patterns.'
  },
  {
    icon: CloudRain,
    title: 'Live Weather & Risk',
    desc: 'Real-time rainfall radar and landslide hazard overlays that dynamically update route risk scores.'
  },
  {
    icon: Truck,
    title: 'Vehicle & Cargo',
    desc: 'Physical bridge limits, axle weight caps, and cold-chain priorities automatically enforced.'
  },
  {
    icon: Radio,
    title: 'Live Tracking',
    desc: 'Continuous GPS telemetry and corridor checkpoint monitoring with automatic diversion prompts.'
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150 flex flex-col selection:bg-[var(--primary)] selection:text-white w-full max-w-[100vw] overflow-x-hidden">
      {/* ─── RESPONSIVE MARKETING HEADER ────────────────────────────────────────── */}
      <Navbar
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />

      {/* ─── HERO SECTION: INTENTIONAL COMPACT MOBILE COMPOSITION ──────────── */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f010_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f010_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* ─── HERO CONTENT COLUMN ─── */}
            <div className="lg:col-span-7 text-left space-y-4 sm:space-y-5">
              {/* 1. Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--primary)]/25 bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-semibold select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                <span>Smart India Hackathon 2026 • SIH26002</span>
              </div>

              {/* 2. Scaled Mobile-First Headline (36–46px) */}
              <h1 className="text-[clamp(2rem,6vw,2.875rem)] font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.14] max-w-xl">
                Intelligent Routes for a <br className="hidden sm:inline" />
                <span className="gradient-text">Smarter Northeast</span>
              </h1>

              {/* 3. Short Description (16–18px) */}
              <p className="text-[15px] sm:text-[17px] text-[var(--text-secondary)] max-w-xl leading-relaxed">
                AI-powered logistics and accessibility platform designed to plan safer, faster, and more efficient transportation across Northeast India.
              </p>

              {/* 4 & 5. Primary and Secondary Action Buttons (44–52px touch height, natural width) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/plan')}
                  className="min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 shadow-sm font-bold text-sm w-full sm:w-auto justify-center"
                >
                  Plan a Route →
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  className="min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 font-semibold text-sm w-full sm:w-auto justify-center"
                >
                  Explore Dashboard
                </Button>
              </div>

              {/* 6. Small Supporting Metrics (Clean horizontal flow) */}
              <div className="pt-3 sm:pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>8 NER States</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>OR-Tools Optimal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>Bridge Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>Monsoon Feeds</span>
                </div>
              </div>
            </div>

            {/* ─── VISUAL PREVIEW: Appears BELOW CTAs on Mobile, Right Column on Desktop ─── */}
            <div className="lg:col-span-5 w-full mt-2 lg:mt-0">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs space-y-3.5 text-left">
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Corridor Intelligence Snapshot
                    </span>
                  </div>
                  <Badge variant="low" size="sm" dot>
                    Live Engine
                  </Badge>
                </div>

                {/* Corridor Parameters */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Origin</span>
                    <strong className="text-[var(--text-primary)] truncate block">Guwahati, Assam</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Destination</span>
                    <strong className="text-[var(--text-primary)] truncate block">Shillong, Meghalaya</strong>
                  </div>
                </div>

                {/* Recommended Route Card */}
                <div className="p-3.5 rounded-xl bg-[var(--primary-subtle)] border border-[var(--primary)]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-[var(--primary)] uppercase">
                      RECOMMENDED ROUTE
                    </span>
                    <span className="text-xs font-bold text-[var(--primary)]">
                      98.8 km • 2h 42m
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>NH6 Asian Highway 1</span>
                    <span className="font-semibold text-[var(--text-primary)]">Fuel: ₹1,817.92</span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Badge variant="low" size="sm" dot>
                      LOW RISK (18/100)
                    </Badge>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Bridge Safe
                    </span>
                  </div>
                </div>

                {/* Direct Action Link */}
                <button
                  type="button"
                  onClick={() => navigate('/plan')}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-[var(--primary)] bg-[var(--primary-subtle)]/60 hover:bg-[var(--primary-subtle)] border border-[var(--primary)]/25 flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>Interactive Route Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOBILE-FIRST FEATURE CARDS (1 Column Mobile / 4 Columns Desktop) ─── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-1">
            Engineered for Northeast Terrain
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Logistics Intelligence Stack
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            Built specifically to address landslides, monsoons, narrow pass restrictions, and remote medical accessibility.
          </p>
        </div>

        {/* 1 Column on Mobile, 2 on Tablet, 4 on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {CORE_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <Card
                key={feat.title}
                padding="default"
                hover
                className="text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mb-2.5 shadow-xs flex-shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ─── GOVERNMENT & STRATEGIC IMPACT ─────────────────────────────────── */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface-subtle)]/50 border-t border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="max-w-2xl text-left">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
              Empowering DoNER, NEC & Transportation Authorities
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Real-time arterial visibility into freight corridors, bridge load clearances, and emergency diversions across the 8 northeastern states.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              icon={Building2}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto justify-center min-h-[44px]"
            >
              Government Portal
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[var(--text-muted)] text-center border-t border-[var(--border-subtle)] pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            SIH26002 • AI-Based Smart Logistics & Accessibility Intelligence for NER
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Sign In</Link>
            <Link to="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Dashboard</Link>
            <Link to="/plan" className="hover:text-[var(--text-primary)] transition-colors">Route Planner</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <BottomNav onOpenDrawer={() => setMobileDrawerOpen(true)} />
    </div>
  )
}
