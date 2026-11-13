import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import modelUrl from '../source/porsche_992_gt3_r.glb?url'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import './style.css'

// ---------------------------------------------------------------------------
// Prototype minimal : un modèle, une lumière qui projette une ombre, un sol.
// Tout le reste (UI, composants, store) de l'application principale est ignoré.
// ---------------------------------------------------------------------------

const MODEL_URL = modelUrl
const TARGET_LENGTH = 4.77 // mètres, longueur réelle d'une 992 GT3 R
const SUN_RADIUS = 8.5
const SUN_HEIGHT = 8.2

const canvas = document.querySelector('#stage')
const loaderEl = document.querySelector('#loader')
const loaderBar = document.querySelector('#loader-bar')
const loaderPct = document.querySelector('#loader-pct')
const errorEl = document.querySelector('#error')

// ---------------------------------------------------------------- Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// ------------------------------------------------------------------- Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog('#0a0b0e', 18, 46)

const camera = new THREE.PerspectiveCamera(
  36,
  window.innerWidth / window.innerHeight,
  0.1,
  120,
)
camera.position.set(5.4, 2.35, 6.3)

const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.55, 0)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.minDistance = 3.2
controls.maxDistance = 20
controls.maxPolarAngle = Math.PI / 2 - 0.03
controls.autoRotate = true
controls.autoRotateSpeed = 0.8
canvas.addEventListener('contextmenu', (event) => event.preventDefault())

// Réflexions studio sans fichier HDR : RoomEnvironment passé dans un PMREM.
const pmrem = new THREE.PMREMGenerator(renderer)
const environmentScene = new RoomEnvironment()
scene.environment = pmrem.fromScene(environmentScene, 0.04).texture
scene.environmentIntensity = 0.65
environmentScene.dispose?.()
pmrem.dispose()

// ------------------------------------------------------------------- Sol
const floorMaterial = new THREE.MeshStandardMaterial({
  color: '#191c22',
  roughness: 0.82,
  metalness: 0.14,
})

const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 96), floorMaterial)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

const grid = new THREE.GridHelper(40, 40, '#343a45', '#22262e')
grid.material.transparent = true
grid.material.opacity = 0.32
grid.position.y = 0.002
scene.add(grid)

// ------------------------------------------------------------------ Lumières
const hemisphere = new THREE.HemisphereLight('#b9c9ea', '#0a0b0e', 0.5)
scene.add(hemisphere)

const sun = new THREE.DirectionalLight('#fff3e2', 3.1)
sun.position.set(-6, SUN_HEIGHT, 6)
sun.target.position.set(0, 0.5, 0)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.near = 0.5
sun.shadow.camera.far = 32
sun.shadow.camera.left = -7
sun.shadow.camera.right = 7
sun.shadow.camera.top = 7
sun.shadow.camera.bottom = -7
sun.shadow.bias = -0.0004
sun.shadow.normalBias = 0.025
scene.add(sun)
scene.add(sun.target)

// Contre-jour bleu + léger fill : donne du volume à la carrosserie.
const rim = new THREE.DirectionalLight('#5b8dff', 1.55)
rim.position.set(-6, 4.5, -7)
scene.add(rim)

const fill = new THREE.DirectionalLight('#ffffff', 0.45)
fill.position.set(-5, 2.4, 6)
scene.add(fill)

// Repères optionnels (trajectoire du soleil + frustum d'ombre).
const helpers = new THREE.Group()
helpers.visible = false
const lightHelper = new THREE.DirectionalLightHelper(sun, 1.5, '#ff2d3d')
const shadowHelper = new THREE.CameraHelper(sun.shadow.camera)
helpers.add(lightHelper, shadowHelper)
scene.add(helpers)

function setSunAngle(degrees) {
  const angle = THREE.MathUtils.degToRad(degrees)
  sun.position.set(Math.cos(angle) * SUN_RADIUS, SUN_HEIGHT, Math.sin(angle) * SUN_RADIUS)
  sun.shadow.camera.updateProjectionMatrix()
  lightHelper.update()
  shadowHelper.update()
}

setSunAngle(135)

// -------------------------------------------------------------------- Model
const modelRoot = new THREE.Group()
scene.add(modelRoot)

function objectPath(object) {
  const parts = []
  let cursor = object
  while (cursor) {
    if (cursor.name) parts.push(cursor.name)
    cursor = cursor.parent
  }
  return parts.reverse().join('/')
}

function prepareMaterials(root, maxAnisotropy) {
  const seen = new Set()
  root.traverse((object) => {
    if (!object.isMesh) return

    object.castShadow = true
    object.receiveShadow = true

    // Doubles "flous" exportés par Sketchfab : inutiles sur une scène fixe.
    if (/RIM_BLUR|RIM_STATIC/i.test(objectPath(object))) object.visible = false

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!material || seen.has(material.uuid)) continue
      seen.add(material.uuid)

      if ('envMapIntensity' in material) material.envMapIntensity = 1.15

      for (const value of Object.values(material)) {
        if (!value?.isTexture || seen.has(value.uuid)) continue
        seen.add(value.uuid)
        value.anisotropy = maxAnisotropy
        value.needsUpdate = true
      }
      material.needsUpdate = true
    }
  })
}

const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
const gltfLoader = new GLTFLoader()

gltfLoader.load(
  MODEL_URL,
  (gltf) => {
    const model = gltf.scene
    model.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = size.z > 1e-4 ? TARGET_LENGTH / size.z : 1

    // Centre X/Z et pose les roues sur y = 0, à l'échelle réelle (≈ 4,77 m).
    model.position.set(-center.x, -box.min.y, -center.z)

    const scaled = new THREE.Group()
    scaled.scale.setScalar(scale)
    scaled.add(model)
    modelRoot.add(scaled)

    prepareMaterials(model, maxAnisotropy)

    loaderEl.hidden = true
  },
  (event) => {
    let percent = 0
    if (event.total > 0) {
      percent = Math.round((event.loaded / event.total) * 100)
    } else {
      percent = Math.round((event.loaded / 36_628_708) * 100)
    }
    percent = THREE.MathUtils.clamp(percent, 0, 99)
    loaderBar.style.width = `${percent}%`
    loaderPct.textContent = `${percent} %`
  },
  (error) => {
    console.error('[prototype] Impossible de charger le modèle 3D.', error)
    loaderEl.hidden = true
    errorEl.hidden = false
  },
)

// ---------------------------------------------------------------------- UI
const sunAngleInput = document.querySelector('#sun-angle')
const sunAngleValue = document.querySelector('#sun-angle-value')
const shadowsToggle = document.querySelector('#toggle-shadows')
const rotateToggle = document.querySelector('#toggle-rotate')
const helpersToggle = document.querySelector('#toggle-helpers')

sunAngleInput.addEventListener('input', () => {
  const degrees = Number(sunAngleInput.value)
  sunAngleValue.textContent = `${degrees}°`
  setSunAngle(degrees)
})

shadowsToggle.addEventListener('change', () => {
  const enabled = shadowsToggle.checked
  sun.castShadow = enabled
  renderer.shadowMap.enabled = enabled
  floorMaterial.needsUpdate = true
})

rotateToggle.addEventListener('change', () => {
  controls.autoRotate = rotateToggle.checked
})

helpersToggle.addEventListener('change', () => {
  helpers.visible = helpersToggle.checked
})

// ------------------------------------------------------------------ Resize
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', resize)

// ------------------------------------------------------------------- Frame
renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})
