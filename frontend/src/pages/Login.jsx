import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Mountain,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Button, Input, Badge } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coldStartNotice, setColdStartNotice] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // Cold start timer notice: if login takes > 2.5s, let user know the server is waking up
  useEffect(() => {
    let timer
    if (loading) {
      timer = setTimeout(() => {
        setColdStartNotice(true)
      }, 2500)
    } else {
      setColdStartNotice(false)
    }
    return () => clearTimeout(timer)
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAdminLogin = () => {
    useAuthStore.getState().login(
      {
        id: 'gov-admin-01',
        full_name: 'DoNER Regional Logistics Administrator',
        email: 'admin.doner@gov.in',
        organization: 'Ministry of DoNER / SIH26002 Authority'
      },
      'sih26002-admin-demo-token'
    )
    navigate('/admin')
  }

  const handleDemoOfficerLogin = () => {
    useAuthStore.getState().login(
      {
        id: 'officer-01',
        full_name: 'Command Officer Sharma',
        email: 'officer@neroute.gov.in',
        organization: 'NER Logistics Operations'
      },
      'sih26002-officer-demo-token'
    )
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex bg-[var(--bg-app)]">
      {/* ─── DESKTOP LEFT SHOWCASE PANEL (Hidden on mobile < lg) ──────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0c1e15] via-[#11291d] to-[#08120d] text-white select-none border-r border-[#1d3d2c]">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#16845B]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2FA36F]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Topographic Grid Lines SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Top Branding Eyebrow */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16845B]/20 border border-[#2FA36F]/40 text-[#59D6A2] text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart India Hackathon 2026 • SIH26002</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white max-w-lg">
            Precision Freight & Lifeline Corridor Intelligence for Northeast India
          </h1>

          <p className="text-sm text-emerald-100/75 leading-relaxed max-w-md">
            Multi-objective constraint optimization, real-time Doppler radar weather feeds, and bridge clearance compliance across all 8 mountain states.
          </p>
        </div>

        {/* Center Live Platform Highlights */}
        <div className="relative z-10 grid grid-cols-1 gap-3.5 max-w-md my-8">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/30 border border-[#2FA36F]/40 text-[#59D6A2] flex items-center justify-center flex-shrink-0">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">8 North Eastern States Connected</div>
              <div className="text-[11px] text-emerald-200/60">Assam, Meghalaya, Tripura, Mizoram, Manipur, Nagaland, Arunachal & Sikkim</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/30 border border-[#2FA36F]/40 text-[#59D6A2] flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Random Forest Risk Engine + Google OR-Tools</div>
              <div className="text-[11px] text-emerald-200/60">Real-time mountain hazard calibration & Pareto optimal route decisions</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/30 border border-[#2FA36F]/40 text-[#59D6A2] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Verified Lifeline Infrastructure Buffer</div>
              <div className="text-[11px] text-emerald-200/60">Emergency medical hospitals, hill fuel depots & cold chain hubs</div>
            </div>
          </div>
        </div>

        {/* Bottom Authority Endorsement */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#59D6A2]" />
            <span>Ministry of Development of North Eastern Region (DoNER)</span>
          </div>
          <span className="font-mono text-[11px] text-[#59D6A2]">v1.0 • Secure</span>
        </div>
      </div>

      {/* ─── RIGHT AUTHENTICATION PANEL (Full width on mobile, 50% on desktop) ─ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 relative">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Header Eyebrow (Visible on mobile only) */}
          <div className="lg:hidden text-center space-y-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-subtle)] border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH26002 • Logistics Intelligence</span>
            </div>
          </div>

          {/* Card Container */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm backdrop-blur-md">
            
            {/* Logo, Title & Subtitle */}
            <div className="text-center mb-6">
              <div className="w-13 h-13 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center mx-auto mb-3.5 shadow-md ring-4 ring-[var(--primary)]/15">
                <Compass className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Sign in to Platform
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-xs mx-auto">
                Access real-time corridor telemetry, multi-objective route planning, and fleet analytics.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 mb-5 rounded-xl bg-[var(--risk-high-bg)] border border-[var(--risk-high-border)] flex items-start gap-2.5 text-xs text-[var(--color-danger)] font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  label="Email Address"
                  icon={Mail}
                  placeholder="admin@gmail.com or officer@neroute.gov.in"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Enter password (e.g. admin123)"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full min-h-[44px] pl-10 pr-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--text-muted)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="min-h-[44px] min-w-[40px] absolute right-0 top-0 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Cold start wake-up banner if request is taking time */}
              {coldStartNotice && (
                <div className="p-3 rounded-xl bg-[var(--primary-subtle)] border border-[var(--primary)]/30 flex items-center gap-2.5 text-xs text-[var(--primary)] font-medium animate-pulse">
                  <Clock className="w-4 h-4 flex-shrink-0 animate-spin" />
                  <span>Connecting to cloud server (Render free-tier cold start may take ~30s on first load)...</span>
                </div>
              )}

              {/* Sign In CTA */}
              <Button
                id="login-submit"
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="min-h-[48px] font-bold text-sm tracking-wide shadow-sm"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <span className="relative bg-[var(--bg-surface)] px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Instant Evaluation Access
              </span>
            </div>

            {/* Quick Demo Evaluation Cards */}
            <div className="space-y-2.5">
              {/* Demo Officer Button Card */}
              <button
                id="demo-officer-login-btn"
                type="button"
                onClick={handleDemoOfficerLogin}
                className="w-full p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--primary-subtle)]/50 hover:border-[var(--primary)]/40 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      Field Logistics Officer
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      Routes, Fleet Telemetry & Live Tracking
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] flex-shrink-0 pl-2">
                  <span>Enter</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Demo Admin Button Card */}
              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={handleDemoAdminLogin}
                className="w-full p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--primary-subtle)]/50 hover:border-[var(--primary)]/40 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      DoNER Regional Administrator
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      Multi-State Oversight & Hazard Directives
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] flex-shrink-0 pl-2">
                  <span>Portal</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Bottom Register Link */}
            <p className="text-center mt-6 text-xs text-[var(--text-muted)]">
              Need new credentials?{' '}
              <Link to="/register" className="text-[var(--primary)] font-bold hover:underline">
                Create an agency account
              </Link>
            </p>

          </div>

          {/* Bottom Security Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Encrypted with SHA-256 & JWT Authentication</span>
          </div>

        </div>
      </div>
    </div>
  )
}
