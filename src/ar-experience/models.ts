export type ArModel = {
  id: string
  name: string
  asset: string
  thumb: string
  clip: string
  clips: string[]
  scale: number
  animated: boolean
  /** Local Y offset so center-origin meshes sit on the ground instead of clipping. */
  lift: number
}

export const MODELS: ArModel[] = [
  {
    id: 'walk_robot',
    name: 'Walk Robot',
    asset: 'assets/animated/robot_expressive.glb',
    thumb: 'assets/animated/robot_expressive.svg',
    clip: 'Walking',
    clips: ['Idle', 'Walking', 'Running', 'Dance', 'Wave', 'Jump'],
    scale: 0.22,
    animated: true,
    lift: 0,
  },
  {
    id: 'fox',
    name: 'Fox',
    asset: 'assets/animated/fox.glb',
    thumb: 'assets/animated/fox.svg',
    clip: 'Walk',
    clips: ['Survey', 'Walk', 'Run'],
    scale: 0.025,
    animated: true,
    lift: 0,
  },
  {
    id: 'cesium_man',
    name: 'Walk Man',
    asset: 'assets/animated/cesium_man.glb',
    thumb: 'assets/animated/cesium_man.svg',
    clip: '',
    clips: [],
    scale: 0.7,
    animated: true,
    lift: 0,
  },
  {id: 'mecha_robot', name: 'Mecha Robot', asset: 'assets/mecha_robot.glb', thumb: 'assets/thumbs/mecha_robot.svg', clip: '', clips: [], scale: 0.16, animated: false, lift: 0.8},
  {id: 'another_robot', name: 'Another Robot', asset: 'assets/robot_character.glb', thumb: 'assets/thumbs/robot_character.svg', clip: '', clips: [], scale: 0.16, animated: false, lift: 0.8},
  {id: 'brain_stem', name: 'Brain Mech', asset: 'assets/brain_stem.glb', thumb: 'assets/thumbs/brain_stem.svg', clip: '', clips: [], scale: 0.35, animated: false, lift: 0.8},
  {id: 'ion_drive', name: 'Ion Drive', asset: 'assets/ion_drive.glb', thumb: 'assets/thumbs/ion_drive.svg', clip: '', clips: [], scale: 0.2, animated: false, lift: 0.8},
  {id: 'cyber_fox', name: 'Cyber Fox', asset: 'assets/cyber_fox.glb', thumb: 'assets/thumbs/cyber_fox.svg', clip: '', clips: [], scale: 0.005, animated: false, lift: 0.8},
  {id: 'aerial_mech', name: 'Aerial Mech', asset: 'assets/aerial_mech.glb', thumb: 'assets/thumbs/aerial_mech.svg', clip: '', clips: [], scale: 0.005, animated: false, lift: 0.8},
]

export const OBJECT_PLACED_EVENT = 'object-placed'
export const SELECTION_CHANGED_EVENT = 'selection-changed'
