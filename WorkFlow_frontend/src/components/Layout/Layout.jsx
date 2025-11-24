import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../UI/Button/Button'
import './Layout.css'

const Layout = ({ children, currentUser, onLogout }) => {
  const location = useLocation()

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="brand-text">Workflow Manager</span>
          </Link>
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
      
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
