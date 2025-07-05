import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'

export default function EnhancedCameraControls({ onZoomChange, zoomToTarget = null }) {
  const { camera, gl } = useThree()
  const targetRef = useRef(new Vector3(0, 0, 0))
  const currentZoom = useRef(8)
  const isDragging = useRef(false)
  const lastMousePosition = useRef({ x: 0, y: 0 })
  const targetPosition = useRef(new Vector3(0, 8, 0))
  
  const calculateFrustumBounds = (cameraPos, cameraAngle, fov, aspect) => {
    const distance = cameraPos.y
    const fovRad = (fov * Math.PI) / 180
    const angleRad = Math.abs(cameraAngle * Math.PI / 180)
    
    const heightAtGround = Math.tan(fovRad / 2) * (distance / Math.cos(angleRad))
    const widthAtGround = heightAtGround * aspect
    
    const angleAdjustment = Math.cos(angleRad)
    const adjustedHeight = heightAtGround / angleAdjustment
    
    return {
      width: widthAtGround * 2,
      height: adjustedHeight * 2
    }
  }
  
  const clampCameraTarget = (target, cameraHeight, cameraAngle) => {
    const bounds = calculateFrustumBounds(
      { y: cameraHeight }, 
      cameraAngle, 
      camera.fov, 
      camera.aspect
    )
    
    const mapWidth = 8
    const mapHeight = 8
    
    const maxX = Math.max(0, (mapWidth / 2) - (bounds.width / 2))
    const maxZ = Math.max(0, (mapHeight / 2) - (bounds.height / 2))
    
    return new Vector3(
      MathUtils.clamp(target.x, -maxX, maxX),
      target.y,
      MathUtils.clamp(target.z, -maxZ, maxZ)
    )
  }

  useEffect(() => {
    const canvas = gl.domElement
    
    const handleWheel = (event) => {
      event.preventDefault()
      const delta = -event.deltaY * 0.008
      currentZoom.current = MathUtils.clamp(currentZoom.current + delta, 4, 16)

      const zoomFactor = (currentZoom.current - 4) / (16 - 4)
      
      updateCameraPosition(zoomFactor)
      
      if (onZoomChange) {
        onZoomChange(zoomFactor)
      }
    }
    
    const handleMouseDown = (event) => {
      if (event.button === 0) {
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
        
        // pan speed calculation
        const zoomFactor = (currentZoom.current - 4) / (16 - 4)
        const panSpeed = 0.008 * (1 - zoomFactor * 0.75)
        const panX = -deltaX * panSpeed
        const panZ = deltaY * panSpeed
        
        const newTarget = targetRef.current.clone()
        newTarget.x += panX
        newTarget.z += panZ
        const cameraHeight = targetPosition.current.y
        const cameraAngle = getCurrentCameraAngle()
        
        const clampedTarget = clampCameraTarget(newTarget, cameraHeight, cameraAngle)
        targetRef.current.copy(clampedTarget)
        
        // Update camera position to follow the target
        updateCameraPosition(zoomFactor)
        
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
  
  // Get current camera angle for calculations
  const getCurrentCameraAngle = () => {
    const zoomFactor = (currentZoom.current - 4) / (16 - 4)
    const maxAngle = 0
    return MathUtils.lerp(0, maxAngle, zoomFactor)
  }
  
  // Improved camera position calculation
  const updateCameraPosition = (zoomFactor) => {
    // Better height range for full-screen viewing
    const minHeight = 4
    const maxHeight = 0.8
    const height = MathUtils.lerp(minHeight, maxHeight, zoomFactor)
    
    // Improved camera angle calculation
    const maxAngleRad = (0 * Math.PI) / 180
    const angle = MathUtils.lerp(maxAngleRad, 0, zoomFactor)
    
    // Calculate camera position with better positioning
    const distance = height / Math.cos(angle)
    const x = targetRef.current.x
    const y = height
    const z = -targetRef.current.z + distance * Math.sin(angle)
    
    targetPosition.current.set(x, y, z)
  }
  
  // Handle zoom to region
  // useEffect(() => {
  //   if (zoomToTarget) {
  //     // Animate to target position
  //     const targetPos = new Vector3(zoomToTarget.x, 0, zoomToTarget.z)
      
  //     // Set zoom level for region view
  //     currentZoom.current = 1 // Medium zoom for region view
  //     const zoomFactor = (currentZoom.current - 4) / (16 - 4)
      
  //     // Update target and camera position
  //     targetRef.current.copy(targetPos)
  //     updateCameraPosition(zoomFactor)
      
  //     if (onZoomChange) {
  //       onZoomChange(1 - zoomFactor)
  //     }
  //   }
  // }, [zoomToTarget, onZoomChange])
  
  useFrame(() => {
    // Smooth camera movement with better interpolation
    camera.position.lerp(targetPosition.current, 0.08)
  })
  
  useEffect(() => {
    updateCameraPosition(0.4)
  }, [])
  
  return null
}

