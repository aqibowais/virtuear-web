import { ComparisonMetrics } from '../ar-shared/metrics'
import { mountComparisonLab } from '../ar-shared/lab-ui'
import { videoPathFor } from './config'
import { frameToJpegBase64, searchCrs } from './crs'
import { applyQuadOverlay, fallbackCorners, hideOverlay } from './overlay'
import { PoseTracker } from './pose-tracker'

const MUTE_ICON_OFF =
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
const MUTE_ICON_ON =
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
  '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'

const metrics = new ComparisonMetrics('easyar')
const tracker = new PoseTracker()

let camera: HTMLVideoElement
let overlay: HTMLVideoElement
let snap: HTMLCanvasElement
let currentId: string | null = null
let soundMuted = true
let lastCrsAt = 0
let lastPoseAt = 0
let lastSeenAt = 0
let searching = false
let crsMisses = 0
let lastCorners: number[] | null = null

function goHome() {
  stopCamera()
  overlay.pause()
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = '/'
      return
    }
  } catch {
    // ignore
  }
  window.location.href = '/'
}

function stopCamera() {
  const stream = camera?.srcObject as MediaStream | undefined
  stream?.getTracks().forEach((t) => t.stop())
}

function applyMute() {
  overlay.muted = soundMuted
  const btn = document.getElementById('alpharas-mute')
  const label = document.getElementById('mute-label')
  const icon = document.getElementById('mute-icon')
  btn?.classList.toggle('on', !soundMuted)
  if (label) label.textContent = soundMuted ? 'Sound Off' : 'Sound On'
  if (icon) icon.innerHTML = soundMuted ? MUTE_ICON_OFF : MUTE_ICON_ON
}

function updateStatusUI(status: 'scanning' | 'found', targetName?: string) {
  const badge = document.getElementById('alpharas-status')
  if (!badge) return

  if (status === 'scanning') {
    badge.textContent = 'Point camera at a target image'
    badge.classList.remove('found')
    badge.style.opacity = '1'
    return
  }

  const clean = (targetName || '').replace(/^(image-|letter-)/, '')
  badge.textContent = `Playing video for Alphara ${clean}`
  badge.classList.add('found')
  badge.style.opacity = '1'
  setTimeout(() => {
    if (badge.classList.contains('found')) badge.style.opacity = '0.7'
  }, 2000)
}

function sampleBrightness() {
  if (!camera.videoWidth) return
  const c = snap
  c.width = 32
  c.height = 18
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.drawImage(camera, 0, 0, 32, 18)
  const data = ctx.getImageData(0, 0, 32, 18).data
  let sum = 0
  for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3
  metrics.brightness = Math.round(sum / (data.length / 4))
}

function playTarget(id: string) {
  const path = videoPathFor(id)
  const current = overlay.getAttribute('src') || overlay.src
  if (!current.endsWith(path.replace('./', ''))) {
    overlay.src = path
  }
  overlay.muted = soundMuted
  overlay.play().catch(() => {})
  lastCorners = fallbackCorners(camera)
  applyQuadOverlay(overlay, lastCorners, camera)
}

function loseTarget() {
  if (!currentId) return
  metrics.markLost()
  currentId = null
  crsMisses = 0
  lastSeenAt = 0
  lastCorners = null
  tracker.reset()
  hideOverlay(overlay)
  updateStatusUI('scanning')
}

function lockTarget(id: string, x = 0, y = 0) {
  const switched = currentId !== id
  currentId = id
  crsMisses = 0
  lastSeenAt = performance.now()
  if (switched) {
    tracker.reset()
    tracker.ensure(id).catch(() => {})
    playTarget(id)
    metrics.markFound(id, x, y)
    updateStatusUI('found', id)
  } else if (overlay.paused) {
    overlay.play().catch(() => {})
  }
}

async function pollCrs() {
  if (searching || !camera.videoWidth) return
  searching = true
  try {
    const jpeg = frameToJpegBase64(camera, snap)
    if (!jpeg) return
    const result = await searchCrs(jpeg)
    if (result.status === 'hit') {
      lockTarget(result.hit.name)
      return
    }
    if (result.status === 'nomatch' && currentId) {
      crsMisses += 1
      const poseFresh = performance.now() - lastSeenAt < 500
      if (crsMisses >= 3 || (crsMisses >= 2 && !poseFresh)) loseTarget()
      return
    }
    if (result.status === 'error') {
      const el = document.getElementById('alpharas-status')
      if (el && !currentId) el.textContent = result.message
    }
  } catch (err: any) {
    if (!currentId) {
      const el = document.getElementById('alpharas-status')
      if (el) el.textContent = err?.message || 'CRS request failed'
    }
  } finally {
    searching = false
  }
}

function loop() {
  metrics.tick()
  sampleBrightness()

  if (currentId) {
    if (performance.now() - lastPoseAt > 50) {
      lastPoseAt = performance.now()
      const hit = tracker.track(camera, currentId)
      if (hit) {
        lastSeenAt = performance.now()
        lastCorners = hit.corners
        metrics.markUpdated(hit.centerX, hit.centerY)
        applyQuadOverlay(overlay, hit.corners, camera)
      } else if (lastCorners) {
        applyQuadOverlay(overlay, lastCorners, camera)
      }
    }

    if (performance.now() - lastSeenAt > 1600 && crsMisses >= 2) {
      loseTarget()
    }
  }

  const interval = currentId ? 1100 : 450
  if (performance.now() - lastCrsAt > interval) {
    lastCrsAt = performance.now()
    pollCrs()
  }

  requestAnimationFrame(loop)
}

function bindOverlayUI() {
  const backBtn = document.getElementById('alpharas-back')
  const muteBtn = document.getElementById('alpharas-mute')
  backBtn?.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false })
  backBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    goHome()
  })
  muteBtn?.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false })
  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    soundMuted = !soundMuted
    applyMute()
  })
  applyMute()
}

async function start() {
  camera = document.getElementById('camera') as HTMLVideoElement
  overlay = document.getElementById('ar-video') as HTMLVideoElement
  snap = document.createElement('canvas')

  bindOverlayUI()
  mountComparisonLab(metrics)
  metrics.startScan()

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
  })
  camera.srcObject = stream
  await camera.play()

  updateStatusUI('scanning')
  document.getElementById('loading-overlay')?.classList.add('hidden')
  loop()
}

start().catch((err) => {
  const label = document.querySelector('.loading-label')
  if (label) label.textContent = err?.message || 'Camera permission denied'
  console.error(err)
})
