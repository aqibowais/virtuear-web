import { ComparisonMetrics } from '../ar-shared/metrics'
import { mountComparisonLab } from '../ar-shared/lab-ui'
import { crsEnabled, videoPathFor } from './config'
import { frameToJpegBase64, searchCrs } from './crs'
import { LocalImageTracker } from './local-tracker'

const metrics = new ComparisonMetrics('easyar')
const tracker = new LocalImageTracker()

let camera: HTMLVideoElement
let overlay: HTMLVideoElement
let snap: HTMLCanvasElement
let currentId: string | null = null
let lostFrames = 0
let soundMuted = true
let lastCrsAt = 0
let lastMatchAt = 0

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
  btn?.classList.toggle('on', !soundMuted)
  if (label) label.textContent = soundMuted ? 'Sound Off' : 'Sound On'
}

function setStatus(text: string, found = false) {
  const el = document.getElementById('alpharas-status')
  if (!el) return
  el.textContent = text
  el.classList.toggle('found', found)
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

function videoToCss(x: number, y: number) {
  const vw = camera.videoWidth
  const vh = camera.videoHeight
  const cw = window.innerWidth
  const ch = window.innerHeight
  const scale = Math.max(cw / vw, ch / vh)
  return {
    x: x * scale + (cw - vw * scale) / 2,
    y: y * scale + (ch - vh * scale) / 2,
  }
}

function applyOverlay(corners: number[]) {
  const css = [0, 2, 4, 6].map((i) => videoToCss(corners[i], corners[i + 1]))
  const w = overlay.videoWidth || 640
  const h = overlay.videoHeight || 360
  overlay.style.display = 'block'
  overlay.style.width = `${w}px`
  overlay.style.height = `${h}px`
  overlay.style.transformOrigin = '0 0'
  overlay.style.transform = homographyCss(w, h, css)
}

function hideOverlay() {
  overlay.style.display = 'none'
  overlay.pause()
}

function homographyCss(w: number, h: number, dst: {x: number, y: number}[]) {
  const src = [{x: 0, y: 0}, {x: w, y: 0}, {x: w, y: h}, {x: 0, y: h}]
  const H = solveHomography(src, dst)
  const m = [
    H[0], H[3], 0, H[6],
    H[1], H[4], 0, H[7],
    0, 0, 1, 0,
    H[2], H[5], 0, H[8],
  ]
  return `matrix3d(${m.join(',')})`
}

function solveHomography(src: {x: number, y: number}[], dst: {x: number, y: number}[]) {
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const {x, y} = src[i]
    const u = dst[i].x
    const v = dst[i].y
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v])
    b.push(v)
  }
  const h = gaussSolve(A, b)
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1]
}

function gaussSolve(A: number[][], b: number[]) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let i = 0; i < n; i++) {
    let max = i
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[max][i])) max = r
    ;[M[i], M[max]] = [M[max], M[i]]
    const piv = M[i][i] || 1e-12
    for (let c = i; c <= n; c++) M[i][c] /= piv
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const f = M[r][i]
      for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]
    }
  }
  return M.map((row) => row[n])
}

async function playTarget(id: string) {
  const path = videoPathFor(id)
  if (!overlay.src.endsWith(path.replace('./', ''))) {
    overlay.src = path
  }
  overlay.muted = soundMuted
  overlay.play().catch(() => {})
}

async function loop() {
  metrics.tick()
  sampleBrightness()

  let hit = null
  if (tracker.ready && performance.now() - lastMatchAt > 180) {
    lastMatchAt = performance.now()
    hit = tracker.matchFrame(camera, currentId)
  }

  if (!hit && crsEnabled() && !currentId && performance.now() - lastCrsAt > 400) {
    lastCrsAt = performance.now()
    const jpeg = frameToJpegBase64(camera, snap)
    if (jpeg) {
      try {
        const crs = await searchCrs(jpeg)
        if (crs?.name) {
          currentId = crs.name.replace(/^(image-|letter-)/, '')
          metrics.markFound(currentId)
          setStatus(`EasyAR CRS: Alphara ${currentId}`, true)
          playTarget(currentId)
        }
      } catch (err) {
        console.warn('CRS search failed', err)
      }
    }
  }

  if (hit) {
    lostFrames = 0
    if (currentId !== hit.id) {
      currentId = hit.id
      metrics.markFound(hit.id, hit.centerX, hit.centerY)
      setStatus(`Playing video for Alphara ${hit.id}`, true)
      playTarget(hit.id)
    } else {
      metrics.markUpdated(hit.centerX, hit.centerY)
    }
    applyOverlay(hit.corners)
  } else if (currentId) {
    lostFrames += 1
    if (lostFrames > 8) {
      metrics.markLost()
      currentId = null
      hideOverlay()
      setStatus('Point camera at a target image')
    }
  }

  requestAnimationFrame(loop)
}

async function start() {
  camera = document.getElementById('camera') as HTMLVideoElement
  overlay = document.getElementById('ar-video') as HTMLVideoElement
  snap = document.createElement('canvas')

  document.getElementById('alpharas-back')?.addEventListener('click', (e) => {
    e.stopPropagation()
    goHome()
  })
  document.getElementById('alpharas-mute')?.addEventListener('click', (e) => {
    e.stopPropagation()
    soundMuted = !soundMuted
    applyMute()
  })
  applyMute()
  mountComparisonLab(metrics)
  metrics.startScan()

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
  })
  camera.srcObject = stream
  await camera.play()

  const mode = document.getElementById('easyar-mode')
  if (mode) {
    mode.textContent = crsEnabled() ? 'EasyAR CRS + local track' : 'EasyAR local tracker'
  }

  try {
    setStatus('Loading tracker…')
    await tracker.init()
    setStatus('Point camera at a target image')
  } catch (err: any) {
    console.error(err)
    const detail = err?.message || 'Failed to load EasyAR tracker'
    setStatus(crsEnabled() ? `CRS only — ${detail}` : detail)
  }

  document.getElementById('loading-overlay')?.classList.add('hidden')
  loop()
}

start().catch((err) => {
  const label = document.querySelector('.loading-label')
  if (label) label.textContent = err?.message || 'Camera permission denied'
  console.error(err)
})
