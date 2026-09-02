import * as ecs from '@8thwall/ecs'
import {MODELS} from './models'
import {
  OBJECT_PLACED_EVENT,
  SELECTION_CHANGED_EVENT,
  setAnimationClip,
  setAnimationPaused,
} from './tap-to-place'

let currentModelIndex = 0
let hintEl: HTMLElement | null = null
let trashBtn: HTMLElement | null = null
let playBtn: HTMLElement | null = null
let clipRow: HTMLElement | null = null

function buildUI(world: any) {
  const container = document.createElement('div')
  container.id = 'ar-overlay'
  container.style.cssText = `
    position:fixed; inset:0; z-index:9999; pointer-events:none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `

  const topBar = document.createElement('div')
  topBar.style.cssText = `
    position:absolute; top:0; left:0; right:0;
    display:flex; align-items:center; justify-content:space-between;
    padding: 50px 16px 12px 16px;
    background: linear-gradient(to bottom, rgba(10,14,20,0.7) 0%, transparent 100%);
    pointer-events:auto;
  `

  const backBtn = document.createElement('button')
  backBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`
  backBtn.style.cssText = iconBtnCss()
  backBtn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  backBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    window.location.href = '/'
  })

  const title = document.createElement('span')
  title.textContent = 'Virtuar'
  title.style.cssText = `
    color:white; font-size:17px; font-weight:700; letter-spacing:0.8px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  `

  const actions = document.createElement('div')
  actions.style.cssText = 'display:flex; gap:8px; align-items:center;'

  playBtn = document.createElement('button')
  playBtn.textContent = '❚❚'
  playBtn.title = 'Pause / play animation'
  playBtn.style.cssText = `${iconBtnCss()} color:#fff; font-size:13px; opacity:0; pointer-events:none;`
  playBtn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    togglePause(world)
  })

  trashBtn = document.createElement('button')
  trashBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`
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
    deleteSelected(world)
  })

  actions.appendChild(playBtn)
  actions.appendChild(trashBtn)
  topBar.appendChild(backBtn)
  topBar.appendChild(title)
  topBar.appendChild(actions)

  hintEl = document.createElement('div')
  hintEl.style.cssText = `
    position:absolute; top:120px; left:0; right:0;
    display:flex; justify-content:center; pointer-events:none;
  `
  const hintBadge = document.createElement('div')
  hintBadge.id = 'ar-hint'
  hintBadge.textContent = 'Tap a model icon, then tap a surface'
  hintBadge.style.cssText = `
    padding: 8px 20px; border-radius:12px;
    background:rgba(255,107,26,0.12); border:1px solid rgba(255,107,26,0.25);
    color:#FF6B1A; font-size:14px; font-weight:500; max-width:90%; text-align:center;
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  `
  hintEl.appendChild(hintBadge)

  const bottomArea = document.createElement('div')
  bottomArea.style.cssText = `
    position:absolute; bottom:0; left:0; right:0;
    padding: 0 0 28px 0; pointer-events:auto;
    background: linear-gradient(to top, rgba(10,14,20,0.78) 0%, transparent 100%);
  `

  clipRow = document.createElement('div')
  clipRow.style.cssText = `
    display:none; gap:6px; padding:0 16px 8px;
    overflow-x:auto; -webkit-overflow-scrolling:touch;
  `

  const gestureHint = document.createElement('div')
  gestureHint.style.cssText = `
    text-align:center; padding: 8px 0 6px 0;
    color:rgba(255,255,255,0.5); font-size:11px;
  `
  gestureHint.textContent = 'Tap model to select · Tap empty to move · Pinch scale · Two fingers rotate'

  const strips = document.createElement('div')
  strips.id = 'ar-model-strips'
  strips.appendChild(makeDockSection('Animated', true, world))
  strips.appendChild(makeDockSection('Static', false, world))

  bottomArea.appendChild(clipRow)
  bottomArea.appendChild(gestureHint)
  bottomArea.appendChild(strips)

  container.appendChild(topBar)
  container.appendChild(hintEl)
  container.appendChild(bottomArea)
  document.body.appendChild(container)
}

function iconBtnCss() {
  return `
    width:44px; height:44px; border-radius:14px;
    background:rgba(18,22,30,0.85); border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  `
}

function thumbStyle(active: boolean): string {
  return `
    display:flex; flex-direction:column; align-items:center;
    padding:6px; border-radius:14px; border:none; cursor:pointer; flex-shrink:0;
    background:${active ? 'rgba(255,107,26,0.2)' : 'rgba(18,22,30,0.85)'};
    box-shadow:${active ? '0 0 0 2px #FF6B1A' : '0 0 0 1px rgba(255,255,255,0.08)'};
    font-family: inherit;
  `
}

function makeDockSection(title: string, animated: boolean, world: any) {
  const section = document.createElement('div')
  section.style.cssText = 'padding: 0 0 8px 0;'

  const heading = document.createElement('div')
  heading.textContent = title
  heading.style.cssText = `
    padding: 4px 16px 6px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${animated ? '#FF6B1A' : 'rgba(255,255,255,0.45)'};
  `
  section.appendChild(heading)

  const strip = document.createElement('div')
  strip.style.cssText = `
    display:flex; gap:10px; padding:0 16px;
    overflow-x:auto; -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
  `

  MODELS.forEach((model, i) => {
    if (model.animated !== animated) return
    strip.appendChild(makeThumbChip(model, i, world))
  })

  section.appendChild(strip)
  return section
}

function makeThumbChip(model: (typeof MODELS)[number], i: number, world: any) {
  const chip = document.createElement('button')
  chip.dataset.idx = String(i)
  chip.style.cssText = thumbStyle(i === currentModelIndex)
  if (model.thumb) {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'position:relative; width:56px; height:56px;'
    const img = document.createElement('img')
    img.src = model.thumb
    img.alt = model.name
    img.style.cssText = 'width:56px; height:56px; object-fit:cover; border-radius:10px; display:block; pointer-events:none;'
    wrap.appendChild(img)
    if (model.animated) {
      const badge = document.createElement('span')
      badge.textContent = '▶'
      badge.style.cssText = 'position:absolute; right:2px; bottom:2px; font-size:9px; background:rgba(255,107,26,0.9); color:#fff; border-radius:4px; padding:1px 4px; line-height:1.2;'
      wrap.appendChild(badge)
    }
    chip.appendChild(wrap)
  } else {
    const letter = document.createElement('div')
    letter.textContent = model.name.slice(0, 1)
    letter.style.cssText = 'width:56px; height:56px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#FF6B1A;'
    chip.appendChild(letter)
  }
  const label = document.createElement('span')
  label.textContent = model.name
  label.style.cssText = 'display:block; margin-top:4px; font-size:10px; font-weight:600; color:rgba(255,255,255,0.75); max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'
  chip.appendChild(label)

  chip.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  chip.addEventListener('click', (e) => {
    e.stopPropagation()
    e.preventDefault()
    selectCatalogModel(i, world)
  })
  return chip
}

function selectCatalogModel(idx: number, world: any) {
  currentModelIndex = idx
  window._virtuar.currentModelIndex = idx
  window._virtuar.placeMode = true
  window._virtuar.selectedEid = null
  updateChips()
  refreshSelectionUi(world)
  updateHint()
}

function updateChips() {
  document.querySelectorAll('#ar-overlay button[data-idx]').forEach((chip) => {
    const i = Number((chip as HTMLElement).dataset.idx)
    ;(chip as HTMLElement).style.cssText = thumbStyle(i === currentModelIndex)
  })
}

function deleteSelected(world: any) {
  const eid = window._virtuar.selectedEid
  if (!eid) return
  try {
    world.deleteEntity(eid)
  } catch {
    // already gone
  }
  window._virtuar.placed = window._virtuar.placed.filter((p) => p.eid !== eid)
  window._virtuar.selectedEid = null
  window._virtuar.placeMode = true
  refreshSelectionUi(world)
  updateHint()
}

function togglePause(world: any) {
  const rec = window._virtuar.placed.find((p) => p.eid === window._virtuar.selectedEid)
  if (!rec) return
  setAnimationPaused(world, rec.eid, !rec.paused)
  refreshSelectionUi(world)
}

function refreshSelectionUi(world: any) {
  const rec = window._virtuar.placed.find((p) => p.eid === window._virtuar.selectedEid)
  const hasSelection = Boolean(rec)
  if (trashBtn) {
    trashBtn.style.opacity = hasSelection ? '1' : '0'
    trashBtn.style.pointerEvents = hasSelection ? 'auto' : 'none'
  }
  if (playBtn) {
    const model = rec ? MODELS[rec.modelIndex] : null
    const show = Boolean(model?.animated)
    playBtn.style.opacity = show ? '1' : '0'
    playBtn.style.pointerEvents = show ? 'auto' : 'none'
    playBtn.textContent = rec?.paused ? '▶' : '❚❚'
  }
  if (clipRow) {
    clipRow.innerHTML = ''
    const clips = rec ? MODELS[rec.modelIndex].clips : []
    if (clips.length) {
      clipRow.style.display = 'flex'
      clips.forEach((clip) => {
        const btn = document.createElement('button')
        btn.textContent = clip
        btn.style.cssText = `
          padding:6px 10px; border-radius:10px; flex-shrink:0; cursor:pointer;
          border:1px solid rgba(255,107,26,${rec.clip === clip ? '0.7' : '0.35'});
          background:rgba(255,107,26,${rec.clip === clip ? '0.28' : '0.12'});
          color:#FF6B1A; font-size:11px; font-weight:600;
        `
        btn.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          setAnimationClip(world, rec.eid, clip)
          refreshSelectionUi(world)
        })
        clipRow.appendChild(btn)
      })
    } else {
      clipRow.style.display = 'none'
    }
  }
}

function updateHint() {
  const badge = document.getElementById('ar-hint')
  if (!badge) return
  const n = window._virtuar.placed.length
  if (window._virtuar.placeMode) {
    badge.textContent = `Tap a surface to place ${MODELS[currentModelIndex].name}`
  } else if (window._virtuar.selectedEid) {
    badge.textContent = n > 1
      ? 'Selected · tap empty to move · tap icon to place another'
      : 'Selected · tap empty to move · pinch to scale'
  } else {
    badge.textContent = 'Tap a model icon, then tap a surface'
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
        const loading = document.getElementById('ar-loading')
        if (loading) {
          loading.classList.add('hidden')
          window.setTimeout(() => loading.remove(), 400)
        }
        window._virtuar.currentModelIndex = currentModelIndex
        buildUI(world)
      })
      .listen(eid, OBJECT_PLACED_EVENT, () => {
        updateHint()
        refreshSelectionUi(world)
      })
      .listen(eid, SELECTION_CHANGED_EVENT, () => {
        updateHint()
        refreshSelectionUi(world)
      })
  },
})
