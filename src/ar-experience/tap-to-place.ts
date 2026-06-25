import * as ecs from '@8thwall/ecs'

const OBJECT_PLACED_EVENT = 'object-placed'
const MODEL_CHANGED_EVENT = 'model-changed'

declare global {
  interface Window {
    _virtuar: {
      placedEid: any
      world: any
      prefabEid: any
      currentRotationY: number
      currentScale: number
      touchCount: number
    }
  }
}

window._virtuar = {
  placedEid: null,
  world: null,
  prefabEid: null,
  currentRotationY: 0,
  currentScale: 1,
  touchCount: 0,
}

ecs.registerComponent({
  name: 'tap-to-place',
  schema: {
    prefab: 'eid' as const,
  },
  stateMachine: ({world, eid, schemaAttribute, defineState}) => {
    window._virtuar.world = world
    window._virtuar.prefabEid = schemaAttribute.get(eid).prefab

    defineState('initial').initial().listen(eid, ecs.input.SCREEN_TOUCH_START, (e) => {
      if (window._virtuar.touchCount >= 2) {
        return
      }

      if (!e.data.worldPosition) {
        return
      }

      if (window._virtuar.placedEid) {
        try {
          const existing = world.getEntity(window._virtuar.placedEid)
          if (existing && !existing.isDeleted()) {
            existing.setLocalPosition(e.data.worldPosition)
            return
          }
        } catch {
          window._virtuar.placedEid = null
        }
      }

      const prefab = schemaAttribute.get(eid).prefab
      const newEid = world.createEntity(prefab)
      const newEntity = world.getEntity(newEid)
      newEntity.setLocalPosition(e.data.worldPosition)
      newEntity.set(ecs.Quaternion, ecs.math.quat.yRadians(0))

      window._virtuar.placedEid = newEid
      window._virtuar.currentRotationY = 0
      window._virtuar.currentScale = 1

      world.events.dispatch(eid, OBJECT_PLACED_EVENT)
    })
  },
})

export {
  OBJECT_PLACED_EVENT,
  MODEL_CHANGED_EVENT,
}
