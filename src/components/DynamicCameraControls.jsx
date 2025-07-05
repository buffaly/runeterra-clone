import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'

export default function DynamicCameraControls({ onZoomChange }) {
  const { camera, gl } = useThree()
  const targetRef = useRef(new Vector3(0, 0, 0))
  const currentZoom = useRef(10) // Start far away for top-down view
  const isDragging = useRef(false)
  const lastMousePosition = useRef({ x: 0, y: 0 })
  
  // Camera position states
  const targetPosition = useRef(new Vector3(0, 10, 0))
  
  useEffect(() => {
    const canvas = gl.domElement
    
    // Mouse wheel for zooming
    const handleWheel = (event) => {
      event.preventDefault()
      const delta = event.deltaY * 0.01
      currentZoom.current = MathUtils.clamp(currentZoom.current + delta, 3, 15)
      
      // Calculate zoom factor (0 = closest, 1 = farthest)
      const zoomFactor = (currentZoom.current - 3) / (15 - 3)
      
      // Update camera position based on zoom
      updateCameraPosition(zoomFactor)
      
      // Notify parent component about zoom change
      if (onZoomChange) {
        onZoomChange(1 - zoomFactor) // Invert so 0 = far, 1 = close
      }
    }
    
    // Mouse events for panning
    const handleMouseDown = (event) => {
      if (event.button === 0) { // Left mouse button
        isDragging.current = true
        lastMousePosition.current = { x: event.clientX, y: event.clientY }
        canvas.style.cursor = 'grabbing'
        event.preventDefault()
      }
    }
    
    const handleMouseMove = (event) => {
      if (isDragging.current) {
        const deltaX = event.clientX - lastMousePosition.current.x
        const deltaY = event.clientY - lastMousePosition.current.y
        
        // Calculate pan speed based on zoom level (closer = slower pan)
        const zoomFactor = (currentZoom.current - 3) / (15 - 3)
        const panSpeed = 0.008 * (1 + zoomFactor * 2) // Adjust pan speed based on zoom
        
        // Get camera's current angle for proper panning direction
        const angle = Math.atan2(
          targetPosition.current.z - targetRef.current.z,
          targetPosition.current.x - targetRef.current.x
        )
        
        // Calculate pan direction
        const cosAngle = Math.cos(angle)
        const sinAngle = Math.sin(angle)
        
        // Pan the target position in world coordinates
        const panX = (-deltaX * cosAngle + deltaY * sinAngle) * panSpeed
        const panZ = (-deltaX * sinAngle - deltaY * cosAngle) * panSpeed
        
        targetRef.current.x += panX
        targetRef.current.z += panZ
        
        // Update camera position to follow the target
        updateCameraPosition((currentZoom.current - 3) / (15 - 3))
        
        lastMousePosition.current = { x: event.clientX, y: event.clientY }
        event.preventDefault()
      }
    }
    
    const handleMouseUp = (event) => {
      isDragging.current = false
      canvas.style.cursor = 'grab'
      event.preventDefault()
    }
    
    const handleMouseLeave = (event) => {
      isDragging.current = false
      canvas.style.cursor = 'grab'
    }
    
    // Prevent context menu on right click
    const handleContextMenu = (event) => {
      event.preventDefault()
    }
    
    // Add event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('contextmenu', handleContextMenu)
    
    // Set initial cursor
    canvas.style.cursor = 'grab'
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [gl, onZoomChange])
  
  const updateCameraPosition = (zoomFactor) => {
    // Calculate camera height and angle based on zoom
    const minHeight = 4 // Closest height
    const maxHeight = 10 // Farthest height (top-down)
    const height = MathUtils.lerp(minHeight, maxHeight, zoomFactor)
    
    const maxAngle = Math.PI * 0.25
    const angle = MathUtils.lerp(maxAngle, 0, zoomFactor)
    
    // Calculate camera position relative to target
    const distance = height / Math.cos(angle)
    const x = targetRef.current.x
    const y = height
    const z = targetRef.current.z + distance * Math.sin(angle)
    
    targetPosition.current.set(x, y, z)
  }
  
  useFrame(() => {
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.1)
    camera.lookAt(targetRef.current)
  })
  
  // Initialize camera position
  useEffect(() => {
    updateCameraPosition(1) // Start with top-down view
  }, [])
  
  return null
}

