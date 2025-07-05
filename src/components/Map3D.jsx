import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import RegionPin from './RegionPin'
import EnhancedCameraControls from './EnhancedCameraControls'
import CloudLayer from './CloudLayer'
import OceanWaves from './OceanWaves'
import TerrainMesh from './TerrainMesh'

const REGIONS = [
  { id: 'noxus', name: 'Noxus', position: [0, 0.05, -0.8], iconUrl: '/icons/noxus.png', hoverIconUrl: '/icons/noxus-hover.png'},
]

function Map3D({ onRegionClick, selectedRegion, onRegionHover, hoveredRegion }) {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [zoomToTarget, setZoomToTarget] = useState(null)

  const handleRegionClick = (region) => {
    // Set zoom target for camera animation
    setZoomToTarget({ x: region.position[0], z: region.position[2] })
    onRegionClick(region)
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
        />
        
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#4169E1" />
        
        <TerrainMesh zoomLevel={zoomLevel} />
        <OceanWaves zoomLevel={zoomLevel} />
        <CloudLayer zoomLevel={zoomLevel} />
        
        {REGIONS.map((region) => (
          <RegionPin
            key={region.id}
            zoomLevel={zoomLevel}
            region={region}
            onClick={handleRegionClick}
            isHovered={hoveredRegion?.id === region.id}
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

