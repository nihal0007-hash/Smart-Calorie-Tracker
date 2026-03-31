import { useAuth } from '../store/AuthContext'
import './ApprovalPending.css'

export default function ApprovalPending() {
  const { logout } = useAuth()

  return (
    <div className="approval-pending-overlay animate-fade-in">
      <div className="container-sm">
        <div className="approval-card card">
          <div className="approval-card-brand">
            <span>🥗</span>
            <span>Smart Calorie Tracker</span>
          </div>

          <div className="approval-icon-container">
            <svg className="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" />
            </svg>
            <div className="ripple"></div>
          </div>

          <h2 className="mb-4 text-center gradient-text">Account Pending Approval</h2>
          
          <p className="text-secondary mb-8 text-center" style={{ lineHeight: 1.8 }}>
            Your account has been successfully created and your health profile is saved. 
            However, for security purposes, the <strong>account needs approval by the owner</strong> 
            before you can start tracking meals.
          </p>
          
          <div className="status-badge mb-8">
            <span className="pulse-dot"></span>
            <span className="status-text">Live Status: Checking for access...</span>
          </div>
          
          <div className="divider mb-8"></div>
          
          <p className="text-xs text-muted mb-6 text-center">
            Our administrator is manually reviewing new registrations to ensure a secure community. Please check back shortly.
          </p>
          
          <button className="btn btn-secondary btn-full" onClick={logout}>
            🚪 Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  )
}
