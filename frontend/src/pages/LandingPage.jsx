import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  ArrowRight,
  Route,
  CloudRain,
  Truck,
  Radio,
  Hospital,
  Zap,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  MapPin,
  TrendingDown,
  Activity
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

// 6 Core Features requested in Section 6
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
    title: 'Vehicle & Cargo Management',
    desc: 'Physical bridge limits, axle weight caps, and cold-chain priorities automatically enforced.'
  },
  {
    icon: Radio,
    title: 'Real-Time Vehicle Tracking',
    desc: 'Continuous GPS telemetry and corridor checkpoint monitoring with automatic diversion prompts.'
  },
  {
    icon: Hospital,
    title: 'Accessibility Intelligence',
    desc: 'Lifeline scoring ensuring commercial freight stays within reach of emergency trauma centers and fuel depots.'
  },
  {
    icon: Zap,
    title: 'Route Optimization',
    desc: 'Google OR-Tools multi-criteria engine balancing fuel economy, travel duration, and terrain safety.'
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150 flex flex-col selection:bg-[var(--primary)] selection:text-white">
      {/* ─── PUBLIC MARKETING NAVBAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                NER Logistics
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--primary-subtle)] text-[var(--primary)] font-bold">
                SIH26002
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>

            <Link
              to="/login"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Gov Portal</span>
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

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-14 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-semibold mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span>Smart India Hackathon 2026 • Problem SIH26002</span>
          </div>

          {/* Headline requested */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] mb-5 leading-[1.12]">
            Intelligent Routes for a <br />
            <span className="gradient-text">Smarter Northeast</span>
          </h1>

          {/* Supporting Text requested */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered logistics and accessibility platform designed to help plan safer, faster, and more efficient transportation across Northeast India.
          </p>

          {/* Primary and Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Button
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              onClick={() => navigate('/plan')}
              className="w-full sm:w-auto shadow-md"
            >
              Plan a Route
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              Explore Dashboard
            </Button>
          </div>

          {/* Subtle Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[var(--text-muted)] font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>8 North Eastern States</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>OR-Tools Multi-Objective</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Bridge & Axle Restrictions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>NDMA Hazard Integration</span>
            </div>
          </div>
        </div>

        {/* Realistic Product / Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 relative z-10">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 sm:p-3 shadow-xl">
            {/* Fake browser top bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] mb-3 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-0.5 rounded bg-[var(--bg-surface-subtle)] text-[11px] font-mono border border-[var(--border-subtle)]">
                https://ner-logistics.gov.in/plan?from=Guwahati&to=Shillong
              </div>
              <div className="text-[11px] font-medium text-[var(--primary)]">Live Engine Active</div>
            </div>

            {/* Split Preview Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Controls Column Preview */}
              <div className="md:col-span-4 p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Route Parameters</span>
                  <Badge variant="brand" size="sm">OR-Tools</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Origin</span>
                    <div className="font-bold text-[var(--text-primary)]">Guwahati (Kamrup Met.)</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Destination</span>
                    <div className="font-bold text-[var(--text-primary)]">Shillong (East Khasi Hills)</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Vehicle & Cargo</span>
                    <div className="font-medium text-[var(--text-primary)]">Standard Truck (10t) • Medicines</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-xs">
                  <div className="flex items-center justify-between font-bold text-[var(--primary)] mb-1">
                    <span>RECOMMENDED ROUTE</span>
                    <span>98.8 km</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    NH6 Asian Highway 1 • 2h 42m • Fuel: ₹1,817.92
                  </div>
                </div>
              </div>

              {/* Map Column Preview */}
              <div className="md:col-span-8 h-64 md:h-auto rounded-xl bg-slate-900 border border-[var(--border-subtle)] p-4 relative overflow-hidden flex flex-col justify-between text-left">
                <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      🟢 LOW RISK (18/100)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                      4 Emergency Hospitals Online
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Carto Mountain GIS</span>
                </div>

                {/* Simulated route line */}
                <div className="relative z-10 flex items-center justify-between py-8 px-6">
                  <div className="text-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mx-auto shadow-md">A</div>
                    <span className="text-[11px] text-white font-medium mt-1 block">Guwahati</span>
                  </div>
                  <div className="flex-1 mx-4 h-0.5 bg-emerald-500 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-900/90 border border-emerald-500/40 text-[9px] text-emerald-300 font-mono">
                      NH6 Valley Corridor
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center mx-auto shadow-md">B</div>
                    <span className="text-[11px] text-white font-medium mt-1 block">Shillong</span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  <span>Terrain gradient: +920m elev. change</span>
                  <span className="text-emerald-400 font-medium">Clear road conditions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT FEATURES SECTION ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-2">
            Engineered for Northeast Terrain
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Complete Logistics Intelligence Stack
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            Built specifically to address landslides, monsoons, narrow pass restrictions, and remote medical accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all duration-150 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">
                  {feat.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── GOVERNMENT & CITIZEN IMPACT ─────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[var(--bg-surface-subtle)]/50 border-t border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2">
              Empowering DoNER, NEC & State Authorities
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Provides real-time visibility into freight arteries, bridge capacities, and emergency diversions during high rainfall and geological hazard events.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={Building2}
              onClick={() => navigate('/login')}
            >
              Access Government Portal
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 sm:px-6 border-t border-[var(--border-subtle)] mt-auto text-xs text-[var(--text-muted)] text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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
    </div>
  )
}
