import * as THREE from 'three'
import {
  COMPONENTS,
  FALLBACK_COMPONENT,
  MATCHABLE_COMPONENTS,
} from '../data/components'
import { PAINTS, RIM_COLOURS } from '../data/config'

const HIGHLIGHT_COLOUR = new THREE.Color('#ff2d3d')
const HOVER_COLOUR = new THREE.Color('#ff6a70')

function buildPath(object) {
  const segments = []
  let cursor = object
  while (cursor) {
    if (cursor.name) segments.push(cursor.name)
    cursor = cursor.parent
  }
  return segments.reverse().join('/')
}

function matchesAny(patterns, path) {
  return patterns.some((pattern) => pattern.test(path))
}

function resolvePrimary(path) {
  for (const component of MATCHABLE_COMPONENTS) {
    if (matchesAny(component.patterns, path)) return component.id
  }
  return FALLBACK_COMPONENT
}

function triangleCount(geometry) {
  if (!geometry) return 0
  if (geometry.index) return geometry.index.count / 3
  return (geometry.attributes.position?.count ?? 0) / 3
}

function isRimDuplicate(path) {
  return /RIM_BLUR|RIM_STATIC/i.test(path)
}

function makeLocalBox(object) {
  object.updateWorldMatrix(true, true)
  const worldBox = new THREE.Box3().setFromObject(object)
  if (worldBox.isEmpty()) return worldBox
  const inverse = new THREE.Matrix4().copy(object.matrixWorld).invert()
  return worldBox.applyMatrix4(inverse)
}

/**
 * Replace the origin of `group`'s children with a pivot placed at `pivotPoint`.
 * The visual position at rest is unchanged; rotating the pivot then behaves
 * like a real hinge/axle instead of rotating around the world origin.
 */
function createPivot(group, pivotPoint, name) {
  const pivot = new THREE.Group()
  pivot.name = name
  pivot.position.copy(pivotPoint)

  const inverseTranslation = new THREE.Matrix4().makeTranslation(
    -pivotPoint.x,
    -pivotPoint.y,
    -pivotPoint.z,
  )

  for (const child of [...group.children]) {
    if (child.userData.isAuto3DOverlay) continue
    child.updateMatrix()
    child.matrix.premultiply(inverseTranslation)
    child.matrix.decompose(child.position, child.quaternion, child.scale)
    child.updateMatrix()
    pivot.add(child)
  }

  group.add(pivot)
  group.updateMatrixWorld(true)
  return pivot
}

function createMaterialClone(original, registry) {
  const name = original.name ?? ''
  let clone

  if (/Carpaint/i.test(name)) {
    clone = new THREE.MeshPhysicalMaterial()
    // The GLB paint is a MeshStandardMaterial. MeshPhysicalMaterial.copy()
    // expects physical-only fields (sheen, iridescence...) that the source
    // does not have, so copy the standard PBR fields explicitly first.
    THREE.MeshStandardMaterial.prototype.copy.call(clone, original)
    clone.clearcoat = 1
    clone.clearcoatRoughness = 0.06
    clone.clearcoatNormalMap = null
    clone.metalness = PAINTS[0].metalness
    clone.roughness = PAINTS[0].roughness
    clone.color = new THREE.Color(PAINTS[0].hex)
    clone.envMapIntensity = 1.05
    clone.transparent = false
    clone.depthWrite = true
    registry.paintMaterials.push(clone)
  } else {
    clone = original.clone()
  }

  clone.name = `${name || 'material'}__AUTO3D`
  clone.originalName = name

  if (!registry.paintMaterials.includes(clone)) {
    if (/^EXT_RIM/i.test(name) && !/BLUR/i.test(name)) {
      clone.color = new THREE.Color(RIM_COLOURS[0].hex)
      clone.metalness = RIM_COLOURS[0].metalness
      clone.roughness = RIM_COLOURS[0].roughness
      clone.envMapIntensity = 1.35
      clone.needsUpdate = true
      registry.rimMaterials.push(clone)
    } else if (/TYRE|Tyre/i.test(name)) {
      clone.metalness = 0
      clone.roughness = 0.84
      clone.envMapIntensity = 0.35
      clone.needsUpdate = true
    } else if (/DISC/i.test(name)) {
      clone.metalness = 0.78
      clone.roughness = 0.3
      clone.envMapIntensity = 1.15
      clone.needsUpdate = true
    } else if (/CALIPER/i.test(name)) {
      clone.color = new THREE.Color('#9d121d')
      clone.metalness = 0.28
      clone.roughness = 0.36
      clone.envMapIntensity = 0.85
      clone.needsUpdate = true
    } else if (/GLASS|WINDOW|WINDSHIELD/i.test(name)) {
      clone.metalness = 0.18
      clone.roughness = Math.min(clone.roughness ?? 0.1, 0.09)
      clone.envMapIntensity = 1.3
      clone.needsUpdate = true
    } else if (/MIRROR/i.test(name)) {
      clone.metalness = 0.96
      clone.roughness = 0.08
      clone.envMapIntensity = 1.1
      clone.needsUpdate = true
    } else if (/CARBON/i.test(name)) {
      clone.metalness = 0.2
      clone.roughness = Math.min(clone.roughness ?? 0.5, 0.44)
      clone.envMapIntensity = 0.9
      clone.needsUpdate = true
    } else if (/EXALST|EXHAUST|CHASSIS_KEVLAR|RADIATOR|METAL/i.test(name)) {
      clone.metalness = 0.72
      clone.roughness = Math.min(clone.roughness ?? 0.5, 0.38)
      clone.envMapIntensity = 1.05
      clone.needsUpdate = true
    } else if (/SEAT|SPARCO|ALCANTARA|DASH|PLASTIC|NET|BELT|INT_/i.test(name)) {
      clone.metalness = 0.02
      clone.roughness = Math.max(clone.roughness ?? 0.8, 0.78)
      clone.needsUpdate = true
    }

    if (/Emissive_Light|Glass_Emissive|AUX_LIGHT/i.test(name)) {
      clone.emissiveMap = clone.map
      clone.emissive = new THREE.Color(0xffffff)
      clone.emissiveIntensity = 0
      clone.needsUpdate = true
      if (/Front/i.test(name) && !/Rear/i.test(name)) {
        registry.frontLightMaterials.push(clone)
      } else if (/Rear/i.test(name)) {
        registry.rearLightMaterials.push(clone)
      }
    }
  }

  clone.userData.auto3dBase = {
    color: clone.color ? clone.color.getHex() : 0xffffff,
    opacity: clone.opacity,
    transparent: clone.transparent,
    depthWrite: clone.depthWrite,
    metalness: clone.metalness,
    roughness: clone.roughness,
    clearcoat: clone.clearcoat,
    clearcoatRoughness: clone.clearcoatRoughness,
    emissiveIntensity: clone.emissiveIntensity,
  }

  registry.materialClones.push(clone)
  return clone
}

function collectMaterialTextures(material, textures) {
  if (!material) return
  for (const value of Object.values(material)) {
    if (value?.isTexture) textures.add(value.uuid)
  }
}

export function buildModelRegistry(scene) {
  scene.updateMatrixWorld(true)

  const registry = {
    scene,
    records: [],
    meshesById: new Map(),
    componentStats: {},
    paintMaterials: [],
    rimMaterials: [],
    frontLightMaterials: [],
    rearLightMaterials: [],
    materialClones: [],
    wheelPivots: [],
    discPivots: [],
    doorPivots: [],
    explodeEntries: [],
    selectionOverlays: [],
    hoverOverlays: [],
    selectionMaterial: new THREE.MeshBasicMaterial({
      color: HIGHLIGHT_COLOUR,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
    hoverMaterial: new THREE.MeshBasicMaterial({
      color: HOVER_COLOUR,
      transparent: true,
      opacity: 0.085,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    modelStats: null,
    dispose: null,
  }

  // -------------------------------------------------------------------------
  // 1. Mesh audit, component resolution and safe material cloning
  // -------------------------------------------------------------------------
  const originalMeshes = []
  scene.traverse((object) => {
    if (object.isMesh && !object.userData.isAuto3DOverlay) originalMeshes.push(object)
  })

  const uniqueMaterials = new Set()
  const uniqueTextures = new Set()
  let totalTriangles = 0

  const materialCache = new Map()
  for (const mesh of originalMeshes) {
    const path = buildPath(mesh)
    const primary = resolvePrimary(path)
    const duplicate = isRimDuplicate(path)
    const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

    for (const original of originals) {
      if (!original) continue
      uniqueMaterials.add(original.uuid)
      collectMaterialTextures(original, uniqueTextures)
      if (!materialCache.has(original.uuid)) {
        materialCache.set(original.uuid, createMaterialClone(original, registry))
      }
    }

    const cloned = Array.isArray(mesh.material)
      ? mesh.material.map((material) => materialCache.get(material.uuid))
      : materialCache.get(mesh.material?.uuid)

    mesh.userData.auto3dOriginalMaterial = mesh.material
    mesh.material = cloned
    mesh.userData.auto3dPrimary = primary
    mesh.userData.auto3dPath = path
    mesh.userData.auto3dDuplicate = duplicate
    mesh.castShadow = true
    mesh.receiveShadow = true
    if (duplicate) mesh.visible = false

    const record = {
      mesh,
      path,
      primary,
      duplicate,
      triangles: triangleCount(mesh.geometry),
    }
    registry.records.push(record)
    if (!duplicate) totalTriangles += record.triangles
  }

  let nodeCount = 0
  scene.traverse(() => {
    nodeCount += 1
  })

  registry.modelStats = {
    nodes: nodeCount,
    meshes: originalMeshes.length,
    materials: uniqueMaterials.size,
    textures: uniqueTextures.size,
    triangles: Math.round(totalTriangles),
    wheels: 4,
    dimensions: null,
  }

  // -------------------------------------------------------------------------
  // 2. Logical mesh collections per educational component
  // -------------------------------------------------------------------------
  for (const component of COMPONENTS) {
    let selected
    if (component.id === FALLBACK_COMPONENT) {
      selected = registry.records.filter((record) => record.primary === component.id && !record.duplicate)
    } else {
      const patterns = component.highlightPatterns ?? component.patterns
      selected = registry.records.filter(
        (record) => !record.duplicate && patterns.length > 0 && matchesAny(patterns, record.path),
      )
    }
    registry.meshesById.set(component.id, selected.map((record) => record.mesh))
    registry.componentStats[component.id] = {
      meshes: selected.length,
      triangles: Math.round(selected.reduce((sum, record) => sum + record.triangles, 0)),
    }
  }

  // -------------------------------------------------------------------------
  // 3. Kinematic pivots: wheels spin on their own axle, doors on their hinge
  // -------------------------------------------------------------------------
  for (const side of ['LF', 'LR', 'RF', 'RR']) {
    const wheelGroup = scene.getObjectByName(`WHEEL_${side}`)
    if (!wheelGroup) continue
    const wheelBox = makeLocalBox(wheelGroup)
    if (wheelBox.isEmpty()) continue
    const center = wheelBox.getCenter(new THREE.Vector3())
    const pivot = createPivot(wheelGroup, center, `AUTO3D_WHEEL_PIVOT_${side}`)
    registry.wheelPivots.push({ side, group: wheelGroup, pivot, rotation: 0 })

    // Brake discs are parented separately from the wheel in this export.
    // They rotate with the wheel; the calipers (SUSP_*) deliberately do not.
    const discGroup = scene.getObjectByName(`DISC_${side}`)
    if (!discGroup) continue
    const discBox = makeLocalBox(discGroup)
    if (discBox.isEmpty()) continue
    const discPivot = createPivot(
      discGroup,
      discBox.getCenter(new THREE.Vector3()),
      `AUTO3D_DISC_PIVOT_${side}`,
    )
    registry.discPivots.push({ side, group: discGroup, pivot: discPivot })
  }

  for (const [side, sign] of [
    ['L', 1],
    ['R', -1],
  ]) {
    const doorGroup = scene.getObjectByName(`DOOR_${side}`)
    if (!doorGroup) continue
    const box = makeLocalBox(doorGroup)
    if (box.isEmpty()) continue
    const center = box.getCenter(new THREE.Vector3())
    const hinge = new THREE.Vector3(
      sign > 0 ? box.max.x - 0.07 : box.min.x + 0.07,
      center.y,
      box.max.z - 0.04,
    )
    const pivot = createPivot(doorGroup, hinge, `AUTO3D_DOOR_PIVOT_${side}`)
    registry.doorPivots.push({
      side,
      sign,
      group: doorGroup,
      pivot,
      openAngle: sign > 0 ? -1.13 : 1.13,
    })
  }

  // -------------------------------------------------------------------------
  // 4. Exploded-view registry
  // -------------------------------------------------------------------------
  const bodyVectors = [
    { test: /SUB6/i, vector: [0, 0.95, 0], label: 'Vitrage extérieur' },
    { test: /SUB7|SUB9|ST_FRONT|^L0$|^L1$/i, vector: [0, 0.22, 0.52], label: 'Optiques avant' },
    {
      test: /SUB8|SUB10|ST_REAR|RAIN_LIGHTS|^B0$/i,
      vector: [0, 0.22, -0.52],
      label: 'Optiques arrière',
    },
    { test: /CHASSIS_RADIATOR|RADIATOR/i, vector: [0, -0.02, 0.42], label: 'Radiateur' },
    { test: /CHASSIS_KEVLAR/i, vector: [0, 0.02, 0], label: 'Châssis' },
    { test: /EXALST|EXHAUST/i, vector: [0, -0.1, -0.42], label: 'Échappement' },
    { test: /SUB0|SUB1|SUB2|SUB3|SUB5/i, vector: [0, 0.62, 0], label: 'Carrosserie' },
  ]

  const addEntry = (node, vector, label) => {
    if (!node) return
    registry.explodeEntries.push({
      node,
      vector: new THREE.Vector3(...vector),
      base: node.position.clone(),
      label,
    })
  }

  const carCenter = new THREE.Box3().setFromObject(scene).getCenter(new THREE.Vector3())

  for (const side of ['LF', 'LR', 'RF', 'RR']) {
    const sign = side.includes('L') ? 1 : -1
    const wheel = scene.getObjectByName(`WHEEL_${side}`)
    addEntry(wheel, [sign * 1.42, 0.035, 0], `Roue ${side}`)
    const disc = scene.getObjectByName(`DISC_${side}`)
    addEntry(disc, [sign * 0.5, 0.04, 0], `Disque ${side}`)
    const caliper = scene.getObjectByName(`SUSP_${side}`)
    addEntry(caliper, [sign * 0.96, 0.055, 0], `Étrier ${side}`)
  }

  for (const side of ['L', 'R']) {
    const sign = side === 'L' ? 1 : -1
    addEntry(scene.getObjectByName(`DOOR_${side}`), [sign * 1.15, 0.36, 0.08], `Portière ${side}`)
  }

  const mainBody = scene.getObjectByName('MAIN_BODY')
  if (mainBody) {
    for (const child of mainBody.children) {
      const entry = bodyVectors.find((candidate) => candidate.test.test(child.name))
      const vector = entry?.vector ?? [0, 0.48, 0]
      addEntry(child, vector, entry?.label ?? 'Détail de carrosserie')
    }
  }

  addEntry(scene.getObjectByName('COCKPIT_HR'), [0, 0.28, 0], 'Habitacle')
  addEntry(scene.getObjectByName('CINTURE_ON'), [0, 0.28, 0], 'Harnais')
  addEntry(scene.getObjectByName('WIPER'), [0, 0.62, 0], 'Essuie-glace')

  // Sanity check: make sure no entry receives two independent offsets.
  const entryNodes = new Set()
  registry.explodeEntries = registry.explodeEntries.filter((entry) => {
    if (entryNodes.has(entry.node)) return false
    entryNodes.add(entry.node)
    return true
  })

  // -------------------------------------------------------------------------
  // 5. Model dimensions (for the overview panel)
  // -------------------------------------------------------------------------
  const worldBox = new THREE.Box3().setFromObject(scene)
  const worldSize = worldBox.getSize(new THREE.Vector3())
  registry.modelStats.dimensions = {
    x: worldSize.x,
    y: worldSize.y,
    z: worldSize.z,
    center: worldBox.getCenter(new THREE.Vector3()),
    minY: worldBox.min.y,
  }
  registry.carCenter = carCenter

  // -------------------------------------------------------------------------
  // 6. Overlay helpers and disposer
  // -------------------------------------------------------------------------
  const removeOverlays = (array) => {
    for (const overlay of array) {
      if (overlay.parent) overlay.parent.remove(overlay)
    }
    array.length = 0
  }

  const addOverlays = (componentId, material, targetArray) => {
    removeOverlays(targetArray)
    if (!componentId) return
    const meshes = registry.meshesById.get(componentId) ?? []
    for (const mesh of meshes) {
      if (!mesh.isMesh || !mesh.visible || mesh.userData.isAuto3DOverlay) continue
      const overlay = new THREE.Mesh(mesh.geometry, material)
      overlay.name = `AUTO3D_HIGHLIGHT_${componentId}`
      overlay.userData.isAuto3DOverlay = true
      overlay.raycast = () => {}
      overlay.frustumCulled = false
      overlay.renderOrder = 6
      overlay.matrixAutoUpdate = false
      mesh.add(overlay)
      targetArray.push(overlay)
    }
  }

  registry.setSelection = (componentId) => addOverlays(componentId, registry.selectionMaterial, registry.selectionOverlays)
  registry.setHover = (componentId) => {
    if (componentId && componentId === registry.currentSelection) {
      removeOverlays(registry.hoverOverlays)
      return
    }
    addOverlays(componentId, registry.hoverMaterial, registry.hoverOverlays)
  }
  registry.setCurrentSelection = (componentId) => {
    registry.currentSelection = componentId
  }

  registry.getComponentWorldBox = (componentId) => {
    const meshes = registry.meshesById.get(componentId) ?? []
    const box = new THREE.Box3()
    for (const mesh of meshes) {
      if (!mesh.visible) continue
      mesh.updateWorldMatrix(true, false)
      const geometryBox = mesh.geometry.boundingBox ?? (mesh.geometry.computeBoundingBox(), mesh.geometry.boundingBox)
      if (!geometryBox) continue
      const meshBox = geometryBox.clone().applyMatrix4(mesh.matrixWorld)
      box.union(meshBox)
    }
    return box
  }

  registry.dispose = () => {
    removeOverlays(registry.selectionOverlays)
    removeOverlays(registry.hoverOverlays)
    registry.selectionMaterial.dispose()
    registry.hoverMaterial.dispose()
    for (const mesh of originalMeshes) {
      const original = mesh.userData.auto3dOriginalMaterial
      if (original) mesh.material = original
    }
    for (const material of registry.materialClones) material.dispose()
    registry.materialClones.length = 0
  }

  return registry
}

export function updatePaint(registry, paint) {
  if (!registry) return
  for (const material of registry.paintMaterials) {
    material.color.set(paint.hex)
    material.metalness = paint.metalness
    material.roughness = paint.roughness
    material.clearcoat = paint.clearcoat
    material.clearcoatRoughness = paint.clearcoatRoughness
    material.needsUpdate = true
  }
}

export function updateRimColour(registry, rim) {
  if (!registry) return
  for (const material of registry.rimMaterials) {
    material.color.set(rim.hex)
    material.metalness = rim.metalness
    material.roughness = rim.roughness
    material.needsUpdate = true
  }
}

export function updateTransparency(registry, enabled) {
  if (!registry) return
  for (const material of registry.paintMaterials) {
    const base = material.userData.auto3dBase
    if (enabled) {
      material.transparent = true
      material.opacity = 0.16
      material.depthWrite = false
      material.needsUpdate = true
    } else if (base) {
      material.transparent = base.transparent
      material.opacity = base.opacity
      material.depthWrite = base.depthWrite
      material.needsUpdate = true
    }
  }
}

export function updateLightMaterials(registry, { headlights, taillights }) {
  if (!registry) return
  for (const material of registry.frontLightMaterials) {
    const on = headlights
    material.emissive.set(on ? '#eaf4ff' : '#000000')
    material.emissiveIntensity = on ? 2.4 : 0
    material.needsUpdate = true
  }
  for (const material of registry.rearLightMaterials) {
    const on = taillights
    material.emissive.set(on ? '#ff1628' : '#000000')
    material.emissiveIntensity = on ? 2.2 : 0
    material.needsUpdate = true
  }
}

export function applyExplosion(registry, amount) {
  if (!registry) return
  for (const entry of registry.explodeEntries) {
    entry.node.position.copy(entry.base).addScaledVector(entry.vector, amount)
  }
}

export function spinWheels(registry, angle) {
  if (!registry) return
  for (const wheel of registry.wheelPivots) {
    wheel.pivot.rotation.x = angle
  }
  for (const disc of registry.discPivots) {
    disc.pivot.rotation.x = angle
  }
}
