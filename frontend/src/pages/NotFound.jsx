import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-container animate-fade-in">
      <div className="container-sm text-center">
        <div className="notfound-card card">
          <div className="notfound-icon">🥗</div>
          <h1 className="gradient-text mb-2">404</h1>
          <h2 className="mb-6">Page Not Found</h2>
          <p className="text-secondary mb-8">
            The page you are looking for doesn't exist or has been moved. 
            Don't worry, your calories are still being tracked!
          </p>
          <Link to="/" className="btn btn-primary btn-full justify-center">
            🏠 Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
