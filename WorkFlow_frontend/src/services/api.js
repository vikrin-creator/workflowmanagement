import axios from 'axios'

// API Base URL - Automatically switches between local and production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
export const API_BASE_URL = isDevelopment ? 'http://localhost/WorkFlow_backend/api' : 'https://vkgroup.solutions/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login.php', { username, password })
}

// Clients API
export const clientsAPI = {
  getAll: (filter = '') => {
    const url = filter ? `/clients/index.php?filter=${filter}` : '/clients/index.php'
    return api.get(url)
  },
  create: (clientData) => 
    api.post('/clients/index.php', clientData),
  update: (clientData) => 
    api.put('/clients/index.php', clientData),
  delete: (id) => 
    api.delete(`/clients/index.php?id=${id}`)
}

// Projects API
export const projectsAPI = {
  getAll: (clientId = '') => {
    const url = clientId ? `/projects/index.php?client_id=${clientId}` : '/projects/index.php'
    return api.get(url)
  },
  create: (projectData) => 
    api.post('/projects/index.php', projectData),
  update: (projectData) => 
    api.put('/projects/index.php', projectData),
  delete: (id) => 
    api.delete(`/projects/index.php?id=${id}`)
}

// Status Updates API
export const statusAPI = {
  getByProject: (projectId) => 
    api.get(`/status/index.php?project_id=${projectId}`),
  create: (statusData) => 
    api.post('/status/index.php', statusData)
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => 
    api.get('/dashboard/stats.php')
}

export default api
