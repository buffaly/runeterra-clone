import { useRef, useState, useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { Text } from '@react-three/drei'
import { getNumberFromPercentageWithRange } from '../utils/number'

const getOpacity = (zoomLevel) => {
  if (zoomLevel <= 0.85) return 1
  return getNumberFromPercentageWithRange({ percent: zoomLevel, startInPercent: 0.85, endInPercent: 0.88, startNumber: 1, endNumber: 0 })
  }

export default function RegionPin({ region, onClick, zoomLevel }) {
    const meshRef = useRef()
    const { gl } = useThree()
    const texture = useLoader(TextureLoader, region.iconUrl)
    const hoverTexture = useLoader(TextureLoader, region.hoverIconUrl)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
      const canvas = gl?.domElement
      if (!canvas) return
      if(isHovered) {
        canvas.style.cursor = 'pointer'
        return
      }
      canvas.style.cursor = 'grab'
    }, [isHovered])
    
    return (
      <group position={region.position} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={() => onClick(region)}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        >
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial
            map={isHovered ? hoverTexture : texture}
            transparent
            opacity={getOpacity(zoomLevel)}
            alphaTest={0.1}
          />
        </mesh>
        
        {/* Glow effect behind the image */}
        <mesh>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial
            transparent
            opacity={0}
          />
        </mesh>
        
        {/* Label below the icon */}
        <Text
          position={[0, -0.16, 0.01]}
          fontSize={0.08}
          color={'#FFFFFF'}
          anchorX="center"
          anchorY="middle"
          font="/fonts/BeaufortforLOL-Bold.otf"
          maxWidth={0.8}
          textAlign="center"
          outlineColor="rgba(0, 0, 0, 0.8)"
          outlineWidth={0.003}
          fillOpacity={getOpacity(zoomLevel)}
          outlineOpacity={getOpacity(zoomLevel)}
        >
          {region.name}
        </Text>
      </group>
    )
  }