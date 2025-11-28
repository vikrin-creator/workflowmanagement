import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../UI/Button/Button'
import Sidebar from '../Sidebar/Sidebar'
import './Layout.css'

const Layout = ({ children, currentUser, onLogout }) => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            <Link to="/" className="navbar-brand">
              <span className="brand-text">Workflow Manager</span>
            </Link>
          </div>
          <div className="navbar-links">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/clients" 
              className={`nav-link ${location.pathname.includes('/clients') ? 'active' : ''}`}
            >
              Clients
            </Link>
            <Link 
              to="/projects/add" 
              className="nav-link nav-link-cta"
            >
              + New Project
            </Link>
            <div className="user-section">
              <span className="user-name">{currentUser}</span>
              <Button variant="ghost" size="small" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
