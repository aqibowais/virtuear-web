# Adding animated 3D models to Virtuar

The phone AR experience (8th Wall ECS) and the desktop 3D preview share the same idea: pick a model from the **icon dock**, tap a surface to place it, then select it to move / rotate / scale and play its clips.

Three animated samples are already in the project:

| Name | File | Clips | Source |
| --- | --- | --- | --- |
| Walk Robot | `robot_expressive.glb` | Idle, Walking, Running, Dance, Wave, Jump, … | [three.js RobotExpressive](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive) |
| Fox | `fox.glb` | Survey, Walk, Run | [Khronos Fox](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox) |
| Walk Man | `cesium_man.glb` | one unnamed walk cycle (leave `clip` empty) | [Khronos CesiumMan](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/CesiumMan) |

## Where files go

You must copy each new model into **both** places:

1. Phone AR (webpack copies this folder into `/ar/assets/`):
   `virtuear-web/src/ar-experience/assets/animated/your_model.glb`
2. Desktop preview (Vite serves `public/` as `/`):
   `virtuear-web/public/models/robots/animated/your_model.glb`

Add a square thumbnail (SVG, PNG, or JPG, about 128×128) next to the GLB:

- AR: `src/ar-experience/assets/animated/your_model.svg`
- Preview: `public/models/robots/animated/your_model.svg`

Static (non-animated) thumbs live in `src/ar-experience/assets/thumbs/` and `public/models/robots/thumbs/`.

## Register the model

**Phone AR** — `src/ar-experience/models.ts`:

```ts
{
  id: 'my_robot',
  name: 'My Robot',
  asset: 'assets/animated/my_robot.glb',
  thumb: 'assets/animated/my_robot.svg',
  clip: 'Walk',          // default clip name, or '' to play the first clip
  clips: ['Idle', 'Walk', 'Run'],
  scale: 0.3,            // start small and raise if it looks tiny
  animated: true,
}
```

**Desktop preview** — `src/data/modelCatalog.js` (same `id`, preview paths):

```js
{
  id: 'my_robot',
  displayName: 'My Robot',
  path: '/models/robots/animated/my_robot.glb',
  thumb: '/models/robots/animated/my_robot.svg',
  defaultScale: 0.3,
  animated: true,
  clip: 'Walk',
  clips: ['Idle', 'Walk', 'Run'],
}
```

Then rebuild the phone bundle:

```bash
npm run build:ar
```

## How to download more models

Use **glTF Binary (`.glb`)** with embedded animations. Avoid `.fbx` unless you convert it first.

### Mixamo (best for walking characters)

1. Open [https://www.mixamo.com](https://www.mixamo.com) (free Adobe account).
2. Pick a character, then an animation such as **Walking** or **Idle**.
3. For AR, turn **In Place** on so the character walks without drifting off the tap point.
4. Download as **glTF Binary (.glb)** or FBX and convert (see below).
5. Drop the file into both folders and add the catalog entries.

### Sketchfab

1. Search on [Sketchfab](https://sketchfab.com) and filter **Downloadable** + **Animated**.
2. Download **glTF**. If you get a zip with `.gltf` + `.bin` + textures, keep the folder or pack it into one `.glb` in Blender (`File → Export → glTF 2.0`, format *glTF Binary*).
3. Check the license (CC-BY still needs credit).

### Khronos sample models

Ready-made animated GLBs:

- https://github.com/KhronosGroup/glTF-Sample-Assets
- Direct binary files are usually under `Models/<Name>/glTF-Binary/<Name>.glb`

PowerShell example:

```powershell
New-Item -ItemType Directory -Force -Path "src\ar-experience\assets\animated","public\models\robots\animated"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb" -OutFile "src\ar-experience\assets\animated\fox.glb"
Copy-Item "src\ar-experience\assets\animated\fox.glb" "public\models\robots\animated\fox.glb"
```

### three.js examples

https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf  
`RobotExpressive.glb` is the walking/dancing robot already in this app.

### Convert FBX / Blender

In Blender: import the character, confirm the Action/NLA clips play, then **Export → glTF 2.0**:

- Format: **glTF Binary (.glb)**
- Include: **Animation**
- Resting pose at the origin, standing on the ground plane (Y-up)

## Clip names

8th Wall and Three.js play clips **by name**. Open the GLB in [https://gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com) and read the animation list. Put those exact strings in `clips`. If there is only one unnamed clip (CesiumMan), set `clip: ''` and `clips: []`.

## Scale

Characters are authored at very different sizes. Start around `0.2`–`0.5` for humanoids, much smaller (`0.02`) for the Khronos Fox. Tune in AR with pinch, or on desktop with the scale slider.

## Interaction recap (after you add a model)

1. Tap the **thumbnail** in the dock (not a text pill).
2. Tap a real surface (phone) or the floor (desktop) to spawn another instance — several models can be in the scene at once.
3. Tap a placed model to select it.
4. Tap empty ground to **move** the selection, pinch to **scale**, two fingers to **rotate**.
5. For animated models, use **play/pause** and the clip chips.
