import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import './Navbar.css'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/log-meal',  label: 'Log Meal',  icon: '🍽️' },
  { href: '/profile',   label: 'Profile',   icon: '👤' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  // Close drawer on outside click / resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setDrawerOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    setDrawerOpen(false)
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/dashboard" className="navbar-brand">
            <span className="navbar-logo">🥗</span>
            <span className="gradient-text">Smart Calorie</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-links">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`navbar-link ${location.pathname === l.href ? 'active' : ''}`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="navbar-right">
            {user?.name && <span className="navbar-greeting">Hi, {user.name.split(' ')[0]} 👋</span>}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className={`navbar-hamburger ${drawerOpen ? 'open' : ''}`}
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-drawer ${drawerOpen ? 'open' : ''}`}>
        {user?.name && (
          <div className="drawer-user">
            <span>👋</span>
            <span>Hi, <strong>{user.name.split(' ')[0]}</strong>!</span>
          </div>
        )}
        <div className="drawer-divider" />
        {links.map((l) => (
          <Link
            key={l.href}
            to={l.href}
            className={`drawer-link ${location.pathname === l.href ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
        <div className="drawer-divider" />
        <button className="drawer-logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>

      {/* Bottom tab bar (phones) */}
      <nav className="bottom-nav" aria-label="Bottom navigation">
        {links.map((l) => (
          <Link
            key={l.href}
            to={l.href}
            className={`bottom-nav-item ${location.pathname === l.href ? 'active' : ''}`}
          >
            <span className="bnav-icon">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
