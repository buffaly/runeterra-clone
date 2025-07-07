import { useRef, useState, useEffect } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { Text } from '@react-three/drei'
import { getNumberFromPercentageWithRange } from '../utils/number'
import { MathUtils } from 'three'

const MIN_ZOOM_LEVEL_TO_HIDE_ICON = 0.2

const getOpacity = (zoomLevel) => {
  if (zoomLevel <= MIN_ZOOM_LEVEL_TO_HIDE_ICON) return 1
  return getNumberFromPercentageWithRange({ percent: zoomLevel, startInPercent: MIN_ZOOM_LEVEL_TO_HIDE_ICON, endInPercent: 0.6, startNumber: 1, endNumber: 0 })
}

export default function RegionPin({ region, onClick, zoomLevel, onHover }) {
    const meshRef = useRef()
    const groupRef = useRef()
    const { gl } = useThree()
    const texture = useLoader(TextureLoader, region.iconUrl)
    const hoverTexture = useLoader(TextureLoader, region.hoverIconUrl)
    const [isHovered, setIsHovered] = useState(false)
    const [pointerDownRegion, setPointerDownRegion] = useState(null)
    const [pointerUpRegion, setPointerUpRegion] = useState(null)

    useEffect(() => {
        if (!!pointerDownRegion && !!pointerUpRegion && pointerDownRegion === pointerUpRegion) {
            onClick(region)
            setPointerDownRegion(null)
            setPointerUpRegion(null)
        }
    }, [pointerDownRegion, pointerUpRegion])

    useEffect(() => {
      const canvas = gl?.domElement
      if (!canvas) return
      if(isHovered) {
        canvas.style.cursor = 'pointer'
        onHover(region.id)
        return
      }
      onHover(null)
      canvas.style.cursor = 'grab'
    }, [isHovered])

    useFrame(() => {
      if (zoomLevel > 0.4) {
        groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, -0.1, 0.05)
      } else {
        groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0.1, 0.03)
      }
    })
    
    return (
      <group ref={groupRef} position={region.position} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          ref={meshRef}
          renderOrder={1}
          onPointerDown={() => setPointerDownRegion(region.name)}
          onPointerUp={() => setPointerUpRegion(region.name)}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        >
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial
            map={isHovered ? hoverTexture : texture}
            transparent
            opacity={getOpacity(zoomLevel)}
            toneMapped={false}
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
          outlineWidth={0.003}
          fillOpacity={getOpacity(zoomLevel)}
          outlineOpacity={getOpacity(zoomLevel)}
        >
          {region.name}
        </Text>
      </group>
    )
  }