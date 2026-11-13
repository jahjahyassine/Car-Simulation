import { useEffect, useState } from 'react'
import { Maximize2, Minimize2, PanelLeft, PanelRight, RotateCcw } from 'lucide-react'
import { APP_MODES } from '../../data/config'
import { useAppStore } from '../../store/useAppStore'

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-slash brand-slash-1" />
      <span className="brand-slash brand-slash-2" />
      <span className="brand-slash brand-slash-3" />
    </span>
  )
}

export function TopBar() {
  const mode = useAppStore((state) => state.mode)
  const setMode = useAppStore((state) => state.setMode)
  const resetAll = useAppStore((state) => state.resetAll)
  const openMobileLeft = useAppStore((state) => state.openMobileLeft)
  const openMobileRight = useAppStore((state) => state.openMobileRight)
  const mobileLeft = useAppStore((state) => state.mobileLeft)
  const mobileRight = useAppStore((state) => state.mobileRight)

  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.warn('[AUTO3D] Le mode plein écran a été refusé par le navigateur.', error)
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <button
          type="button"
          className="brand-button"
          onClick={() => setMode('overview')}
          aria-label="AUTO3D — revenir à la vue d’ensemble"
        >
          <BrandMark />
          <span className="brand-copy">
            <span className="brand-name">AUTO3D</span>
            <span className="brand-sub">Visualiseur automobile</span>
          </span>
        </button>
        <span className="brand-divider" aria-hidden="true" />
        <div className="brand-model">
          <span className="brand-model-make">PORSCHE</span>
          <span className="brand-model-name">992 GT3 R</span>
        </div>
      </div>

      <nav className="mode-nav" aria-label="Modes de visualisation">
        {APP_MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mode-tab ${mode === item.id ? 'is-active' : ''}`}
            onClick={() => setMode(item.id)}
            aria-current={mode === item.id ? 'true' : undefined}
          >
            <span className="mode-index">{item.index}</span>
            <span className="mode-label">{item.label}</span>
            <span className="mode-label-short">{item.short}</span>
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <div className="mobile-actions">
          <button
            type="button"
            className={`icon-button mobile-action ${mobileLeft ? 'is-active' : ''}`}
            onClick={openMobileLeft}
            aria-label="Ouvrir l’explorateur de composants"
            aria-expanded={mobileLeft}
          >
            <PanelLeft size={18} />
          </button>
          <button
            type="button"
            className={`icon-button mobile-action ${mobileRight ? 'is-active' : ''}`}
            onClick={openMobileRight}
            aria-label="Ouvrir le panneau d’informations"
            aria-expanded={mobileRight}
          >
            <PanelRight size={18} />
          </button>
        </div>

        <div className="desktop-actions">
          <button
            type="button"
            className="icon-button chrome-action"
            onClick={toggleFullscreen}
            title={fullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
            aria-label={fullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          >
            {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button
            type="button"
            className="reset-button"
            onClick={resetAll}
            title="Réinitialiser la caméra, les animations et la configuration"
          >
            <RotateCcw size={16} />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>
    </header>
  )
}
