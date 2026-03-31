import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import LogMeal from './pages/LogMeal'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth()
  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>
  if (!token) return <Navigate to="/auth" replace />
  if (user && !user.onboarding_complete) return <Navigate to="/onboarding" replace />
  return children
}

function OnboardingRoute({ children }) {
  const { token, user, loading } = useAuth()
  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>
  if (!token) return <Navigate to="/auth" replace />
  if (user?.onboarding_complete) return <Navigate to="/dashboard" replace />
  return children
}

import { useEffect } from 'react'
import { registerWakingStateSetter } from './services/api'
import ServerWakeUpOverlay from './components/ServerWakeUpOverlay'

function AppLayout({ children }) {
  const { token, serverWakingUp, setServerWakingUp } = useAuth()

  useEffect(() => {
    registerWakingStateSetter(setServerWakingUp)
  }, [setServerWakingUp])

  return (
    <>
      {token && <Navbar />}
      <ServerWakeUpOverlay isOpen={serverWakingUp} />
      {children}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/log-meal" element={<ProtectedRoute><LogMeal /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  )
}
