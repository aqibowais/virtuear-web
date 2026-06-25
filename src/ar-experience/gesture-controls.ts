import * as ecs from '@8thwall/ecs'

const MIN_SCALE = 0.3
const MAX_SCALE = 3.0

function getAngle(t1: Touch, t2: Touch): number {
  return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX)
}

function getDist(t1: Touch, t2: Touch): number {
  const dx = t2.clientX - t1.clientX
  const dy = t2.clientY - t1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

ecs.registerComponent({
  name: 'gesture-controls',
  stateMachine: ({world, defineState}) => {
    defineState('initial').initial().onEvent(ecs.events.REALITY_READY, 'active', {
      target: world.events.globalId,
    })

    defineState('active').onEnter(() => {
      let prevAngle: number | null = null
      let prevDist: number | null = null

      const onTouchStart = (e: TouchEvent) => {
        window._virtuar.touchCount = e.touches.length
        if (e.touches.length === 2) {
          prevAngle = getAngle(e.touches[0], e.touches[1])
          prevDist = getDist(e.touches[0], e.touches[1])
        }
      }

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 2) return
        const placedEid = window._virtuar.placedEid
        if (!placedEid) return

        try {
          const t0 = e.touches[0]
          const t1 = e.touches[1]
          const angle = getAngle(t0, t1)
          const dist = getDist(t0, t1)

          if (prevAngle !== null) {
            const deltaAngle = angle - prevAngle
            window._virtuar.currentRotationY += deltaAngle
            const rotQuat = ecs.math.quat.yRadians(window._virtuar.currentRotationY)
            world.setQuaternion(placedEid, rotQuat.x, rotQuat.y, rotQuat.z, rotQuat.w)
          }

          if (prevDist !== null && prevDist > 0) {
            const scaleFactor = dist / prevDist
            let newScale = window._virtuar.currentScale * scaleFactor
            newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
            window._virtuar.currentScale = newScale
            world.setScale(placedEid, newScale, newScale, newScale)
          }

          prevAngle = angle
          prevDist = dist
          e.preventDefault()
        } catch {
          // Entity may have been deleted
        }
      }

      const onTouchEnd = (e: TouchEvent) => {
        window._virtuar.touchCount = e.touches.length
        if (e.touches.length < 2) {
          prevAngle = null
          prevDist = null
        }
      }

      document.addEventListener('touchstart', onTouchStart, {passive: false})
      document.addEventListener('touchmove', onTouchMove, {passive: false})
      document.addEventListener('touchend', onTouchEnd, {passive: false})
    })
  },
})
