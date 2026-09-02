import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_MODEL_ID, getModelById } from '../data/modelCatalog.js';

const useSceneStore = create((set, get) => ({
  placedObjects: [],
  selectedObjectId: null,
  selectedModelId: DEFAULT_MODEL_ID,
  placeMode: true,
  showPlanes: false,
  isDragging: false,

  setSelectedModelId: (id) =>
    set({
      selectedModelId: id,
      placeMode: true,
      selectedObjectId: null,
    }),

  setPlaceMode: (placeMode) => set({ placeMode }),
  setDragging: (isDragging) => set({ isDragging }),

  placeObject: (hitPosition) => {
    const { selectedModelId } = get();
    const model = getModelById(selectedModelId);
    const newObject = {
      id: uuidv4(),
      modelId: selectedModelId,
      position: [...hitPosition],
      rotation: [0, 0, 0],
      userScaleFactor: 1.0,
      clip: model.clip || '',
      paused: false,
    };
    set((state) => ({
      placedObjects: [...state.placedObjects, newObject],
      selectedObjectId: newObject.id,
      placeMode: false,
    }));
    return newObject.id;
  },

  selectObject: (id) =>
    set({
      selectedObjectId: id,
      placeMode: !id,
    }),

  updateObjectPosition: (id, pos) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id ? { ...obj, position: [...pos] } : obj
      ),
    })),

  updateObjectRotation: (id, rot) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id ? { ...obj, rotation: [...rot] } : obj
      ),
    })),

  updateObjectScale: (id, factor) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id
          ? { ...obj, userScaleFactor: Math.min(8.0, Math.max(0.15, factor)) }
          : obj
      ),
    })),

  setObjectClip: (id, clip) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id ? { ...obj, clip, paused: false } : obj
      ),
    })),

  setObjectPaused: (id, paused) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id ? { ...obj, paused } : obj
      ),
    })),

  replaceObjectModel: (id, newModelId) =>
    set((state) => {
      const model = getModelById(newModelId);
      return {
        placedObjects: state.placedObjects.map((obj) =>
          obj.id === id
            ? { ...obj, modelId: newModelId, clip: model.clip || '', paused: false }
            : obj
        ),
      };
    }),

  deleteSelected: () =>
    set((state) => ({
      placedObjects: state.placedObjects.filter(
        (obj) => obj.id !== state.selectedObjectId
      ),
      selectedObjectId: null,
      placeMode: true,
    })),

  clearScene: () => set({ placedObjects: [], selectedObjectId: null, placeMode: true }),

  toggleShowPlanes: () =>
    set((state) => ({ showPlanes: !state.showPlanes })),

  resetSession: () =>
    set({
      placedObjects: [],
      selectedObjectId: null,
      selectedModelId: DEFAULT_MODEL_ID,
      placeMode: true,
      showPlanes: false,
      isDragging: false,
    }),
}));

export default useSceneStore;
