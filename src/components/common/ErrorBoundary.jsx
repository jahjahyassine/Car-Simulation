import { Component } from 'react'

/**
 * Catches model-loading errors below the Canvas and leaves a readable
 * fallback in the viewport. AUTO3D never hides a broken asset behind a
 * fake car or an endless spinner.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, resetKey: 0 }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="viewer-error-fallback">
            <span className="eyebrow">Moteur 3D indisponible</span>
            <p>Le modèle n’a pas pu être chargé.</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
