# Les Alpharas — Image AR Setup

This AR experience uses **8th Wall's XR8 engine** to detect printed target images
and play corresponding videos as AR overlays.

Engine toggle for the professor’s comparison: `/alpharas?engine=8thwall` or `/alpharas?engine=easyar`.
EasyAR notes: `src/ar-easyar/SETUP.md`. Report template: `COMPARISON-REPORT.md` at the repo root.

There is **no App Key**. 8th Wall Studio's Publish dialog (HTML5 / Embed) is for
exporting a Studio-built game, not for this self-hosted React app.

## How It Works

1. Camera detects a target image (from the `imagesAR` set)
2. XR8 identifies which target was found by name (`1` … `12`)
3. The corresponding video (`videos/1.mp4`, etc.) plays on a Three.js plane
   positioned over the detected image

## 8th Wall Studio Publish — HTML5 vs Embed

You can **close that Publish window**. Do not use either option for VirtuAR.

| Option | What it does | Use for VirtuAR? |
|--------|----------------|------------------|
| **HTML5** | Builds a `.zip` of the Studio scene to host on itch.io / Netlify / etc. | No — that would replace our custom video overlay |
| **Embed** | Gives an `<iframe>` snippet for a Studio-hosted build | No — `/alpharas` already iframes our own `/ar-alpharas/index.html` |

Image targets are loaded **locally** from `assets/image-targets/tracking/`
(480×640 grayscale JPEGs + JSON). The engine script is the same one the
existing 3D model AR page uses:

```html
<script src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js"
        async crossorigin="anonymous" data-preload-chunks="slam"></script>
```

## Assets

### Videos (`assets/videos/`)
- `1.mp4` through `12.mp4` — Alphara character videos

### Target Images (`assets/image-targets/`)
- `imagesAR/` — color images to print (camera mode 1)
- `lettersAR/` — letter form images (camera mode 2)
- `tracking/` — 8th Wall luminance JPEGs + JSON used at runtime
- Workspace root: `G:\mitacs project\virtuear-web`

Print from `imagesAR/` (or the Android app assets). The tracking copies are
only for the engine.

## Build

```bash
npm run build:alpharas    # Webpack builds → alpharas-dist/
                          # Post-build copies → public/ar-alpharas/
```

## Target Name Convention

The image-to-video mapping in `main.ts` uses numeric names:
- Target name `"1"` → `videos/1.mp4`
- Target name `"2"` → `videos/2.mp4`
- ...etc.

Names prefixed with `image-` or `letter-` are also handled
(the prefix is stripped before lookup).
