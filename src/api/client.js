const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('internpath-token')
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    let message = 'Request failed'
    if (typeof data.detail === 'string') message = data.detail
    else if (Array.isArray(data.detail)) message = data.detail.map((item) => item.msg || item).join(', ')
    throw new Error(message)
  }
  return data
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  getProfile: () => request('/profile'),
  saveProfile: (payload) => request('/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  getRecommendations: (top_k = 10) =>
    request('/recommendations', { method: 'POST', body: JSON.stringify({ top_k }) }),
  getDashboard: () => request('/dashboard'),
  saveInternship: (internship_id) =>
    request('/dashboard/saved', { method: 'POST', body: JSON.stringify({ internship_id }) }),
  unsaveInternship: (internship_id) =>
    request(`/dashboard/saved/${internship_id}`, { method: 'DELETE' }),
  createApplication: (payload) =>
    request('/dashboard/applications', { method: 'POST', body: JSON.stringify(payload) }),
  updateApplication: (id, payload) =>
    request(`/dashboard/applications/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  health: () => request('/health'),
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('internpath-token', token)
  else localStorage.removeItem('internpath-token')
}

export function isAuthenticated() {
  return Boolean(getToken())
}
