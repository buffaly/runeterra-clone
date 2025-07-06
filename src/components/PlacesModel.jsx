import { useLoader, useFrame } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { TextureLoader } from 'three'
import { useRef, useMemo, useState, useEffect } from 'react'

export default function PlacesModel({ zoomLevel, isHover }) {
  const meshRef = useRef()
  const [opacity, setOpacity] = useState(0)
  
  const obj = useLoader(OBJLoader, '/place_model/immortal-bastion.obj')
  const texture = useLoader(TextureLoader, '/place_model/immortal-bastion.jpg')

  useFrame(() => {
    if (!meshRef?.current?.position) return
    if (zoomLevel > 0.9) {
        meshRef.current.position.y = 0.082
    } else {
        meshRef.current.position.y = 0.06
    }
  })
  
  // Fade effect based on zoomLevel
  useEffect(() => {
    const targetOpacity = zoomLevel >= 0.6 ? 1 : 0
    
    // Smooth transition animation
    const animate = () => {
      setOpacity(prevOpacity => {
        const diff = targetOpacity - prevOpacity
        if (Math.abs(diff) < 0.01) {
          return targetOpacity
        }
        return prevOpacity + diff * 0.1
      })
    }
    const interval = setInterval(animate, 12)
    return () => clearInterval(interval)
  }, [zoomLevel])
  
  const model = useMemo(() => {
    const clonedModel = obj.clone()
    
    clonedModel.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.map = texture
        child.material.needsUpdate = true
        child.material.transparent = true
        child.material.opacity = opacity
        if (isHover) {
            child.material.color.setHex(0xffffff)
        } else {
            child.material.color.setHex(0x9a9a9a)
        }
        child.castShadow = false
        child.receiveShadow = false
      }
    })
    
    return clonedModel
  }, [obj, texture, opacity, isHover])

  if (zoomLevel < 0.7) {
    return null
  }
  return (
    <primitive 
      ref={meshRef}
      object={model} 
      position={[0.01, 0.06, -0.61]}
      scale={[0.052, 0.052, 0.052]}
    />
  )
}