import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Button from '../../components/UI/Button/Button'
import Input from '../../components/UI/Input/Input'
import Modal from '../../components/UI/Modal/Modal'
import Loader from '../../components/UI/Loader/Loader'
import { clientsAPI } from '../../services/api'
import './Clients.css'

const Clients = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(true)
  const [subStatusFilter, setSubStatusFilter] = useState('all')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [confirmationDetails, setConfirmationDetails] = useState({
    startDate: '',
    endDate: '',
    budget: ''
  })

  useEffect(() => {
    // Set toggle state based on URL parameter
    const filterParam = searchParams.get('filter')
    if (filterParam === 'confirmed') {
      setShowConfirmedOnly(true)
    } else if (filterParam === 'not-confirmed') {
      setShowConfirmedOnly(false)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let url = '';
        if (subStatusFilter !== 'all') {
          url = `?sub_status=${subStatusFilter}`;
        }
        const response = await clientsAPI.getAll(url)
        if (response.data.success) {
          setClients(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [subStatusFilter])

  const handleClientClick = async (client) => {
    try {
      // Find projects for this client
      const { projectsAPI } = await import('../../services/api')
      const response = await projectsAPI.getAll()
      
      if (response.data.success) {
        const clientProjects = response.data.data.filter(p => p.client_id === client.id)
        
        if (clientProjects.length > 0) {
          // Navigate to the first project
          navigate(`/project/${clientProjects[0].id}`)
        } else {
          // No projects found - navigate to client details view
          navigate(`/client/${client.id}`)
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      alert('Error loading projects')
    }
  }

  const handleToggleConfirmation = (e, clientId) => {
    e.stopPropagation()
    const client = clients.find(c => c.id === clientId)
    
    if (!client.is_confirmed) {
      // Show modal to get confirmation details
      setSelectedClientId(clientId)
      setShowConfirmModal(true)
    } else {
      // Unconfirm directly
      updateClientConfirmation(clientId, false, '', '', '')
    }
  }

  const updateClientConfirmation = async (clientId, isConfirmed, startDate, endDate, budget) => {
    try {
      const client = clients.find(c => c.id === clientId)
      const updatedClient = {
        ...client,
        isConfirmed: isConfirmed,
        startDate: startDate,
        endDate: endDate,
        budget: budget
      }
      
      await clientsAPI.update(updatedClient)
      
      // Update local state
      setClients(prevClients =>
        prevClients.map(c =>
          c.id === clientId
            ? { ...c, is_confirmed: isConfirmed, start_date: startDate, end_date: endDate, budget: budget }
            : c
        )
      )
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client. Please try again.')
    }
  }

  const handleConfirmClient = async () => {
    if (!confirmationDetails.startDate || !confirmationDetails.endDate || !confirmationDetails.budget) {
      alert('Please fill in all fields')
      return
    }

    await updateClientConfirmation(
      selectedClientId,
      true,
      confirmationDetails.startDate,
      confirmationDetails.endDate,
      confirmationDetails.budget
    )

    setShowConfirmModal(false)
    setConfirmationDetails({ startDate: '', endDate: '', budget: '' })
    setSelectedClientId(null)
  }

  let filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Apply confirmation filter based on toggle
  filteredClients = filteredClients.filter(client => 
    showConfirmedOnly ? client.is_confirmed : !client.is_confirmed
  )

  if (loading) {
    return <Loader fullScreen size="large" />
  }

  return (
    <div className="clients-page">
      <div className="clients-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Clients
        </motion.h1>
        
        <div className="filter-toggle">
          <span className={!showConfirmedOnly ? 'active' : ''}>Not Confirmed</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showConfirmedOnly}
              onChange={(e) => {
                const isConfirmed = e.target.checked
                setShowConfirmedOnly(isConfirmed)
                // Reset sub-status filter when switching
                setSubStatusFilter('all')
                // Update URL to reflect the current filter
                navigate(`/clients?filter=${isConfirmed ? 'confirmed' : 'not-confirmed'}`)
              }}
            />
            <span className="slider"></span>
          </label>
          <span className={showConfirmedOnly ? 'active' : ''}>Confirmed</span>
        </div>
      </div>

      {!showConfirmedOnly && (
        <div className="sub-status-filter">
          <label className="sub-status-label">Filter by Status:</label>
          <select 
            className="sub-status-dropdown"
            value={subStatusFilter}
            onChange={(e) => setSubStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting-for-client-response">Waiting for Client Response</option>
            <option value="pending-from-our-side">Pending from our side</option>
          </select>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search clients by name, company, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div 
        className="clients-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card hoverable className="client-card" onClick={() => handleClientClick(client)}>
              <div className="client-header-section">
                <div className="client-avatar">
                  {client.name.charAt(0)}
                </div>
                <label className="confirmation-toggle" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={client.is_confirmed}
                    onChange={(e) => handleToggleConfirmation(e, client.id)}
                  />
                  <span className="toggle-label">
                    {client.is_confirmed ? 'Confirmed' : 'Not Confirmed'}
                  </span>
                </label>
              </div>
              
              <h3 className="client-name">{client.name}</h3>
              <p className="client-company">{client.company}</p>
              
              <div className="client-contact">
                <div className="contact-item">
                  <span className="contact-text">{client.email}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-text">{client.phone}</span>
                </div>
              </div>

              <div className="client-stats">
                <div className="stat-box">
                  <span className="stat-value">{client.activeProjects}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{client.projects}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmationDetails({ startDate: '', endDate: '', budget: '' })
          setSelectedClientId(null)
        }}
        title="Confirm Client Details"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ margin: '0 0 8px 0', color: '#5a6c7d', fontSize: '15px', lineHeight: '1.5' }}>
            Please provide project details for this confirmed client:
          </p>
          
          <Input
            label="Start Date"
            type="date"
            value={confirmationDetails.startDate}
            onChange={(e) => setConfirmationDetails({ ...confirmationDetails, startDate: e.target.value })}
            required
          />

          <Input
            label="End Date"
            type="date"
            value={confirmationDetails.endDate}
            onChange={(e) => setConfirmationDetails({ ...confirmationDetails, endDate: e.target.value })}
            required
          />

          <Input
            label="Budget"
            type="text"
            value={confirmationDetails.budget}
            onChange={(e) => setConfirmationDetails({ ...confirmationDetails, budget: e.target.value })}
            placeholder="$5,000"
            required
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'flex-end' }}>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirmModal(false)
                setConfirmationDetails({ startDate: '', endDate: '', budget: '' })
                setSelectedClientId(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmClient}>
              Confirm Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Clients
