import './ServerWakeUpOverlay.css'

export default function ServerWakeUpOverlay({ isOpen }) {
  if (!isOpen) return null

  return (
    <div className="wakeup-overlay">
      <div className="wakeup-content card animate-fade-in">
        <div className="wakeup-icon">🔌</div>
        <div className="wakeup-title">Waking up the server...</div>
        <div className="wakeup-text">
          Our backend is hosted on a free tier which goes to sleep after inactivity.
          It usually takes <strong>30-60 seconds</strong> to fully start up.
        </div>
        <div className="wakeup-footer">
          <div className="wakeup-spinner"></div>
          <span>Thanks for your patience! 🥗</span>
        </div>
      </div>
    </div>
  )
}
