import * as ecs from '@8thwall/ecs'
import {MODELS, OBJECT_PLACED_EVENT, SELECTION_CHANGED_EVENT} from './models'

export type PlacedInstance = {
  eid: any
  modelIndex: number
  rotationY: number
  scale: number
  paused: boolean
  clip: string
}

declare global {
  interface Window {
    _virtuar: {
      placed: PlacedInstance[]
      selectedEid: any
      placeMode: boolean
      world: any
      prefabEid: any
      groundEid: any
      currentModelIndex: number
      touchCount: number
    }
  }
}

window._virtuar = {
  placed: [],
  selectedEid: null,
  placeMode: true,
  world: null,
  prefabEid: null,
  groundEid: null,
  currentModelIndex: 0,
  touchCount: 0,
}

function getRecord(eid: any): PlacedInstance | undefined {
  return window._virtuar.placed.find((p) => p.eid === eid)
}

function walkToPlaced(world: any, startEid: any): any {
  if (startEid == null) return null
  const ids = new Set(window._virtuar.placed.map((p) => p.eid))
  let eid = startEid
  for (let i = 0; i < 12 && eid; i += 1) {
    if (ids.has(eid)) return eid
    try {
      eid = world.getParent(eid)
    } catch {
      return null
    }
  }
  return null
}

function meshEid(world: any, rootEid: any): any {
  try {
    const children = Array.from(world.getChildren(rootEid)) as any[]
    return children[0] ?? rootEid
  } catch {
    return rootEid
  }
}

export function applyModel(world: any, rootEid: any, modelIndex: number) {
  const model = MODELS[modelIndex]
  const child = meshEid(world, rootEid)
  const entity = world.getEntity(child)
  entity.set(ecs.GltfModel, {
    url: model.asset,
    animationClip: model.clip || '',
    loop: true,
    paused: false,
    timeScale: 1,
  })

  const lift = model.lift ?? 0
  try {
    entity.setLocalPosition({x: 0, y: lift, z: 0})
  } catch {
    world.setPosition(child, 0, lift, 0)
  }

  if (ecs.PositionAnimation?.has?.(world, child)) {
    ecs.PositionAnimation.mutate(world, child, (cursor) => {
      cursor.toY = lift
      cursor.fromY = lift - 3
    })
  }
}

export function setAnimationPaused(world: any, rootEid: any, paused: boolean) {
  const child = meshEid(world, rootEid)
  ecs.GltfModel.mutate(world, child, (cursor) => {
    cursor.paused = paused
  })
  const rec = getRecord(rootEid)
  if (rec) rec.paused = paused
}

export function setAnimationClip(world: any, rootEid: any, clip: string) {
  const child = meshEid(world, rootEid)
  ecs.GltfModel.mutate(world, child, (cursor) => {
    cursor.animationClip = clip
    cursor.paused = false
    cursor.loop = true
  })
  const rec = getRecord(rootEid)
  if (rec) {
    rec.paused = false
    rec.clip = clip
  }
}

export function selectPlaced(world: any, eid: any) {
  window._virtuar.selectedEid = eid
  window._virtuar.placeMode = !eid
  const target = window._virtuar.groundEid || eid
  if (target) world.events.dispatch(target, SELECTION_CHANGED_EVENT)
}

ecs.registerComponent({
  name: 'tap-to-place',
  schema: {
    prefab: 'eid' as const,
  },
  stateMachine: ({world, eid, schemaAttribute, defineState}) => {
    window._virtuar.world = world
    window._virtuar.prefabEid = schemaAttribute.get(eid).prefab
    window._virtuar.groundEid = eid

    defineState('initial').initial().listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, (e) => {
      if (window._virtuar.touchCount >= 2) return

      const hitPlaced = walkToPlaced(world, e.data.target)
      if (hitPlaced) {
        window._virtuar.selectedEid = hitPlaced
        window._virtuar.placeMode = false
        world.events.dispatch(eid, SELECTION_CHANGED_EVENT)
        return
      }

      if (!e.data.worldPosition) return

      const selected = window._virtuar.selectedEid && getRecord(window._virtuar.selectedEid)
      if (selected && !window._virtuar.placeMode) {
        try {
          const existing = world.getEntity(selected.eid)
          if (existing && !existing.isDeleted()) {
            existing.setLocalPosition(e.data.worldPosition)
            return
          }
        } catch {
          window._virtuar.selectedEid = null
        }
      }

      const prefab = schemaAttribute.get(eid).prefab
      const modelIndex = window._virtuar.currentModelIndex
      const model = MODELS[modelIndex]
      const newEid = world.createEntity(prefab)
      const newEntity = world.getEntity(newEid)
      newEntity.setLocalPosition(e.data.worldPosition)
      newEntity.set(ecs.Quaternion, ecs.math.quat.yRadians(0))
      const s = model.scale
      world.setScale(newEid, s, s, s)
      applyModel(world, newEid, modelIndex)

      window._virtuar.placed.push({
        eid: newEid,
        modelIndex,
        rotationY: 0,
        scale: s,
        paused: false,
        clip: model.clip || '',
      })
      window._virtuar.selectedEid = newEid
      window._virtuar.placeMode = false

      world.events.dispatch(eid, OBJECT_PLACED_EVENT)
      world.events.dispatch(eid, SELECTION_CHANGED_EVENT)
    })
  },
})

export {
  OBJECT_PLACED_EVENT,
  SELECTION_CHANGED_EVENT,
}
