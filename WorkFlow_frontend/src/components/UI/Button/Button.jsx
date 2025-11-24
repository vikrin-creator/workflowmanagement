import React from 'react'
import { motion } from 'framer-motion'
import './Button.css'

const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  disabled = false,
  fullWidth = false,
  className = '',
  style = {}
}) => {
  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : "hover"}
      whileTap={disabled ? {} : "tap"}
      variants={buttonVariants}
      style={style}
    >
      {children}
    </motion.button>
  )
}

export default Button
