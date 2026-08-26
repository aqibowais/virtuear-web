/**
 * EasyAR Cloud Recognition (CRS) — virtuarwebar / North America Region 1
 *
 * Do not commit this file to a public repo. Token expires 2026-10-25.
 * Trial: 500 searches/day.
 */
export const EASYAR_CRS = {
  clientendUrl: 'https://4c29f7119442e8f838b517918dbd00cf.na1.crs.easyar.com:8443',
  /** Same-origin path; Vite proxies this to clientendUrl (avoids CORS). */
  proxyPath: '/easyar-crs',
  token:
    'WYoZ4QrJ7WYkeD21iOwI2uUcLmycMjsbJqCPzF6PZFOAQuBvs14pALsphQUhy04BCsCkAeuFpzl1AGNP1/o7xiludJbgMAQ4dS5P8Sm1oX2lQZJ3EBe+e1FmHvlrMwBpQNW4vfJLrTyr54TLOwKjvHs/H6Udo4ScgMUXEvCcARdwBX3/6Te0ggbZ+QqTiS1Tzzk0OkUgnuTvb7zz1EPVIaTOGFik505tfo/3PX6UYtdvJr2eYc8U4boZs30byfFfwlFPPaXWioP+Q47UN5w6KyzGtK+1RQ4ICYv4DBLN7abXjrbJkQ+eh3UvxX9GOaFzvQRsk5VIhxur1ETWt8FkmErscYhuPZ4gxlW1CeW3FMS7GlbbUszgoWp1zLmXshoSZP+/km1FN37un1r6noOZCGjEqsvg1eKrW1zq+rJnwqDhb5am50g/kbTCPEoU62a4+mFdQ3I97+m5y8KIaU/kHw==',
  appId: '4c29f7119442e8f838b517918dbd00cf',
  apiKey: 'da7d29294f1d84c2bd3c880acb3224c8',
}

export const TARGET_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export function videoPathFor(name: string) {
  const clean = String(name).replace(/^(image-|letter-)/, '')
  return `./videos/${clean}.mp4`
}

export function targetImageCandidates(id: string) {
  return [
    `./image-targets/lettersAR/${id}.png`,
    `./image-targets/imagesAR/${id}.png`,
    `./image-targets/tracking/${id}_luminance.jpg`,
  ]
}

export function crsEnabled() {
  return Boolean(EASYAR_CRS.clientendUrl && EASYAR_CRS.token && EASYAR_CRS.appId)
}

export function crsSearchBase() {
  return EASYAR_CRS.proxyPath
}
