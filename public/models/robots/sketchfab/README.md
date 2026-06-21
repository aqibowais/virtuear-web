# Sketchfab robot imports (manual)

Sketchfab downloads require a free [Sketchfab](https://sketchfab.com) account. The Virtuar app cannot fetch these automatically.

For each model:

1. Open the link below and click **Download 3D Model**.
2. Choose **glTF** or **GLB** format (prefer **GLB**).
3. Save/rename the file exactly as shown.
4. Place it in this folder: `assets/models/robots/sketchfab/`
5. Uncomment the matching entry in [`lib/data/ar_model_catalog.dart`](../../../lib/data/ar_model_catalog.dart).

| Save as | Sketchfab model |
|---------|-----------------|
| `robotic_dog.glb` | [Robotic dog with QZB95 rifle](https://sketchfab.com/3d-models/robotic-dog-with-qzb95-rifle-09e67814516e4500a9c6b2d396ba42ca) |
| `another_robot.glb` | [Another Robot](https://sketchfab.com/3d-models/another-robot-b5187425ddb14676a93ab21f050e0e6f) |
| `robot_character.glb` | [Robot character](https://sketchfab.com/3d-models/robot-character-2fe59c8ef49547d2a1e0a65506701a7e) |
| `lagst_robot.glb` | [Robot (Lagst)](https://sketchfab.com/3d-models/robot-435566387be94cbfbc623c3d45241769) |

**Tips for AR:**

- Prefer GLB under ~5 MB when possible (very large Sketchfab exports may fail on mobile).
- If a model fails to load, re-export from Blender with Draco compression disabled.
- Start with scale `1.0` in the catalog; increase if the model appears too small.
