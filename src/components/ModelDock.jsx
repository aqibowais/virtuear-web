import useSceneStore from '../store/useSceneStore.js';
import { MODEL_CATALOG, getModelById } from '../data/modelCatalog.js';

export default function ModelDock() {
  const placedObjects = useSceneStore((s) => s.placedObjects);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const selectedModelId = useSceneStore((s) => s.selectedModelId);
  const setSelectedModelId = useSceneStore((s) => s.setSelectedModelId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const updateObjectScale = useSceneStore((s) => s.updateObjectScale);
  const replaceObjectModel = useSceneStore((s) => s.replaceObjectModel);
  const deleteSelected = useSceneStore((s) => s.deleteSelected);

  const selectedObject = placedObjects.find((o) => o.id === selectedObjectId);
  const selectedModel = getModelById(selectedObject?.modelId ?? selectedModelId);
  const scalePercent = selectedObject
    ? Math.round(selectedObject.userScaleFactor * 100)
    : 100;

  const handleScaleChange = (delta) => {
    if (!selectedObject) return;
    const newFactor = Math.min(4.0, Math.max(0.25, selectedObject.userScaleFactor + delta));
    updateObjectScale(selectedObject.id, newFactor);
  };

  const handleSliderChange = (e) => {
    if (!selectedObject) return;
    updateObjectScale(selectedObject.id, parseFloat(e.target.value));
  };

  const handleModelPillClick = (modelId) => {
    if (selectedObject) {
      // Replace current object's model
      replaceObjectModel(selectedObject.id, modelId);
    }
    // Always update selected model for next placement
    setSelectedModelId(modelId);
  };

  const styles = {
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      pointerEvents: 'none',
    },
    panel: {
      pointerEvents: 'auto',
      background: 'rgba(20,27,36,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px 20px 0 0',
      padding: '12px 16px 24px',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: 'rgba(255,255,255,0.24)',
      margin: '0 auto 12px',
    },
    title: {
      fontSize: 15,
      fontWeight: 600,
      color: 'white',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    subtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.6)',
      margin: '2px 0 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    deleteBtn: {
      pointerEvents: 'auto',
      marginLeft: 12,
      padding: '6px 12px',
      borderRadius: 12,
      background: 'rgba(255,77,106,0.15)',
      border: '1px solid rgba(255,77,106,0.3)',
      color: '#FF4D6A',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
    },
    scaleBtn: {
      pointerEvents: 'auto',
      width: 32,
      height: 32,
      borderRadius: 8,
      background: '#141B24',
      border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.8)',
      fontSize: 18,
      fontWeight: 700,
      cursor: 'pointer',
    },
    pill: (isActive) => ({
      pointerEvents: 'auto',
      flexShrink: 0,
      padding: '8px 14px',
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
      background: isActive ? 'rgba(0,229,255,0.2)' : '#141B24',
      border: `1px solid ${isActive ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
      color: isActive ? '#00E5FF' : 'rgba(255,255,255,0.6)',
    }),
    chip: (isSelected) => ({
      pointerEvents: 'auto',
      flexShrink: 0,
      padding: '6px 12px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      background: isSelected ? 'rgba(0,229,255,0.2)' : 'rgba(20,27,36,0.8)',
      border: `1px solid ${isSelected ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
      color: isSelected ? '#00E5FF' : 'rgba(255,255,255,0.6)',
    }),
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        {/* Drag handle */}
        <div style={styles.handle} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedObject ? (
              <>
                <p style={styles.title}>{selectedModel.displayName}</p>
                <p style={styles.subtitle}>Drag to move · Rotate with two fingers · {scalePercent}%</p>
              </>
            ) : (
              <>
                <p style={styles.title}>Place model</p>
                <p style={styles.subtitle}>Tap a surface to add {selectedModel.displayName}</p>
              </>
            )}
          </div>
          {selectedObject && (
            <button onClick={deleteSelected} style={styles.deleteBtn}>Delete</button>
          )}
        </div>

        {/* Scale controls */}
        {selectedObject && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button onClick={() => handleScaleChange(-0.1)} style={styles.scaleBtn}>−</button>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.05"
              value={selectedObject.userScaleFactor}
              onChange={handleSliderChange}
              style={{ flex: 1, height: 4, accentColor: '#00E5FF', cursor: 'pointer' }}
            />
            <button onClick={() => handleScaleChange(0.1)} style={styles.scaleBtn}>+</button>
            <span style={{ fontSize: 12, color: '#00E5FF', fontWeight: 500, width: 40, textAlign: 'right' }}>
              {scalePercent}%
            </span>
          </div>
        )}

        {/* Model pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {MODEL_CATALOG.map((model) => {
            const isActive = selectedObject
              ? selectedObject.modelId === model.id
              : selectedModelId === model.id;
            return (
              <button
                key={model.id}
                onClick={() => handleModelPillClick(model.id)}
                style={styles.pill(isActive)}
              >
                {model.displayName}
              </button>
            );
          })}
        </div>

        {/* Placed object chips */}
        {placedObjects.length >= 2 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 4 }}>
            {placedObjects.map((obj, idx) => {
              const objModel = getModelById(obj.modelId);
              const isSelected = obj.id === selectedObjectId;
              return (
                <button
                  key={obj.id}
                  onClick={() => selectObject(obj.id)}
                  style={styles.chip(isSelected)}
                >
                  {objModel.displayName} #{idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
