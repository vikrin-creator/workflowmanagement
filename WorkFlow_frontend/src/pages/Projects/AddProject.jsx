import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Button from '../../components/UI/Button/Button'
import Input from '../../components/UI/Input/Input'
import { clientsAPI, projectsAPI, statusAPI } from '../../services/api'
import './AddProject.css'

const AddProject = ({ currentUser }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    // Project fields
    name: '',
    projectType: '',
    requirements: '',
    budget: '',
    // Client fields
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    clientAddress: '',
    isConfirmed: false,
    startDate: '',
    endDate: '',
    clientBudget: ''
  })
  const [preSelectedClient, setPreSelectedClient] = useState(null)

  useEffect(() => {
    // Check for pre-selected client from URL parameters
    const clientId = searchParams.get('client_id')
    const clientName = searchParams.get('client_name')
    
    if (clientId && clientName) {
      // Fetch full client details
      const fetchClientDetails = async () => {
        try {
          const response = await clientsAPI.getAll()
          if (response.data.success) {
            const client = response.data.data.find(c => c.id === parseInt(clientId))
            if (client) {
              setPreSelectedClient(client)
              setFormData(prevData => ({
                ...prevData,
                clientName: client.name,
                clientEmail: client.email || '',
                clientPhone: client.phone || '',
                clientCompany: client.company || '',
                clientAddress: client.address || '',
                isConfirmed: client.is_confirmed === 1,
                startDate: client.start_date || '',
                endDate: client.deadline || '',
                clientBudget: client.budget || ''
              }))
            }
          }
        } catch (error) {
          console.error('Error fetching client details:', error)
          // Fallback to just the name if API fails
          setFormData(prevData => ({
            ...prevData,
            clientName: decodeURIComponent(clientName)
          }))
        }
      }
      
      fetchClientDetails()
    }
  }, [searchParams])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let clientId
      
      if (preSelectedClient) {
        // Use existing client
        clientId = preSelectedClient.id
        
        // Update client details if they were modified
        const clientData = {
          id: preSelectedClient.id,
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          company: formData.clientCompany,
          address: formData.clientAddress,
          is_confirmed: formData.isConfirmed,
          start_date: formData.isConfirmed ? formData.startDate : null,
          end_date: formData.isConfirmed ? formData.endDate : null,
          budget: formData.isConfirmed ? formData.clientBudget : null
        }
        
        const clientResponse = await clientsAPI.update(clientData)
        
        if (!clientResponse.data.success) {
          alert('Failed to update client. Please try again.')
          return
        }
      } else {
        // Create new client
        const clientData = {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          company: formData.clientCompany,
          address: formData.clientAddress,
          is_confirmed: formData.isConfirmed,
          start_date: formData.isConfirmed ? formData.startDate : null,
          end_date: formData.isConfirmed ? formData.endDate : null,
          budget: formData.isConfirmed ? formData.clientBudget : null
        }
        
        const clientResponse = await clientsAPI.create(clientData)
        
        if (!clientResponse.data.success) {
          alert('Failed to create client. Please try again.')
          return
        }
        
        clientId = clientResponse.data.data.id
      }
      
      // Then, create the project linked to this client
      const projectData = {
        name: formData.name,
        type: formData.projectType,
        client_id: clientId,
        requirements: formData.requirements,
        budget: formData.budget || 'Not specified',
        status: 'in-progress',
        progress: 0
      }
      
      const projectResponse = await projectsAPI.create(projectData)
      
      if (projectResponse.data.success) {
        const newProjectId = projectResponse.data.data.id
        
        // Create initial status update for project creation
        try {
          const statusData = {
            project_id: newProjectId,
            progress: 0,
            update_text: `Project "${formData.name}" created by ${currentUser}`,
            updated_by: currentUser
          }
          
          await statusAPI.create(statusData)
        } catch (statusError) {
          console.error('Error creating initial status update:', statusError)
          // Don't fail the whole process if status update fails
        }
        
        console.log('Project and client created successfully')
        navigate('/clients')
      } else {
        alert('Client created but failed to create project. Please try again.')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    }
  }

  return (
    <div className="add-project-page">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="back-button"
      >
        ← Back to Dashboard
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="add-project-card">
          <h1 className="form-title">
            {preSelectedClient ? `Create New Project for ${preSelectedClient.name}` : 'Create New Project'}
          </h1>
          <p className="form-subtitle">
            {preSelectedClient 
              ? 'Add project details for this existing client' 
              : 'Add client and project details'
            }
          </p>

          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-section">
              <h3 className="section-title">
                Client Information
                {preSelectedClient && (
                  <span style={{ color: '#4caf50', fontSize: '0.8em', marginLeft: '10px' }}>
                    (Existing Client)
                  </span>
                )}
              </h3>
              
              <Input
                label="Client Name"
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Enter client name"
                required
              />

              <Input
                label="Email"
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="client@example.com"
              />

              <Input
                label="Phone"
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />

              <Input
                label="Company"
                type="text"
                name="clientCompany"
                value={formData.clientCompany}
                onChange={handleChange}
                placeholder="Company name"
              />

              <div className="input-wrapper">
                <label className="input-label">Address</label>
                <textarea
                  className="input-field"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  placeholder="Enter client address..."
                  rows="3"
                />
              </div>

              <div className="checkbox-wrapper">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isConfirmed"
                    checked={formData.isConfirmed}
                    onChange={handleChange}
                  />
                  <span>Client is confirmed</span>
                </label>
              </div>

              {formData.isConfirmed && (
                <>
                  <Input
                    label="Start Date"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="End Date"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Budget"
                    type="text"
                    name="clientBudget"
                    value={formData.clientBudget}
                    onChange={handleChange}
                    placeholder="$5,000"
                    required
                  />
                </>
              )}
            </div>

            <div className="form-section">
              <h3 className="section-title">Project Details</h3>
              
              <Input
                label="Project Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />

              <Input
                label="Project Type"
                type="text"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                placeholder="E-commerce, Portfolio, Blog, etc."
                required
              />

              <div className="input-wrapper">
                <label className="input-label">
                  Requirements <span className="required">*</span>
                </label>
                <textarea
                  className="input-field"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Describe the project requirements in detail..."
                  rows="6"
                  required
                />
              </div>

              <Input
                label="Budget"
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="$5,000"
              />
            </div>

            <div className="form-actions">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default AddProject
