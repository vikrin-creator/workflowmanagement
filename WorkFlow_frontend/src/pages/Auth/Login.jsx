import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Button from '../../components/UI/Button/Button'
import Input from '../../components/UI/Input/Input'
import { authAPI } from '../../services/api'
import './Login.css'

const Login = ({ onLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password')
      setLoading(false)
      return
    }
    
    try {
      const response = await authAPI.login(formData.username, formData.password)
      
      if (response.data && response.data.success) {
        // Store user data with error handling for localStorage
        try {
          localStorage.setItem('currentUser', formData.username)
        } catch (storageError) {
          console.warn('localStorage not available, using sessionStorage')
          sessionStorage.setItem('currentUser', formData.username)
        }
        
        onLogin(formData.username)
        navigate('/')
      } else {
        setError(response.data?.message || 'Invalid username or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'Login failed'
        setError(message)
      } else if (error.request) {
        // Request made but no response received
        setError('Unable to connect to server. Please check your connection.')
      } else {
        // Something else happened
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="login-card">
          <div className="login-header">
            <h1 className="login-title">Workflow Management</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login