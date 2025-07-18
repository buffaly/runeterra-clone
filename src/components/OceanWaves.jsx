import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping, ShaderMaterial, AdditiveBlending } from 'three'
import oceanMaskImage from '../assets/ocean_z1.jpg'

// Ocean Wave Sparkles Shaders
const oceanVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const oceanFragmentShader = `
  /*
    Ocean Wave Sparkles
    https://github.com/ashima/webgl-noise
  */

  // Uniforms
  uniform float opacity;
  uniform float time;
  uniform sampler2D tHeightMap;
  
  // variables
  varying vec2 vUv;

  // ==========================================
  // Ashima Noise Functions
  // ==========================================

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  // 3D Simplex noise
  float snoise(vec3 v) { 
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(
      permute(
        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)
      )
      + i.x + vec4(0.0, i1.x, i2.x, 1.0)
    );

    // Gradients
    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalize gradients
    vec4 norm = taylorInvSqrt(vec4(
      dot(p0, p0),
      dot(p1, p1),
      dot(p2, p2),
      dot(p3, p3)
    ));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(
      dot(x0, x0),
      dot(x1, x1),
      dot(x2, x2),
      dot(x3, x3)
    ), 0.0);
    m = m * m;
    
    return 42.0 * dot(m * m, vec4(
      dot(p0, x0),
      dot(p1, x1),
      dot(p2, x2),
      dot(p3, x3)
    ));
  }

  float random1d(float n) {
    return fract(sin(n) * 43758.5453);
  }

  void main() {
    // Sample ocean mask from height map
    float isOcean = texture2D(tHeightMap, vUv).r;
    
    // Generate sparkle patterns using two-scale noise
    float sparklePattern = 0.0;
    
    // Large scale sparkles
    sparklePattern += snoise(vec3(
      vUv.xy * 30.0 + time * 0.1,
      time * 0.08
    )) * 0.3;
    
    // Fine detail sparkles
    sparklePattern += snoise(vec3(
      vUv.xy * 600.0,
      time * 0.15
    ));
    
    // Apply contrast and color
    sparklePattern = (sparklePattern - 0.7) * 1.0;
    vec3 sparkleColor = isOcean * vec3(sparklePattern);
    
    gl_FragColor = vec4(sparkleColor, opacity);
  }
`

function OceanWaves({ zoomLevel }) {
  const oceanMeshRef = useRef()
  const [oceanMaskTexture] = useLoader(TextureLoader, [oceanMaskImage])

  // Configure ocean mask texture
  useMemo(() => {
    if (oceanMaskTexture) {
      oceanMaskTexture.wrapS = RepeatWrapping
      oceanMaskTexture.wrapT = RepeatWrapping
      oceanMaskTexture.repeat.set(10, 10)
    }
  }, [oceanMaskTexture])

  // Create custom shader material for sparkles
  const oceanMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        tHeightMap: { value: oceanMaskTexture }
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      lights: false,
      depthTest: false
    })
  }, [oceanMaskTexture])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Update sparkle material
    if (oceanMeshRef.current && oceanMaterial) {
      oceanMaterial.uniforms.time.value = time
    }

    // display 
    oceanMaterial.uniforms.opacity.value = Math.min(1, (zoomLevel - 0.6) / 0.4)
  })

  return (
      <mesh 
        ref={oceanMeshRef} 
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={oceanMaterial}
      >
        <planeGeometry args={[10, 10, 32, 32]} />
      </mesh>
  )
}

export default OceanWaves

