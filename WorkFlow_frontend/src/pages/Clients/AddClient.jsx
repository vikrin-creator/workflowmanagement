import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Button from '../../components/UI/Button/Button'
import Input from '../../components/UI/Input/Input'
import { clientsAPI } from '../../services/api'
import './AddClient.css'

const AddClient = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    isConfirmed: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await clientsAPI.create(formData)
      
      if (response.data.success) {
        console.log('Client created:', response.data)
        navigate('/clients')
      } else {
        alert('Failed to create client. Please try again.')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Failed to create client. Please try again.')
    }
  }

  return (
    <div className="add-client-page">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/clients')}
        className="back-button"
      >
        ← Back to Clients
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="add-client-card">
          <h1 className="form-title">Add New Client</h1>
          <p className="form-subtitle">Enter client information below</p>

          <form onSubmit={handleSubmit} className="client-form">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter client name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="client@example.com"
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
              required
            />

            <Input
              label="Company Name"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Inc."
              required
            />

            <div className="input-wrapper">
              <label className="input-label">Address</label>
              <textarea
                className="input-field"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
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
                <span>This is a confirmed client</span>
              </label>
            </div>

            <div className="form-actions">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate('/clients')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Client
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default AddClient
