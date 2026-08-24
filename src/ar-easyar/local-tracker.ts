import { TARGET_IDS, targetImagePath } from './config'

export type TrackHit = {
  id: string
  corners: number[]
  centerX: number
  centerY: number
  inliers: number
}

type Template = {
  id: string
  width: number
  height: number
  pixels: Float32Array
  mean: number
  norm: number
}

const TW = 48
const TH = 48
const MATCH_MIN = 0.42

export class LocalImageTracker {
  private targets: Template[] = []
  private work = document.createElement('canvas')
  private ctx = this.work.getContext('2d', { willReadFrequently: true })!
  ready = false

  async init() {
    const errors: string[] = []
    for (const id of TARGET_IDS) {
      try {
        const img = await loadHtmlImage(targetImagePath(id))
        const pixels = this.drawGray(img, img.naturalWidth, img.naturalHeight)
        const { mean, norm } = stats(pixels)
        this.targets.push({
          id,
          width: img.naturalWidth,
          height: img.naturalHeight,
          pixels,
          mean,
          norm,
        })
      } catch (err: any) {
        errors.push(`${id}: ${err?.message || err}`)
      }
    }
    this.ready = this.targets.length > 0
    if (!this.ready) {
      throw new Error(errors[0] || 'No EasyAR target images found in ./image-targets/imagesAR/')
    }
  }

  matchFrame(video: HTMLVideoElement, preferId?: string | null): TrackHit | null {
    if (!this.ready || !video.videoWidth || !this.ctx) return null

    const vw = video.videoWidth
    const vh = video.videoHeight
    const minSide = Math.min(vw, vh)
    const scales = [0.42, 0.58, 0.78]
    const grid = preferId ? 3 : 4

    let best: { id: string; score: number; x: number; y: number; size: number } | null = null
    const list = preferId
      ? [...this.targets.filter((t) => t.id === preferId), ...this.targets.filter((t) => t.id !== preferId)]
      : this.targets

    for (const scale of scales) {
      const size = Math.round(minSide * scale)
      for (let gy = 0; gy < grid; gy++) {
        for (let gx = 0; gx < grid; gx++) {
          const cx = (vw * (gx + 1)) / (grid + 1)
          const cy = (vh * (gy + 1)) / (grid + 1)
          const x = Math.max(0, Math.min(vw - size, cx - size / 2))
          const y = Math.max(0, Math.min(vh - size, cy - size / 2))
          const patch = this.sampleGray(video, x, y, size, size)
          const { mean, norm } = stats(patch)
          if (norm < 1e-3) continue

          for (const target of list) {
            const score = ncc(patch, mean, norm, target)
            if (!best || score > best.score) {
              best = { id: target.id, score, x, y, size }
            }
            if (preferId === target.id && score > 0.62) break
          }
        }
      }
    }

    if (!best || best.score < MATCH_MIN) return null

    const x0 = best.x
    const y0 = best.y
    const x1 = best.x + best.size
    const y1 = best.y + best.size
    return {
      id: best.id,
      corners: [x0, y0, x1, y0, x1, y1, x0, y1],
      centerX: (x0 + x1) / 2,
      centerY: (y0 + y1) / 2,
      inliers: Math.round(best.score * 100),
    }
  }

  private drawGray(source: CanvasImageSource, sw: number, sh: number) {
    this.work.width = TW
    this.work.height = TH
    this.ctx.fillStyle = '#fff'
    this.ctx.fillRect(0, 0, TW, TH)
    const scale = Math.min(TW / sw, TH / sh)
    const dw = sw * scale
    const dh = sh * scale
    this.ctx.drawImage(source, (TW - dw) / 2, (TH - dh) / 2, dw, dh)
    return toGray(this.ctx.getImageData(0, 0, TW, TH).data)
  }

  private sampleGray(video: HTMLVideoElement, x: number, y: number, w: number, h: number) {
    this.work.width = TW
    this.work.height = TH
    this.ctx.drawImage(video, x, y, w, h, 0, 0, TW, TH)
    return toGray(this.ctx.getImageData(0, 0, TW, TH).data)
  }
}

function toGray(data: Uint8ClampedArray) {
  const out = new Float32Array(TW * TH)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
  }
  return out
}

function stats(pixels: Float32Array) {
  let sum = 0
  for (let i = 0; i < pixels.length; i++) sum += pixels[i]
  const mean = sum / pixels.length
  let acc = 0
  for (let i = 0; i < pixels.length; i++) {
    const d = pixels[i] - mean
    acc += d * d
  }
  return { mean, norm: Math.sqrt(acc) }
}

function ncc(patch: Float32Array, pMean: number, pNorm: number, target: Template) {
  let acc = 0
  for (let i = 0; i < patch.length; i++) {
    acc += (patch[i] - pMean) * (target.pixels[i] - target.mean)
  }
  return acc / (pNorm * target.norm + 1e-6)
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Missing target ${src}`))
    img.src = src
  })
}
