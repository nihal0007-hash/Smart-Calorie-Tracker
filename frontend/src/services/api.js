import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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
export const getTodayMeals = () => api.get('/meals/today')
export const getMealHistory = (days = 7) => api.get(`/meals/history?days=${days}`)
export const deleteMeal = (id) => api.delete(`/meals/${id}`)

// Dashboard
export const getDashboardSummary = () => api.get('/dashboard/summary')
export const getWeeklyData = () => api.get('/dashboard/weekly')

export default api
