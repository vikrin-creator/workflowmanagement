import React from 'react'
import { motion } from 'framer-motion'
import './Loader.css'

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const loaderVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const dotVariants = {
    animate: (i) => ({
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  }

  const sizeClasses = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large'
  }

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader ${sizeClasses[size]}`}>
          <motion.div 
            className="loader-spinner"
            variants={loaderVariants}
            animate="animate"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="loader-dot"
                custom={i}
                variants={dotVariants}
                animate="animate"
              />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={`loader ${sizeClasses[size]}`}>
      <motion.div 
        className="loader-spinner"
        variants={loaderVariants}
        animate="animate"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="loader-dot"
            custom={i}
            variants={dotVariants}
            animate="animate"
          />
        ))}
      </motion.div>
    </div>
  )
}

export default Loader
