import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../../components/UI/Card/Card'
import Button from '../../components/UI/Button/Button'
import Loader from '../../components/UI/Loader/Loader'
import { statusColors, projectTypeColors } from '../../theme/colors'
import './ProjectsByType.css'

const ProjectsByType = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all') // all, in-progress, completed, pending

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects([
        {
          id: 1,
          name: 'Client ABC Store',
          client: 'ABC Corporation',
          status: 'in-progress',
          progress: 65,
          startDate: '2024-01-15',
          deadline: '2024-03-30',
          lastUpdate: '2 hours ago'
        },
        {
          id: 2,
          name: 'XYZ Fashion Shop',
          client: 'XYZ Fashion Ltd',
          status: 'pending',
          progress: 20,
          startDate: '2024-02-01',
          deadline: '2024-04-15',
          lastUpdate: '1 day ago'
        },
        {
          id: 3,
          name: 'Tech Gadgets Online',
          client: 'Tech Innovations',
          status: 'completed',
          progress: 100,
          startDate: '2023-11-10',
          deadline: '2024-01-20',
          lastUpdate: '1 week ago'
        }
      ])
      setLoading(false)
    }, 600)
  }, [type])

  const handleProjectClick = (id) => {
    navigate(`/project/${id}`)
  }

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter)

  const typeColors = projectTypeColors[type] || projectTypeColors.custom
  const typeName = type.charAt(0).toUpperCase() + type.slice(1)

  if (loading) {
    return <Loader fullScreen size="large" />
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Back to Types
        </Button>

        <div className="header-info">
          <motion.div 
            className="type-badge"
            style={{ 
              background: typeColors.bg,
              color: typeColors.text 
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {typeName} Projects
          </motion.div>
          <motion.h1 
            className="page-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {filteredProjects.length} Projects
          </motion.h1>
        </div>

        <div className="filter-buttons">
          {['all', 'in-progress', 'completed', 'pending'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setFilter(f)}
            >
              {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Button>
          ))}
        </div>
      </div>

      <motion.div 
        className="projects-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredProjects.map((project, index) => {
          const statusColor = statusColors[project.status]
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card 
                hoverable 
                onClick={() => handleProjectClick(project.id)}
                className="project-card"
              >
                <div className="project-card-header">
                  <h3 className="project-name">{project.name}</h3>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: statusColor.bg,
                      color: statusColor.text 
                    }}
                  >
                    {project.status.split('-').join(' ')}
                  </span>
                </div>

                <p className="project-client">
                  {project.client}
                </p>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      style={{ background: typeColors.icon }}
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>

                <div className="project-meta">
                  <div className="meta-item">
                    <span className="meta-label">Deadline</span>
                    <span className="meta-value">{project.deadline}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Last Update</span>
                    <span className="meta-value">{project.lastUpdate}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {filteredProjects.length === 0 && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>No projects found</p>
        </motion.div>
      )}
    </div>
  )
}

export default ProjectsByType
