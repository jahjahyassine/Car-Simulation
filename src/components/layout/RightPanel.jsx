import { useEffect, useMemo, useRef } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Crosshair,
  Eye,
  Info,
  LampCeiling,
  Layers,
  Lightbulb,
  MapPin,
  Move3D,
  PanelLeft,
  RotateCcw,
  Ruler,
  Settings2,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import {
  CATEGORY_BY_ID,
  COMPONENT_BY_ID,
  COMPONENTS,
  MODEL_SUMMARY,
} from '../../data/components'
import {
  ENVIRONMENTS,
  PAINTS,
  RIM_COLOURS,
} from '../../data/config'
import { useAppStore } from '../../store/useAppStore'
import { ComponentIcon } from '../common/ComponentIcon'
import { Switch } from '../common/Switch'

const numberFormatter = new Intl.NumberFormat('fr-FR')
const decimalFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

function formatNumber(value) {
  return value === null || value === undefined ? '—' : numberFormatter.format(value)
}

function formatTriangles(value) {
  if (!value) return '—'
  return numberFormatter.format(value)
}

function formatDimensions(dimensions) {
  if (!dimensions) return '—'
  return `${decimalFormatter.format(dimensions.length)} × ${decimalFormatter.format(dimensions.width)} × ${decimalFormatter.format(dimensions.height)} m`
}

function AvailabilityBadge({ available }) {
  return (
    <span className={`availability-badge ${available ? 'is-available' : 'is-info-only'}`}>
      {available ? <Check size={12} /> : <BookOpen size={12} />}
      {available ? 'Géométrie présente' : 'Fiche pédagogique'}
    </span>
  )
}

function SectionTitle({ children }) {
  return <h4 className="detail-section-title">{children}</h4>
}

function OverviewContent() {
  const setMode = useAppStore((state) => state.setMode)
  const openMobileLeft = useAppStore((state) => state.openMobileLeft)
  const selectComponent = useAppStore((state) => state.selectComponent)
  const modelStats = useAppStore((state) => state.modelStats)
  const availableCount = COMPONENTS.filter((component) => component.available).length

  const startExploring = () => {
    setMode('explore')
    if (window.matchMedia('(max-width: 1290px)').matches) openMobileLeft()
  }

  const showInfoOnly = (id) => {
    selectComponent(id)
  }

  return (
    <div className="panel-content overview-content">
      <div className="overview-hero">
        <span className="overline">
          <span className="status-dot" /> Étude 3D interactive
        </span>
        <h3>
          Chaque pièce
          <br />
          <span>raconte une fonction.</span>
        </h3>
        <p>
          Explorez la Porsche 992 GT3 R à l’échelle du fichier 3D. Chaque composant
          réellement modélisé est sélectionnable, isolable et documenté en français.
        </p>
      </div>

      <div className="stat-grid" aria-label="Statistiques du modèle">
        <div className="stat-card">
          <span className="stat-value">{formatNumber(modelStats?.meshes)}</span>
          <span className="stat-label">Maillages</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatTriangles(modelStats?.triangles)}</span>
          <span className="stat-label">Triangles</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNumber(modelStats?.materials)}</span>
          <span className="stat-label">Matériaux</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNumber(modelStats?.textures)}</span>
          <span className="stat-label">Textures</span>
        </div>
      </div>

      <div className="dimension-strip">
        <Ruler size={16} aria-hidden="true" />
        <div>
          <span>Boîte englobante du fichier</span>
          <strong>{formatDimensions(modelStats?.dimensions)}</strong>
        </div>
        <span className="dimension-note">L × l × H</span>
      </div>

      <div className="overview-actions">
        <button type="button" className="primary-button" onClick={startExploring}>
          Explorer les {availableCount} composants
          <ArrowUpRight size={16} />
        </button>
        <span className="action-note">Survol, sélection et vue éclatée</span>
      </div>

      <div className="info-callout info-callout-warning">
        <TriangleAlert size={17} aria-hidden="true" />
        <div>
          <strong>Ce que le fichier ne contient pas</strong>
          <p>
            Aucun moteur, aucune transmission et aucun bras de suspension ne sont
            modélisés. Ces fiches restent accessibles comme contenu pédagogique, mais
            ne sélectionnent aucune fausse géométrie.
          </p>
          <div className="inline-links">
            <button type="button" onClick={() => showInfoOnly('moteur')}>
              Fiche moteur <ChevronRight size={12} />
            </button>
            <button type="button" onClick={() => showInfoOnly('transmission')}>
              Transmission <ChevronRight size={12} />
            </button>
            <button type="button" onClick={() => showInfoOnly('suspension')}>
              Suspension <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="overview-section">
        <SectionTitle>Comment explorer</SectionTitle>
        <div className="guide-grid">
          <div className="guide-step">
            <span className="guide-number">01</span>
            <span>Survolez une pièce dans la scène ou la liste pour l’identifier.</span>
          </div>
          <div className="guide-step">
            <span className="guide-number">02</span>
            <span>Cliquez pour ouvrir sa fiche technique et la mettre en évidence.</span>
          </div>
          <div className="guide-step">
            <span className="guide-number">03</span>
            <span>Écartez la structure avec le curseur d’éclatement.</span>
          </div>
        </div>
      </div>

      <div className="attribution-card">
        <span className="panel-kicker">Crédits du modèle</span>
        <p>
          Modèle 3D par{' '}
          <a href={MODEL_SUMMARY.sourceUrl} target="_blank" rel="noreferrer">
            {MODEL_SUMMARY.sourceAuthor}
          </a>{' '}
          sur {MODEL_SUMMARY.sourcePlatform}.
        </p>
        <a
          href={MODEL_SUMMARY.licenseUrl}
          target="_blank"
          rel="noreferrer"
          className="license-link"
        >
          Licence {MODEL_SUMMARY.license}
          <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  )
}

function ExploreContent() {
  const openMobileLeft = useAppStore((state) => state.openMobileLeft)
  const modelStats = useAppStore((state) => state.modelStats)
  const availableCount = COMPONENTS.filter((component) => component.available).length

  return (
    <div className="panel-content explore-content">
      <div className="large-panel-icon">
        <Crosshair size={26} />
      </div>
      <span className="overline">Mode exploration</span>
      <h3>La scène est prête.</h3>
      <p>
        Survolez le véhicule, puis cliquez sur une pièce pour révéler sa fonction, sa
        localisation et les observations faites sur le fichier 3D.
      </p>

      <div className="explore-prompt">
        <div className="prompt-line">
          <span className="prompt-index">01</span>
          <span>Survoler</span>
          <span className="prompt-hint">mise en évidence rouge</span>
        </div>
        <div className="prompt-line">
          <span className="prompt-index">02</span>
          <span>Cliquer</span>
          <span className="prompt-hint">fiche + caméra</span>
        </div>
        <div className="prompt-line">
          <span className="prompt-index">03</span>
          <span>Isoler</span>
          <span className="prompt-hint">éclaté ou transparence</span>
        </div>
      </div>

      <button
        type="button"
        className="secondary-button full-button"
        onClick={openMobileLeft}
      >
        <PanelLeft size={16} />
        Ouvrir l’explorateur
      </button>

      <div className="mini-stats-row">
        <span>{availableCount} composants cartographiés</span>
        <span className="summary-dot" />
        <span>{formatNumber(modelStats?.meshes)} maillages</span>
      </div>

      <p className="subtle-note">
        Astuce : appuyez sur <kbd>Échap</kbd> pour désélectionner la pièce active.
      </p>
    </div>
  )
}

const EXPLODE_PRESETS = [0, 0.4, 0.7, 1]

function ExplodedContent() {
  const explosionTarget = useAppStore((state) => state.explosionTarget)
  const setExplosion = useAppStore((state) => state.setExplosion)
  const selectComponent = useAppStore((state) => state.selectComponent)
  const percent = Math.round(explosionTarget * 100)

  return (
    <div className="panel-content exploded-content">
      <div className="large-panel-icon exploded-icon">
        <Layers size={26} />
      </div>
      <span className="overline">Anatomie de la structure</span>
      <h3>Une lecture en profondeur.</h3>
      <p>
        Les groupes réellement présents dans le fichier sont écartés depuis leur
        position d’origine. La vue reste réversible et chaque pièce revient exactement
        à sa place.
      </p>

      <div className="explode-readout">
        <div>
          <span className="panel-kicker">Écartement actuel</span>
          <strong>{percent}%</strong>
        </div>
        <Layers size={24} aria-hidden="true" />
      </div>

      <div className="explode-presets" aria-label="Préréglages de vue éclatée">
        {EXPLODE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={Math.abs(explosionTarget - preset) < 0.02 ? 'is-active' : ''}
            onClick={() => setExplosion(preset)}
          >
            {preset === 0 ? 'Assemblé' : `${Math.round(preset * 100)}%`}
          </button>
        ))}
      </div>

      <SectionTitle>Groupes mis en mouvement</SectionTitle>
      <ul className="explode-list">
        <li>Roues, jantes et disques</li>
        <li>Étriers fixes et porte-moyeux</li>
        <li>Portières et rétroviseurs</li>
        <li>Optiques avant et arrière</li>
        <li>Vitrage, cockpit et harnais</li>
        <li>Châssis Kevlar, radiateur et échappement</li>
      </ul>

      <div className="info-callout">
        <Info size={17} aria-hidden="true" />
        <div>
          <strong>Une vue fidèle à la hiérarchie</strong>
          <p>
            Certains organes internes ne sont pas modélisés. La vue éclatée ne crée donc
            pas de pièces fictives pour combler les manques.
          </p>
          <button type="button" className="inline-action" onClick={() => selectComponent('moteur')}>
            Comprendre le cas du moteur <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <p className="subtle-note">
        Le curseur complet se trouve dans la barre de contrôle, en bas de la scène.
      </p>
    </div>
  )
}

function PaintSelector() {
  const paintId = useAppStore((state) => state.paintId)
  const setPaint = useAppStore((state) => state.setPaint)

  return (
    <section className="config-section">
      <div className="config-section-head">
        <SectionTitle>Peinture de carrosserie</SectionTitle>
        <span className="config-value">
          {PAINTS.find((paint) => paint.id === paintId)?.name}
        </span>
      </div>
      <div className="swatch-grid swatch-grid-paint">
        {PAINTS.map((paint) => (
          <button
            key={paint.id}
            type="button"
            className={`paint-swatch ${paint.id === paintId ? 'is-active' : ''}`}
            onClick={() => setPaint(paint.id)}
            aria-pressed={paint.id === paintId}
          >
            <span
              className="paint-chip"
              style={{
                background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,.42), transparent 35%), ${paint.swatch}`,
              }}
            />
            <span>{paint.name}</span>
            {paint.id === paintId ? <Check size={12} className="swatch-check" /> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

function RimSelector() {
  const rimColourId = useAppStore((state) => state.rimColourId)
  const setRimColour = useAppStore((state) => state.setRimColour)
  const activeRim = RIM_COLOURS.find((rim) => rim.id === rimColourId)

  return (
    <section className="config-section">
      <div className="config-section-head">
        <SectionTitle>Finition des jantes</SectionTitle>
        <span className="config-value">{activeRim?.name}</span>
      </div>
      <div className="rim-row" role="group" aria-label="Couleur des jantes">
        {RIM_COLOURS.map((rim) => (
          <button
            key={rim.id}
            type="button"
            className={`rim-dot-button ${rim.id === rimColourId ? 'is-active' : ''}`}
            onClick={() => setRimColour(rim.id)}
            aria-label={rim.name}
            aria-pressed={rim.id === rimColourId}
            title={rim.name}
          >
            <span style={{ backgroundColor: rim.hex }} />
          </button>
        ))}
      </div>
    </section>
  )
}

function EnvironmentSelector() {
  const environmentId = useAppStore((state) => state.environmentId)
  const setEnvironment = useAppStore((state) => state.setEnvironment)

  return (
    <section className="config-section">
      <SectionTitle>Environnement lumineux</SectionTitle>
      <div className="environment-list">
        {ENVIRONMENTS.map((environment) => (
          <button
            key={environment.id}
            type="button"
            className={`environment-option ${environment.id === environmentId ? 'is-active' : ''}`}
            onClick={() => setEnvironment(environment.id)}
            aria-pressed={environment.id === environmentId}
          >
            <span
              className="environment-preview"
              style={{ backgroundImage: environment.gradient }}
            >
              <span
                className="environment-orb"
                style={{ backgroundColor: environment.accent }}
              />
            </span>
            <span className="environment-copy">
              <strong>{environment.name}</strong>
              <span>{environment.subtitle}</span>
            </span>
            {environment.id === environmentId ? (
              <Check size={14} className="environment-check" />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  )
}

function LightingControls() {
  const headlights = useAppStore((state) => state.headlights)
  const taillights = useAppStore((state) => state.taillights)
  const toggleHeadlights = useAppStore((state) => state.toggleHeadlights)
  const toggleTaillights = useAppStore((state) => state.toggleTaillights)

  return (
    <section className="config-section">
      <SectionTitle>Éclairage</SectionTitle>
      <div className="setting-list">
        <div className="setting-row">
          <span className="setting-icon">
            <Lightbulb size={17} />
          </span>
          <span className="setting-copy">
            <strong>Phares avant</strong>
            <small>Matériaux émissifs + deux projecteurs</small>
          </span>
          <Switch
            checked={headlights}
            onChange={toggleHeadlights}
            label="Activer les phares avant"
          />
        </div>
        <div className="setting-row">
          <span className="setting-icon">
            <LampCeiling size={17} />
          </span>
          <span className="setting-copy">
            <strong>Feux arrière</strong>
            <small>Signature rouge et feu de pluie</small>
          </span>
          <Switch
            checked={taillights}
            onChange={toggleTaillights}
            label="Activer les feux arrière"
          />
        </div>
      </div>
    </section>
  )
}

function ConfigContent() {
  const resetConfiguration = useAppStore((state) => state.resetConfiguration)

  return (
    <div className="panel-content config-content">
      <div className="config-intro">
        <span className="overline">
          <Settings2 size={13} /> Configuration
        </span>
        <h3>Composez votre spécification.</h3>
        <p>
          Les réglages modifient les matériaux, l’éclairage et l’environnement de la
          scène. La géométrie et les textures d’origine du modèle sont conservées.
        </p>
      </div>

      <PaintSelector />
      <RimSelector />
      <EnvironmentSelector />
      <LightingControls />

      <div className="config-footer-actions">
        <button type="button" className="secondary-button full-button" onClick={resetConfiguration}>
          <RotateCcw size={15} />
          Réinitialiser la configuration
        </button>
        <p className="subtle-note">
          La transparence de la carrosserie et les animations restent accessibles dans
          la barre de contrôle.
        </p>
      </div>
    </div>
  )
}

function ComponentDetails({ component }) {
  const clearSelection = useAppStore((state) => state.clearSelection)
  const focusComponent = useAppStore((state) => state.focusComponent)
  const transparency = useAppStore((state) => state.transparency)
  const toggleTransparency = useAppStore((state) => state.toggleTransparency)
  const modelStats = useAppStore((state) => state.modelStats)
  const category = CATEGORY_BY_ID[component.category]
  const componentStats = modelStats?.componentStats?.[component.id]
  const hasGeometry = component.available && (componentStats?.meshes ?? 0) > 0

  return (
    <div className="panel-content component-details" key={component.id}>
      <div className="component-eyebrow">
        <span>{category?.label}</span>
        <ChevronRight size={12} />
        <span>Fiche {component.id.toUpperCase()}</span>
      </div>

      <div className="component-title-row">
        <span className={`component-hero-icon ${component.available ? '' : 'is-info-only'}`}>
          <ComponentIcon name={component.icon} size={25} />
        </span>
        <div>
          <h3>{component.name}</h3>
          <p>{component.tagline}</p>
        </div>
      </div>

      <div className="component-badges">
        <AvailabilityBadge available={component.available} />
        {component.available && !hasGeometry ? (
          <span className="soft-badge">Géométrie non isolable</span>
        ) : null}
      </div>

      {!component.available ? (
        <div className="info-callout info-callout-warning">
          <TriangleAlert size={17} aria-hidden="true" />
          <div>
            <strong>Aucune géométrie dans ce GLB</strong>
            <p>
              Cette fiche est exclusivement pédagogique. AUTO3D ne fabrique pas de pièce
              et ne sélectionne aucun maillage pour ce composant.
            </p>
          </div>
        </div>
      ) : null}

      <p className="component-description">{component.description}</p>

      <div className="component-actions">
        {hasGeometry ? (
          <button
            type="button"
            className="primary-button compact-button"
            onClick={() => focusComponent(component.id)}
          >
            <Crosshair size={15} />
            Cadrer la pièce
          </button>
        ) : null}
        {hasGeometry && ['habitacle', 'sieges', 'volant', 'ecrans', 'arceau', 'harnais'].includes(component.id) ? (
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={toggleTransparency}
            aria-pressed={transparency}
          >
            <Eye size={15} />
            {transparency ? 'Masquer la transparence' : 'Voir par transparence'}
          </button>
        ) : null}
        {hasGeometry ? (
          <div className="component-metrics">
            <span>
              <strong>{formatNumber(componentStats.meshes)}</strong> maillages
            </span>
            <span>
              <strong>{formatNumber(componentStats.triangles)}</strong> triangles
            </span>
          </div>
        ) : null}
      </div>

      <div className="detail-block">
        <SectionTitle>Fonction</SectionTitle>
        <p>{component.function}</p>
      </div>

      <div className="detail-block">
        <SectionTitle>Emplacement</SectionTitle>
        <p className="location-line">
          <MapPin size={15} aria-hidden="true" />
          {component.location}
        </p>
      </div>

      {component.technical?.length ? (
        <div className="detail-block">
          <SectionTitle>Repères techniques</SectionTitle>
          <dl className="technical-list">
            {component.technical.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className={`geometry-note ${component.available ? '' : 'is-info-only'}`}>
        <SectionTitle>Dans le fichier 3D</SectionTitle>
        <p>{component.geometryNote}</p>
      </div>

      {component.didYouKnow ? (
        <div className="did-you-know">
          <Sparkles size={16} aria-hidden="true" />
          <div>
            <span>Le saviez-vous ?</span>
            <p>{component.didYouKnow}</p>
          </div>
        </div>
      ) : null}

      <div className="component-footer">
        <button type="button" className="text-button" onClick={clearSelection}>
          <ChevronRight size={13} className="rotate-180" />
          Revenir au panneau général
        </button>
      </div>
    </div>
  )
}

export function RightPanel() {
  const selectedId = useAppStore((state) => state.selectedId)
  const mode = useAppStore((state) => state.mode)
  const mobileRight = useAppStore((state) => state.mobileRight)
  const closeMobilePanels = useAppStore((state) => state.closeMobilePanels)
  const clearSelection = useAppStore((state) => state.clearSelection)
  const scrollRef = useRef(null)

  const selectedComponent = selectedId ? COMPONENT_BY_ID[selectedId] : null

  const heading = useMemo(() => {
    if (selectedComponent) {
      return {
        kicker: 'Détail du composant',
        title: 'Fiche technique',
      }
    }
    if (mode === 'config') return { kicker: 'Atelier', title: 'Configuration' }
    if (mode === 'exploded') return { kicker: 'Vue éclatée', title: 'Anatomie 3D' }
    if (mode === 'explore') return { kicker: 'Guide', title: 'Explorer' }
    return { kicker: 'Le projet', title: 'Vue d’ensemble' }
  }, [mode, selectedComponent])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedId, mode])

  return (
    <aside
      className={`sidebar sidebar-right ${mobileRight ? 'is-open' : ''}`}
      aria-label="Panneau d’informations et de configuration"
    >
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">{heading.kicker}</span>
          <h2>{heading.title}</h2>
        </div>
        <div className="panel-heading-actions">
          {selectedComponent ? (
            <button
              type="button"
              className="icon-button desktop-only"
              onClick={clearSelection}
              aria-label="Fermer la fiche du composant"
            >
              <X size={17} />
            </button>
          ) : null}
          <button
            type="button"
            className="icon-button mobile-only"
            onClick={closeMobilePanels}
            aria-label="Fermer le panneau"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="panel-scroll" ref={scrollRef}>
        {selectedComponent ? (
          <ComponentDetails component={selectedComponent} />
        ) : mode === 'config' ? (
          <ConfigContent />
        ) : mode === 'exploded' ? (
          <ExplodedContent />
        ) : mode === 'explore' ? (
          <ExploreContent />
        ) : (
          <OverviewContent />
        )}
      </div>

      <div className="panel-statusbar">
        <span className="status-dot" />
        <span>WebGL · temps réel</span>
        <span className="statusbar-spacer" />
        <Move3D size={13} />
        <span>Vue orbitale</span>
      </div>
    </aside>
  )
}
