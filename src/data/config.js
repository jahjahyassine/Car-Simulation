export const PAINTS = [
  {
    id: 'silver',
    name: 'Argent GT',
    hex: '#b9bec6',
    swatch: '#b9bec6',
    metalness: 0.62,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  },
  {
    id: 'chalk',
    name: 'Craie',
    hex: '#d8d5ca',
    swatch: '#d8d5ca',
    metalness: 0.45,
    roughness: 0.36,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
  },
  {
    id: 'guards',
    name: 'Rouge Guards',
    hex: '#b41220',
    swatch: '#a9101c',
    metalness: 0.48,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  },
  {
    id: 'yellow',
    name: 'Jaune Racing',
    hex: '#e6b63a',
    swatch: '#e6b63a',
    metalness: 0.42,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  },
  {
    id: 'gulf',
    name: 'Bleu Gulf',
    hex: '#3f7a9c',
    swatch: '#3f7a9c',
    metalness: 0.55,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  },
  {
    id: 'jet',
    name: 'Noir Jet',
    hex: '#15171b',
    swatch: '#15171b',
    metalness: 0.7,
    roughness: 0.23,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  },
]

export const RIM_COLOURS = [
  { id: 'platinum', name: 'Platine', hex: '#b7bcc4', metalness: 0.88, roughness: 0.24 },
  { id: 'anthracite', name: 'Anthracite', hex: '#50565e', metalness: 0.85, roughness: 0.3 },
  { id: 'satin-black', name: 'Noir satiné', hex: '#202328', metalness: 0.72, roughness: 0.32 },
  { id: 'gold', name: 'Or champagne', hex: '#b48f56', metalness: 0.9, roughness: 0.24 },
  { id: 'race-red', name: 'Rouge course', hex: '#a2121f', metalness: 0.65, roughness: 0.28 },
]

export const ENVIRONMENTS = [
  {
    id: 'graphite',
    name: 'Studio Graphite',
    subtitle: 'Lumière froide · fond graphite',
    hdri: '/environments/studio-graphite.hdr',
    background: '#08090b',
    floor: '#171a20',
    fog: '#08090b',
    accent: '#dce6f5',
    fill: '#8aa0b8',
    rim: '#ff2d3f',
    envIntensity: 0.78,
    keyIntensity: 1.45,
    fillIntensity: 0.55,
    gradient: 'radial-gradient(circle at 52% 34%, #20242b 0%, #0d0f13 48%, #07080a 100%)',
  },
  {
    id: 'warm',
    name: 'Atelier Ambre',
    subtitle: 'Lumière chaude · atelier privé',
    hdri: '/environments/studio-warm.hdr',
    background: '#0c0907',
    floor: '#1b1510',
    fog: '#0c0907',
    accent: '#ffd6a6',
    fill: '#c28b54',
    rim: '#ff3a2f',
    envIntensity: 0.74,
    keyIntensity: 1.3,
    fillIntensity: 0.6,
    gradient: 'radial-gradient(circle at 52% 34%, #2a2118 0%, #120e0a 48%, #080605 100%)',
  },
  {
    id: 'night',
    name: 'Nuit Circuit',
    subtitle: 'Lumière lunaire · ambiance piste',
    hdri: '/environments/night-track.hdr',
    background: '#04070d',
    floor: '#0d1522',
    fog: '#04070d',
    accent: '#b8d4ff',
    fill: '#4c6d9d',
    rim: '#ff1b2d',
    envIntensity: 0.72,
    keyIntensity: 0.9,
    fillIntensity: 0.5,
    gradient: 'radial-gradient(circle at 50% 30%, #0c1a2c 0%, #060b14 46%, #030509 100%)',
  },
]

export const DEFAULT_CONFIG = {
  paint: 'silver',
  rimColour: 'platinum',
  environment: 'graphite',
  headlights: false,
  taillights: false,
}

export const CAMERA_PRESETS = [
  {
    id: 'front',
    label: 'Avant',
    title: 'Vue avant',
    position: [0, 1.5, 9.2],
    target: [0, 0.58, 0],
  },
  {
    id: 'rear',
    label: 'Arrière',
    title: 'Vue arrière',
    position: [0, 1.6, -9.2],
    target: [0, 0.58, 0],
  },
  {
    id: 'left',
    label: 'Gauche',
    title: 'Profil gauche',
    position: [9.1, 1.3, 0.02],
    target: [0, 0.56, 0],
  },
  {
    id: 'right',
    label: 'Droite',
    title: 'Profil droit',
    position: [-9.1, 1.3, 0.02],
    target: [0, 0.56, 0],
  },
  {
    id: 'top',
    label: 'Dessus',
    title: 'Vue de dessus',
    position: [0.02, 10.6, 0.28],
    target: [0, 0.4, 0],
  },
  {
    id: 'threeQuarter',
    label: '3/4',
    title: 'Vue trois-quarts',
    position: [4.85, 2.05, 5.65],
    target: [0, 0.52, 0],
  },
  {
    id: 'interior',
    label: 'Cockpit',
    title: 'Vue cockpit',
    position: [0.33, 0.98, 0.08],
    target: [0.02, 0.74, 2.2],
  },
]

export const HERO_CAMERA = {
  position: [5.2, 1.85, 5.5],
  target: [0, 0.5, 0],
}

export const CAMERA_BY_ID = Object.fromEntries(CAMERA_PRESETS.map((p) => [p.id, p]))

export const APP_MODES = [
  { id: 'overview', label: "Vue d'ensemble", short: 'Aperçu', index: '01' },
  { id: 'explore', label: 'Explorer', short: 'Explorer', index: '02' },
  { id: 'exploded', label: 'Vue éclatée', short: 'Éclaté', index: '03' },
  { id: 'config', label: 'Configuration', short: 'Config.', index: '04' },
]

export const QUALITY = {
  maxDpr: 1.75,
  shadowResolution: 512,
  reflectorResolution: 384,
}
