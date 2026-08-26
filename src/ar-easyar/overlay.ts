export function videoToCss(
  x: number,
  y: number,
  videoW: number,
  videoH: number,
  viewW: number,
  viewH: number,
) {
  const scale = Math.max(viewW / videoW, viewH / videoH)
  return {
    x: x * scale + (viewW - videoW * scale) / 2,
    y: y * scale + (viewH - videoH * scale) / 2,
  }
}

export function fallbackCorners(camera: HTMLVideoElement, aspect = 0.75) {
  const vw = camera.videoWidth || 640
  const vh = camera.videoHeight || 480
  const h = Math.min(vw / aspect, vh) * 0.7
  const w = h * aspect
  const x0 = (vw - w) / 2
  const y0 = (vh - h) / 2
  return [x0, y0, x0 + w, y0, x0 + w, y0 + h, x0, y0 + h]
}

export function applyQuadOverlay(
  el: HTMLVideoElement,
  corners: number[],
  camera: HTMLVideoElement,
) {
  const css = [0, 2, 4, 6].map((i) =>
    videoToCss(corners[i], corners[i + 1], camera.videoWidth, camera.videoHeight, window.innerWidth, window.innerHeight),
  )
  const cx = (css[0].x + css[1].x + css[2].x + css[3].x) / 4
  const cy = (css[0].y + css[1].y + css[2].y + css[3].y) / 4
  const pad = 1.1
  const dest = css.map((p) => ({ x: cx + (p.x - cx) * pad, y: cy + (p.y - cy) * pad }))
  const srcW = Math.max(80, Math.round(Math.hypot(dest[1].x - dest[0].x, dest[1].y - dest[0].y)))
  const srcH = Math.max(80, Math.round(Math.hypot(dest[3].x - dest[0].x, dest[3].y - dest[0].y)))
  el.style.display = 'block'
  el.style.left = '0px'
  el.style.top = '0px'
  el.style.width = `${srcW}px`
  el.style.height = `${srcH}px`
  el.style.objectFit = 'fill'
  el.style.transformOrigin = '0 0'
  el.style.willChange = 'transform'
  el.style.transform = homographyCss(srcW, srcH, dest)
}

export function hideOverlay(el: HTMLVideoElement) {
  el.style.display = 'none'
  el.pause()
}

function homographyCss(w: number, h: number, dst: { x: number; y: number }[]) {
  const src = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]
  const H = solveHomography(src, dst)
  const m = [H[0], H[3], 0, H[6], H[1], H[4], 0, H[7], 0, 0, 1, 0, H[2], H[5], 0, H[8]]
  return `matrix3d(${m.join(',')})`
}

function solveHomography(src: { x: number; y: number }[], dst: { x: number; y: number }[]) {
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]
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
