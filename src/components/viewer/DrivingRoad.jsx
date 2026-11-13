import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const WIDTH = 512
const HEIGHT = 1024

function makeRoadTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')

  const asphalt = context.createLinearGradient(0, 0, WIDTH, 0)
  asphalt.addColorStop(0, 'rgba(4, 5, 7, 0)')
  asphalt.addColorStop(0.13, 'rgba(5, 6, 8, 0.82)')
  asphalt.addColorStop(0.5, 'rgba(7, 8, 10, 0.94)')
  asphalt.addColorStop(0.87, 'rgba(5, 6, 8, 0.82)')
  asphalt.addColorStop(1, 'rgba(4, 5, 7, 0)')
  context.fillStyle = asphalt
  context.fillRect(0, 0, WIDTH, HEIGHT)

  // Fine grain avoids a flat, plastic-looking tarmac.
  let seed = 47
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let index = 0; index < 2400; index += 1) {
    const x = 54 + random() * (WIDTH - 108)
    const y = random() * HEIGHT
    context.fillStyle = `rgba(190, 200, 210, ${0.012 + random() * 0.024})`
    context.fillRect(x, y, 1 + random() * 1.6, 1 + random() * 4)
  }

  const drawDashes = (x, dash, gap) => {
    context.fillStyle = 'rgba(220, 226, 234, 0.52)'
    context.shadowColor = 'rgba(255, 255, 255, 0.28)'
    context.shadowBlur = 5
    for (let y = 0; y < HEIGHT; y += dash + gap) {
      context.fillRect(x - 2, y, 4, dash)
    }
  }

  drawDashes(118, 76, 92)
  drawDashes(WIDTH - 118, 76, 92)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 6)
  texture.anisotropy = 4
  return texture
}

export function DrivingRoad() {
  const driving = useAppStore((state) => state.driving)
  const wheelSpeed = useAppStore((state) => state.wheelSpeed)
  const materialRef = useRef(null)
  const meshRef = useRef(null)
  const opacity = useRef(0)
  const texture = useMemo(() => makeRoadTexture(), [])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const material = materialRef.current
    if (!material) return

    const target = driving ? 0.92 : 0
    opacity.current = THREE.MathUtils.damp(opacity.current, target, driving ? 5 : 4, delta)
    material.opacity = opacity.current
    if (meshRef.current) meshRef.current.visible = opacity.current > 0.005

    if (driving) {
      texture.offset.y = (texture.offset.y + delta * (0.16 + wheelSpeed * 0.13)) % 1
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position={[0, 0.002, -8]}
      visible={false}
      frustumCulled={false}
    >
      <planeGeometry args={[9.4, 58]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
