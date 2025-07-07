import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0)
  
    useEffect(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(onComplete, 500)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
  
      return () => clearInterval(interval)
    }, [onComplete])
  
    return (
      <motion.div 
        className="fixed inset-0 runeterra-background flex items-center justify-center z-50"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <h1 className="runeterra-subtitle text-lg mb-4 fade-in">EXPLORE & DISCOVER</h1>
            <h2 className="runeterra-title text-6xl font-bold mb-8 fade-in">RUNETERRA</h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="loading-bar mx-auto"
          >
            <div 
              className="loading-bar-inner"
              style={{ transform: `scaleX(${Math.min(progress / 100, 1)})` }}
            />
          </motion.div>
  
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-[#c8aa6e] mt-4 text-sm"
          >
            Cloning the world of Runeterra...
          </motion.p>
        </div>
      </motion.div>
    )
  }