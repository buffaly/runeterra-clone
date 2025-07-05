import { useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping } from 'three'
import { getNumberFromPercentageWithRange } from '../utils/number'
import textureImage from '../assets/terrain_z1.jpg'
import depthMapImage from '../assets/depth_z1.jpg'

export default function TerrainMesh({ zoomLevel }) {
    const meshRef = useRef()
    const [textureMap, depthMap] = useLoader(TextureLoader, [textureImage, depthMapImage])
  
    useMemo(() => {
      if (textureMap) {
        textureMap.wrapS = RepeatWrapping
        textureMap.wrapT = RepeatWrapping
        textureMap.repeat.set(1, 1)
      }
      if (depthMap) {
        depthMap.wrapS = RepeatWrapping
        depthMap.wrapT = RepeatWrapping
        depthMap.repeat.set(1, 1)
      }
    }, [textureMap, depthMap])
  
    const displacementScale = useMemo(() => {
      if (zoomLevel < 0.85 ) return 0
      return getNumberFromPercentageWithRange({ percent: zoomLevel, startInPercent: 0.85, endInPercent: 1, startNumber: 0, endNumber: 0.35 })
    }, [zoomLevel])
    
    return (
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10, 256, 256]} />
        <meshStandardMaterial
          map={textureMap}
          displacementMap={depthMap}
          displacementScale={displacementScale}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    )
  }