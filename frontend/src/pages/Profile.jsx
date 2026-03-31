import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../services/api'
import { useAuth } from '../store/AuthContext'
import './Profile.css'

const SUGGESTED_DISEASES = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'PCOS', 'Thyroid', 'Kidney Disease', 'Celiac Disease']
const SUGGESTED_ALLERGIES = ['Nuts', 'Gluten', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Fish', 'Wheat']
const ACTIVITIES = [
  { value: 'sedentary', label: '🪑 Sedentary' }, { value: 'light', label: '🚶 Light' },
  { value: 'moderate', label: '🏃 Moderate' }, { value: 'active', label: '💪 Active' },
  { value: 'very_active', label: '🔥 Very Active' },
]

function Chip({ label, selected, onToggle, showRemove }) {
  return (
    <div className={`profile-chip ${selected ? 'selected' : ''}`} onClick={() => onToggle(label)} style={{ cursor: 'pointer' }}>
      {label} {showRemove && <span style={{ marginLeft: 8, opacity: 0.6 }}>✕</span>}
    </div>
  )
}

export default function Profile() {
  const { refreshUser } = useAuth()
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getProfile().then((r) => setForm(r.data)).catch(console.error)
  }, [])

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const persistProfile = async (updatedForm) => {
    setSaving(true)
    try {
      await updateProfile({
        name: updatedForm.name, age: parseInt(updatedForm.age), gender: updatedForm.gender,
        height_cm: parseFloat(updatedForm.height_cm), weight_kg: parseFloat(updatedForm.weight_kg),
        activity_level: updatedForm.activity_level, 
        diseases: updatedForm.diseases, 
        allergies: updatedForm.allergies,
      })
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const toggleHealth = (key, val) => {
    const list = form[key] || []
    const newList = list.includes(val) ? list.filter((x) => x !== val) : [...list, val]
    const updated = { ...form, [key]: newList }
    setForm(updated)
    persistProfile(updated)
  }

  const handleGlobalSave = async (e) => {
    e.preventDefault()
    persistProfile(form)
    setEditing(false)
  }

  const [customDisease, setCustomDisease] = useState('')
  const [customAllergy, setCustomAllergy] = useState('')
  const [showDiseaseAdd, setShowDiseaseAdd] = useState(false)
  const [showAllergyAdd, setShowAllergyAdd] = useState(false)

  if (!form) return <div className="page page-with-nav loading-overlay"><div className="spinner" /></div>

  const bmi = form.height_cm && form.weight_kg
    ? (form.weight_kg / Math.pow(form.height_cm / 100, 2)).toFixed(1) : '—'
  const bmiLabel = bmi !== '—'
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : '—'
  const bmiColor = bmi === '—' ? 'var(--text-muted)'
    : bmi < 18.5 ? 'var(--accent-blue)' : bmi < 25 ? 'var(--success)' : bmi < 30 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="page page-with-nav">
      <div className="container-md">
        <div className="prof-header">
          <div>
            <h2>👤 Health Profile</h2>
            <p className="text-secondary">Your profile information is used for personalized AI analysis.</p>
          </div>
          <div className="flex items-center gap-4">
             {saving && <div className="flex items-center gap-2 text-sm text-accent"><span className="spinner" style={{width: 14, height: 14, borderWidth: 2}} /> Saving...</div>}
             <button className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setEditing(!editing)}>
              {editing ? '✕ Cancel' : '✏️ Edit Bio Details'}
            </button>
          </div>
        </div>

        {success && (
          <div className="success-banner animate-fade-in" style={{ position: 'fixed', top: 80, right: 20, zIndex: 100, marginBottom: 0 }}>
            ✅ Changes saved
          </div>
        )}

        {/* Profile stats */}
        <div className="grid-4 mb-6">
          {[
            { label: 'Calorie Goal', val: `${form.daily_calorie_goal || '—'} kcal`, color: 'var(--accent)' },
            { label: 'BMI', val: bmi, color: bmiColor },
            { label: 'BMI Status', val: bmiLabel, color: bmiColor },
            { label: 'Activity', val: (form.activity_level || 'sedentary').replace('_', ' '), color: 'var(--accent-purple)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card p-4">
              <div className="stat-value" style={{ color, fontSize: '1.4rem' }}>{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleGlobalSave} style={{ display: 'grid', gap: 24 }}>
          {/* Bio section */}
          <div className="card p-6">
            <h3 className="mb-4">Bio Details</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name || ''} onChange={set('name')} disabled={!editing} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" value={form.age || ''} onChange={set('age')} disabled={!editing} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender || ''} onChange={set('gender')} disabled={!editing}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select className="form-select" value={form.activity_level || 'sedentary'} onChange={set('activity_level')} disabled={!editing}>
                  {ACTIVITIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" value={form.height_cm || ''} onChange={set('height_cm')} disabled={!editing} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" step="0.1" value={form.weight_kg || ''} onChange={set('weight_kg')} disabled={!editing} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Diseases */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3>Medical Conditions</h3>
                {editing && !showDiseaseAdd && (
                  <button type="button" className="btn btn-secondary py-1 px-3 text-sm" onClick={() => setShowDiseaseAdd(true)}>
                    + Add
                  </button>
                )}
              </div>
              
              {editing && showDiseaseAdd && (
                <div className="animate-fade-in mb-6 p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-muted uppercase tracking-wider font-bold">Suggestions</p>
                    <button type="button" className="close-suggestion-btn" onClick={() => setShowDiseaseAdd(false)}>✕</button>
                  </div>
                  <div className="chip-grid mb-4">
                    {SUGGESTED_DISEASES.filter(d => !form.diseases?.includes(d)).map(d => (
                      <Chip key={d} label={d} onToggle={() => toggleHealth('diseases', d)} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="form-input text-sm" placeholder="Type other..." value={customDisease} onChange={e => setCustomDisease(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && (toggleHealth('diseases', customDisease), setCustomDisease(''))} />
                    <button type="button" className="btn btn-primary px-4" onClick={() => (toggleHealth('diseases', customDisease), setCustomDisease(''))}>Add</button>
                  </div>
                </div>
              )}

              <div className="chip-grid">
                {form.diseases?.map(d => (
                  <Chip key={d} label={d} selected showRemove={editing} onToggle={editing ? () => toggleHealth('diseases', d) : () => {}} />
                ))}
                {!form.diseases?.length && !showDiseaseAdd && <p className="text-muted text-sm italic">No medical conditions added.</p>}
              </div>
            </div>

            {/* Allergies */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3>Food Allergies</h3>
                {editing && !showAllergyAdd && (
                  <button type="button" className="btn btn-secondary py-1 px-3 text-sm" onClick={() => setShowAllergyAdd(true)}>
                    + Add
                  </button>
                )}
              </div>

              {editing && showAllergyAdd && (
                <div className="animate-fade-in mb-6 p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-muted uppercase tracking-wider font-bold">Suggestions</p>
                    <button type="button" className="close-suggestion-btn" onClick={() => setShowAllergyAdd(false)}>✕</button>
                  </div>
                  <div className="chip-grid mb-4">
                    {SUGGESTED_ALLERGIES.filter(a => !form.allergies?.includes(a)).map(a => (
                      <Chip key={a} label={a} onToggle={() => toggleHealth('allergies', a)} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="form-input text-sm" placeholder="Type other..." value={customAllergy} onChange={e => setCustomAllergy(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (toggleHealth('allergies', customAllergy), setCustomAllergy(''))} />
                    <button type="button" className="btn btn-primary px-4" onClick={() => (toggleHealth('allergies', customAllergy), setCustomAllergy(''))}>Add</button>
                  </div>
                </div>
              )}

              <div className="chip-grid">
                {form.allergies?.map(a => (
                  <Chip key={a} label={a} selected showRemove={editing} onToggle={editing ? () => toggleHealth('allergies', a) : () => {}} />
                ))}
                {!form.allergies?.length && !showAllergyAdd && <p className="text-muted text-sm italic">No allergies added.</p>}
              </div>
            </div>
          </div>
          
          {editing && (
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center pb-12">
              <button type="submit" className="btn btn-primary btn-full max-w-sm" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Saving Changes...
                  </span>
                ) : '💾 Save All Profile Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
