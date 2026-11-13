import { useMemo, useState } from 'react'
import { ChevronDown, Info, Search, X } from 'lucide-react'
import {
  COMPONENTS,
  COMPONENTS_BY_CATEGORY,
  CATEGORY_BY_ID,
} from '../../data/components'
import { useAppStore } from '../../store/useAppStore'
import { ComponentIcon } from '../common/ComponentIcon'

const NORMALIZE_MAP = {
  à: 'a', â: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', ë: 'e',
  î: 'i', ï: 'i', ô: 'o', ö: 'o', ù: 'u', û: 'u', ü: 'u',
  ç: 'c', œ: 'oe', æ: 'ae',
}

function normalise(value) {
  return value
    .toLowerCase()
    .replace(/[àâäéèêëîïôöùûüçœæ]/g, (character) => NORMALIZE_MAP[character] ?? character)
}

const initialOpenCategories = Object.fromEntries(
  COMPONENTS_BY_CATEGORY.map((category) => [category.id, true]),
)

export function LeftExplorer() {
  const [query, setQuery] = useState('')
  const [openCategories, setOpenCategories] = useState(initialOpenCategories)
  const selectedId = useAppStore((state) => state.selectedId)
  const hoveredId = useAppStore((state) => state.hoveredId)
  const selectComponent = useAppStore((state) => state.selectComponent)
  const setHovered = useAppStore((state) => state.setHovered)
  const closeMobilePanels = useAppStore((state) => state.closeMobilePanels)
  const mobileLeft = useAppStore((state) => state.mobileLeft)

  const availableCount = COMPONENTS.filter((component) => component.available).length
  const normalisedQuery = normalise(query.trim())

  const filteredGroups = useMemo(() => {
    if (!normalisedQuery) {
      return COMPONENTS_BY_CATEGORY.map((category) => ({
        ...category,
        components: category.components,
      }))
    }

    return COMPONENTS_BY_CATEGORY.map((category) => {
      const components = category.components.filter((component) => {
        const haystack = normalise(
          [
            component.name,
            component.tagline,
            component.description,
            component.keywords,
            CATEGORY_BY_ID[component.category]?.label ?? '',
          ].join(' '),
        )
        return haystack.includes(normalisedQuery)
      })
      return { ...category, components }
    }).filter((category) => category.components.length > 0)
  }, [normalisedQuery])

  const resultCount = filteredGroups.reduce(
    (total, category) => total + category.components.length,
    0,
  )

  const toggleCategory = (categoryId) => {
    setOpenCategories((current) => ({ ...current, [categoryId]: !current[categoryId] }))
  }

  const handleSelect = (component) => {
    selectComponent(component.id)
    setHovered(null)
  }

  return (
    <aside
      className={`sidebar sidebar-left ${mobileLeft ? 'is-open' : ''}`}
      aria-label="Explorateur de composants"
    >
      <div className="panel-heading explorer-heading">
        <div>
          <span className="panel-kicker">Explorateur</span>
          <h2>Composants</h2>
        </div>
        <button
          type="button"
          className="icon-button panel-close mobile-only"
          onClick={closeMobilePanels}
          aria-label="Fermer l’explorateur"
        >
          <X size={18} />
        </button>
      </div>

      <div className="explorer-summary">
        <span>{COMPONENTS.length} fiches</span>
        <span className="summary-dot" aria-hidden="true" />
        <span>{availableCount} avec géométrie</span>
      </div>

      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une pièce…"
          aria-label="Rechercher un composant"
          data-explorer-search
        />
        {query ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => setQuery('')}
            aria-label="Effacer la recherche"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="search-shortcut">/</kbd>
        )}
      </label>

      {normalisedQuery ? (
        <p className="search-result-count" aria-live="polite">
          {resultCount} résultat{resultCount > 1 ? 's' : ''} pour « {query.trim()} »
        </p>
      ) : null}

      <div className="explorer-scroll">
        {filteredGroups.length === 0 ? (
          <div className="explorer-empty">
            <Search size={22} />
            <p>Aucun composant ne correspond à cette recherche.</p>
            <button type="button" className="text-button" onClick={() => setQuery('')}>
              Effacer la recherche
            </button>
          </div>
        ) : (
          filteredGroups.map((category) => {
            const isOpen = normalisedQuery || openCategories[category.id]
            const contentId = `explorer-category-${category.id}`
            return (
              <section className="explorer-category" key={category.id}>
                <button
                  type="button"
                  className={`category-toggle ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className="category-title">
                    <ComponentIcon name={category.icon} size={15} />
                    <span>{category.label}</span>
                  </span>
                  <span className="category-count">
                    {category.components.length}
                    <ChevronDown size={14} aria-hidden="true" />
                  </span>
                </button>

                {isOpen ? (
                  <div className="category-items" id={contentId}>
                    {category.components.map((component) => {
                      const isSelected = component.id === selectedId
                      const isHovered = component.id === hoveredId
                      return (
                        <button
                          type="button"
                          key={component.id}
                          className={[
                            'explorer-item',
                            isSelected ? 'is-selected' : '',
                            isHovered ? 'is-hovered' : '',
                            !component.available ? 'is-unavailable' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => handleSelect(component)}
                          onMouseEnter={() => setHovered(component.id)}
                          onMouseLeave={() => setHovered(null)}
                          onFocus={() => setHovered(component.id)}
                          onBlur={() => setHovered(null)}
                          aria-current={isSelected ? 'true' : undefined}
                          aria-label={`${component.name}${component.available ? '' : ' — fiche pédagogique sans géométrie'}`}
                        >
                          <span className="explorer-icon">
                            <ComponentIcon name={component.icon} size={17} />
                          </span>
                          <span className="explorer-copy">
                            <span className="explorer-name">{component.name}</span>
                            <span className="explorer-tagline">{component.tagline}</span>
                          </span>
                          <span
                            className={`availability-dot ${component.available ? 'is-available' : 'is-info-only'}`}
                            title={
                              component.available
                                ? 'Géométrie présente dans le modèle'
                                : 'Fiche pédagogique : géométrie absente du modèle'
                            }
                          />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          })
        )}
      </div>

      <div className="explorer-note">
        <Info size={15} aria-hidden="true" />
        <p>
          Le point rouge signale une géométrie réelle. Les fiches sans géométrie sont
          pédagogiques et ne prétendent pas être présentes dans le GLB.
        </p>
      </div>
    </aside>
  )
}
