import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import { 
  OrthographicCamera, 
  WebGLRenderTarget, 
  RGBFormat, 
  ShaderMaterial, 
  Vector2, 
  AdditiveBlending,
  DataTexture,
  Color
} from 'three'

// Create ripple normal texture
function createRippleNormalTexture(size = 64) {
  const data = new Uint8Array(size * size * 3)
  const center = size / 2
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = (i * size + j) * 3
      
      const dx = i - center
      const dy = j - center
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = center
      
      if (distance < maxDistance) {
        // Create ripple pattern
        const normalizedDistance = distance / maxDistance
        const ripple = Math.sin(normalizedDistance * Math.PI * 4) * (1 - normalizedDistance)
        
        // Calculate normal from height
        const heightScale = 0.1
        const height = ripple * heightScale
        
        const gradientX = i > 0 && i < size - 1 ? 
          (Math.sin((distance + 1) / maxDistance * Math.PI * 4) * (1 - (distance + 1) / maxDistance) - 
           Math.sin((distance - 1) / maxDistance * Math.PI * 4) * (1 - (distance - 1) / maxDistance)) * heightScale : 0
        
        const gradientY = j > 0 && j < size - 1 ? 
          (Math.sin((distance + 1) / maxDistance * Math.PI * 4) * (1 - (distance + 1) / maxDistance) - 
           Math.sin((distance - 1) / maxDistance * Math.PI * 4) * (1 - (distance - 1) / maxDistance)) * heightScale : 0
        
        const normal = {
          x: -gradientX,
          y: -gradientY,
          z: 1
        }
        
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
        normal.x /= length
        normal.y /= length
        normal.z /= length
        
        data[index] = Math.floor((normal.x + 1) * 127.5)
        data[index + 1] = Math.floor((normal.y + 1) * 127.5)
        data[index + 2] = Math.floor((normal.z + 1) * 127.5)
      } else {
        // Default normal (pointing up)
        data[index] = 127
        data[index + 1] = 127
        data[index + 2] = 255
      }
    }
  }
  
  const texture = new DataTexture(data, size, size, RGBFormat)
  texture.needsUpdate = true
  return texture
}

// Water Ripples Shader (for particles)
const rippleVertexShader = `
  attribute float size;
  attribute float opacity;
  
  varying vec2 vUv;
  varying float vOpacity;
  
  void main() {
    vUv = uv;
    vOpacity = opacity;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Apply size
    gl_PointSize = size * (300.0 / -mvPosition.z);
  }
`

const rippleFragmentShader = `
  uniform sampler2D rippleTexture;
  uniform float maskRadiusOuter;
  uniform float maskRadiusInner;
  uniform float maskSoftnessOuter;
  uniform float maskSoftnessInner;
  
  varying vec2 vUv;
  varying float vOpacity;
  
  void main() {
    // Calculate distance from center for circular mask
    float circleSDF = distance(vUv, vec2(0.5, 0.5));
    
    // Create ring mask
    float outerMask = 1.0 - smoothstep(maskRadiusOuter, maskRadiusOuter + maskSoftnessOuter, circleSDF);
    float innerMask = smoothstep(maskRadiusInner, maskRadiusInner + maskSoftnessInner, circleSDF);
    float mask = outerMask * innerMask;
    
    // Sample ripple normal texture
    vec4 rippleNormal = texture2D(rippleTexture, vUv);
    
    // Output with mask and opacity
    gl_FragColor = vec4(rippleNormal.rgb, mask * vOpacity);
  }
`

// Particle system for ripples
function RippleParticles({ renderTarget, cameraRef }) {
  const particlesRef = useRef()
  const materialRef = useRef()
  const { scene: mainScene } = useThree()
  
  // Create ripple texture
  const rippleTexture = useMemo(() => createRippleNormalTexture(64), [])
  
  // Particle system setup
  const particleCount = 50
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const opacities = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)
    const lifetimes = new Float32Array(particleCount)
    const maxLifetimes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within water area
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      
      sizes[i] = Math.random() * 2 + 0.5
      opacities[i] = 0
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1
      
      lifetimes[i] = 0
      maxLifetimes[i] = Math.random() * 3 + 2
    }
    
    return {
      positions,
      sizes,
      opacities,
      velocities,
      lifetimes,
      maxLifetimes
    }
  }, [])
  
  // Ripple material
  const rippleMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: rippleVertexShader,
      fragmentShader: rippleFragmentShader,
      uniforms: {
        rippleTexture: { value: rippleTexture },
        maskRadiusOuter: { value: 0.4 },
        maskRadiusInner: { value: 0.1 },
        maskSoftnessOuter: { value: 0.2 },
        maskSoftnessInner: { value: 0.1 }
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false
    })
  }, [rippleTexture])
  
  // Add new ripple
  const addRipple = useCallback((position) => {
    if (!particlesRef.current) return
    
    const geometry = particlesRef.current.geometry
    const positionAttribute = geometry.attributes.position
    const sizeAttribute = geometry.attributes.size
    const opacityAttribute = geometry.attributes.opacity
    
    // Find inactive particle
    for (let i = 0; i < particleCount; i++) {
      if (particles.lifetimes[i] <= 0) {
        // Reset particle
        positionAttribute.array[i * 3] = position.x
        positionAttribute.array[i * 3 + 1] = position.y
        positionAttribute.array[i * 3 + 2] = position.z
        
        sizeAttribute.array[i] = 0.1
        opacityAttribute.array[i] = 1.0
        
        particles.lifetimes[i] = particles.maxLifetimes[i]
        
        positionAttribute.needsUpdate = true
        sizeAttribute.needsUpdate = true
        opacityAttribute.needsUpdate = true
        break
      }
    }
  }, [particles])
  
  // Animation loop
  useFrame((state, delta) => {
    if (!particlesRef.current) return
    
    const geometry = particlesRef.current.geometry
    const positionAttribute = geometry.attributes.position
    const sizeAttribute = geometry.attributes.size
    const opacityAttribute = geometry.attributes.opacity
    
    let needsUpdate = false
    
    for (let i = 0; i < particleCount; i++) {
      if (particles.lifetimes[i] > 0) {
        particles.lifetimes[i] -= delta
        
        const lifeRatio = 1 - (particles.lifetimes[i] / particles.maxLifetimes[i])
        
        // Update size (expand over time)
        sizeAttribute.array[i] = lifeRatio * 3 + 0.1
        
        // Update opacity (fade out)
        opacityAttribute.array[i] = Math.max(0, 1 - lifeRatio)
        
        // Update position
        positionAttribute.array[i * 3] += particles.velocities[i * 3] * delta
        positionAttribute.array[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta
        
        needsUpdate = true
      }
    }
    
    if (needsUpdate) {
      positionAttribute.needsUpdate = true
      sizeAttribute.needsUpdate = true
      opacityAttribute.needsUpdate = true
    }
    
    // Automatically add ripples
    if (Math.random() < 0.02) {
      addRipple({
        x: (Math.random() - 0.5) * 6,
        y: 0,
        z: (Math.random() - 0.5) * 6
      })
    }
  })
  
  return (
    <points ref={particlesRef} material={rippleMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={particleCount}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={particles.sizes}
          count={particleCount}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          array={particles.opacities}
          count={particleCount}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}

// Main Water Ripples Component
function WaterRipples({ onRenderTextureUpdate }) {
  const { gl, scene } = useThree()
  const cameraRef = useRef()
  const sceneRef = useRef()
  
  // Create render target for ripples
  const renderTarget = useMemo(() => {
    return new WebGLRenderTarget(512, 512, {
      format: RGBFormat,
      generateMipmaps: false
    })
  }, [])
  
  // Create orthographic camera
  const camera = useMemo(() => {
    const cam = new OrthographicCamera(-5, 5, 5, -5, 0.1, 10)
    cam.position.set(0, 5, 0)
    cam.lookAt(0, 0, 0)
    return cam
  }, [])
  
  useFrame(() => {
    // Render ripples to texture
    const originalRenderTarget = gl.getRenderTarget()
    
    gl.setRenderTarget(renderTarget)
    gl.clear()
    
    if (sceneRef.current) {
      gl.render(sceneRef.current, camera)
    }
    
    gl.setRenderTarget(originalRenderTarget)
    
    // Pass render texture to water shader
    if (onRenderTextureUpdate) {
      onRenderTextureUpdate(renderTarget.texture)
    }
  })
  
  return createPortal(
    <scene ref={sceneRef}>
      <RippleParticles renderTarget={renderTarget} cameraRef={cameraRef} />
    </scene>,
    scene
  )
}

export default WaterRipples 