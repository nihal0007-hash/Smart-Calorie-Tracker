import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary, getWeeklyData, getTodayMeals } from '../services/api'
import { useAuth } from '../store/AuthContext'
import ProgressRing from '../components/ProgressRing'
import MealCard from '../components/MealCard'
import WeeklyChart from '../components/WeeklyChart'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const getTodayIST = () => new Date().toLocaleDateString('en-CA')
  const [selectedDate, setSelectedDate] = useState(getTodayIST())
  const [summary, setSummary] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const loadInitial = async () => {
    try {
      const w = await getWeeklyData()
      setWeekly(w.data)
    } catch (e) { console.error(e) }
  }

  const loadDateData = async (date) => {
    // Only show partial loading if we already have data
    setLoading(true)
    try {
      const [s, m] = await Promise.all([
        getDashboardSummary(date), 
        getTodayMeals(date)
      ])
      setSummary(s.data)
      setMeals(m.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { 
    loadInitial() 
  }, [])

  useEffect(() => { 
    loadDateData(selectedDate) 
  }, [selectedDate])

  const handleDateChange = (e) => setSelectedDate(e.target.value)
  const resetToToday = () => setSelectedDate(getTodayIST())

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const isToday = selectedDate === getTodayIST()

  if (loading && !summary) {
    return (
      <div className="page page-with-nav loading-overlay">
        <div className="spinner" />
        <div className="text-secondary mt-4 animate-fade-in">Fetching your nutrition report...</div>
      </div>
    )
  }

  const cal = summary?.total_calories || 0
  const goal = summary?.calorie_goal || 2000
  const pct = summary?.goal_percentage || 0

  return (
    <div className="page page-with-nav">
      <div className="container">

        {/* Header */}
        <div className="dash-header animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 style={{ margin: 0 }}>{greeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋</h2>
              {isToday ? (
                <span className="tag-live">Live Mode</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="tag-history">History Mode</span>
                  <button className="tag-reset-btn" onClick={resetToToday}>
                    Switch to Live Tracker
                  </button>
                </div>
              )}
            </div>
            <p className="text-secondary">
              {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="dash-header-actions">
            <div className="date-picker-wrapper">
              <span className="calendar-picker-icon">📅</span>
              <input type="date" className="date-picker-input" value={selectedDate} onChange={handleDateChange} />
            </div>
            <Link to={isToday ? '/log-meal' : `/log-meal?date=${selectedDate}`} className="btn btn-primary">+ Log Meal</Link>
          </div>
        </div>

        {/* Warning banner */}
        {summary?.has_warnings && (
          <div className="warning-banner animate-fade-in">
            ⚠️ Some meals for this day have health warnings. Review them below.
          </div>
        )}

        {/* Calorie overview */}
        <div className="dash-overview card p-6 animate-fade-in">
          <div className="overview-main">
            <ProgressRing value={cal} max={goal} size={160} stroke={14}
              color={pct > 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#00d4aa'}
              label={`of ${goal} kcal goal`} sublabel="kcal" />
            <div className="overview-stats">
              <div className="overview-stat">
                <div className="stat-value" style={{ color: 'var(--accent)' }}>{Math.round(cal)}</div>
                <div className="stat-label">Daily Calories</div>
              </div>
              <div className="overview-stat">
                <div className="stat-value">{goal - Math.round(cal) > 0 ? goal - Math.round(cal) : 0}</div>
                <div className="stat-label">Remaining</div>
              </div>
              <div className="overview-stat">
                <div className="stat-value">{summary?.meal_count || 0}</div>
                <div className="stat-label">Meals Logged</div>
              </div>
              <div className="overview-stat">
                <div className="stat-value" style={{ color: summary?.avg_health_score >= 7 ? 'var(--success)' : summary?.avg_health_score >= 4 ? 'var(--warning)' : 'var(--danger)' }}>
                  {summary?.avg_health_score || '—'}
                </div>
                <div className="stat-label">Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Macro rings */}
        <div className="macro-section animate-fade-in">
          <h3 className="section-title">{isToday ? "Today's Macros" : "Daily Macros"}</h3>
          <div className="macro-rings card p-6">
            <ProgressRing value={summary?.total_protein_g || 0} max={Math.round(goal * 0.075)}
              size={100} stroke={8} color="#3b82f6" label="Protein (g)" />
            <ProgressRing value={summary?.total_carbs_g || 0} max={Math.round(goal * 0.15)}
              size={100} stroke={8} color="#f97316" label="Carbs (g)" />
            <ProgressRing value={summary?.total_fat_g || 0} max={Math.round(goal * 0.044)}
              size={100} stroke={8} color="#8b5cf6" label="Fat (g)" />
            <ProgressRing value={summary?.total_sugar_g || 0} max={50}
              size={100} stroke={8} color="#ec4899" label="Sugar (g)" />
          </div>
        </div>

        {/* Weekly chart */}
        <div className="chart-section animate-fade-in">
          <h3 className="section-title">Weekly Trend</h3>
          <div className="card p-6">
            <WeeklyChart data={weekly} />
          </div>
        </div>

        {/* Recorded meals */}
        <div className="meals-section animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title" style={{ margin: 0 }}>{isToday ? "Today's Meals" : "Recorded Meals"}</h3>
            <Link to={isToday ? '/log-meal' : `/log-meal?date=${selectedDate}`} className="btn btn-secondary btn-sm">+ Add</Link>
          </div>
          {meals.length === 0 ? (
            <div className="empty-meals card p-6">
              <span style={{ fontSize: '2.5rem' }}>🍽️</span>
              <p>No meals logged for this day. <Link to="/log-meal">Log one now!</Link></p>
            </div>
          ) : (
            meals.map((m) => <MealCard key={m.id} meal={m} onDelete={(id) => setMeals((prev) => prev.filter((x) => x.id !== id))} />)
          )}
        </div>
      </div>
    </div>
  )
}
