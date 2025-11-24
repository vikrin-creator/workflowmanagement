import React from 'react'
import { motion } from 'framer-motion'
import './Card.css'

const Card = ({ 
  children, 
  onClick, 
  className = '', 
  hoverable = false,
  style = {}
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  }

  const hoverVariants = hoverable ? {
    scale: 1.02,
    y: -4,
    boxShadow: '0 12px 24px rgba(100, 121, 143, 0.15)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  } : {}

  return (
    <motion.div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={hoverVariants}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export default Card
