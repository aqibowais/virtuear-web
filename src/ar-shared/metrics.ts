export type EngineId = '8thwall' | 'easyar'

export const TEST_CASES = [
  { id: 'recog_time', label: 'Image recognition time', unit: 'ms' },
  { id: 'dist_20', label: 'Recognition at 20 cm', unit: 'okfail' },
  { id: 'dist_50', label: 'Recognition at 50 cm', unit: 'okfail' },
  { id: 'angle_30', label: 'Recognition at 30°', unit: 'okfail' },
  { id: 'angle_60', label: 'Recognition at 60°', unit: 'okfail' },
  { id: 'low_light', label: 'Low-light conditions', unit: 'okfail' },
  { id: 'occluded', label: 'Partially occluded image', unit: 'okfail' },
  { id: 'stability', label: 'Video tracking stability', unit: 'notes' },
  { id: 'android_chrome', label: 'Android Chrome', unit: 'notes' },
  { id: 'iphone_safari', label: 'iPhone Safari', unit: 'notes' },
] as const

export type TestCaseId = (typeof TEST_CASES)[number]['id']

export type TrialResult = {
  id: string
  engine: EngineId
  testId: TestCaseId
  testLabel: string
  verdict: 'OK' | 'Fail' | 'Notes'
  recognitionMs: number | null
  fpsAvg: number | null
  trackLosses: number
  recoveries: number
  lastRecoveryMs: number | null
  jitterPx: number | null
  brightness: number | null
  notes: string
  targetName: string | null
  device: string
  createdAt: string
}

const STORAGE_KEY = 'alpharas-comparison-results'

export function loadTrials(): TrialResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveTrial(trial: TrialResult) {
  const all = loadTrials()
  all.push(trial)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function clearTrials() {
  localStorage.removeItem(STORAGE_KEY)
}

export class ComparisonMetrics {
  engine: EngineId
  scanning = false
  scanStartedAt = 0
  recognitionMs: number | null = null
  targetName: string | null = null
  found = false
  losses = 0
  recoveries = 0
  lastLostAt = 0
  lastRecoveryMs: number | null = null
  frames = 0
  fps = 0
  fpsAccum = 0
  fpsCount = 0
  lastFpsAt = 0
  lastX = 0
  lastY = 0
  jitterSum = 0
  jitterN = 0
  brightness: number | null = null

  constructor(engine: EngineId) {
    this.engine = engine
    this.lastFpsAt = performance.now()
  }

  startScan() {
    this.scanning = true
    this.scanStartedAt = performance.now()
    this.recognitionMs = null
    this.targetName = null
    this.found = false
    this.losses = 0
    this.recoveries = 0
    this.lastRecoveryMs = null
    this.jitterSum = 0
    this.jitterN = 0
  }

  markFound(name: string, x = 0, y = 0) {
    if (!this.found && this.scanning) {
      this.recognitionMs = Math.round(performance.now() - this.scanStartedAt)
    } else if (this.found === false && this.lastLostAt) {
      this.recoveries += 1
      this.lastRecoveryMs = Math.round(performance.now() - this.lastLostAt)
    }
    this.found = true
    this.targetName = name
    this.lastX = x
    this.lastY = y
  }

  markUpdated(x: number, y: number) {
    if (!this.found) return
    const dx = x - this.lastX
    const dy = y - this.lastY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (this.lastX || this.lastY) {
      this.jitterSum += dist
      this.jitterN += 1
    }
    this.lastX = x
    this.lastY = y
  }

  markLost() {
    if (this.found) {
      this.losses += 1
      this.lastLostAt = performance.now()
    }
    this.found = false
  }

  tick(brightness?: number) {
    this.frames += 1
    const now = performance.now()
    const dt = now - this.lastFpsAt
    if (dt >= 500) {
      this.fps = Math.round((this.frames * 1000) / dt)
      if (this.fps > 0) {
        this.fpsAccum += this.fps
        this.fpsCount += 1
      }
      this.frames = 0
      this.lastFpsAt = now
    }
    if (typeof brightness === 'number') this.brightness = brightness
  }

  jitterPx() {
    return this.jitterN ? Math.round((this.jitterSum / this.jitterN) * 10) / 10 : null
  }

  fpsAvg() {
    return this.fpsCount ? Math.round(this.fpsAccum / this.fpsCount) : this.fps || null
  }

  snapshot() {
    return {
      engine: this.engine,
      recognitionMs: this.recognitionMs,
      fps: this.fps,
      fpsAvg: this.fpsAvg(),
      trackLosses: this.losses,
      recoveries: this.recoveries,
      lastRecoveryMs: this.lastRecoveryMs,
      jitterPx: this.jitterPx(),
      brightness: this.brightness,
      targetName: this.targetName,
      found: this.found,
    }
  }
}

export function deviceLabel() {
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad/i.test(ua)) return 'iPhone Safari'
  if (/Android/i.test(ua)) return 'Android Chrome'
  return navigator.platform || 'Desktop'
}
