import * as ecs from '@8thwall/ecs'
import {Logo} from './logo'
import {OBJECT_PLACED_EVENT} from './tap-to-place'

const logoQuery = ecs.defineQuery([Logo])

const MODELS = [
  {name: 'Mecha Robot', asset: 'assets/mecha_robot.glb'},
  {name: 'Another Robot', asset: 'assets/robot_character.glb'},
  {name: 'Brain Mech', asset: 'assets/brain_stem.glb'},
  {name: 'Ion Drive', asset: 'assets/ion_drive.glb'},
  {name: 'Cyber Fox', asset: 'assets/cyber_fox.glb'},
  {name: 'Aerial Mech', asset: 'assets/aerial_mech.glb'},
]

let currentModelIndex = 0
let hintEl: HTMLElement | null = null
let trashBtn: HTMLElement | null = null

function buildUI(world: any, groundEid: any) {
  const container = document.createElement('div')
  container.id = 'ar-overlay'
  container.style.cssText = `
    position:fixed; inset:0; z-index:9999; pointer-events:none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `

  // ─── Top Bar ───
  const topBar = document.createElement('div')
  topBar.style.cssText = `
    position:absolute; top:0; left:0; right:0;
    display:flex; align-items:center; justify-content:space-between;
    padding: 50px 16px 12px 16px;
    background: linear-gradient(to bottom, rgba(10,14,20,0.7) 0%, transparent 100%);
    pointer-events:auto;
  `

  // Back button
  const backBtn = document.createElement('button')
  backBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`
  backBtn.style.cssText = `
    width:44px; height:44px; border-radius:14px;
    background:rgba(18,22,30,0.85); border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  `
  backBtn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  backBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    window.location.href = '/'
  })

  // Title
  const title = document.createElement('span')
  title.textContent = 'Virtuar'
  title.style.cssText = `
    color:white; font-size:17px; font-weight:700; letter-spacing:0.8px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  `

  // Trash button
  trashBtn = document.createElement('button')
  trashBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
  trashBtn.style.cssText = `
    width:44px; height:44px; border-radius:14px;
    background:rgba(255,77,106,0.15); border:1px solid rgba(255,77,106,0.3);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    opacity:0; pointer-events:none; transition: opacity 0.25s ease;
  `
  trashBtn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  trashBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    deleteCurrentModel(world, groundEid)
  })

  topBar.appendChild(backBtn)
  topBar.appendChild(title)
  topBar.appendChild(trashBtn)

  // ─── Hint Text ───
  hintEl = document.createElement('div')
  hintEl.style.cssText = `
    position:absolute; top:120px; left:0; right:0;
    display:flex; justify-content:center; pointer-events:none;
  `
  const hintBadge = document.createElement('div')
  hintBadge.id = 'ar-hint'
  hintBadge.textContent = 'Tap a surface to place robot'
  hintBadge.style.cssText = `
    padding: 8px 20px; border-radius:12px;
    background:rgba(255,107,26,0.12); border:1px solid rgba(255,107,26,0.25);
    color:#FF6B1A; font-size:14px; font-weight:500;
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    transition: opacity 0.3s ease;
  `
  hintEl.appendChild(hintBadge)

  // ─── Bottom: Model Dock ───
  const bottomArea = document.createElement('div')
  bottomArea.style.cssText = `
    position:absolute; bottom:0; left:0; right:0;
    padding: 0 0 32px 0; pointer-events:auto;
    background: linear-gradient(to top, rgba(10,14,20,0.7) 0%, transparent 100%);
  `

  // Scale hint
  const gestureHint = document.createElement('div')
  gestureHint.style.cssText = `
    text-align:center; padding: 10px 0 8px 0;
    color:rgba(255,255,255,0.5); font-size:11px;
  `
  gestureHint.textContent = 'Pinch to resize · Two fingers to rotate'

  // Model strip
  const strip = document.createElement('div')
  strip.style.cssText = `
    display:flex; gap:8px; padding:10px 16px;
    overflow-x:auto; -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
  `

  MODELS.forEach((model, i) => {
    const chip = document.createElement('button')
    chip.textContent = model.name
    chip.dataset.idx = String(i)
    chip.style.cssText = chipStyle(i === currentModelIndex)

    chip.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
    chip.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      selectModel(i, strip, world, groundEid)
    })
    strip.appendChild(chip)
  })

  bottomArea.appendChild(gestureHint)
  bottomArea.appendChild(strip)

  container.appendChild(topBar)
  container.appendChild(hintEl)
  container.appendChild(bottomArea)
  document.body.appendChild(container)
}

function chipStyle(active: boolean): string {
  return `
    padding:10px 18px; border-radius:12px; border:none; white-space:nowrap;
    font-size:13px; font-weight:600; cursor:pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: all 0.2s ease; flex-shrink:0;
    ${active
      ? 'background:#FF6B1A; color:#fff; box-shadow:0 0 16px rgba(255,107,26,0.4);'
      : 'background:rgba(18,22,30,0.85); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.08);'
    }
  `
}

function selectModel(idx: number, strip: HTMLElement, world: any, groundEid: any) {
  if (idx === currentModelIndex && !window._virtuar.placedEid) return
  currentModelIndex = idx
  updateChips(strip)

  const placedEid = window._virtuar.placedEid
  if (!placedEid) return

  try {
    const pos = world.transform.getLocalPosition(placedEid)
    logoQuery(world).forEach((e: any) => world.deleteEntity(e))
    window._virtuar.placedEid = null

    const prefab = window._virtuar.prefabEid
    const newEid = world.createEntity(prefab)
    const newEntity = world.getEntity(newEid)
    newEntity.setLocalPosition(pos)

    const rotQuat = ecs.math.quat.yRadians(window._virtuar.currentRotationY)
    world.setQuaternion(newEid, rotQuat.x, rotQuat.y, rotQuat.z, rotQuat.w)
    const s = window._virtuar.currentScale
    world.setScale(newEid, s, s, s)

    const children = Array.from(world.getChildren(newEid)) as any[]
    if (children.length > 0) {
      const modelEntity = world.getEntity(children[0])
      modelEntity.set(ecs.GltfModel, {url: MODELS[idx].asset})
    }

    window._virtuar.placedEid = newEid
    updateHint(true)
    showTrash(true)
  } catch (err) {
    console.warn('Model switch error:', err)
  }
}

function updateChips(strip: HTMLElement) {
  strip.querySelectorAll('button').forEach((chip, i) => {
    chip.style.cssText = chipStyle(i === currentModelIndex)
  })
}

function deleteCurrentModel(world: any, groundEid: any) {
  logoQuery(world).forEach((e: any) => world.deleteEntity(e))
  window._virtuar.placedEid = null
  window._virtuar.currentRotationY = 0
  window._virtuar.currentScale = 1
  updateHint(false)
  showTrash(false)
}

function updateHint(placed: boolean) {
  const badge = document.getElementById('ar-hint')
  if (badge) {
    badge.textContent = placed ? 'Tap to move · Select model below' : 'Tap a surface to place robot'
  }
}

function showTrash(visible: boolean) {
  if (trashBtn) {
    trashBtn.style.opacity = visible ? '1' : '0'
    trashBtn.style.pointerEvents = visible ? 'auto' : 'none'
  }
}

ecs.registerComponent({
  name: 'ar-ui',
  stateMachine: ({world, eid, defineState}) => {
    defineState('initial').initial().onEvent(ecs.events.REALITY_READY, 'active', {
      target: world.events.globalId,
    })

    defineState('active')
      .onEnter(() => {
        buildUI(world, eid)
      })
      .listen(eid, OBJECT_PLACED_EVENT, () => {
        updateHint(true)
        showTrash(true)
      })
  },
})
