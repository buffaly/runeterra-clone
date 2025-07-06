import { useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping } from 'three'
import { getNumberFromPercentageWithRange } from '../utils/number'
import textureImage from '../assets/terrain_z1.jpg'
import depthMapImage from '../assets/depth_z1.jpg'

// high quality terrain images
import terrain_z2_01 from '../assets/hq_map/terrain_z2_01.jpg'
import terrain_z2_02 from '../assets/hq_map/terrain_z2_02.jpg'
import terrain_z2_03 from '../assets/hq_map/terrain_z2_03.jpg'
import terrain_z2_04 from '../assets/hq_map/terrain_z2_04.jpg'
import terrain_z2_05 from '../assets/hq_map/terrain_z2_05.jpg'
import terrain_z2_06 from '../assets/hq_map/terrain_z2_06.jpg'
import terrain_z2_07 from '../assets/hq_map/terrain_z2_07.jpg'
import terrain_z2_08 from '../assets/hq_map/terrain_z2_08.jpg'
import terrain_z2_09 from '../assets/hq_map/terrain_z2_09.jpg'
import terrain_z2_10 from '../assets/hq_map/terrain_z2_10.jpg'
import terrain_z2_11 from '../assets/hq_map/terrain_z2_11.jpg'
import terrain_z2_12 from '../assets/hq_map/terrain_z2_12.jpg'
import terrain_z2_13 from '../assets/hq_map/terrain_z2_13.jpg'
import terrain_z2_14 from '../assets/hq_map/terrain_z2_14.jpg'
import terrain_z2_15 from '../assets/hq_map/terrain_z2_15.jpg'
import terrain_z2_16 from '../assets/hq_map/terrain_z2_16.jpg'
import terrain_z2_17 from '../assets/hq_map/terrain_z2_17.jpg'
import terrain_z2_18 from '../assets/hq_map/terrain_z2_18.jpg'
import terrain_z2_19 from '../assets/hq_map/terrain_z2_19.jpg'
import terrain_z2_20 from '../assets/hq_map/terrain_z2_20.jpg'
import terrain_z2_21 from '../assets/hq_map/terrain_z2_21.jpg'
import terrain_z2_22 from '../assets/hq_map/terrain_z2_22.jpg'
import terrain_z2_23 from '../assets/hq_map/terrain_z2_23.jpg'
import terrain_z2_24 from '../assets/hq_map/terrain_z2_24.jpg'
import terrain_z2_25 from '../assets/hq_map/terrain_z2_25.jpg'
import terrain_z2_26 from '../assets/hq_map/terrain_z2_26.jpg'
import terrain_z2_27 from '../assets/hq_map/terrain_z2_27.jpg'
import terrain_z2_28 from '../assets/hq_map/terrain_z2_28.jpg'
import terrain_z2_29 from '../assets/hq_map/terrain_z2_29.jpg'
import terrain_z2_30 from '../assets/hq_map/terrain_z2_30.jpg'
import terrain_z2_31 from '../assets/hq_map/terrain_z2_31.jpg'
import terrain_z2_32 from '../assets/hq_map/terrain_z2_32.jpg'
import terrain_z2_33 from '../assets/hq_map/terrain_z2_33.jpg'
import terrain_z2_34 from '../assets/hq_map/terrain_z2_34.jpg'
import terrain_z2_35 from '../assets/hq_map/terrain_z2_35.jpg'
import terrain_z2_36 from '../assets/hq_map/terrain_z2_36.jpg'
import terrain_z2_37 from '../assets/hq_map/terrain_z2_37.jpg'
import terrain_z2_38 from '../assets/hq_map/terrain_z2_38.jpg'
import terrain_z2_39 from '../assets/hq_map/terrain_z2_39.jpg'
import terrain_z2_40 from '../assets/hq_map/terrain_z2_40.jpg'
import terrain_z2_41 from '../assets/hq_map/terrain_z2_41.jpg'
import terrain_z2_42 from '../assets/hq_map/terrain_z2_42.jpg'
import terrain_z2_43 from '../assets/hq_map/terrain_z2_43.jpg'
import terrain_z2_44 from '../assets/hq_map/terrain_z2_44.jpg'
import terrain_z2_45 from '../assets/hq_map/terrain_z2_45.jpg'
import terrain_z2_46 from '../assets/hq_map/terrain_z2_46.jpg'
import terrain_z2_47 from '../assets/hq_map/terrain_z2_47.jpg'
import terrain_z2_48 from '../assets/hq_map/terrain_z2_48.jpg'
import terrain_z2_49 from '../assets/hq_map/terrain_z2_49.jpg'
import terrain_z2_50 from '../assets/hq_map/terrain_z2_50.jpg'
import terrain_z2_51 from '../assets/hq_map/terrain_z2_51.jpg'
import terrain_z2_52 from '../assets/hq_map/terrain_z2_52.jpg'
import terrain_z2_53 from '../assets/hq_map/terrain_z2_53.jpg'
import terrain_z2_54 from '../assets/hq_map/terrain_z2_54.jpg'
import terrain_z2_55 from '../assets/hq_map/terrain_z2_55.jpg'
import terrain_z2_56 from '../assets/hq_map/terrain_z2_56.jpg'
import terrain_z2_57 from '../assets/hq_map/terrain_z2_57.jpg'
import terrain_z2_58 from '../assets/hq_map/terrain_z2_58.jpg'
import terrain_z2_59 from '../assets/hq_map/terrain_z2_59.jpg'
import terrain_z2_60 from '../assets/hq_map/terrain_z2_60.jpg'
import terrain_z2_61 from '../assets/hq_map/terrain_z2_61.jpg'
import terrain_z2_62 from '../assets/hq_map/terrain_z2_62.jpg'
import terrain_z2_63 from '../assets/hq_map/terrain_z2_63.jpg'
import terrain_z2_64 from '../assets/hq_map/terrain_z2_64.jpg'

const hqTerrainImages = [
  terrain_z2_01, terrain_z2_02, terrain_z2_03, terrain_z2_04, terrain_z2_05, terrain_z2_06, terrain_z2_07, terrain_z2_08,
  terrain_z2_09, terrain_z2_10, terrain_z2_11, terrain_z2_12, terrain_z2_13, terrain_z2_14, terrain_z2_15, terrain_z2_16,
  terrain_z2_17, terrain_z2_18, terrain_z2_19, terrain_z2_20, terrain_z2_21, terrain_z2_22, terrain_z2_23, terrain_z2_24,
  terrain_z2_25, terrain_z2_26, terrain_z2_27, terrain_z2_28, terrain_z2_29, terrain_z2_30, terrain_z2_31, terrain_z2_32,
  terrain_z2_33, terrain_z2_34, terrain_z2_35, terrain_z2_36, terrain_z2_37, terrain_z2_38, terrain_z2_39, terrain_z2_40,
  terrain_z2_41, terrain_z2_42, terrain_z2_43, terrain_z2_44, terrain_z2_45, terrain_z2_46, terrain_z2_47, terrain_z2_48,
  terrain_z2_49, terrain_z2_50, terrain_z2_51, terrain_z2_52, terrain_z2_53, terrain_z2_54, terrain_z2_55, terrain_z2_56,
  terrain_z2_57, terrain_z2_58, terrain_z2_59, terrain_z2_60, terrain_z2_61, terrain_z2_62, terrain_z2_63, terrain_z2_64
]

const MIN_ZOOM_LEVEL_FOR_HQ_TERRAIN = 0.5

export default function TerrainMesh({ zoomLevel }) {
    const meshRef = useRef()
    const [textureMap, depthMap] = useLoader(TextureLoader, [textureImage, depthMapImage])
    
    const hqTextures = useLoader(TextureLoader, hqTerrainImages)
  
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
      return getNumberFromPercentageWithRange({ percent: zoomLevel, startInPercent: 0.85, endInPercent: 1, startNumber: 0, endNumber: 0.45 })
    }, [zoomLevel])
    
    const hqOpacity = useMemo(() => {
      if (zoomLevel <= MIN_ZOOM_LEVEL_FOR_HQ_TERRAIN) return 0
      return getNumberFromPercentageWithRange({ 
        percent: zoomLevel, 
        startInPercent: MIN_ZOOM_LEVEL_FOR_HQ_TERRAIN,
        endInPercent: 0.6,
        startNumber: 0,
        endNumber: 1
      })
    }, [zoomLevel])
    
    // high quality terrain tiles (8x8 = 64 tiles)
    const renderHQTiles = () => {
      const tiles = []
      const tileSize = 10 / 8
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const tileIndex = row * 8 + col
          const x = (col - 3.5) * tileSize
          const z = (row - 3.5) * tileSize
          const tileDepthMap = depthMap?.clone()
          if (tileDepthMap) {
            tileDepthMap.wrapS = RepeatWrapping
            tileDepthMap.wrapT = RepeatWrapping
            tileDepthMap.repeat.set(1/8, 1/8)
            tileDepthMap.offset.set(col / 8, (7 - row) / 8)
          }
          
          tiles.push(
            <mesh 
              key={`hq-tile-${tileIndex}`}
              position={[x, 0.01, z]} 
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[tileSize, tileSize, 32, 32]} />
              <meshStandardMaterial
                map={hqTextures[tileIndex]}
                displacementMap={tileDepthMap}
                displacementScale={displacementScale}
                transparent
                opacity={hqOpacity}
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
          )
        }
      }
      
      return tiles
    }
    
    return (
      <group>
        {/* Base terrain mesh */}
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[10, 10, 256, 256]} />
          <meshStandardMaterial
            map={textureMap}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {renderHQTiles()}
      </group>
    )
  }