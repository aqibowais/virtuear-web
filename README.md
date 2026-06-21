# Virtuar

Web-first AR application for placing 3D robot models on real-world surfaces through the browser camera. Built with React, Three.js, and WebXR.

## Features

- **Full AR mode** on supported devices (Android Chrome with WebXR)
- **3D Preview fallback** on unsupported devices (desktop browsers, iOS Safari)
- Place multiple GLB models on surfaces
- Scale, rotate, and drag placed models
- Dark futuristic UI theme

## Tech Stack

- React 19 + JavaScript (no TypeScript)
- Vite for bundling
- React Router v6
- Tailwind CSS v4
- Three.js via @react-three/fiber + @react-three/drei
- @react-three/xr for WebXR immersive-ar
- Zustand for state management

## Local Development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### HTTPS for AR Testing

Camera and WebXR APIs require HTTPS. For local AR testing:

**Option 1 — Deploy to Vercel preview** (recommended for quick testing)

**Option 2 — Vite with basic-ssl plugin:**

```js
// vite.config.js (uncomment for local HTTPS)
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  // ...
});
```

Then run `npm run dev` and accept the self-signed certificate.

## Build & Deploy

```bash
npm run build
```

Output is in `dist/`. Deploy to any static host (Vercel, Netlify, etc.).

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The included `vercel.json` handles SPA routing automatically.

## Browser Compatibility

| Platform | Experience |
|----------|-----------|
| Android Chrome | Full WebXR AR |
| Windows Chrome/Edge | 3D Preview only |
| Mac Safari | 3D Preview only |
| iPhone Safari | 3D Preview only |
| Firefox | 3D Preview only |

## Adding GLB Models

Place GLB files in `public/models/` matching the paths in `src/data/modelCatalog.js`:

```
public/models/
  sketchfab/mecha_robot.glb
  sketchfab/robot_character.glb
  brain_stem.glb
  ion_drive.glb
  cyber_fox.glb
  aerial_mech.glb
```

## Project Structure

```
src/
  main.jsx              — App entry point
  App.jsx               — Router setup
  index.css             — Tailwind + theme tokens
  data/modelCatalog.js  — Model definitions
  store/useSceneStore.js — Zustand global state
  pages/
    WelcomePage.jsx     — Home/landing page
    ArSessionPage.jsx   — Session bootstrap + mode detection
  components/
    ArHud.jsx           — Top overlay controls
    ModelDock.jsx       — Bottom model selection panel
    FeatureTile.jsx     — Feature card component
    PermissionGate.jsx  — Camera permission denied state
  ar/
    PreviewSession.jsx  — 3D fallback with OrbitControls
    WebXrSession.jsx    — WebXR immersive-ar session
    PlacedModel.jsx     — GLB model instance
    SceneGrid.jsx       — Debug grid overlay
```

## License

Private project.
