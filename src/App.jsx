import { useEffect } from 'react'
import { TopBar } from './components/layout/TopBar'
import { LeftExplorer } from './components/layout/LeftExplorer'
import { RightPanel } from './components/layout/RightPanel'
import { BottomBar } from './components/layout/BottomBar'
import { StageHud } from './components/layout/StageHud'
import { LoadingOverlay } from './components/layout/LoadingOverlay'
import { Viewer } from './components/viewer/Viewer'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const mobileLeft = useAppStore((state) => state.mobileLeft)
  const mobileRight = useAppStore((state) => state.mobileRight)
  const closeMobilePanels = useAppStore((state) => state.closeMobilePanels)
  const openMobileLeft = useAppStore((state) => state.openMobileLeft)

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (event.key === 'Escape') {
        const state = useAppStore.getState()
        if (state.mobileLeft || state.mobileRight) {
          state.closeMobilePanels()
        } else if (state.selectedId) {
          state.clearSelection()
        }
        return
      }

      if (event.key === '/' && !isTyping) {
        event.preventDefault()
        if (window.matchMedia('(max-width: 1290px)').matches) {
          openMobileLeft()
          window.setTimeout(() => {
            document.querySelector('[data-explorer-search]')?.focus()
          }, 120)
        } else {
          document.querySelector('[data-explorer-search]')?.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openMobileLeft])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#stage">
        Aller à la scène 3D
      </a>
      <TopBar />
      <main className="workspace">
        <LeftExplorer />
        <section className="stage-shell" id="stage" aria-label="Scène 3D interactive">
          <Viewer />
          <StageHud />
          <BottomBar />
        </section>
        <RightPanel />
        <div
          className={`panel-scrim ${mobileLeft || mobileRight ? 'is-visible' : ''}`}
          onClick={closeMobilePanels}
          aria-hidden="true"
        />
      </main>
      <LoadingOverlay />
    </div>
  )
}
