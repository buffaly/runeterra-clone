import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import RegionPin from './RegionPin'
import EnhancedCameraControls from './EnhancedCameraControls'
import CloudLayer from './CloudLayer'
import OceanWaves from './OceanWaves'
import TerrainMesh from './TerrainMesh'
import PlacesModel from './PlacesModel'

const REGIONS = [
  { id: 'noxus', name: 'NOXUS', position: [0, 0.1, -0.8], iconUrl: '/icons/noxus.png', hoverIconUrl: '/icons/noxus-hover.png'},
]

function Map3D({ onRegionClick }) {
  const [hoverRegion, setHoverRegion] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(0)
  const [zoomToTarget, setZoomToTarget] = useState(null)

  const handleRegionClick = (region) => {
    setZoomToTarget({ x: region.position[0], z: region.position[2] })
    onRegionClick?.(region)
  }

  const handleZoomChange = (newZoomLevel) => {
    setZoomLevel(newZoomLevel)
  }

  return (
    <div className="map-3d-container">
      <Canvas
        camera={{ position: [0, 10, 0], fov: 60 }}
        style={{ background: 'transparent', width: '100vw', height: '100vh' }}
        gl={{ antialias: true, alpha: true }}
      >
        <EnhancedCameraControls 
          onZoomChange={handleZoomChange}
          zoomToTarget={zoomToTarget}
          setZoomToTarget={setZoomToTarget}
        />
        
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#4169E1" />

        <TerrainMesh zoomLevel={zoomLevel} />
        <OceanWaves zoomLevel={zoomLevel} />
        <CloudLayer zoomLevel={zoomLevel} />

        {/* only Noxus place */}
        <PlacesModel zoomLevel={zoomLevel} isHover={hoverRegion === 'noxus'} />
        
        {REGIONS.map((region) => (
          <RegionPin
            key={region.id}
            zoomLevel={zoomLevel}
            region={region}
            onClick={handleRegionClick}
            onHover={setHoverRegion}
          />
        ))}
      </Canvas>
      
      {/* Debug tools */}
      <div className="absolute top-4 left-4 text-white text-sm font-mono bg-black/30 px-3 py-2 rounded">
        <div>Zoom: {Math.round(zoomLevel * 100)}%</div>
        <div>Terrain Detail: {Math.round(zoomLevel * 100)}%</div>
      </div>
      
    </div>
  )
}

export default Map3D

