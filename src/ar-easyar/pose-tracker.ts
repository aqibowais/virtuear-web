import { targetImageCandidates } from './config'

export type TrackHit = {
  id: string
  corners: number[]
  centerX: number
  centerY: number
  score: number
}

type Template = {
  id: string
  aspect: number
  gray: Float32Array
  gw: number
  gh: number
  mean: number
  norm: number
}

const FRAME_W = 128
const MATCH_MIN = 0.32
const TRACK_MIN = 0.22

export class PoseTracker {
  private templates = new Map<string, Template[]>()
  private work = document.createElement('canvas')
  private ctx = this.work.getContext('2d', { willReadFrequently: true })!
  private prev: TrackHit | null = null
  private hold = 0
  private chosen = new Map<string, Template>()
  private loading = new Map<string, Promise<void>>()
  ready = true

  async init() {
    this.ready = true
  }

  async ensure(id: string) {
    if (this.templates.has(id)) return
    const pending = this.loading.get(id)
    if (pending) return pending
    const task = this.loadOne(id)
    this.loading.set(id, task)
    await task
  }

  private async loadOne(id: string) {
    const list: Template[] = []
    for (const src of targetImageCandidates(id)) {
      try {
        const img = await loadHtmlImage(src)
        const aspect = img.naturalWidth / Math.max(1, img.naturalHeight)
        const gh = 40
        const gw = Math.max(12, Math.round(gh * aspect))
        const gray = this.drawGray(img, gw, gh)
        const { mean, norm } = stats(gray)
        list.push({ id, aspect, gray, gw, gh, mean, norm })
        break
      } catch {
        // try next path
      }
    }
    if (list.length) this.templates.set(id, list)
  }

  reset() {
    this.prev = null
    this.hold = 0
  }

  track(video: HTMLVideoElement, id: string): TrackHit | null {
    if (!this.ready || !video.videoWidth) return null
    const list = this.templates.get(id)
    if (!list?.length) return null

    const frame = this.capture(video)
    const templates = this.chosen.get(id) ? [this.chosen.get(id)!, ...list.filter((t) => t !== this.chosen.get(id))] : list

    if (this.prev?.id === id) {
      const hit = this.local(frame, templates[0], this.prev)
      if (hit && hit.score >= TRACK_MIN) {
        this.prev = smooth(this.prev, hit)
        this.hold = 0
        return this.prev
      }
      this.hold += 1
      if (this.hold < 8) return this.prev
      this.prev = null
      this.hold = 0
      return null
    }

    const hit = this.locate(frame, templates, id)
    if (!hit || hit.score < MATCH_MIN) {
      this.prev = null
      return null
    }
    this.prev = hit
    return hit
  }

  private capture(video: HTMLVideoElement) {
    const vw = video.videoWidth
    const vh = video.videoHeight
    const fw = FRAME_W
    const fh = Math.max(80, Math.round((FRAME_W * vh) / vw))
    this.work.width = fw
    this.work.height = fh
    this.ctx.drawImage(video, 0, 0, fw, fh)
    const gray = toGray(this.ctx.getImageData(0, 0, fw, fh).data, fw * fh)
    return { gray, fw, fh, sx: vw / fw, sy: vh / fh }
  }

  private locate(frame: Frame, templates: Template[], id: string): TrackHit | null {
    let best: { score: number; x: number; y: number; w: number; h: number; tmpl: Template } | null = null
    const ratios = [0.52, 0.7]

    for (const tmpl of templates.slice(0, 1)) {
      for (const ratio of ratios) {
        const h = Math.round(frame.fh * ratio)
        const w = Math.round(h * tmpl.aspect)
        if (w < 16 || h < 20 || w >= frame.fw || h >= frame.fh) continue
        const resized = resizeGray(tmpl.gray, tmpl.gw, tmpl.gh, w, h)
        const st = stats(resized)
        const stride = Math.max(6, Math.round(Math.min(w, h) / 5))
        for (let y = 0; y <= frame.fh - h; y += stride) {
          for (let x = 0; x <= frame.fw - w; x += stride) {
            const score = nccWindow(frame.gray, frame.fw, x, y, w, h, resized, st.mean, st.norm)
            if (!best || score > best.score) best = { score, x, y, w, h, tmpl }
          }
        }
      }
    }

    if (!best) return null
    this.chosen.set(id, best.tmpl)
    return this.polish(frame, best.tmpl, best.x, best.y, best.w, best.h, best.score)
  }

  private local(frame: Frame, tmpl: Template, prev: TrackHit): TrackHit | null {
    const x0 = prev.corners[0] / frame.sx
    const y0 = prev.corners[1] / frame.sy
    const w0 = Math.hypot(prev.corners[2] - prev.corners[0], prev.corners[3] - prev.corners[1]) / frame.sx
    const h0 = Math.hypot(prev.corners[6] - prev.corners[0], prev.corners[7] - prev.corners[1]) / frame.sy
    let best: { score: number; x: number; y: number; w: number; h: number } | null = null

    for (const scale of [0.94, 1, 1.06]) {
      const w = Math.max(16, Math.round(w0 * scale))
      const h = Math.max(20, Math.round(h0 * scale))
      const resized = resizeGray(tmpl.gray, tmpl.gw, tmpl.gh, w, h)
      const st = stats(resized)
      for (let dy = -10; dy <= 10; dy += 5) {
        for (let dx = -10; dx <= 10; dx += 5) {
          const x = Math.max(0, Math.min(frame.fw - w, Math.round(x0 + dx)))
          const y = Math.max(0, Math.min(frame.fh - h, Math.round(y0 + dy)))
          const score = nccWindow(frame.gray, frame.fw, x, y, w, h, resized, st.mean, st.norm)
          if (!best || score > best.score) best = { score, x, y, w, h }
        }
      }
    }

    if (!best) return null
    return this.polish(frame, tmpl, best.x, best.y, best.w, best.h, best.score)
  }

  private polish(
    frame: Frame,
    tmpl: Template,
    x: number,
    y: number,
    w: number,
    h: number,
    score: number,
  ): TrackHit {
    let bx = x
    let by = y
    let bw = w
    let bh = h
    let best = score
    const resized = resizeGray(tmpl.gray, tmpl.gw, tmpl.gh, w, h)
    const st = stats(resized)

    for (let dy = -3; dy <= 3; dy += 1) {
      for (let dx = -3; dx <= 3; dx += 1) {
        const nx = Math.max(0, Math.min(frame.fw - w, x + dx))
        const ny = Math.max(0, Math.min(frame.fh - h, y + dy))
        const s = nccWindow(frame.gray, frame.fw, nx, ny, w, h, resized, st.mean, st.norm)
        if (s > best) {
          best = s
          bx = nx
          by = ny
        }
      }
    }

    const cx = bx + bw / 2
    const cy = by + bh / 2
    const corners = [
      bx * frame.sx, by * frame.sy,
      (bx + bw) * frame.sx, by * frame.sy,
      (bx + bw) * frame.sx, (by + bh) * frame.sy,
      bx * frame.sx, (by + bh) * frame.sy,
    ]
    return {
      id: tmpl.id,
      corners,
      centerX: cx * frame.sx,
      centerY: cy * frame.sy,
      score: best,
    }
  }

  private drawGray(img: HTMLImageElement, gw: number, gh: number) {
    this.work.width = gw
    this.work.height = gh
    this.ctx.drawImage(img, 0, 0, gw, gh)
    return toGray(this.ctx.getImageData(0, 0, gw, gh).data, gw * gh)
  }
}

type Frame = { gray: Float32Array; fw: number; fh: number; sx: number; sy: number }

function toGray(data: Uint8ClampedArray, count: number) {
  const out = new Float32Array(count)
  for (let i = 0, p = 0; p < count; i += 4, p++) {
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

function resizeGray(src: Float32Array, sw: number, sh: number, tw: number, th: number) {
  if (sw === tw && sh === th) return src
  const out = new Float32Array(tw * th)
  for (let y = 0; y < th; y++) {
    const sy = ((y + 0.5) * sh) / th - 0.5
    const y0 = Math.max(0, Math.min(sh - 1, Math.floor(sy)))
    const y1 = Math.min(sh - 1, y0 + 1)
    const fy = sy - y0
    for (let x = 0; x < tw; x++) {
      const sx = ((x + 0.5) * sw) / tw - 0.5
      const x0 = Math.max(0, Math.min(sw - 1, Math.floor(sx)))
      const x1 = Math.min(sw - 1, x0 + 1)
      const fx = sx - x0
      const a = src[y0 * sw + x0]
      const b = src[y0 * sw + x1]
      const c = src[y1 * sw + x0]
      const d = src[y1 * sw + x1]
      out[y * tw + x] = a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy
    }
  }
  return out
}

function nccWindow(
  frame: Float32Array,
  fw: number,
  x: number,
  y: number,
  w: number,
  h: number,
  tmpl: Float32Array,
  tMean: number,
  tNorm: number,
) {
  let sum = 0
  let sumSq = 0
  let dot = 0
  let k = 0
  for (let row = 0; row < h; row++) {
    const off = (y + row) * fw + x
    for (let col = 0; col < w; col++) {
      const v = frame[off + col]
      sum += v
      sumSq += v * v
      dot += v * tmpl[k++]
    }
  }
  const n = w * h
  const mean = sum / n
  const pNorm = Math.sqrt(Math.max(0, sumSq - n * mean * mean))
  const cross = dot - mean * tMean * n
  return cross / (pNorm * tNorm + 1e-6)
}

function smooth(prev: TrackHit, next: TrackHit): TrackHit {
  const a = 0.35
  const corners = next.corners.map((v, i) => prev.corners[i] * (1 - a) + v * a)
  return {
    id: next.id,
    corners,
    centerX: (corners[0] + corners[2] + corners[4] + corners[6]) / 4,
    centerY: (corners[1] + corners[3] + corners[5] + corners[7]) / 4,
    score: next.score,
  }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Missing target ${src}`))
    img.src = src
  })
}
