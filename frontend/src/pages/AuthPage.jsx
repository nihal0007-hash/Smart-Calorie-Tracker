import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../services/api'
import { useAuth } from '../store/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (tab === 'register' && form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    setLoading(true)
    try {
      const fn = tab === 'register' ? register : login
      const { data } = await fn({ email: form.email, password: form.password })
      authLogin(data.access_token, data.user)
      navigate(data.user.onboarding_complete ? '/dashboard' : '/onboarding')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-brand">
          <span style={{ fontSize: '2rem' }}>🥗</span>
          <h1 className="gradient-text" style={{ fontSize: '1.8rem' }}>Smart Calorie Tracker</h1>
          <p className="text-secondary text-sm">AI-powered nutrition tracking</p>
        </div>

        <div className="auth-tabs">
          {['login', 'register'].map((t) => (
            <button key={t} className={`auth-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setError('') }}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="auth-email" className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="auth-password" className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          {tab === 'register' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Confirm Password</label>
              <input id="auth-confirm" className="form-input" type="password" placeholder="••••••••"
                value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button id="auth-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Connecting to server...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-switch-btn" onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}>
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
