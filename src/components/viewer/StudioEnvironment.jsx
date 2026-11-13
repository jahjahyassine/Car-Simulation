import { Environment } from '@react-three/drei'
import { useEnvironmentData } from '../../store/useAppStore'

export function StudioEnvironment() {
  const environment = useEnvironmentData()

  return (
    <>
      <Environment
        key={environment.id}
        files={environment.hdri}
        background={false}
        environmentIntensity={environment.envIntensity}
      />
      <fog attach="fog" args={[environment.fog, 11, 28]} />

      <ambientLight intensity={0.13} color={environment.fill} />
      <hemisphereLight
        intensity={0.2}
        color={environment.accent}
        groundColor={environment.fog}
      />
      <directionalLight
        position={[5.5, 7.5, 4.5]}
        intensity={environment.keyIntensity * 0.82}
        color={environment.accent}
      />
      <directionalLight
        position={[-5.5, 3.2, -4.5]}
        intensity={environment.fillIntensity}
        color={environment.fill}
      />
      <pointLight
        position={[3.6, 1.15, -4.2]}
        intensity={13}
        distance={9}
        decay={2}
        color={environment.rim}
      />
      <spotLight
        position={[-1.8, 7.5, 2.4]}
        target-position={[0, 0, 0]}
        angle={0.58}
        penumbra={1}
        intensity={28}
        distance={18}
        decay={1.7}
        color={environment.accent}
      />
    </>
  )
}
