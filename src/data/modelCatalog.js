export const MODEL_CATALOG = [
  {
    id: 'mecha_robot',
    displayName: 'Mecha Robot',
    path: '/models/robots/sketchfab/mecha_robot.glb',
    defaultScale: 0.16,
  },
  {
    id: 'another_robot',
    displayName: 'Another Robot',
    path: '/models/robots/sketchfab/robot_character.glb',
    defaultScale: 0.16,
  },
  {
    id: 'brain_stem',
    displayName: 'Brain Mech',
    path: '/models/robots/brain_stem.glb',
    defaultScale: 0.35,
  },
  {
    id: 'ion_drive',
    displayName: 'Ion Drive',
    path: '/models/robots/ion_drive.glb',
    defaultScale: 0.2,
  },
  {
    id: 'cyber_fox',
    displayName: 'Cyber Fox',
    path: '/models/robots/cyber_fox.glb',
    defaultScale: 0.005,
  },
  {
    id: 'aerial_mech',
    displayName: 'Aerial Mech',
    path: '/models/robots/aerial_mech.glb',
    defaultScale: 0.005,
  },
];

export const DEFAULT_MODEL_ID = MODEL_CATALOG[0].id;

export function getModelById(id) {
  return MODEL_CATALOG.find((m) => m.id === id) ?? MODEL_CATALOG[0];
}
