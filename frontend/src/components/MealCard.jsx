import { useState } from 'react'
import HealthBadge from './HealthBadge'
import { deleteMeal } from '../services/api'
import './MealCard.css'

export default function MealCard({ meal, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const time = new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const typeColors = { breakfast: '#f97316', lunch: '#3b82f6', dinner: '#8b5cf6', snack: '#00d4aa' }
  const typeColor = typeColors[meal.meal_type] || '#00d4aa'

  const handleDelete = async () => {
    setDeleting(true)
    try { 
      await deleteMeal(meal.id)
      onDelete?.(meal.id) 
    } catch { 
      setDeleting(false) 
      setShowConfirm(false)
    }
  }

  return (
    <div className={`meal-card card ${expanded ? 'expanded' : ''}`}>
      <div className="meal-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="meal-card-left">
          <span className="meal-type-dot" style={{ background: typeColor }} />
          <div>
            <div className="meal-card-name">{meal.meal_name}</div>
            <div className="meal-card-meta">
              <span style={{ color: typeColor, fontSize: '0.75rem', fontWeight: 600 }}>
                {meal.meal_type}
              </span>
              <span className="text-muted text-xs">• {time}</span>
            </div>
          </div>
        </div>
        <div className="meal-card-right">
          <div className="meal-cal">{Math.round(meal.calories)} <span>kcal</span></div>
          <HealthBadge score={meal.health_score} isSuitable={meal.is_suitable} size="sm" />
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="meal-card-body animate-fade-in">
          <div className="meal-macros">
            {[
              { label: 'Protein', val: meal.protein_g, unit: 'g', color: '#3b82f6' },
              { label: 'Carbs', val: meal.carbs_g, unit: 'g', color: '#f97316' },
              { label: 'Fat', val: meal.fat_g, unit: 'g', color: '#8b5cf6' },
              { label: 'Sugar', val: meal.sugar_g, unit: 'g', color: '#ec4899' },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="macro-pill" style={{ borderColor: color + '30' }}>
                <span style={{ color, fontWeight: 700 }}>{Math.round(val)}{unit}</span>
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </div>

          {meal.ai_summary && (
            <p className="meal-summary">💡 {meal.ai_summary}</p>
          )}

          {meal.warnings?.length > 0 && (
            <div className="meal-warnings">
              {meal.warnings.map((w, i) => (
                <span key={i} className="tag tag-danger">⚠️ {w}</span>
              ))}
            </div>
          )}

          {meal.benefits?.length > 0 && (
            <div className="meal-benefits">
              {meal.benefits.map((b, i) => (
                <span key={i} className="tag">✓ {b}</span>
              ))}
            </div>
          )}

          <div className="meal-card-actions">
            {!showConfirm ? (
              <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>
                🗑 Remove Meal
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirm(false)} disabled={deleting}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
