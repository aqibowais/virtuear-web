import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_MODEL_ID } from '../data/modelCatalog.js';

const useSceneStore = create((set, get) => ({
  placedObjects: [],
  selectedObjectId: null,
  selectedModelId: DEFAULT_MODEL_ID,
  showPlanes: false,

  setSelectedModelId: (id) => set({ selectedModelId: id }),

  placeObject: (hitPosition) => {
    const { selectedModelId } = get();
    // Only one object at a time — replace existing if any
    const newObject = {
      id: uuidv4(),
      modelId: selectedModelId,
      position: [...hitPosition],
      rotation: [0, 0, 0],
      userScaleFactor: 1.0,
    };
    set({
      placedObjects: [newObject],
      selectedObjectId: newObject.id,
    });
    return newObject.id;
  },

  selectObject: (id) => set({ selectedObjectId: id }),

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
          ? { ...obj, userScaleFactor: Math.min(4.0, Math.max(0.25, factor)) }
          : obj
      ),
    })),

  replaceObjectModel: (id, newModelId) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id ? { ...obj, modelId: newModelId } : obj
      ),
    })),

  deleteSelected: () =>
    set((state) => ({
      placedObjects: state.placedObjects.filter(
        (obj) => obj.id !== state.selectedObjectId
      ),
      selectedObjectId: null,
    })),

  clearScene: () => set({ placedObjects: [], selectedObjectId: null }),

  toggleShowPlanes: () =>
    set((state) => ({ showPlanes: !state.showPlanes })),

  resetSession: () =>
    set({
      placedObjects: [],
      selectedObjectId: null,
      selectedModelId: DEFAULT_MODEL_ID,
      showPlanes: false,
    }),
}));

export default useSceneStore;
