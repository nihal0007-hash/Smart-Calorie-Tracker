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
  const [summary, setSummary] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [s, w, m] = await Promise.all([getDashboardSummary(), getWeeklyData(), getTodayMeals()])
      setSummary(s.data)
      setWeekly(w.data)
      setMeals(m.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = (id) => setMeals((m) => m.filter((x) => x.id !== id))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) {
    return (
      <div className="page page-with-nav loading-overlay">
        <div className="spinner" />
        <div className="text-secondary mt-4 animate-fade-in">Fetching your daily stats...</div>
        <div className="text-muted text-xs mt-2 opacity-50">Free-tier server may take a moment to wake up</div>
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
            <h2>{greeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋</h2>
            <p className="text-secondary">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Link to="/log-meal" className="btn btn-primary">+ Log Meal</Link>
        </div>

        {/* Warning banner */}
        {summary?.has_warnings && (
          <div className="warning-banner animate-fade-in">
            ⚠️ Some meals logged today have health warnings. Review them below.
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
                <div className="stat-label">Calories Today</div>
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
                <div className="stat-label">Avg Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Macro rings */}
        <div className="macro-section animate-fade-in">
          <h3 className="section-title">Today's Macros</h3>
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

        {/* Today's meals */}
        <div className="meals-section animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title" style={{ margin: 0 }}>Today's Meals</h3>
            <Link to="/log-meal" className="btn btn-secondary btn-sm">+ Add</Link>
          </div>
          {meals.length === 0 ? (
            <div className="empty-meals card p-6">
              <span style={{ fontSize: '2.5rem' }}>🍽️</span>
              <p>No meals logged today. <Link to="/log-meal">Log your first meal!</Link></p>
            </div>
          ) : (
            meals.map((m) => <MealCard key={m.id} meal={m} onDelete={handleDelete} />)
          )}
        </div>
      </div>
    </div>
  )
}
