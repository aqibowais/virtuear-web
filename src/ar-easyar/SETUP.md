# EasyAR CRS setup

The EasyAR path uses **Cloud Recognition (CRS)** to identify the print, then a **local pose tracker** to pin the video on the image (same overlay idea as 8th Wall).

Credentials live in `src/ar-easyar/config.ts` (AppId, Token, API Key, Client-end URL). **Do not push that file to a public repo.** The API Secret stays in the EasyAR portal — the web client does not use it.

## What you still need to do in the portal

The library `virtuarwebar` showed **1 / 100000** images. CRS only matches images that are **uploaded and enabled**. Upload all 12 prints:

`src/ar-alpharas/assets/image-targets/imagesAR/`

| File | Target name in CRS (must match) |
|------|----------------------------------|
| 1.png | `1` |
| 2.png | `2` |
| … | … |
| 12.png | `12` |

Use those resized files (already ≥ 480×640). Names must be exactly `1`–`12` so the matching video (`videos/1.mp4`, …) plays.

After upload, confirm each target is **active**.

## Run

1. Rebuild EasyAR (after any `src/ar-easyar` change):

```bash
npm run build:easyar
```

2. Restart `npm run dev` so the CRS proxy is loaded (`/easyar-crs` → your NA1 Client-end URL).

3. On the phone: `https://<your-pc-ip>:5173/alpharas?engine=easyar`

4. Allow camera. Status should become **Point camera at a target image**, then **Playing video for Alphara N** once the video is locked to the print.

## Limits (trial)

- **500 searches/day.** The app polls about every 0.9s while scanning and 1.8s while a video is playing. Do not point at a print all day during tests.
- Token expires **2026-10-25**. Library trial listed around **2026-09-09**.
- CRS on the web returns a **name**, not a native 6DoF pose. Local tracking estimates the image quad so the video covers the print.

## If recognition fails

- **No match:** more images still need uploading, or the name is not `1`–`12`.
- **Quota / limit message:** wait until the daily 500 reset, or upgrade the plan.
- **Auth error:** generate a new Token in the portal and paste it into `config.ts`, then rebuild.
- **CORS / network:** only `npm run dev` (or `npm run preview`) proxies CRS. A static host needs its own `/easyar-crs` proxy.

## Same assets as 8th Wall

- Images: `src/ar-alpharas/assets/image-targets/imagesAR/`
- Videos: `src/ar-alpharas/assets/videos/`
