import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import ProjectsByType from './pages/Projects/ProjectsByType'
import ProjectDetails from './pages/Projects/ProjectDetails'
import Clients from './pages/Clients/Clients'
import AddClient from './pages/Clients/AddClient'
import AddProject from './pages/Projects/AddProject'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in with fallback to sessionStorage
    let user = null
    try {
      user = localStorage.getItem('currentUser')
    } catch (e) {
      // Fallback to sessionStorage if localStorage is not available
      try {
        user = sessionStorage.getItem('currentUser')
      } catch (e2) {
        console.warn('Both localStorage and sessionStorage are not available')
      }
    }
    
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  const handleLogin = (username) => {
    setCurrentUser(username)
  }

  const handleLogout = () => {
    // Clear user data from both storages
    try {
      localStorage.removeItem('currentUser')
    } catch (e) {
      console.warn('localStorage not available during logout')
    }
    
    try {
      sessionStorage.removeItem('currentUser')
    } catch (e) {
      console.warn('sessionStorage not available during logout')
    }
    
    setCurrentUser(null)
  }

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:type" element={<ProjectsByType />} />
          <Route path="/project/:id" element={<ProjectDetails currentUser={currentUser} />} />
          <Route path="/client/:id" element={<ProjectDetails currentUser={currentUser} isClientView={true} />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/add" element={<AddClient />} />
          <Route path="/projects/add" element={<AddProject currentUser={currentUser} />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
