import { useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping } from 'three'
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
      if (zoomLevel < 0.9 ) return 0
      return Math.min(0.01 + (zoomLevel - 0.91) * 10/3, 0.3)
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