import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { MapPin, Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle, CheckCircle2, Compass } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'

export default function Register() {
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ fullName: '', email: '', organization: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
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
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
              Create account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Join SIH26002 NER Logistics Platform
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-[var(--risk-high-bg)] border border-[var(--risk-high-border)] flex items-center gap-2.5 text-xs text-[var(--color-danger)] font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 rounded-xl bg-[var(--risk-low-bg)] border border-[var(--risk-low-border)] flex items-center gap-2.5 text-xs text-[var(--color-success)] font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Account created! Redirecting to login...</span>
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
                placeholder="Debashish Roy"
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
                label="Email Address"
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
                label="Organization (Optional)"
                icon={Building2}
                placeholder="Assam State Transport / Freight Agency"
                value={form.organization}
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
                  id="reg-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
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
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
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
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-5 text-xs text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
