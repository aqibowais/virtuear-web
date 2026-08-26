import { EASYAR_CRS, crsSearchBase } from './config'

export type CrsHit = {
  name: string
  targetId?: string
  latencyMs: number
}

export type CrsSearch =
  | { status: 'hit'; hit: CrsHit }
  | { status: 'nomatch'; latencyMs: number }
  | { status: 'error'; message: string; latencyMs: number }

export async function searchCrs(imageBase64: string): Promise<CrsSearch> {
  const started = performance.now()
  const url = `${crsSearchBase().replace(/\/$/, '')}/search`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;Charset=UTF-8',
      Authorization: EASYAR_CRS.token,
    },
    body: JSON.stringify({
      image: imageBase64,
      appId: EASYAR_CRS.appId,
      notracking: true,
    }),
  })

  const latencyMs = Math.round(performance.now() - started)
  let data: any = null
  try {
    data = await res.json()
  } catch {
    return { status: 'error', message: `CRS HTTP ${res.status}`, latencyMs }
  }

  const code = data?.statusCode
  const target = data?.result?.target || (data?.result?.name ? data.result : null)
  if (code === 0 && target?.name) {
    const raw = String(target.name || '')
    const name = raw.replace(/^(image-|letter-)/, '')
    return {
      status: 'hit',
      hit: {
        name,
        targetId: target.targetId,
        latencyMs,
      },
    }
  }
  if (code === 17) {
    return { status: 'nomatch', latencyMs }
  }
  const rawMessage = data?.result?.message || data?.msg || data?.message || `CRS status ${code ?? res.status}`
  if (code === 21 || /quota|limit|exceed/i.test(String(rawMessage))) {
    return { status: 'error', message: `CRS quota: ${rawMessage}`, latencyMs }
  }
  return { status: 'error', message: String(rawMessage), latencyMs }
}

export function frameToJpegBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const maxW = 320
  const scale = Math.min(1, maxW / Math.max(1, video.videoWidth))
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.55).split('base64,').pop() || ''
}
