import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import {
  Compass,
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Mountain,
  Activity,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { Button, Input } from '../components/ui'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', organization: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await authService.register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
            <pattern id="reg-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reg-grid-pattern)" />
        </svg>

        {/* Top Branding Eyebrow */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16845B]/20 border border-[#2FA36F]/40 text-[#59D6A2] text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join the NER Logistics Network</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white max-w-lg">
            Empower Freight Operations Across Mountain Highways
          </h1>

          <p className="text-sm text-emerald-100/75 leading-relaxed max-w-md">
            Register your transport agency, logistics fleet, or government department to access real-time road clearance data, weather radar, and optimized routing.
          </p>
        </div>

        {/* Platform Highlights */}
        <div className="relative z-10 grid grid-cols-1 gap-3.5 max-w-md my-8">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/30 border border-[#2FA36F]/40 text-[#59D6A2] flex items-center justify-center flex-shrink-0">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Terrain-Aware Dispatch</div>
              <div className="text-[11px] text-emerald-200/60">Elevation gradients, slope percentages and bridge weight thresholds</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/30 border border-[#2FA36F]/40 text-[#59D6A2] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Government & Civil Authority Standards</div>
              <div className="text-[11px] text-emerald-200/60">Compliant with PM Gati Shakti National Master Plan guidelines</div>
            </div>
          </div>
        </div>

        {/* Bottom Endorsement */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#59D6A2]" />
            <span>SIH26002 • Secure Agency Enrollment</span>
          </div>
          <span className="font-mono text-[11px] text-[#59D6A2]">v1.0</span>
        </div>
      </div>

      {/* ─── RIGHT REGISTRATION PANEL ─────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-4">

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm backdrop-blur-md">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-13 h-13 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center mx-auto mb-3.5 shadow-md ring-4 ring-[var(--primary)]/15">
                <Compass className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Create Agency Account
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-xs mx-auto">
                Join the North Eastern Region smart logistics intelligence network.
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3.5 mb-4 rounded-xl bg-[var(--risk-high-bg)] border border-[var(--risk-high-border)] flex items-start gap-2.5 text-xs text-[var(--color-danger)] font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 mb-4 rounded-xl bg-[var(--risk-low-bg)] border border-[var(--risk-low-border)] flex items-start gap-2.5 text-xs text-[var(--color-success)] font-medium animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Account registered successfully! Redirecting to login portal...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <Input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  required
                  label="Full Name"
                  icon={User}
                  placeholder="e.g. Debashish Roy"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  label="Official Email Address"
                  icon={Mail}
                  placeholder="you@agency.gov.in"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Input
                  id="reg-org"
                  name="organization"
                  type="text"
                  label="Organization / Department"
                  icon={Building2}
                  placeholder="Assam State Transport Corporation"
                  value={form.organization}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Password (min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    id="reg-password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
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

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    name="confirmPassword"
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full min-h-[44px] pl-10 pr-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <Button
                id="reg-submit"
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={success}
                className="min-h-[48px] font-bold text-sm tracking-wide shadow-sm mt-2"
              >
                Create Account
              </Button>
            </form>

            {/* Link to Login */}
            <p className="text-center mt-6 text-xs text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--primary)] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Encrypted with SHA-256 & JWT Authentication</span>
          </div>

        </div>
      </div>
    </div>
  )
}
