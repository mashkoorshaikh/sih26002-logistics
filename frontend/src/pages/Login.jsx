import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { MapPin, Mail, Lock, Eye, EyeOff, AlertCircle, Building2, ShieldCheck } from 'lucide-react'

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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-dark)', padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}/>

      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#6366f1,#14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MapPin size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: '#f1f5f9' }}>Welcome back</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Sign in to NER Logistics Platform</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20
          }}>
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ fontSize: 14, color: '#ef4444' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Email */}
          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                id="login-password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '4px 0',
            color: '#475569',
            fontSize: 12
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span>OR GOVERNMENT EVALUATION</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <button
            id="demo-admin-login-btn"
            type="button"
            onClick={handleDemoAdminLogin}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(20, 184, 166, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              borderRadius: 10,
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Building2 size={18} color="#818cf8" />
            Quick Demo Admin Portal (SIH26002)
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#475569' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
