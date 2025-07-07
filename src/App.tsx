import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import Map3D from './components/Map3D.jsx'
import SidePanel from './components/sidePanel/SidePanel.tsx'
import LoadingScreen from './components/LoadingScreen.tsx'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [region, setRegion] = useState<string | null>(null)

  return (
    <div className="min-h-screen canvas-container">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      {!isLoading && <Map3D onRegionClick={setRegion} />}
      <AnimatePresence>
        {region && <SidePanel setRegion={setRegion} key="side-panel" />}
      </AnimatePresence>
    </div>
  )
}

export default App

