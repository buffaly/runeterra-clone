import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState, useEffect, useRef } from 'react'

export default function RegionArea({ region, isHover, zoomLevel }) {
  const areaTexture = useTexture(region.areaUrl)
  const meshRef = useRef()
  const [targetOpacity, setTargetOpacity] = useState(0)
  const [currentOpacity, setCurrentOpacity] = useState(0)
  
  useEffect(() => {
    // fadeOut เมื่อ zoomLevel > 0.67 หรือ isHover = false
    if (zoomLevel > 0.67) {
      setTargetOpacity(0)
    } else if (isHover) {
      setTargetOpacity(0.7)
    } else {
      setTargetOpacity(0)
    }
  }, [isHover, zoomLevel])
  
  useFrame((state, delta) => {
    if (Math.abs(currentOpacity - targetOpacity) > 0.01) {
      const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * delta * 8
      setCurrentOpacity(newOpacity)
      
      if (meshRef.current) {
        meshRef.current.material.opacity = newOpacity
      }
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial 
        map={areaTexture} 
        transparent={true}
        opacity={currentOpacity}
      />
    </mesh>  
  )
}