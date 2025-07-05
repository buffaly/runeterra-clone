import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping, AdditiveBlending } from 'three'
import { getNumberFromPercentageWithRange } from '../utils/number'
import fogImage from '../assets/fog.jpg'
import fogMaskImage from '../assets/fog-mask.jpg'
import cloudsImage from '../assets/clouds.jpg'

function CloudLayer({ zoomLevel }) {
  const meshRef = useRef(null)
  const mesh2Ref = useRef(null)
  const [fogTexture, fogMaskTexture, cloudsTexture] = useLoader(TextureLoader, [
    fogImage,
    fogMaskImage,
    cloudsImage
  ])

  // Configure textures
  useMemo(() => {
    // Fog texture setup
    if (fogTexture) {
      fogTexture.wrapS = RepeatWrapping
      fogTexture.wrapT = RepeatWrapping
      fogTexture.repeat.set(2, 2)
    }
    
    // Fog mask texture setup
    if (fogMaskTexture) {
      fogMaskTexture.wrapS = RepeatWrapping
      fogMaskTexture.wrapT = RepeatWrapping
      fogMaskTexture.repeat.set(1, 1)
    }
    
    // Clouds texture setup
    if (cloudsTexture) {
      cloudsTexture.wrapS = RepeatWrapping
      cloudsTexture.wrapT = RepeatWrapping
      cloudsTexture.repeat.set(3, 3)
    }
  }, [fogTexture, fogMaskTexture, cloudsTexture])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (meshRef.current && fogTexture) {
      // Animate fog movement - slow drift
      fogTexture.offset.x = (time * 0.01) % 1
      fogTexture.offset.y = (time * 0.005) % 1
      
      // Adjust opacity based on zoom level
      meshRef.current.material.opacity = 0.2
      if (zoomLevel > 0.55) {
        meshRef.current.material.opacity = getNumberFromPercentageWithRange({ percent: zoomLevel, startInPercent: 0.65, endInPercent: 0.75, startNumber: 0.2, endNumber: 0.3 })
      }
    }
    
    if (mesh2Ref.current && cloudsTexture) {
      // Animate clouds movement - faster drift in different direction
      cloudsTexture.offset.x = (time * 0.015) % 1
      cloudsTexture.offset.y = -(time * 0.008) % 1
      
      // Adjust opacity based on zoom level
      mesh2Ref.current.material.opacity = 0.3
      if (zoomLevel > 0.55) {
        mesh2Ref.current.material.opacity = getNumberFromPercentageWithRange({ percent: zoomLevel, startInPercent: 0.55, endInPercent: 0.7, startNumber: 0.3, endNumber: 0 })
      }
      
    }
  })

  return (
    <group>
      {/* Fog Layer */}
      <mesh 
        ref={meshRef} 
        position={[0, 0.5, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[15, 15]} />
        <meshBasicMaterial
          map={fogTexture}
          alphaMap={fogMaskTexture}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Cloud Layer */}
      <mesh 
        ref={mesh2Ref} 
        position={[0, 0.8, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial
          map={cloudsTexture}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default CloudLayer

