export {}

declare global {
  interface Window {
    XR8: any
    THREE: any
    XRExtras: any
    _alpharas: {
      activeTargets: Set<string>
      videoElements: Map<string, HTMLVideoElement>
      soundMuted: boolean
    }
  }
}

;(window as any)._alpharas = {
  activeTargets: new Set(),
  videoElements: new Map(),
  soundMuted: true,
}

const IMAGE_VIDEO_MAP: Record<string, string> = {
  '1': 'videos/1.mp4',
  '2': 'videos/2.mp4',
  '3': 'videos/3.mp4',
  '4': 'videos/4.mp4',
  '5': 'videos/5.mp4',
  '6': 'videos/6.mp4',
  '7': 'videos/7.mp4',
  '8': 'videos/8.mp4',
  '9': 'videos/9.mp4',
  '10': 'videos/10.mp4',
  '11': 'videos/11.mp4',
  '12': 'videos/12.mp4',
}

const MUTE_ICON_OFF =
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
const MUTE_ICON_ON =
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
  '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
  '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'

const meshes: Record<string, any> = {}
let scene3: any = null

const _w = window as any

function getVideoPath(targetName: string): string | null {
  const clean = targetName.replace(/^(image-|letter-)/, '')
  return IMAGE_VIDEO_MAP[clean] || null
}

function showVideo(name: string, detail: any) {
  const videoPath = getVideoPath(name)
  if (!videoPath) return

  const T = _w.THREE
  if (!scene3) {
    const xrScene = _w.XR8.Threejs.xrScene()
    scene3 = xrScene.scene
  }

  if (meshes[name]) {
    const m = meshes[name]
    m.position.copy(detail.position)
    m.quaternion.copy(detail.rotation)
    m.scale.set(detail.scale, detail.scale, detail.scale)
    m.visible = true

    const vid = _w._alpharas.videoElements.get(name)
    if (vid && vid.paused) {
      vid.muted = _w._alpharas.soundMuted
      vid.play().catch(() => {})
    }
    return
  }

  const video = document.createElement('video')
  video.src = videoPath
  video.crossOrigin = 'anonymous'
  video.loop = true
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.muted = _w._alpharas.soundMuted
  video.play().catch(() => {})

  _w._alpharas.videoElements.set(name, video)

  const texture = new T.VideoTexture(video)
  texture.minFilter = T.LinearFilter
  texture.magFilter = T.LinearFilter
  texture.format = T.RGBAFormat

  const geometry = new T.PlaneGeometry(1, 1)
  const material = new T.MeshBasicMaterial({
    map: texture,
    side: T.DoubleSide,
    transparent: true,
  })

  const mesh = new T.Mesh(geometry, material)
  mesh.position.copy(detail.position)
  mesh.quaternion.copy(detail.rotation)
  mesh.scale.set(detail.scale, detail.scale, detail.scale)

  scene3.add(mesh)
  meshes[name] = mesh

  _w._alpharas.activeTargets.add(name)
  updateStatusUI('found', name)
}

function updateVideo(name: string, detail: any) {
  const mesh = meshes[name]
  if (!mesh) return

  mesh.position.copy(detail.position)
  mesh.quaternion.copy(detail.rotation)
  mesh.scale.set(detail.scale, detail.scale, detail.scale)
  mesh.visible = true
}

function hideVideo(name: string) {
  const mesh = meshes[name]
  if (mesh) {
    mesh.visible = false
  }
  const vid = _w._alpharas.videoElements.get(name)
  if (vid) {
    vid.pause()
  }
  _w._alpharas.activeTargets.delete(name)

  if (_w._alpharas.activeTargets.size === 0) {
    updateStatusUI('scanning')
  }
}

function goHome() {
  Object.values(meshes).forEach((m: any) => { m.visible = false })
  _w._alpharas.videoElements.forEach((v: HTMLVideoElement) => { v.pause(); v.src = '' })
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = '/'
      return
    }
  } catch {
    // ignore cross-origin iframe access
  }
  window.location.href = '/'
}

function fitCanvasesToWindow() {
  const w = `${window.innerWidth}px`
  const h = `${window.innerHeight}px`
  document.querySelectorAll('canvas').forEach((el) => {
    const canvas = el as HTMLCanvasElement
    canvas.style.position = 'fixed'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = w
    canvas.style.height = h
  })
}

function updateStatusUI(status: string, targetName?: string) {
  const badge = document.getElementById('alpharas-status')
  if (!badge) return

  if (status === 'scanning') {
    badge.textContent = 'Point camera at a target image'
    badge.classList.remove('found')
    badge.style.opacity = '1'
  } else if (status === 'found') {
    const clean = (targetName || '').replace(/^(image-|letter-)/, '')
    badge.textContent = `Playing video for Alphara ${clean}`
    badge.classList.add('found')
    badge.style.opacity = '1'
    setTimeout(() => {
      if (badge.classList.contains('found')) badge.style.opacity = '0.7'
    }, 2000)
  }
}

function applyMuteUi() {
  const muted = _w._alpharas.soundMuted
  const muteBtn = document.getElementById('alpharas-mute')
  const muteIcon = document.getElementById('mute-icon')
  const muteLabel = document.getElementById('mute-label')
  muteBtn?.classList.toggle('on', !muted)
  if (muteLabel) muteLabel.textContent = muted ? 'Sound Off' : 'Sound On'
  if (muteIcon) muteIcon.innerHTML = muted ? MUTE_ICON_OFF : MUTE_ICON_ON
  _w._alpharas.videoElements.forEach((v: HTMLVideoElement) => { v.muted = muted })
}

function bindOverlayUI() {
  const backBtn = document.getElementById('alpharas-back')
  const muteBtn = document.getElementById('alpharas-mute')

  backBtn?.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  backBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    goHome()
  })

  muteBtn?.addEventListener('touchstart', (e) => e.stopPropagation(), {passive: false})
  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    _w._alpharas.soundMuted = !_w._alpharas.soundMuted
    applyMuteUi()
  })

  applyMuteUi()
}

const alpharasImageTargetModule = () => ({
  name: 'alpharas-image-targets',

  onStart: () => {
    fitCanvasesToWindow()
    bindOverlayUI()

    const loading = document.getElementById('loading-overlay')
    if (loading) loading.classList.add('hidden')
  },

  listeners: [
    {
      event: 'reality.imagefound',
      process: ({detail}: any) => {
        showVideo(detail.name, detail)
      },
    },
    {
      event: 'reality.imageupdated',
      process: ({detail}: any) => {
        updateVideo(detail.name, detail)
      },
    },
    {
      event: 'reality.imagelost',
      process: ({detail}: any) => {
        hideVideo(detail.name)
      },
    },
  ],
})

const TARGET_IDS = Object.keys(IMAGE_VIDEO_MAP)

async function loadImageTargetData(): Promise<any[]> {
  const loaded = await Promise.all(
    TARGET_IDS.map(async (id) => {
      const res = await fetch(`./image-targets/tracking/${id}.json`)
      if (!res.ok) {
        throw new Error(`Failed to load image target ${id}: ${res.status}`)
      }
      return res.json()
    }),
  )
  return loaded
}

const onxrloaded = async () => {
  const XR8 = _w.XR8
  try {
    const imageTargetData = await loadImageTargetData()

    XR8.XrController.configure({
      disableWorldTracking: true,
      imageTargetData,
      scale: 'responsive',
    })

    XR8.addCameraPipelineModule(XR8.GlTextureRenderer.pipelineModule())
    XR8.addCameraPipelineModule(XR8.Threejs.pipelineModule())
    XR8.addCameraPipelineModule(XR8.XrController.pipelineModule())
    if (_w.XRExtras?.FullWindowCanvas) {
      XR8.addCameraPipelineModule(_w.XRExtras.FullWindowCanvas.pipelineModule())
    }
    XR8.addCameraPipelineModule(alpharasImageTargetModule())

    const canvas = document.getElementById('camerafeed') as HTMLCanvasElement
    fitCanvasesToWindow()
    window.addEventListener('resize', fitCanvasesToWindow)
    window.addEventListener('orientationchange', () => {
      setTimeout(fitCanvasesToWindow, 250)
    })

    XR8.run({canvas})
  } catch (err) {
    const label = document.querySelector('.loading-label')
    if (label) {
      label.textContent = 'Failed to load image targets. Rebuild with npm run build:alpharas.'
    }
    console.error(err)
  }
}

if (_w.XR8) {
  onxrloaded()
} else {
  window.addEventListener('xrloaded', onxrloaded)
}
