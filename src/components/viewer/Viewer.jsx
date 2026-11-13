import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CarModel } from './CarModel'
import { CameraRig } from './CameraRig'
import { DrivingRoad } from './DrivingRoad'
import { LightRig } from './LightRig'
import { StudioEnvironment } from './StudioEnvironment'
import { StudioFloor } from './StudioFloor'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { HERO_CAMERA } from '../../data/config'
import { useAppStore, useEnvironmentData } from '../../store/useAppStore'

export function Viewer() {
  const environment = useEnvironmentData()
  const [registry, setRegistry] = useState(null)
  const clearSelection = useAppStore((state) => state.clearSelection)
  const setAssetError = useAppStore((state) => state.setAssetError)

  const handleRegistry = useCallback((nextRegistry) => {
    setRegistry(nextRegistry)
  }, [])

  const handleError = useCallback(
    (error) => {
      console.error('[AUTO3D] Impossible de préparer la scène 3D.', error)
      setAssetError({
        title: 'Modèle 3D inaccessible',
        message:
          "Le fichier Porsche 992 GT3 R n’a pas pu être chargé. Vérifiez que « source/porsche_992_gt3_r.glb » est présent, puis rechargez la page.",
      })
    },
    [setAssetError],
  )

  const handlePointerMissed = useCallback(() => {
    const state = useAppStore.getState()
    if (state.selectedId) state.clearSelection()
  }, [])

  return (
    <div className="viewer" style={{ backgroundImage: environment.gradient }}>
      <div className="viewer-noise" aria-hidden="true" />
      <ErrorBoundary
        onError={handleError}
        fallback={
          <div className="viewer-error-fallback">
            <span className="eyebrow">Scène 3D interrompue</span>
            <p>Le modèle ne peut pas être affiché pour le moment.</p>
          </div>
        }
      >
        <Canvas
          shadows={false}
          dpr={[1, 1.75]}
          camera={{
            position: HERO_CAMERA.position,
            fov: 36,
            near: 0.1,
            far: 120,
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
          }}
          onCreated={({ gl, scene }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 0.94
            gl.outputColorSpace = THREE.SRGBColorSpace
            scene.background = null
            gl.domElement.style.cursor = 'grab'
          }}
          onPointerMissed={handlePointerMissed}
          fallback={
            <div className="viewer-error-fallback">
              <span className="eyebrow">WebGL indisponible</span>
              <p>
                Activez l’accélération matérielle de votre navigateur pour afficher la scène 3D.
              </p>
            </div>
          }
        >
          <Suspense fallback={null}>
            <StudioEnvironment />
            <StudioFloor />
            <DrivingRoad />
            <CarModel onRegistry={handleRegistry} />
            <LightRig />
          </Suspense>
          <CameraRig registry={registry} />
        </Canvas>
      </ErrorBoundary>
      <div className="viewer-vignette" aria-hidden="true" />
      <div className="viewer-tools-hint" aria-hidden="true">
        <span className="mouse-glyph" />
        <span>Orbiter</span>
        <span className="hint-separator">·</span>
        <span>Molette pour zoomer</span>
      </div>
    </div>
  )
}
