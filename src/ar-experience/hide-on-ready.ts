import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'hide-on-ready',
  stateMachine: ({world, eid, defineState}) => {
    defineState('initial').initial().onEvent(ecs.events.REALITY_READY, 'ready', {
      target: world.events.globalId,
    })

    defineState('ready').onEnter(() => {
      const entity = world.getEntity(eid)
      entity.hide()
      entity.disable()
      const loading = document.getElementById('ar-loading')
      if (loading) loading.remove()
    })
  },
})
