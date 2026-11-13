import { COMPONENT_BY_ID, CATEGORY_BY_ID } from '../../data/components'
import { useAppStore } from '../../store/useAppStore'
import { ComponentIcon } from '../common/ComponentIcon'

const numberFormatter = new Intl.NumberFormat('fr-FR')

export function StageHud() {
  const hoveredId = useAppStore((state) => state.hoveredId)
  const selectedId = useAppStore((state) => state.selectedId)
  const modelStats = useAppStore((state) => state.modelStats)

  const readout = hoveredId
    ? { label: 'Survol', component: COMPONENT_BY_ID[hoveredId] }
    : selectedId
      ? { label: 'Sélection', component: COMPONENT_BY_ID[selectedId] }
      : null

  const component = readout?.component
  const category = component ? CATEGORY_BY_ID[component.category] : null

  return (
    <div className="stage-hud">
      <div className="stage-heading">
        <span className="stage-kicker">
          <span className="status-dot" />
          Étude 3D · WebGL temps réel
        </span>
        <h1>
          <span>992</span> GT3 R
        </h1>
        <p>Lecture pédagogique du modèle Porsche</p>
      </div>

      <div className={`stage-readout ${component ? 'has-component' : ''}`}>
        {component ? (
          <>
            <span className="readout-kicker">{readout.label}</span>
            <div className="readout-main">
              <span className="readout-icon">
                <ComponentIcon name={component.icon} size={19} />
              </span>
              <div>
                <strong>{component.name}</strong>
                <span>{category?.label}</span>
              </div>
            </div>
            <span
              className={`readout-status ${component.available ? 'is-available' : 'is-info-only'}`}
            >
              <span className="status-dot" />
              {component.available ? 'Géométrie présente' : 'Fiche pédagogique'}
            </span>
          </>
        ) : (
          <>
            <span className="readout-kicker">Modèle source</span>
            <div className="readout-data">
              <span>
                <strong>{numberFormatter.format(modelStats?.meshes ?? 0)}</strong>
                maillages
              </span>
              <span>
                <strong>{numberFormatter.format(modelStats?.triangles ?? 0)}</strong>
                triangles
              </span>
            </div>
            <span className="readout-foot">Fichier GLB local · aucune donnée distante</span>
          </>
        )}
      </div>
    </div>
  )
}
