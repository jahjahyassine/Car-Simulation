import {
  Armchair,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Box,
  Camera,
  DoorOpen,
  Eye,
  Gauge,
  Layers,
  Orbit,
  Pause,
  Play,
  Road,
  RotateCcw,
  SquareDot,
} from 'lucide-react'
import { CAMERA_PRESETS } from '../../data/config'
import { useAppStore } from '../../store/useAppStore'

const CAMERA_ICONS = {
  front: ArrowUp,
  rear: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
  top: SquareDot,
  threeQuarter: Box,
  interior: Armchair,
}

const SPEEDS = [0.5, 1, 2]

export function BottomBar() {
  const cameraPreset = useAppStore((state) => state.camera.preset)
  const requestCamera = useAppStore((state) => state.requestCamera)
  const autoRotate = useAppStore((state) => state.autoRotate)
  const toggleAutoRotate = useAppStore((state) => state.toggleAutoRotate)

  const explosionTarget = useAppStore((state) => state.explosionTarget)
  const setExplosion = useAppStore((state) => state.setExplosion)

  const wheelSpin = useAppStore((state) => state.wheelSpin)
  const toggleWheelSpin = useAppStore((state) => state.toggleWheelSpin)
  const driving = useAppStore((state) => state.driving)
  const toggleDriving = useAppStore((state) => state.toggleDriving)
  const wheelSpeed = useAppStore((state) => state.wheelSpeed)
  const setWheelSpeed = useAppStore((state) => state.setWheelSpeed)
  const doorsOpen = useAppStore((state) => state.doorsOpen)
  const toggleDoors = useAppStore((state) => state.toggleDoors)
  const transparency = useAppStore((state) => state.transparency)
  const toggleTransparency = useAppStore((state) => state.toggleTransparency)

  const explosionPercent = Math.round(explosionTarget * 100)

  return (
    <div className="control-deck" role="toolbar" aria-label="Contrôles de la scène 3D">
      <div className="deck-row deck-row-primary">
        <div className="deck-group camera-deck-group">
          <span className="deck-label">
            <Camera size={13} aria-hidden="true" />
            Caméra
          </span>
          <div className="camera-buttons" role="group" aria-label="Points de vue caméra">
            {CAMERA_PRESETS.map((preset) => {
              const Icon = CAMERA_ICONS[preset.id] ?? Box
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`camera-button ${cameraPreset === preset.id ? 'is-active' : ''}`}
                  onClick={() => requestCamera(preset.id)}
                  title={`${preset.title} — ${preset.label}`}
                  aria-label={preset.title}
                  aria-pressed={cameraPreset === preset.id}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className={`camera-button orbit-button ${autoRotate ? 'is-active' : ''}`}
            onClick={toggleAutoRotate}
            title="Rotation automatique de la caméra"
            aria-label="Activer ou désactiver la rotation automatique"
            aria-pressed={autoRotate}
          >
            <Orbit size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="deck-separator" aria-hidden="true" />

        <div className="deck-group explode-deck-group">
          <span className="deck-label">
            <Layers size={13} aria-hidden="true" />
            Éclaté
          </span>
          <input
            type="range"
            className="slider explode-slider"
            min="0"
            max="100"
            step="1"
            value={explosionPercent}
            onChange={(event) => setExplosion(Number(event.target.value) / 100)}
            aria-label="Niveau d’éclatement de la vue"
            style={{ '--range-progress': `${explosionPercent}%` }}
          />
          <span className="deck-value" aria-hidden="true">
            {explosionPercent}
            <small>%</small>
          </span>
          {explosionPercent > 0 ? (
            <button
              type="button"
              className="mini-icon-button"
              onClick={() => setExplosion(0)}
              title="Revenir à la vue assemblée"
              aria-label="Revenir à la vue assemblée"
            >
              <RotateCcw size={13} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="deck-row deck-row-secondary">
        <div className="deck-group motion-deck-group">
          <span className="deck-label">
            <Gauge size={13} aria-hidden="true" />
            Animation
          </span>
          <button
            type="button"
            className={`toolbar-toggle ${wheelSpin ? 'is-active' : ''}`}
            onClick={toggleWheelSpin}
            aria-pressed={wheelSpin}
            title="Démarrer ou mettre en pause la rotation des roues"
          >
            {wheelSpin ? <Pause size={14} /> : <Play size={14} />}
            <span>Roues</span>
          </button>
          <button
            type="button"
            className={`toolbar-toggle ${driving ? 'is-active' : ''}`}
            onClick={toggleDriving}
            aria-pressed={driving}
            title="Simuler le roulage : roues et route en mouvement"
          >
            <Road size={14} />
            <span>Roulage</span>
          </button>
          <button
            type="button"
            className={`toolbar-toggle ${doorsOpen ? 'is-active' : ''}`}
            onClick={toggleDoors}
            aria-pressed={doorsOpen}
            title="Ouvrir ou fermer les deux portières"
          >
            <DoorOpen size={14} />
            <span>Portières</span>
          </button>

          <div className="speed-control" role="group" aria-label="Vitesse des animations">
            <span className="speed-label">Vitesse</span>
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                className={`speed-button ${wheelSpeed === speed ? 'is-active' : ''}`}
                onClick={() => setWheelSpeed(speed)}
                aria-pressed={wheelSpeed === speed}
                aria-label={`Vitesse ${speed} fois`}
              >
                {String(speed).replace('.', ',')}×
              </button>
            ))}
          </div>
        </div>

        <div className="deck-separator" aria-hidden="true" />

        <button
          type="button"
          className={`transparency-toggle ${transparency ? 'is-active' : ''}`}
          onClick={toggleTransparency}
          aria-pressed={transparency}
          title="Rendre la peinture extérieure translucide pour révéler l’habitacle"
        >
          <Eye size={15} />
          <span>Transparence</span>
          <span className={`mini-switch ${transparency ? 'is-on' : ''}`} aria-hidden="true">
            <span />
          </span>
        </button>
      </div>
    </div>
  )
}
