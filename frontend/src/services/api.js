import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Global variable to hold the wake-up state setter (provided by AuthContext)
let setGlobalWakingState = () => {}
export const registerWakingStateSetter = (setter) => { setGlobalWakingState = setter }

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Start a timer to show "Waking Up" message if request takes > 2s
  config.wakingTimer = setTimeout(() => {
    setGlobalWakingState(true)
  }, 2000)

  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.config.wakingTimer) clearTimeout(response.config.wakingTimer)
    setGlobalWakingState(false)
    return response
  },
  (error) => {
    if (error.config?.wakingTimer) clearTimeout(error.config.wakingTimer)
    setGlobalWakingState(false)
    return Promise.reject(error)
  }
)

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// Profile
export const getProfile = () => api.get('/profile/')
export const updateProfile = (data) => api.put('/profile/', data)

// Meals
export const analyzeMeal = (data) => api.post('/meals/analyze', data)
export const logMeal = (data) => api.post('/meals/log', data)
export const getTodayMeals = (date) => api.get(`/meals/today${date ? `?date=${date}` : ''}`)
export const getMealHistory = (days = 7) => api.get(`/meals/history?days=${days}`)
export const deleteMeal = (id) => api.delete(`/meals/${id}`)

// Dashboard
export const getDashboardSummary = (date) => api.get(`/dashboard/summary${date ? `?date=${date}` : ''}`)
export const getWeeklyData = () => api.get('/dashboard/weekly')

export default api
