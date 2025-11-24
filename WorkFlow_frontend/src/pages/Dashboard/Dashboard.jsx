import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Loader from '../../components/UI/Loader/Loader'
import { dashboardAPI } from '../../services/api'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [clientStats, setClientStats] = useState({
    confirmed: 0,
    notConfirmed: 0
  })

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats()
        if (response.data.success) {
          setClientStats({
            confirmed: response.data.data.clients.confirmed,
            notConfirmed: response.data.data.clients.notConfirmed
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        // Fallback to default values
        setClientStats({ confirmed: 0, notConfirmed: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleCardClick = (type) => {
    navigate(`/clients?filter=${type}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  if (loading) {
    return <Loader fullScreen size="large" />
  }

  const clientCategories = [
    {
      id: 1,
      name: 'Confirmed Clients',
      type: 'confirmed',
      icon: 'CC',
      count: clientStats.confirmed,
      description: 'Clients with confirmed projects',
      bgColor: '#e8f5e9',
      iconColor: '#66bb6a',
      textColor: '#4caf50'
    },
    {
      id: 2,
      name: 'Not Confirmed Clients',
      type: 'not-confirmed',
      icon: 'NC',
      count: clientStats.notConfirmed,
      description: 'Pending client confirmations',
      bgColor: '#fff3e0',
      iconColor: '#ffa726',
      textColor: '#ff9800'
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <motion.h1 
          className="dashboard-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Client Overview
        </motion.h1>
        <motion.p 
          className="dashboard-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Manage confirmed and pending clients
        </motion.p>
      </div>

      <motion.div 
        className="project-types-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {clientCategories.map((category) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: category.id * 0.1 }}
          >
            <Card 
              hoverable 
              onClick={() => handleCardClick(category.type)}
              className="project-type-card"
            >
              <div 
                className="card-icon"
                style={{ 
                  background: category.bgColor,
                  color: category.iconColor
                }}
              >
                {category.icon}
              </div>
              <h3 className="card-title">{category.name}</h3>
              <p className="card-description">{category.description}</p>
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-value" style={{ color: category.textColor }}>
                    {category.count}
                  </span>
                  <span className="stat-label">Clients</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Dashboard
