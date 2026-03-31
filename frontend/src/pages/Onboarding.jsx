import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../services/api'
import { useAuth } from '../store/AuthContext'
import './Onboarding.css'

const STEPS = ['Personal Info', 'Body Metrics', 'Medical Info']

const DISEASES = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'PCOS', 'Thyroid', 'Kidney Disease', 'Celiac Disease']
const ALLERGIES = ['Nuts', 'Gluten', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Fish', 'Wheat']

function ToggleChip({ label, selected, onToggle }) {
  return (
    <button type="button"
      className={`toggle-chip ${selected ? 'selected' : ''}`}
      onClick={() => onToggle(label)}>
      {selected ? '✓ ' : ''}{label}
    </button>
  )
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', age: '', gender: '',
    height_cm: '', weight_kg: '', activity_level: 'sedentary',
    diseases: [], allergies: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const [customDisease, setCustomDisease] = useState('')
  const [customAllergy, setCustomAllergy] = useState('')

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const toggle = (key) => (val) => setForm((p) => ({
    ...p,
    [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
  }))

  const addCustom = (key, val, setter) => {
    if (!val.trim()) return
    if (!form[key].includes(val)) {
      setForm((p) => ({ ...p, [key]: [...p[key], val] }))
    }
    setter('')
  }

  const next = (e) => {
    e.preventDefault()
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await updateProfile({
        name: form.name, age: parseInt(form.age),
        gender: form.gender, height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg), activity_level: form.activity_level,
        diseases: form.diseases, allergies: form.allergies,
      })
      await refreshUser()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save profile')
      setLoading(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="onboarding-page">
      <div className="onboarding-card animate-fade-in">
        <div className="ob-header">
          <div className="ob-step-badge">Step {step + 1} of {STEPS.length}</div>
          <h2>{STEPS[step]}</h2>
          <div className="ob-progress-bar"><div className="ob-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        <form onSubmit={next} className="ob-form">
          {step === 0 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="ob-name" className="form-input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input id="ob-age" className="form-input" type="number" placeholder="25" min={10} max={120} value={form.age} onChange={set('age')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select id="ob-gender" className="form-select" value={form.gender} onChange={set('gender')} required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input id="ob-height" className="form-input" type="number" placeholder="170" min={80} max={250} value={form.height_cm} onChange={set('height_cm')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input id="ob-weight" className="form-input" type="number" placeholder="70" min={20} max={300} step={0.1} value={form.weight_kg} onChange={set('weight_kg')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select id="ob-activity" className="form-select" value={form.activity_level} onChange={set('activity_level')}>
                  <option value="sedentary">🪑 Sedentary (little/no exercise)</option>
                  <option value="light">🚶 Light (1-3 days/week)</option>
                  <option value="moderate">🏃 Moderate (3-5 days/week)</option>
                  <option value="active">💪 Active (6-7 days/week)</option>
                  <option value="very_active">🔥 Very Active (hard daily training)</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="form-group">
                <label className="form-label">Medical Conditions <span className="text-muted">(optional)</span></label>
                <div className="chip-grid">
                  {DISEASES.map((d) => (
                    <ToggleChip key={d} label={d} selected={form.diseases.includes(d)} onToggle={toggle('diseases')} />
                  ))}
                  {form.diseases.filter(d => !DISEASES.includes(d)).map(d => (
                    <ToggleChip key={d} label={d} selected={true} onToggle={toggle('diseases')} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="form-input" style={{ fontSize: '0.875rem' }} placeholder="Other disease..." value={customDisease} onChange={(e) => setCustomDisease(e.target.value)} />
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => addCustom('diseases', customDisease, setCustomDisease)}>Add</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Food Allergies <span className="text-muted">(optional)</span></label>
                <div className="chip-grid">
                  {ALLERGIES.map((a) => (
                    <ToggleChip key={a} label={a} selected={form.allergies.includes(a)} onToggle={toggle('allergies')} />
                  ))}
                  {form.allergies.filter(a => !ALLERGIES.includes(a)).map(a => (
                    <ToggleChip key={a} label={a} selected={true} onToggle={toggle('allergies')} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="form-input" style={{ fontSize: '0.875rem' }} placeholder="Other allergy..." value={customAllergy} onChange={(e) => setCustomAllergy(e.target.value)} />
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => addCustom('allergies', customAllergy, setCustomAllergy)}>Add</button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="form-error" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}

          <div className="ob-actions">
            {step > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>Back</button>
            )}
            <button id="ob-next" type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : step === STEPS.length - 1 ? '🚀 Complete Setup' : 'Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
