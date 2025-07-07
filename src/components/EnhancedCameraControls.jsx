import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'

export default function EnhancedCameraControls({ onZoomChange, zoomToTarget = null, setZoomToTarget }) {
  const { camera, gl } = useThree()
  const targetRef = useRef(new Vector3(0, 0, 0))
  const [currentZoom, setCurrentZoom] = useState(9)
  const targetPosition = useRef(new Vector3(0, 8, 0))
  const isDragging = useRef(false)
  const [isZoomToTarget, setIsZoomToTarget] = useState(false)
  const lastMousePosition = useRef({ x: 0, y: 0 })
  
  // Touch-specific refs
  const isTouching = useRef(false)
  const lastTouchPosition = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef(0)
  const isMultiTouch = useRef(false)

  
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

  // Helper function to get touch distance for pinch gesture
  const getTouchDistance = (touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  // Helper function to get center point between two touches
  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  useEffect(() => {
    const canvas = gl.domElement
    
    const handleWheel = (event) => {
      setIsZoomToTarget(false)
      event.preventDefault()
      // Enhanced wheel zoom sensitivity for better fps and zoom amount
      const zoomSensitivity = 0.2
      const delta = event.deltaY * zoomSensitivity
      const newCurrentZoom = MathUtils.clamp(currentZoom + delta, 4, 16)
      setCurrentZoom(newCurrentZoom)
      const zoomFactor = (newCurrentZoom - 4) / (16 - 4)
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
        const zoomFactor = (currentZoom - 4) / (16 - 4)
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

    // Touch event handlers
    const handleTouchStart = (event) => {
      event.preventDefault()
      
      if (event.touches.length === 1) {
        // Single touch - start panning
        isTouching.current = true
        isMultiTouch.current = false
        const touch = event.touches[0]
        lastTouchPosition.current = { x: touch.clientX, y: touch.clientY }
      } else if (event.touches.length === 2) {
        // Multi-touch - start pinch to zoom
        setIsZoomToTarget(false)
        isMultiTouch.current = true
        isTouching.current = false
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        lastTouchDistance.current = getTouchDistance(touch1, touch2)
      }
    }

    const handleTouchMove = (event) => {
      event.preventDefault()
      
      if (event.touches.length === 1 && isTouching.current && !isMultiTouch.current) {
        // Single touch panning
        const touch = event.touches[0]
        const deltaX = touch.clientX - lastTouchPosition.current.x
        const deltaY = touch.clientY - lastTouchPosition.current.y
        
        // pan speed calculation (same as mouse)
        const zoomFactor = (currentZoom - 4) / (16 - 4)
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
        
        lastTouchPosition.current = { x: touch.clientX, y: touch.clientY }
      } else if (event.touches.length === 2 && isMultiTouch.current) {
        // Pinch to zoom
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const currentDistance = getTouchDistance(touch1, touch2)
        
        if (lastTouchDistance.current > 0) {
          const distanceChange = currentDistance - lastTouchDistance.current
          // Smoother touch zoom sensitivity
          const zoomSensitivity = 0.08
          const delta = distanceChange * zoomSensitivity
          
          const newCurrentZoom = MathUtils.clamp(currentZoom + delta, 4, 16)
          setCurrentZoom(newCurrentZoom)
          const zoomFactor = (newCurrentZoom - 4) / (16 - 4)
          updateCameraPosition(zoomFactor)
          
          if (onZoomChange) {
            onZoomChange(zoomFactor)
          }
        }
        
        lastTouchDistance.current = currentDistance
      }
    }

    const handleTouchEnd = (event) => {
      event.preventDefault()
      
      if (event.touches.length === 0) {
        // All touches ended
        isTouching.current = false
        isMultiTouch.current = false
        lastTouchDistance.current = 0
      } else if (event.touches.length === 1 && isMultiTouch.current) {
        // Switched from multi-touch to single touch
        isMultiTouch.current = false
        isTouching.current = true
        const touch = event.touches[0]
        lastTouchPosition.current = { x: touch.clientX, y: touch.clientY }
        lastTouchDistance.current = 0
      }
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
    
    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false })
    
    // Set initial cursor
    canvas.style.cursor = 'grab'
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      
      // Remove touch event listeners
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [gl, onZoomChange, currentZoom])
  
  // Get current camera angle for calculations
  const getCurrentCameraAngle = () => {
    const zoomFactor = (currentZoom - 4) / (16 - 4)
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
  useEffect(() => {
    if (!!zoomToTarget) {
      setIsZoomToTarget(true)
      const newPositionX = window.innerWidth > 768 ? zoomToTarget.x + 0.25 : zoomToTarget.x
      const newPositionZ = window.innerWidth > 768 ? zoomToTarget.z * -0.2 : zoomToTarget.z * -0.05
      const targetPos = new Vector3(newPositionX, 0, newPositionZ)
      targetRef.current.copy(targetPos)
      updateCameraPosition(1)

      if (onZoomChange) {
        onZoomChange(1)
        setCurrentZoom(16)
      }
      setZoomToTarget(null)
    }
  }, [zoomToTarget, onZoomChange])
  
  useFrame(() => {
    // tilt down camera when max zoom - enhanced for better fps
    const lerpFactorPosition = isZoomToTarget ? 0.015 : 0.1
    const lerpFactorRotation = isZoomToTarget ? 0.015 : 0.15

    const zoomMin = 0
    const zoomMax = 16
    const outputMin = -Math.PI / 2
    const outputMax = -Math.PI / 3;
    const newRotationX = outputMin + (currentZoom - zoomMin) * (outputMax - outputMin) / (zoomMax - zoomMin);
    if (currentZoom >= zoomMin) {
      camera.rotation.x = MathUtils.lerp(camera.rotation.x, newRotationX, lerpFactorRotation)
    } else {
      camera.rotation.x = MathUtils.lerp(camera.rotation.x, -Math.PI / 2, lerpFactorRotation)
    }

    const previousPosition = camera.position.clone()
    camera.position.lerp(targetPosition.current, lerpFactorPosition)
    
    if (isZoomToTarget) {
      const distanceToTarget = camera.position.distanceTo(targetPosition.current)
      const positionDelta = camera.position.distanceTo(previousPosition)
      
      if (distanceToTarget < 0.01 || positionDelta < 0.001) {
        setIsZoomToTarget(false)
      }
    }
  })
  
  useEffect(() => {
    updateCameraPosition(0.4)
  }, [])
  
  return null
}

