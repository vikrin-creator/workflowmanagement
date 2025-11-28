import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dashboardAPI } from '../../services/api'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('confirmed')
  const [clientStats, setClientStats] = useState({
    confirmed: 0,
    notConfirmed: 0,
    lost: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats()
        if (response.data.success) {
          setClientStats({
            confirmed: response.data.data.clients.confirmed,
            notConfirmed: response.data.data.clients.notConfirmed,
            lost: response.data.data.clients.lost || 0
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }

    fetchStats()
  }, [])

  const handleTabClick = (tab, filter) => {
    setActiveTab(tab)
    navigate(`/clients?filter=${filter}`)
    // Close sidebar on mobile after navigation
    if (onClose) onClose()
  }

  const menuItems = [
    {
      id: 'confirmed',
      label: 'Confirmed Clients',
      icon: '✓',
      filter: 'confirmed',
      count: clientStats.confirmed
    },
    {
      id: 'not-confirmed',
      label: 'Not Confirmed Clients',
      icon: '⏳',
      filter: 'not-confirmed',
      count: clientStats.notConfirmed
    },
    {
      id: 'lost',
      label: 'Lost Clients',
      icon: '✗',
      filter: 'lost',
      count: clientStats.lost
    }
  ]

  return (
    <div className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h2>Client Status</h2>
        <button className="sidebar-close" onClick={onClose}>×</button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            className={`sidebar-tab ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id, item.filter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
            <span className="tab-badge">{item.count}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
