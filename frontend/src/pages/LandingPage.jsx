import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { useEffect } from 'react'
import './LandingPage.css'

export default function LandingPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  useEffect(() => { if (token) navigate('/dashboard') }, [token])

  const features = [
    { icon: '🤖', title: 'AI Nutrition Analysis', desc: 'Gemini AI analyzes every meal for calories, macros, sugar, oil content, and more.' },
    { icon: '👤', title: 'Personalized Health Profile', desc: 'Your age, weight, conditions, and allergies shape every recommendation.' },
    { icon: '⚠️', title: 'Smart Health Warnings', desc: 'Know if a meal is safe for your conditions before you eat it.' },
    { icon: '📊', title: 'Progress Dashboard', desc: 'Track daily intake vs goals with beautiful charts and streaks.' },
  ]

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>🥗</span>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>CalorieAI</span>
        </div>
        <Link to="/auth" className="btn btn-primary btn-sm">Get Started</Link>
      </nav>

      <section className="hero">
        <div className="hero-badge animate-fade-in">
          <span>✨ Powered by Google Gemini AI</span>
        </div>
        <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Track Smarter.<br />
          <span className="gradient-text">Eat Healthier.</span>
        </h1>
        <p className="hero-sub animate-fade-in" style={{ animationDelay: '0.2s' }}>
          AI-powered calorie tracking personalized to your health profile.
          Know what you're eating and whether it's right for <em>you</em>.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/auth" className="btn btn-primary btn-lg">Start Tracking Free</Link>
          <a href="#features" className="btn btn-secondary btn-lg">See Features</a>
        </div>

        <div className="hero-stats animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[['AI-Powered', 'Nutrition Analysis'], ['Real-time', 'Health Scoring'], ['Personalized', 'To Your Profile']].map(([val, lbl]) => (
            <div key={val} className="hero-stat">
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>{val}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="text-center mb-8">Everything you need to <span className="gradient-text">eat well</span></h2>
          <div className="grid-2">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="feature-card card p-6">
                <div className="feature-icon">{icon}</div>
                <h3 className="mb-2">{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="mb-4">Ready to take control of your nutrition?</h2>
        <Link to="/auth" className="btn btn-primary btn-lg">Create Free Account</Link>
      </section>

      <footer className="landing-footer">
        <p className="text-muted text-sm">© 2024 CalorieAI — Smart Calorie Tracker</p>
      </footer>
    </div>
  )
}
