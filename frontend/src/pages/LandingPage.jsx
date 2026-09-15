import React from 'react'
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
  Sun,
  Moon,
  ShieldCheck,
  TrendingDown,
  Activity,
  MapPin,
  ChevronRight
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
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
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150 flex flex-col selection:bg-[var(--primary)] selection:text-white">
      {/* ─── PUBLIC MARKETING HEADER ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* LEFT: Clean Logo + NERoute */}
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none group select-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-xs group-hover:bg-[var(--primary-hover)] transition-colors">
              <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)]">
                NERoute
              </span>
              <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
                SIH26002
              </span>
            </div>
          </Link>

          {/* RIGHT: Theme toggle, Sign In, Primary Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors shadow-xs cursor-pointer"
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <Link
              to="/login"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors"
            >
              Sign In
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/plan')}
            >
              Plan a Route
            </Button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION: TWO-COLUMN DESKTOP / COMPACT MOBILE ─────────────── */}
      <section className="relative pt-8 sm:pt-14 lg:pt-20 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f010_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f010_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT COLUMN: Headline, Description, Natural CTAs, Metrics */}
            <div className="lg:col-span-7 text-left space-y-5">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--primary)]/25 bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-semibold select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                <span>Smart India Hackathon 2026 • Problem SIH26002</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12] max-w-[680px]">
                Intelligent Routes for a <br />
                <span className="gradient-text">Smarter Northeast</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
                AI-powered logistics and accessibility platform designed to help plan safer, faster, and more efficient transportation across Northeast India.
              </p>

              {/* Natural Button Sizing (Not giant full-width bars) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/plan')}
                  className="shadow-sm"
                >
                  Plan a Route
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                >
                  Explore Dashboard
                </Button>
              </div>

              {/* Small Supporting Metrics */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>8 NER States</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>OR-Tools Multi-Objective</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>Bridge & Axle Compliance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>Monsoon Hazard Feeds</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Route / Map / Logistics Visual Preview */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-sm space-y-4 text-left">
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Corridor Intelligence Preview
                    </span>
                  </div>
                  <Badge variant="low" size="sm" dot>
                    Active Engine
                  </Badge>
                </div>

                {/* Corridor Parameters */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Origin</span>
                    <strong className="text-[var(--text-primary)]">Guwahati, Assam</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Destination</span>
                    <strong className="text-[var(--text-primary)]">Shillong, Meghalaya</strong>
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
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="low" size="sm" dot>
                      LOW RISK (18/100)
                    </Badge>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Vehicle & Bridge Safe
                    </span>
                  </div>
                </div>

                {/* Micro Corridor Elevation Profile */}
                <div className="p-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between font-medium">
                    <span>Elevation Change</span>
                    <span className="text-[var(--text-primary)] font-semibold">+920m (Barapani Crest)</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span>Lifeline Buffer</span>
                    <span className="text-[var(--primary)] font-semibold">4 Hospitals Monitored</span>
                  </div>
                </div>

                {/* Direct Action Link */}
                <button
                  type="button"
                  onClick={() => navigate('/plan')}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-[var(--primary)] bg-[var(--primary-subtle)]/60 hover:bg-[var(--primary-subtle)] border border-[var(--primary)]/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Interactive Route Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4-COLUMN FEATURE SECTION ───────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-1.5">
            Engineered for Northeast Terrain
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Logistics Intelligence Stack
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            Built specifically to address landslides, monsoons, narrow pass restrictions, and remote medical accessibility.
          </p>
        </div>

        {/* 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CORE_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <Card
                key={feat.title}
                padding="sm"
                hover
                className="text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mb-3 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">
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

      {/* ─── GOVERNMENT & STRATEGIC CITIZEN IMPACT ─────────────────────────── */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-surface-subtle)]/60 border-t border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl text-left">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-1.5">
              Empowering DoNER, NEC & State Transportation Authorities
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Provides real-time visibility into freight arteries, bridge capacities, and emergency diversions during high rainfall and geological hazard events across the 8 northeastern states.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="secondary"
              size="md"
              icon={Building2}
              onClick={() => navigate('/login')}
            >
              Government Portal
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CLEAN FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[var(--text-muted)] text-center border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            SIH26002 • AI-Based Smart Logistics & Accessibility Intelligence for NER
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">Sign In</Link>
            <Link to="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Dashboard</Link>
            <Link to="/plan" className="hover:text-[var(--text-primary)] transition-colors">Route Planner</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
