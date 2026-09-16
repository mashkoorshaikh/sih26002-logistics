import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { MapPin, Mail, Lock, Eye, EyeOff, AlertCircle, Building2, ShieldCheck, Compass } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-app)]">
      <div className="w-full max-w-md">
        <Card padding="large" className="shadow-lg border-[var(--border-subtle)]">
          {/* Logo & Heading */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Sign in to SIH26002 NER Logistics Platform
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-[var(--risk-high-bg)] border border-[var(--risk-high-border)] flex items-center gap-2.5 text-xs text-[var(--color-danger)] font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                label="Email Address"
                icon={Mail}
                placeholder="you@agency.gov.in"
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>

            <div className="flex items-center gap-3 my-3 text-[11px] font-semibold text-[var(--text-muted)]">
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              <span>OR EVALUATION ACCESS</span>
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            </div>

            <div className="space-y-2">
              <button
                id="demo-officer-login-btn"
                type="button"
                onClick={handleDemoOfficerLogin}
                className="w-full h-11 px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] transition-all cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Quick Demo Officer (Dashboard)</span>
              </button>

              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={handleDemoAdminLogin}
                className="w-full h-11 px-4 rounded-xl bg-[var(--primary-subtle)] border border-[var(--primary)]/30 text-[var(--primary)] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary)]/15 transition-all cursor-pointer shadow-xs"
              >
                <Building2 className="w-4 h-4" />
                <span>Quick Demo Admin Portal (DoNER)</span>
              </button>
            </div>
          </form>

          <p className="text-center mt-5 text-xs text-[var(--text-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--primary)] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
