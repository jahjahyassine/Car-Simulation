import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import modelUrl from '../../../source/porsche_992_gt3_r.glb?url'
import {
  applyExplosion,
  buildModelRegistry,
  spinWheels,
  updateLightMaterials,
  updatePaint,
  updateRimColour,
  updateTransparency,
} from '../../utils/modelRegistry'
import { useAppStore, usePaint, useRim } from '../../store/useAppStore'

useGLTF.preload(modelUrl)

const TARGET_LENGTH = 4.77

export function CarModel({ onRegistry }) {
  const { scene } = useGLTF(modelUrl)
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  const selectComponent = useAppStore((state) => state.selectComponent)
  const setHovered = useAppStore((state) => state.setHovered)
  const setModelReady = useAppStore((state) => state.setModelReady)
  const setModelStats = useAppStore((state) => state.setModelStats)
  const selectedId = useAppStore((state) => state.selectedId)
  const hoveredId = useAppStore((state) => state.hoveredId)
  const explosionTarget = useAppStore((state) => state.explosionTarget)
  const transparency = useAppStore((state) => state.transparency)
  const wheelSpin = useAppStore((state) => state.wheelSpin)
  const driving = useAppStore((state) => state.driving)
  const wheelSpeed = useAppStore((state) => state.wheelSpeed)
  const doorsOpen = useAppStore((state) => state.doorsOpen)
  const headlights = useAppStore((state) => state.headlights)
  const taillights = useAppStore((state) => state.taillights)
  const paint = usePaint()
  const rim = useRim()

  const wheelAngle = useRef(0)
  const explosionProgress = useRef(0)
  const cursorRef = useRef('')

  const prepared = useMemo(() => {
    const registry = buildModelRegistry(scene)
    scene.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = size.z > 0 ? TARGET_LENGTH / size.z : 1
    const dimensions = {
      width: size.x * scale,
      height: size.y * scale,
      length: size.z * scale,
    }

    // The source export is authored in centimetres with a 0.01 root scale.
    // Normalising the wrapper preserves every pivot/explosion unit (≈ 1 m)
    // while giving the studio, contact shadows and cameras a real-world scale.
    const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z)

    registry.modelStats.dimensions = dimensions

    return { registry, scale, offset, dimensions }
  }, [scene])

  const { registry, scale, offset, dimensions } = prepared

  useEffect(() => {
    onRegistry?.(registry)
    setModelStats({
      ...registry.modelStats,
      dimensions,
      componentStats: registry.componentStats,
    })
    setModelReady(true)
    invalidate()

    return () => onRegistry?.(null)
  }, [dimensions, invalidate, onRegistry, registry, setModelReady, setModelStats])

  useEffect(() => () => registry.dispose(), [registry])

  useEffect(() => {
    registry.setCurrentSelection(selectedId)
    registry.setSelection(selectedId)
    registry.setHover(hoveredId)
    invalidate()
  }, [hoveredId, invalidate, registry, selectedId])

  useEffect(() => {
    updatePaint(registry, paint)
    invalidate()
  }, [invalidate, paint, registry])

  useEffect(() => {
    updateRimColour(registry, rim)
    invalidate()
  }, [invalidate, registry, rim])

  useEffect(() => {
    updateTransparency(registry, transparency)
    invalidate()
  }, [invalidate, registry, transparency])

  useEffect(() => {
    updateLightMaterials(registry, { headlights, taillights })
    invalidate()
  }, [headlights, invalidate, registry, taillights])

  useEffect(() => {
    const state = { value: explosionProgress.current }
    const tween = gsap.to(state, {
      value: explosionTarget,
      duration: explosionTarget === 0 ? 0.9 : 0.8,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: () => {
        explosionProgress.current = state.value
        applyExplosion(registry, state.value)
      },
      onComplete: () => {
        explosionProgress.current = explosionTarget
        applyExplosion(registry, explosionTarget)
      },
    })
    invalidate()
    return () => tween.kill()
  }, [explosionTarget, invalidate, registry])

  useEffect(() => {
    const tweens = registry.doorPivots.map((door) =>
      gsap.to(door.pivot.rotation, {
        y: doorsOpen ? door.openAngle : 0,
        duration: doorsOpen ? 1.05 : 0.85,
        ease: doorsOpen ? 'power3.out' : 'power2.inOut',
        overwrite: true,
      }),
    )
    invalidate()
    return () => tweens.forEach((tween) => tween.kill())
  }, [doorsOpen, invalidate, registry])

  useEffect(() => {
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    const seen = new Set()
    for (const material of registry.materialClones) {
      for (const value of Object.values(material)) {
        if (!value?.isTexture || seen.has(value.uuid)) continue
        seen.add(value.uuid)
        value.anisotropy = maxAnisotropy
        value.needsUpdate = true
      }
    }
  }, [gl, registry])

  useEffect(
    () => () => {
      if (gl.domElement) gl.domElement.style.cursor = ''
    },
    [gl],
  )

  useFrame((_, rawDelta) => {
    if (!wheelSpin && !driving) return
    const delta = Math.min(rawDelta, 0.05)
    const factor = driving ? 2.7 : 1.35
    wheelAngle.current = (wheelAngle.current - delta * wheelSpeed * factor) % (Math.PI * 2)
    spinWheels(registry, wheelAngle.current)
  })

  const pickComponent = (event) => {
    if (event.delta > 6) return
    const id = event.object.userData.auto3dPrimary
    if (!id) return
    event.stopPropagation()
    selectComponent(id)
  }

  const applyCursor = (next) => {
    if (cursorRef.current === next) return
    cursorRef.current = next
    gl.domElement.style.cursor = next
  }

  const handlePointerOver = (event) => {
    if (event.object.userData.isAuto3DOverlay) return
    const id = event.object.userData.auto3dPrimary
    if (!id) return
    event.stopPropagation()
    setHovered(id)
    applyCursor('pointer')
  }

  const handlePointerOut = (event) => {
    if (event.object.userData.isAuto3DOverlay) return
    event.stopPropagation()
    setHovered(null)
    applyCursor('grab')
  }

  return (
    <group
      name="AUTO3D_CAR"
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={pickComponent}
    >
      <group scale={scale}>
        <group position={offset}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}
