import { create } from 'zustand'
import { DEFAULT_CONFIG, ENVIRONMENTS, PAINTS, RIM_COLOURS } from '../data/config'

const initialCamera = { preset: 'threeQuarter', nonce: 0 }

const getEnvironment = (id) =>
  ENVIRONMENTS.find((environment) => environment.id === id) ?? ENVIRONMENTS[0]

const getPaint = (id) => PAINTS.find((paint) => paint.id === id) ?? PAINTS[0]

const getRim = (id) => RIM_COLOURS.find((rim) => rim.id === id) ?? RIM_COLOURS[0]

export const useAppStore = create((set, get) => ({
  mode: 'overview',
  selectedId: null,
  hoveredId: null,
  componentFocusRequest: null,

  mobileLeft: false,
  mobileRight: false,

  assetError: null,

  camera: initialCamera,
  autoRotate: false,

  explosionTarget: 0,
  transparency: false,

  wheelSpin: false,
  driving: false,
  wheelSpeed: 1,
  doorsOpen: false,

  paintId: DEFAULT_CONFIG.paint,
  rimColourId: DEFAULT_CONFIG.rimColour,
  environmentId: DEFAULT_CONFIG.environment,
  headlights: DEFAULT_CONFIG.headlights,
  taillights: DEFAULT_CONFIG.taillights,

  modelReady: false,
  modelStats: null,

  setMode: (mode) => {
    const state = get()
    if (mode === state.mode) {
      set({ mobileRight: false })
      return
    }

    if (mode === 'overview') {
      set({
        mode,
        selectedId: null,
        explosionTarget: 0,
        transparency: false,
        driving: false,
        wheelSpin: false,
        doorsOpen: false,
        camera: { preset: 'threeQuarter', nonce: state.camera.nonce + 1 },
        componentFocusRequest: null,
        mobileLeft: false,
        mobileRight: false,
      })
      return
    }

    if (mode === 'explore') {
      set({
        mode,
        explosionTarget: 0,
        mobileLeft: false,
        mobileRight: false,
      })
      return
    }

    if (mode === 'exploded') {
      set({
        mode,
        explosionTarget: state.explosionTarget < 0.15 ? 0.62 : state.explosionTarget,
        selectedId: null,
        camera: { preset: 'threeQuarter', nonce: state.camera.nonce + 1 },
        mobileLeft: false,
        mobileRight: false,
      })
      return
    }

    if (mode === 'config') {
      set({
        mode,
        selectedId: null,
        explosionTarget: 0,
        mobileLeft: false,
        mobileRight: true,
      })
    }
  },

  selectComponent: (id) => {
    if (!id) {
      set({ selectedId: null })
      return
    }
    const state = get()
    set({
      selectedId: id,
      hoveredId: null,
      mode: state.mode === 'exploded' ? 'exploded' : 'explore',
      mobileLeft: false,
      mobileRight: true,
    })
  },

  clearSelection: () => set({ selectedId: null, mobileRight: false }),

  setHovered: (id) => {
    if (get().hoveredId !== id) set({ hoveredId: id })
  },

  requestCamera: (preset) =>
    set((state) => ({ camera: { preset, nonce: state.camera.nonce + 1 } })),

  focusComponent: (id) =>
    set((state) => ({
      componentFocusRequest: {
        id: id ?? state.selectedId,
        nonce: (state.componentFocusRequest?.nonce ?? 0) + 1,
      },
    })),

  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),

  setExplosion: (value) => {
    const explosionTarget = Math.max(0, Math.min(1, Number(value)))
    const state = get()
    const mode =
      explosionTarget > 0.01 && state.mode !== 'exploded'
        ? 'exploded'
        : explosionTarget === 0 && state.mode === 'exploded'
          ? 'explore'
          : state.mode
    set({ explosionTarget, mode })
  },

  toggleTransparency: () => set((state) => ({ transparency: !state.transparency })),

  toggleWheelSpin: () =>
    set((state) => ({ wheelSpin: !state.wheelSpin, driving: false })),

  toggleDriving: () => set((state) => ({ driving: !state.driving, wheelSpin: false })),

  setWheelSpeed: (speed) =>
    set({ wheelSpeed: Math.max(0.25, Math.min(3, Number(speed))) }),

  toggleDoors: () => set((state) => ({ doorsOpen: !state.doorsOpen })),

  setPaint: (paintId) => set({ paintId }),
  setRimColour: (rimColourId) => set({ rimColourId }),
  setEnvironment: (environmentId) => set({ environmentId }),
  toggleHeadlights: () => set((state) => ({ headlights: !state.headlights })),
  toggleTaillights: () => set((state) => ({ taillights: !state.taillights })),

  resetConfiguration: () =>
    set({
      paintId: DEFAULT_CONFIG.paint,
      rimColourId: DEFAULT_CONFIG.rimColour,
      environmentId: DEFAULT_CONFIG.environment,
      headlights: false,
      taillights: false,
      transparency: false,
    }),

  resetAll: () =>
    set((state) => ({
      mode: 'overview',
      selectedId: null,
      hoveredId: null,
      mobileLeft: false,
      mobileRight: false,
      camera: { preset: 'threeQuarter', nonce: state.camera.nonce + 1 },
      autoRotate: false,
      explosionTarget: 0,
      transparency: false,
      wheelSpin: false,
      driving: false,
      wheelSpeed: 1,
      doorsOpen: false,
      paintId: DEFAULT_CONFIG.paint,
      rimColourId: DEFAULT_CONFIG.rimColour,
      environmentId: DEFAULT_CONFIG.environment,
      headlights: false,
      taillights: false,
      componentFocusRequest: null,
    })),

  openMobileLeft: () => set({ mobileLeft: true, mobileRight: false }),
  openMobileRight: () => set({ mobileRight: true, mobileLeft: false }),
  closeMobilePanels: () => set({ mobileLeft: false, mobileRight: false }),

  setModelReady: (ready) => set({ modelReady: ready }),
  setModelStats: (stats) => set({ modelStats: stats }),
  setAssetError: (message) => set({ assetError: message, modelReady: false }),

  getPaintData: () => getPaint(get().paintId),
  getRimData: () => getRim(get().rimColourId),
  getEnvironmentData: () => getEnvironment(get().environmentId),
}))

export const usePaint = () => {
  const id = useAppStore((state) => state.paintId)
  return getPaint(id)
}

export const useRim = () => {
  const id = useAppStore((state) => state.rimColourId)
  return getRim(id)
}

export const useEnvironmentData = () => {
  const id = useAppStore((state) => state.environmentId)
  return getEnvironment(id)
}
