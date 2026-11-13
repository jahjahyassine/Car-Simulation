import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei'
import { useEnvironmentData } from '../../store/useAppStore'

function makeSoftShadow() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.72)')
  gradient.addColorStop(0.42, 'rgba(0, 0, 0, 0.52)')
  gradient.addColorStop(0.72, 'rgba(0, 0, 0, 0.18)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeLightPool(accent) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const color = new THREE.Color(accent)
  const rgb = `${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}`
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, `rgba(${rgb}, 0.37)`)
  gradient.addColorStop(0.38, `rgba(${rgb}, 0.16)`)
  gradient.addColorStop(0.72, `rgba(${rgb}, 0.045)`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function StudioFloor() {
  const environment = useEnvironmentData()
  const lightPool = useMemo(() => makeLightPool(environment.accent), [environment.accent])
  const softShadow = useMemo(() => makeSoftShadow(), [])

  useEffect(() => () => lightPool.dispose(), [lightPool])
  useEffect(() => () => softShadow.dispose(), [softShadow])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.024, 0]}>
        <circleGeometry args={[30, 96]} />
        <meshStandardMaterial
          color="#191c22"
          metalness={0.28}
          roughness={0.7}
          envMapIntensity={0.6}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.012, 0]}>
        <circleGeometry args={[16, 96]} />
        <MeshReflectorMaterial
          resolution={512}
          blur={[240, 70]}
          mixBlur={1.4}
          mixStrength={4.2}
          mirror={0.62}
          roughness={0.58}
          metalness={0.42}
          depthScale={1.15}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.5}
          color={environment.floor}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0015, 0]}>
        <circleGeometry args={[11.5, 96]} />
        <meshBasicMaterial
          map={lightPool}
          transparent
          opacity={0.52}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.005, 0]}
        scale={[2.8, 4.5, 1]}
      >
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial
          map={softShadow}
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <ringGeometry args={[3.32, 3.335, 160]} />
        <meshBasicMaterial
          color={environment.rim}
          transparent
          opacity={0.3}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <ringGeometry args={[9.9, 9.91, 160]} />
        <meshBasicMaterial
          color={environment.accent}
          transparent
          opacity={0.05}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <ContactShadows
        key={environment.id}
        position={[0, 0.004, 0]}
        opacity={environment.id === 'night' ? 0.8 : 0.7}
        scale={6.4}
        blur={2.4}
        far={2.1}
        resolution={512}
        frames={1}
        color="#000000"
      />
    </group>
  )
}
