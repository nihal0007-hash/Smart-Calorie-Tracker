import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { analyzeMeal, logMeal } from '../services/api'
import HealthBadge from '../components/HealthBadge'
import './LogMeal.css'

const MEAL_TYPES = [
  { val: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { val: 'lunch', label: 'Lunch', icon: '☀️' },
  { val: 'dinner', label: 'Dinner', icon: '🌙' },
  { val: 'snack', label: 'Snack', icon: '🍎' },
]

export default function LogMeal() {
  const [searchParams] = useSearchParams()
  const customDate = searchParams.get('date')

  const [form, setForm] = useState({ 
    meal_name: '', 
    meal_description: '', 
    meal_type: 'snack'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const [images, setImages] = useState([]) // Array of base64 strings
  const [imagePreviews, setImagePreviews] = useState([])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 3) {
      return setError('You can upload up to 3 images.')
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result])
        setImages((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await analyzeMeal({ ...form, images })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // Don't log the images to the DB as per privacy requirement
      const { images: _, ...resultData } = result
      // If we have a custom date, we need to log for that date
      const dataToLog = {
        ...resultData,
        logged_at: customDate ? new Date(customDate).toISOString() : undefined
      }
      await logMeal(dataToLog)
      navigate('/dashboard')
    } catch (err) {
      setError('Could not save meal to tracker.')
      setLoading(false)
    }
  }

  const resetForm = () => { 
    setForm({ meal_name: '', meal_description: '', meal_type: 'snack' })
    setResult(null)
    setImages([])
    setImagePreviews([])
  }

  return (
    <div className="page page-with-nav">
      <div className="container-md">
        <div className="lm-header">
          <div>
            <div className="flex items-center gap-3">
              <h2 style={{ margin: 0 }}>🍽️ Log a Meal</h2>
              {customDate && <span className="tag tag-purple">For {new Date(customDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
            </div>
            <p className="text-secondary">Enter your meal and Gemini AI will analyze it for you.</p>
          </div>
        </div>

        {!result ? (
          <div className="card p-6 animate-fade-in">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Meal type selector */}
              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <div className="meal-type-grid">
                  {MEAL_TYPES.map(({ val, label, icon }) => (
                    <button key={val} type="button"
                      className={`meal-type-btn ${form.meal_type === val ? 'selected' : ''}`}
                      onClick={() => setForm((p) => ({ ...p, meal_type: val }))}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Meal Name *</label>
                <input id="lm-name" className="form-input" placeholder="e.g. Chicken Biryani, Masala Dosa..."
                  value={form.meal_name} onChange={set('meal_name')} required />
                <span className="form-hint">Be specific — the more detail, the better the analysis!</span>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Details <span className="text-muted">(optional)</span></label>
                <textarea id="lm-desc" className="form-textarea"
                  placeholder="e.g. 1 large plate, extra ghee, with raita and papad..."
                  value={form.meal_description} onChange={set('meal_description')} rows={3} />
              </div>

              <div className="form-group">
                <label className="form-label">Nutrition Label Images <span className="text-muted">(optional)</span></label>
                <div className="image-upload-container">
                  <div className="image-upload-actions">
                    <label className="image-upload-label desktop-hide">
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} hidden />
                      <div className="image-upload-placeholder">
                        <span style={{ fontSize: '1.5rem' }}>📸</span>
                        <span>Take Photo</span>
                      </div>
                    </label>
                    <label className="image-upload-label">
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden />
                      <div className="image-upload-placeholder">
                        <span style={{ fontSize: '1.5rem' }}>📁</span>
                        <span>Choose File</span>
                      </div>
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="image-previews">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="image-preview-item">
                          <img src={src} alt="preview" />
                          <button type="button" className="remove-image" onClick={() => removeImage(i)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="disclaimer-box mt-4">
                  <p className="text-xs text-muted">
                    <strong>Disclaimer:</strong> AI analysis is most accurate with nutrition labels or brand packaging. 
                    Please <strong>avoid uploading pictures of the actual food dish</strong>. 
                    Images are processed for analysis and are <strong>not stored</strong> in our database.
                  </p>
                </div>
              </div>

              {error && <div className="form-error" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}

              <button id="lm-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    Waking up AI analyzer...
                  </span>
                ) : '🤖 Analyze Meal'}
              </button>
            </form>
          </div>
        ) : (
          <div className="result-card animate-fade-in">
            <div className="result-header card p-6">
              <div className="result-title-row">
                <div>
                  <h3>{result.meal_name}</h3>
                  <span className="tag tag-purple">{result.meal_type}</span>
                </div>
                <HealthBadge score={result.health_score} isSuitable={result.is_suitable} />
              </div>

              <div className="result-calories">
                <span className="result-cal-num">{Math.round(result.calories)}</span>
                <span className="result-cal-unit">kcal</span>
              </div>
            </div>

            {/* Macros */}
            <div className="card p-6">
              <h4 className="mb-4">Nutritional Breakdown</h4>
              <div className="result-macros">
                {[
                  { label: 'Protein', val: result.protein_g, unit: 'g', color: '#3b82f6', icon: '💪' },
                  { label: 'Carbs', val: result.carbs_g, unit: 'g', color: '#f97316', icon: '⚡' },
                  { label: 'Fat', val: result.fat_g, unit: 'g', color: '#8b5cf6', icon: '🫙' },
                  { label: 'Sugar', val: result.sugar_g, unit: 'g', color: '#ec4899', icon: '🍬' },
                  { label: 'Fiber', val: result.fiber_g, unit: 'g', color: '#22c55e', icon: '🌾' },
                  { label: 'Sodium', val: result.sodium_mg, unit: 'mg', color: '#f59e0b', icon: '🧂' },
                ].map(({ label, val, unit, color, icon }) => (
                  <div key={label} className="result-macro" style={{ borderColor: color + '30' }}>
                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                    <span style={{ fontWeight: 700, color, fontSize: '1.1rem' }}>{Math.round(val)}<small>{unit}</small></span>
                    <span className="text-xs text-muted">{label}</span>
                  </div>
                ))}
                <div className="result-macro" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '1.2rem' }}>🫕</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', textTransform: 'capitalize' }}>{result.oil_content}</span>
                  <span className="text-xs text-muted">Oil Content</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {result.ai_summary && (
              <div className="card p-6">
                <h4 className="mb-3">💡 AI Health Assessment</h4>
                <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{result.ai_summary}</p>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="card p-6">
                <h4 className="mb-3" style={{ color: 'var(--warning)' }}>⚠️ Health Warnings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.warnings.map((w, i) => (
                    <div key={i} className="warning-item">⚠️ {w}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {result.benefits?.length > 0 && (
              <div className="card p-6">
                <h4 className="mb-3" style={{ color: 'var(--success)' }}>✅ Health Benefits</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.benefits.map((b, i) => (
                    <span key={i} className="tag">✓ {b}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-6" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 className="mb-4">Do you want to add this to your daily tracker?</h4>
              <div className="result-actions">
                <button className="btn btn-secondary" onClick={resetForm} disabled={loading}>❌ Don't Add</button>
                <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Adding...' : '✅ Add to Tracker'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
