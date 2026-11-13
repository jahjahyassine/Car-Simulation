import { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { CAMERA_BY_ID } from '../../data/config'
import { useAppStore } from '../../store/useAppStore'

const DEFAULT_TARGET = new THREE.Vector3(0, 0.53, 0)

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function CameraRig({ registry }) {
  const camera = useThree((state) => state.camera)
  const controlsRef = useRef(null)
  const tweenRef = useRef(null)

  const preset = useAppStore((state) => state.camera.preset)
  const nonce = useAppStore((state) => state.camera.nonce)
  const autoRotate = useAppStore((state) => state.autoRotate)
  const focusRequest = useAppStore((state) => state.componentFocusRequest)

  const moveCamera = (nextPosition, nextTarget, options = {}) => {
    const controls = controlsRef.current
    if (!controls) return

    
    tweenRef.current?.kill()
    controls.autoRotate = false

    const positionState = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    }
    const targetState = {
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z,
    }

    const duration = options.duration ?? 1.2
    const timeline = gsap.timeline({
      onComplete: () => {
        controls.autoRotate = useAppStore.getState().autoRotate
      },
    })

    timeline.to(
      positionState,
      {
        x: nextPosition.x,
        y: nextPosition.y,
        z: nextPosition.z,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.position.set(positionState.x, positionState.y, positionState.z)
        },
      },
      0,
    )

    timeline.to(
      targetState,
      {
        x: nextTarget.x,
        y: nextTarget.y,
        z: nextTarget.z,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => {
          controls.target.set(targetState.x, targetState.y, targetState.z)
          controls.update()
        },
      },
      0,
    )

    tweenRef.current = timeline
  }

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.target.copy(DEFAULT_TARGET)
    controls.update()
  }, [])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const view = CAMERA_BY_ID[preset] ?? CAMERA_BY_ID.threeQuarter
    moveCamera(
      new THREE.Vector3(...view.position),
      new THREE.Vector3(...view.target),
      { duration: 1.15 },
    )
    // The nonce deliberately re-triggers the same preset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, preset])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.58
  }, [autoRotate])

  useEffect(() => {
    if (!focusRequest || !registry) return
    const box = registry.getComponentWorldBox(focusRequest.id)
    if (!box.isEmpty()) {
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      const center = sphere.center
      const radius = Math.max(sphere.radius, 0.18)
      const direction = camera.position.clone().sub(center)
      if (direction.lengthSq() < 0.0001) direction.set(1, 0.35, 1)
      direction.normalize()
      if (direction.y < 0.08) direction.y = 0.18
      direction.normalize()

      const fov = THREE.MathUtils.degToRad(camera.fov)
      const distance = clamp((radius / Math.tan(fov / 2)) * 1.9, 1.1, 5.4)
      const nextPosition = center.clone().addScaledVector(direction, distance)
      nextPosition.y = Math.max(nextPosition.y, 0.3)
      moveCamera(nextPosition, center.clone(), { duration: 0.9 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest?.nonce])

  useEffect(
    () => () => {
      tweenRef.current?.kill()
    },
    [],
  )

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.055}
      enablePan={false}
      minDistance={1.5}
      maxDistance={13}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2 - 0.025}
      onStart={() => {
        tweenRef.current?.kill()
      }}
    />
  )
}
