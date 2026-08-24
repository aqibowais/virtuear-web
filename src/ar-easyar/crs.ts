import { EASYAR_CRS } from './config'

export type CrsHit = {
  name: string
  targetId?: string
  latencyMs: number
}

export async function searchCrs(imageBase64: string): Promise<CrsHit | null> {
  const started = performance.now()
  const url = `${EASYAR_CRS.clientendUrl.replace(/\/$/, '')}/search`
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
  const data = await res.json()
  const latencyMs = Math.round(performance.now() - started)
  if (data?.statusCode === 0 && data?.result?.target) {
    return {
      name: String(data.result.target.name || ''),
      targetId: data.result.target.targetId,
      latencyMs,
    }
  }
  return null
}

export function frameToJpegBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const maxW = 480
  const scale = Math.min(1, maxW / Math.max(1, video.videoWidth))
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.7).split('base64,').pop() || ''
}
