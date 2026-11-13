import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

export function LightRig() {
  const headlights = useAppStore((state) => state.headlights)
  const taillights = useAppStore((state) => state.taillights)

  const targets = useMemo(
    () => ({
      left: new THREE.Object3D(),
      right: new THREE.Object3D(),
    }),
    [],
  )

  return (
    <group>
      <primitive object={targets.left} position={[0.45, 0.08, 10]} />
      <primitive object={targets.right} position={[-0.45, 0.08, 10]} />

      <spotLight
        position={[0.63, 0.68, 2.12]}
        target={targets.left}
        angle={0.35}
        penumbra={0.72}
        intensity={headlights ? 46 : 0}
        distance={14}
        decay={1.65}
        color="#dceaff"
      />
      <spotLight
        position={[-0.63, 0.68, 2.12]}
        target={targets.right}
        angle={0.35}
        penumbra={0.72}
        intensity={headlights ? 46 : 0}
        distance={14}
        decay={1.65}
        color="#dceaff"
      />

      <pointLight
        position={[0.61, 0.68, -2.08]}
        intensity={taillights ? 4.5 : 0}
        distance={4.2}
        decay={2}
        color="#ff1628"
      />
      <pointLight
        position={[-0.61, 0.68, -2.08]}
        intensity={taillights ? 4.5 : 0}
        distance={4.2}
        decay={2}
        color="#ff1628"
      />
      <pointLight
        position={[0, 0.47, -2.28]}
        intensity={taillights ? 1.4 : 0}
        distance={2.4}
        decay={2}
        color="#ff1020"
      />
    </group>
  )
}
