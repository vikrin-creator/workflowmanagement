import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Button from '../../components/UI/Button/Button'
import Input from '../../components/UI/Input/Input'
import Modal from '../../components/UI/Modal/Modal'
import Loader from '../../components/UI/Loader/Loader'
import { projectsAPI, statusAPI, clientsAPI } from '../../services/api'
import { statusColors } from '../../theme/colors'
import './ProjectDetails.css'

const ProjectDetails = ({ currentUser, isClientView = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [client, setClient] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState({
    update: ''
  })
  const [checklist, setChecklist] = useState({
    designingPhase: false,
    developmentPhase: false,
    testingPhase: false,
    live: false
  })
  const [isEditingRequirements, setIsEditingRequirements] = useState(false)
  const [editedRequirements, setEditedRequirements] = useState('')
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMenuDropdown, setShowMenuDropdown] = useState(false)
  const [editedProject, setEditedProject] = useState({
    name: '',
    type: '',
    startDate: '',
    deadline: '',
    budget: '',
    requirements: ''
  })
  const [editedClient, setEditedClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  })

  useEffect(() => {
    // Load project and client data from API
    const fetchProjectData = async () => {
      try {
        if (isClientView) {
          // Load client data only
          const clientsResponse = await clientsAPI.getAll()
          
          if (!clientsResponse.data.success) {
            console.log('No clients found')
            setLoading(false)
            return
          }
          
          const clients = clientsResponse.data.data
          const foundClient = clients.find(c => c.id === parseInt(id))
          
          if (!foundClient) {
            console.log('Client not found')
            setClient(null)
            setLoading(false)
            return
          }
          
          setClient(foundClient)
          setProject(null) // No project for client view
          setLoading(false)
          return
        }
        
        const projectsResponse = await projectsAPI.getAll()
        
        if (!projectsResponse.data.success) {
          console.log('No projects found')
          setLoading(false)
          return
        }
        
        const projects = projectsResponse.data.data
        const foundProject = projects.find(p => p.id === parseInt(id))
        
        if (!foundProject) {
          console.log('Project not found')
          setProject(null)
          setLoading(false)
          return
        }
        
        // Get client data
        const clientsResponse = await clientsAPI.getAll()
        let clientData = {
          id: foundProject.client_id,
          name: foundProject.client_name || 'Unknown Client',
          email: foundProject.client_email || 'N/A',
          phone: foundProject.client_phone || 'N/A'
        }
        let isClientConfirmed = false
        
        if (clientsResponse.data.success) {
          const client = clientsResponse.data.data.find(c => c.id === foundProject.client_id)
          if (client) {
            clientData = {
              id: client.id,
              name: client.name,
              email: client.email || 'N/A',
              phone: client.phone || 'N/A'
            }
            isClientConfirmed = client.is_confirmed
            // Use client dates and budget if confirmed, otherwise project data
            if (client.is_confirmed && client.start_date) {
              foundProject.start_date = client.start_date
            }
            if (client.is_confirmed && client.end_date) {
              foundProject.deadline = client.end_date
            }
            if (client.is_confirmed && client.budget) {
              foundProject.budget = client.budget
            }
          }
        }

        // Get status updates
        const statusResponse = await statusAPI.getByProject(foundProject.id)
        const statusUpdates = statusResponse.data.success ? statusResponse.data.data : []

        setProject({
          id: foundProject.id,
          name: foundProject.name,
          type: foundProject.type || 'General',
          client: clientData,
          isClientConfirmed: isClientConfirmed,
          status: foundProject.status || 'in-progress',
          startDate: (foundProject.start_date && foundProject.start_date !== '0') ? foundProject.start_date : '',
          deadline: (foundProject.deadline && foundProject.deadline !== '0') ? foundProject.deadline : '',
          requirements: foundProject.requirements || 'No requirements specified',
          budget: (foundProject.budget && foundProject.budget !== '0' && foundProject.budget !== 0) ? foundProject.budget : 'Not specified',
          statusUpdates: (statusUpdates || []).map(s => ({
            id: s.id,
            date: s.created_at.split(' ')[0],
            time: new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            update: s.update_text || '',
            updatedBy: s.updated_by || 'Unknown'
          }))
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching project data:', error)
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenuDropdown && !event.target.closest('.menu-dropdown-container')) {
        setShowMenuDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenuDropdown])

  const handleAddStatus = async () => {
    if (!newStatus.update) return
    
    try {
      const statusData = {
        project_id: project.id,
        update_text: newStatus.update,
        updated_by: currentUser
      }
      
      const response = await statusAPI.create(statusData)
      
      if (response.data.success) {
        const newStatusUpdate = {
          id: response.data.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          update: newStatus.update,
          updatedBy: currentUser
        }

        setProject({
          ...project,
          statusUpdates: [newStatusUpdate, ...project.statusUpdates]
        })

        setNewStatus({ update: '' })
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error('Error adding status update:', error)
      alert('Failed to add status update. Please try again.')
    }
  }

  const handleSaveRequirements = async () => {
    try {
      const response = await projectsAPI.update({
        id: project.id,
        requirements: editedRequirements
      })

      if (response.data.success) {
        // Add a status update to log the requirements change
        const statusData = {
          project_id: project.id,
          update_text: `Requirements updated by ${currentUser}`,
          updated_by: currentUser
        }
        
        try {
          const statusResponse = await statusAPI.create(statusData)
          
          if (statusResponse.data.success) {
            const newStatusUpdate = {
              id: statusResponse.data.id,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              update: `Requirements updated by ${currentUser}`,
              updatedBy: currentUser
            }

            setProject(prev => ({
              ...prev,
              requirements: editedRequirements,
              statusUpdates: [newStatusUpdate, ...prev.statusUpdates]
            }))
          }
        } catch (statusError) {
          console.error('Error adding status update for requirements change:', statusError)
          // Still update the requirements even if status update fails
          setProject(prev => ({
            ...prev,
            requirements: editedRequirements
          }))
        }
        
        setIsEditingRequirements(false)
        setEditedRequirements('')
        alert('Requirements updated successfully!')
      }
    } catch (error) {
      console.error('Error updating requirements:', error)
      alert('Failed to update requirements. Please try again.')
    }
  }

  const handleSaveProject = async () => {
    try {
      const response = await projectsAPI.update({
        id: project.id,
        name: editedProject.name,
        type: editedProject.type,
        start_date: editedProject.startDate,
        deadline: editedProject.deadline,
        budget: editedProject.budget,
        requirements: editedProject.requirements
      })

      if (response.data.success) {
        // Add a status update to log the project update
        const statusData = {
          project_id: project.id,
          update_text: `Project details updated by ${currentUser}`,
          updated_by: currentUser
        }
        
        try {
          const statusResponse = await statusAPI.create(statusData)
          
          if (statusResponse.data.success) {
            const newStatusUpdate = {
              id: statusResponse.data.id,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              update: `Project details updated by ${currentUser}`,
              updatedBy: currentUser
            }

            setProject(prev => ({
              ...prev,
              name: editedProject.name,
              type: editedProject.type,
              startDate: editedProject.startDate,
              deadline: editedProject.deadline,
              budget: editedProject.budget,
              requirements: editedProject.requirements,
              statusUpdates: [newStatusUpdate, ...prev.statusUpdates]
            }))
          }
        } catch (statusError) {
          console.error('Error adding status update for project change:', statusError)
          // Still update the project even if status update fails
          setProject(prev => ({
            ...prev,
            name: editedProject.name,
            type: editedProject.type,
            startDate: editedProject.startDate,
            deadline: editedProject.deadline,
            budget: editedProject.budget,
            requirements: editedProject.requirements
          }))
        }
        
        setShowEditProjectModal(false)
        alert('Project updated successfully!')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    }
  }

  const handleSaveClient = async () => {
    try {
      const response = await clientsAPI.update({
        id: project.client.id,
        name: editedClient.name,
        email: editedClient.email,
        phone: editedClient.phone,
        company: editedClient.company,
        address: editedClient.address
      })

      if (response.data.success) {
        // Add a status update to log the client update
        const statusData = {
          project_id: project.id,
          progress: 0,
          update_text: `Client details updated by ${currentUser}`,
          updated_by: currentUser
        }
        
        try {
          const statusResponse = await statusAPI.create(statusData)
          
          if (statusResponse.data.success) {
            const newStatusUpdate = {
              id: statusResponse.data.id,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              update: `Client details updated by ${currentUser}`,
              updatedBy: currentUser
            }

            setProject(prev => ({
              ...prev,
              client: {
                ...prev.client,
                name: editedClient.name,
                email: editedClient.email,
                phone: editedClient.phone,
                company: editedClient.company,
                address: editedClient.address
              },
              statusUpdates: [newStatusUpdate, ...prev.statusUpdates]
            }))
          }
        } catch (statusError) {
          console.error('Error adding status update for client change:', statusError)
          // Still update the client even if status update fails
          setProject(prev => ({
            ...prev,
            client: {
              ...prev.client,
              name: editedClient.name,
              email: editedClient.email,
              phone: editedClient.phone,
              company: editedClient.company,
              address: editedClient.address
            }
          }))
        }
        
        setShowEditClientModal(false)
        alert('Client updated successfully!')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client. Please try again.')
    }
  }

  const handleDeleteProject = async () => {
    try {
      // First delete the project (this will cascade delete status updates)
      console.log('Deleting project with ID:', project.id)
      const projectResponse = await projectsAPI.delete(project.id)
      
      if (projectResponse.data.success) {
        console.log('Project deleted successfully, now deleting client with ID:', project.client.id)
        
        // Add a small delay to ensure project deletion is complete
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Then delete the client
        const clientResponse = await clientsAPI.delete(project.client.id)
        
        if (clientResponse.data.success) {
          setShowDeleteModal(false)
          alert('Project and client deleted successfully!')
          navigate('/')
        } else {
          console.error('Client deletion failed:', clientResponse)
          throw new Error(`Failed to delete client: ${clientResponse.data.message || 'Unknown error'}`)
        }
      } else {
        console.error('Project deletion failed:', projectResponse)
        throw new Error(`Failed to delete project: ${projectResponse.data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting project and client:', error)
      alert(`Failed to delete project and client: ${error.message}`)
      setShowDeleteModal(false)
    }
  }

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    const oldStatus = project.status
    
    // Update UI immediately
    setProject({ ...project, status: newStatus })
    
    try {
      // Save status to backend
      await projectsAPI.update({
        id: project.id,
        status: newStatus
      })

      // Update client's sub_status to match project status
      await clientsAPI.update({
        id: project.client.id,
        subStatus: newStatus
      })
      
      // Create automatic status update
      const statusText = `Status changed from "${oldStatus.split('-').join(' ')}" to "${newStatus.split('-').join(' ')}" by ${currentUser}`
      const statusData = {
        project_id: project.id,
        update_text: statusText,
        updated_by: currentUser
      }
      
      const response = await statusAPI.create(statusData)
      
      if (response.data.success) {
        const newStatusUpdate = {
          id: response.data.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          update: statusText,
          updatedBy: currentUser
        }
        
        setProject(prev => ({
          ...prev,
          statusUpdates: [newStatusUpdate, ...prev.statusUpdates]
        }))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
      // Revert UI on error
      setProject({ ...project, status: oldStatus })
    }
  }

  const handleDeleteClient = async () => {
    try {
      console.log('Deleting client with ID:', client.id)
      
      const clientResponse = await clientsAPI.delete(client.id)
      console.log('Client delete response:', clientResponse)
      
      if (clientResponse.data && clientResponse.data.success) {
        setShowDeleteModal(false)
        alert('Client deleted successfully!')
        navigate('/clients')
      } else {
        console.error('Client deletion failed:', clientResponse)
        const errorMessage = clientResponse.data?.message || clientResponse.statusText || 'Unknown error'
        throw new Error(`Failed to delete client: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
      alert(`Failed to delete client: ${errorMessage}`)
      setShowDeleteModal(false)
    }
  }

  const handleChecklistChange = async (field, checked, phaseName) => {
    // Update checklist state
    setChecklist(prev => ({ ...prev, [field]: checked }))
    
    // Create status update for checklist change
    const action = checked ? 'completed' : 'unchecked'
    const statusText = `${phaseName} ${action} by ${currentUser}`
    
    try {
      const statusData = {
        project_id: project.id,
        update_text: statusText,
        updated_by: currentUser
      }
      
      const response = await statusAPI.create(statusData)
      
      if (response.data.success) {
        const newStatusUpdate = {
          id: response.data.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          update: statusText,
          updatedBy: currentUser
        }

        setProject(prev => ({
          ...prev,
          statusUpdates: [newStatusUpdate, ...prev.statusUpdates]
        }))
      }
    } catch (error) {
      console.error('Error adding status update for checklist change:', error)
    }
  }

  if (loading) {
    return <Loader fullScreen size="large" />
  }

  // All users have access to project details

  if (isClientView && !client) {
    return (
      <div className="project-details">
        <div className="details-header">
          <h1>Client Not Found</h1>
          <p>The requested client could not be found.</p>
          <Button onClick={() => navigate('/clients')}>← Back to Clients</Button>
        </div>
      </div>
    )
  }

  if (!isClientView && !project) {
    return (
      <div className="project-details">
        <div className="details-header">
          <h1>Project Not Found</h1>
          <p>The requested project could not be found.</p>
          <Button onClick={() => navigate('/clients')}>← Back to Clients</Button>
        </div>
      </div>
    )
  }

  // Handle client view (client without projects)
  if (isClientView && client) {
    return (
      <div className="project-details">
        <div className="details-header">
          <motion.div 
            className="project-header-info"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="title-row">
              <h1 className="project-title">{client.name}</h1>
              <div className="header-actions">
                <Button 
                  onClick={() => navigate('/projects/add?client_id=' + client.id + '&client_name=' + encodeURIComponent(client.name))}
                  variant="primary"
                >
                  Add Project
                </Button>
                <div className="menu-dropdown-container">
                  <button 
                    className="menu-dropdown-btn"
                    onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  >
                    <span>⋯</span>
                  </button>
                  {showMenuDropdown && (
                    <div className="menu-dropdown">
                      <button 
                        className="menu-item delete-item"
                        onClick={() => {
                          setShowMenuDropdown(false)
                          setShowDeleteModal(true)
                        }}
                      >
                        <span className="menu-icon">🗑️</span>
                        Delete Client
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">Email:</span>
                <span className="meta-value">{client.email || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Phone:</span>
                <span className="meta-value">{client.phone || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Company:</span>
                <span className="meta-value">{client.company || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <span className="meta-value" style={{
                  color: client.is_confirmed === 1 ? '#4caf50' : '#ff9800',
                  fontWeight: 'bold'
                }}>
                  {client.is_confirmed === 1 ? 'Confirmed' : 'Not Confirmed'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Empty project container */}
        <motion.div
          className="project-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="no-projects-card">
            <div className="no-projects-content">
              <h3>No Projects Yet</h3>
              <p>This client doesn't have any projects. Click "Add Project" to create the first project.</p>
              <Button 
                onClick={() => navigate('/projects/add?client_id=' + client.id + '&client_name=' + encodeURIComponent(client.name))}
                variant="primary"
                className="add-project-btn"
              >
                Create First Project
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal for Client View */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Client"
        >
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this client?</p>
            <p><strong>This action cannot be undone.</strong></p>
            <p>This will permanently delete:</p>
            <ul>
              <li>Client: <strong>{client?.name}</strong></li>
              <li>All client data and information</li>
            </ul>
            
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteClient}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  const statusColor = statusColors[project.status]

  return (
    <div className="project-details">
      <div className="details-header">
        <motion.div 
          className="project-header-info"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="title-row">
            <h1 className="project-title">{project.name}</h1>
            <div className="header-actions">
              <select
                className="status-dropdown"
                value={project.status}
                onChange={handleStatusChange}
                style={{
                  background: statusColor.bg,
                color: statusColor.text
              }}
            >
              <option value="in-progress">In Progress</option>
              <option value="waiting-for-client-response">Waiting For Client Response</option>
              <option value="pending-from-our-side">Pending From Our Side</option>
            </select>
            <div className="menu-dropdown-container">
              <button 
                className="menu-dropdown-btn"
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              >
                <span>⋯</span>
              </button>
              {showMenuDropdown && (
                <div className="menu-dropdown">
                  <button 
                    className="menu-item delete-item"
                    onClick={() => {
                      setShowMenuDropdown(false)
                      setShowDeleteModal(true)
                    }}
                  >
                    <span className="menu-icon">🗑️</span>
                    Delete Project & Client
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
          <p className="project-type-label">
            {project.type}
          </p>
        </motion.div>

        <Button onClick={() => setShowStatusModal(true)}>
          + Add Status Update
        </Button>
      </div>

      <div className="details-grid">
        <motion.div
          className="details-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="info-card">
            <div className="card-header">
              <h2 className="section-title">Client Details</h2>
              <button 
                className="edit-project-btn"
                onClick={() => {
                  setEditedClient({
                    name: project.client.name,
                    email: project.client.email,
                    phone: project.client.phone,
                    company: project.client.company || '',
                    address: project.client.address || ''
                  })
                  setShowEditClientModal(true)
                }}
              >
                ✏️ Edit Client
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{project.client.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{project.client.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{project.client.phone}</span>
              </div>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <h2 className="section-title">Project Details</h2>
              <button 
                className="edit-project-btn"
                onClick={() => {
                  setEditedProject({
                    name: project.name,
                    type: project.type,
                    startDate: project.startDate,
                    deadline: project.deadline,
                    budget: project.budget,
                    requirements: project.requirements
                  })
                  setShowEditProjectModal(true)
                }}
              >
                ✏️ Edit Project
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Project Name</span>
                <span className="info-value">{project.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Project Type</span>
                <span className="info-value">{project.type}</span>
              </div>
              {!!project.isClientConfirmed && (
                <>
                  <div className="info-item">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">{project.startDate}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Deadline</span>
                    <span className="info-value">{project.deadline}</span>
                  </div>
                </>
              )}
              <div className="info-item">
                <span className="info-label">Budget</span>
                <span className="info-value">{project.budget}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Requirements</span>
                {isEditingRequirements ? (
                  <div className="requirements-edit">
                    <textarea
                      className="requirements-textarea"
                      value={editedRequirements}
                      onChange={(e) => setEditedRequirements(e.target.value)}
                      rows={8}
                      placeholder="Enter project requirements...\nExample:\nWebsite Pages\n1. Home\n2. Shop -> Collections\n3. Shop -> Categories"
                    />
                    <div className="edit-actions">
                      <button 
                        className="save-btn"
                        onClick={handleSaveRequirements}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          setIsEditingRequirements(false)
                          setEditedRequirements('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="info-text requirements-display">
                    {project.requirements}
                  </pre>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="details-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="status-updates-card">
            <h2 className="section-title">Status Updates</h2>
            
            {!!project.isClientConfirmed && (
              <div className="project-checklist">
                <h3 className="checklist-title">Project Stages</h3>
                <div className="checklist-items">
                  <div className="checklist-item">
                    <input 
                      type="checkbox" 
                      id="designing-phase"
                      checked={checklist.designingPhase}
                      onChange={(e) => handleChecklistChange('designingPhase', e.target.checked, 'Designing Phase')}
                    />
                    <label htmlFor="designing-phase">Designing Phase</label>
                  </div>
                  <div className="checklist-item">
                    <input 
                      type="checkbox" 
                      id="development-phase"
                      checked={checklist.developmentPhase}
                      onChange={(e) => handleChecklistChange('developmentPhase', e.target.checked, 'Development Phase')}
                    />
                    <label htmlFor="development-phase">Development Phase</label>
                  </div>
                  <div className="checklist-item">
                    <input 
                      type="checkbox" 
                      id="testing-phase"
                      checked={checklist.testingPhase}
                      onChange={(e) => handleChecklistChange('testingPhase', e.target.checked, 'Testing Phase')}
                    />
                    <label htmlFor="testing-phase">Testing Phase</label>
                  </div>
                  <div className="checklist-item">
                    <input 
                      type="checkbox" 
                      id="live"
                      checked={checklist.live}
                      onChange={(e) => handleChecklistChange('live', e.target.checked, 'Live')}
                    />
                    <label htmlFor="live">Live</label>
                  </div>
                </div>
              </div>
            )}
            
            <div className="timeline">
              {project.statusUpdates?.length > 0 ? (
                project.statusUpdates.map((status, index) => (
                  <motion.div 
                    key={status.id} 
                    className="timeline-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                  >
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-date">{status.date}</span>
                        <span className="timeline-time">{status.time}</span>
                      </div>
                      <div className="timeline-user">
                        Updated by: <strong>{status.updatedBy}</strong>
                      </div>
                      <pre className="timeline-update">{status.update}</pre>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-updates">
                  <p>No status updates yet. Create the first update above.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Add Status Update"
      >
        <div className="status-form">
          <div className="input-wrapper">
            <label className="input-label">
              Status Update <span className="required">*</span>
            </label>
            <textarea
              className="input-field status-update-textarea"
              name="update"
              value={newStatus.update}
              onChange={(e) => setNewStatus({ ...newStatus, update: e.target.value })}
              placeholder="Describe what has been completed...\nExample:\n- Completed homepage design\n- Fixed navigation issues\n- Added contact form"
              rows="6"
              required
            />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStatus}>
              Add Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        title="Edit Project Details"
      >
        <div className="edit-project-form">
          <div className="form-row">
            <Input
              label="Project Name"
              type="text"
              value={editedProject.name}
              onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
            <Input
              label="Project Type"
              type="text"
              value={editedProject.type}
              onChange={(e) => setEditedProject({ ...editedProject, type: e.target.value })}
              placeholder="e.g. General, E-commerce, Portfolio"
            />
          </div>
          
          <div className="form-row">
            <Input
              label="Start Date"
              type="date"
              value={editedProject.startDate}
              onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
            />
            <Input
              label="Deadline"
              type="date"
              value={editedProject.deadline}
              onChange={(e) => setEditedProject({ ...editedProject, deadline: e.target.value })}
            />
          </div>

          <Input
            label="Budget"
            type="text"
            value={editedProject.budget}
            onChange={(e) => setEditedProject({ ...editedProject, budget: e.target.value })}
            placeholder="Enter budget amount"
          />

          <div className="input-wrapper">
            <label className="input-label">
              Requirements
            </label>
            <textarea
              className="input-field requirements-textarea"
              value={editedProject.requirements}
              onChange={(e) => setEditedProject({ ...editedProject, requirements: e.target.value })}
              placeholder="Enter project requirements..."
              rows="6"
            />
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setShowEditProjectModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={showEditClientModal}
        onClose={() => setShowEditClientModal(false)}
        title="Edit Client Details"
      >
        <div className="edit-form">
          <Input
            label="Client Name"
            type="text"
            value={editedClient.name}
            onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
            placeholder="Enter client name"
            required
          />

          <Input
            label="Email"
            type="email"
            value={editedClient.email}
            onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
            placeholder="client@example.com"
          />

          <Input
            label="Phone"
            type="tel"
            value={editedClient.phone}
            onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />

          <Input
            label="Company"
            type="text"
            value={editedClient.company}
            onChange={(e) => setEditedClient({ ...editedClient, company: e.target.value })}
            placeholder="Company name"
          />

          <div className="input-wrapper">
            <label className="input-label">Address</label>
            <textarea
              className="input-field"
              value={editedClient.address}
              onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
              placeholder="Enter client address..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setShowEditClientModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClient}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={isClientView ? "Delete Client" : "Delete Project & Client"}
      >
        <div className="delete-confirmation">
          {isClientView ? (
            <>
              <p>Are you sure you want to delete this client?</p>
              <p><strong>This action cannot be undone.</strong></p>
              <p>This will permanently delete:</p>
              <ul>
                <li>Client: <strong>{client?.name}</strong></li>
                <li>All client data and information</li>
              </ul>
            </>
          ) : (
            <>
              <p>Are you sure you want to delete this project and client?</p>
              <p><strong>This action cannot be undone.</strong></p>
              <p>This will permanently delete:</p>
              <ul>
                <li>Project: <strong>{project?.name}</strong></li>
                <li>Client: <strong>{project?.client?.name}</strong></li>
                <li>All status updates and data</li>
              </ul>
            </>
          )}
          
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={isClientView ? handleDeleteClient : handleDeleteProject}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProjectDetails
