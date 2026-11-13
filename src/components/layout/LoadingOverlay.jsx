import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { MODEL_SUMMARY } from '../../data/components'
import { useAppStore } from '../../store/useAppStore'

export function LoadingOverlay() {
  const progress = useProgress((state) => state.progress)
  const active = useProgress((state) => state.active)
  const modelReady = useAppStore((state) => state.modelReady)
  const assetError = useAppStore((state) => state.assetError)

  const [leaving, setLeaving] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (assetError) {
      setDismissed(false)
      setLeaving(false)
      return undefined
    }

    if (!modelReady) return undefined

    const leaveTimer = window.setTimeout(() => setLeaving(true), 320)
    const removeTimer = window.setTimeout(() => setDismissed(true), 1060)
    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [assetError, modelReady])

  if (dismissed && !assetError) return null

  if (assetError) {
    return (
      <div className="loading-overlay is-error" role="alert" data-testid="asset-error">
        <div className="loading-backdrop-grid" aria-hidden="true" />
        <div className="loading-content error-content">
          <span className="error-symbol">
            <TriangleAlert size={30} />
          </span>
          <span className="loading-kicker">AUTO3D · Chargement interrompu</span>
          <h1>{assetError.title}</h1>
          <p className="loading-message">{assetError.message}</p>
          <button
            type="button"
            className="primary-button loading-retry"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} />
            Recharger la page
          </button>
          <p className="loading-hint">
            Le modèle doit rester disponible dans <code>source/porsche_992_gt3_r.glb</code>.
          </p>
          <div className="loading-footer">
            <span>Modèle de {MODEL_SUMMARY.sourceAuthor}</span>
            <span>{MODEL_SUMMARY.license}</span>
          </div>
        </div>
      </div>
    )
  }

  const displayProgress = modelReady ? 100 : Math.min(progress, 97)
  const status = modelReady
    ? 'Scène prête'
    : active
      ? 'Géométrie, matériaux et environnements'
      : 'Initialisation de la scène'

  return (
    <div
      className={`loading-overlay ${leaving ? 'is-leaving' : ''}`}
      aria-hidden={leaving ? 'true' : undefined}
      data-testid="loading-overlay"
    >
      <div className="loading-backdrop-grid" aria-hidden="true" />
      <div className="loading-content">
        <div className="loading-brand">
          <span className="loading-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <div>
            <span className="loading-wordmark">AUTO3D</span>
            <span className="loading-brand-sub">Visualiseur automobile</span>
          </div>
        </div>

        <div className="loading-car-line">
          <span className="loading-kicker">PORSCHE 992 GT3 R</span>
          <span className="loading-file">GLB · 35 Mo</span>
        </div>

        <div className="loading-progress-block">
          <div className="loading-progress-head">
            <span>{status}</span>
            <strong>{Math.round(displayProgress)}%</strong>
          </div>
          <div
            className="loading-progress-track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(displayProgress)}
            aria-label="Progression du chargement du modèle 3D"
          >
            <span
              className="loading-progress-fill"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="loading-progress-meta">
            <span>WebGL</span>
            <span>Rendu PBR</span>
            <span>HDRI local</span>
          </div>
        </div>

        <div className="loading-footer">
          <span>
            Modèle de{' '}
            <a href={MODEL_SUMMARY.sourceUrl} target="_blank" rel="noreferrer">
              {MODEL_SUMMARY.sourceAuthor}
            </a>
          </span>
          <span>{MODEL_SUMMARY.license}</span>
        </div>
      </div>
    </div>
  )
}
