/**
 * Official EasyAR WebAR uses Cloud Recognition (CRS).
 * Leave these empty to run the local ImageTracker-style fallback
 * (same printed targets / videos as the Android EasyAR app).
 *
 * Get values from https://www.easyar.com → CRS image library.
 */
export const EASYAR_CRS = {
  clientendUrl: '',
  token: '',
  appId: '',
}

export const TARGET_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export function videoPathFor(name: string) {
  const clean = String(name).replace(/^(image-|letter-)/, '')
  return `./videos/${clean}.mp4`
}

export function targetImagePath(id: string) {
  return `./image-targets/imagesAR/${id}.png`
}

export function crsEnabled() {
  return Boolean(EASYAR_CRS.clientendUrl && EASYAR_CRS.token && EASYAR_CRS.appId)
}
