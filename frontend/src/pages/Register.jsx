import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { MapPin, Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-dark)', padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}/>

      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#6366f1,#14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MapPin size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: '#f1f5f9' }}>Create account</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Join NER Logistics Platform</p>
        </div>

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

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20
          }}>
            <CheckCircle size={16} color="#22c55e" />
            <span style={{ fontSize: 14, color: '#22c55e' }}>Account created! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full Name */}
          <div>
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input id="reg-name" name="fullName" type="text" required placeholder="John Doe"
                value={form.fullName} onChange={handleChange} className="input-field" style={{ paddingLeft: 42 }} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input id="reg-email" name="email" type="email" required placeholder="you@company.com"
                value={form.email} onChange={handleChange} className="input-field" style={{ paddingLeft: 42 }} />
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className="form-label">Organization <span style={{ color: '#334155' }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input id="reg-org" name="organization" type="text" placeholder="Logistics Company Ltd."
                value={form.organization} onChange={handleChange} className="input-field" style={{ paddingLeft: 42 }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input id="reg-password" name="password" type={showPwd ? 'text' : 'password'} required
                placeholder="Min. 8 characters" value={form.password} onChange={handleChange}
                className="input-field" style={{ paddingLeft: 42, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input id="reg-confirm-password" name="confirmPassword" type={showPwd ? 'text' : 'password'} required
                placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange}
                className="input-field" style={{ paddingLeft: 42 }} />
            </div>
          </div>

          <button id="reg-submit" type="submit" className="btn-primary" disabled={loading || success}
            style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
