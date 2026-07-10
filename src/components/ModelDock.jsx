import useSceneStore from '../store/useSceneStore.js';
import { MODEL_CATALOG, getModelById } from '../data/modelCatalog.js';

const ACCENT = '#FF6B1A';
const SURFACE = '#12161E';

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
  const scalePercent = selectedObject ? Math.round(selectedObject.userScaleFactor * 100) : 100;

  const handleScaleChange = (delta) => {
    if (!selectedObject) return;
    updateObjectScale(selectedObject.id, Math.min(4.0, Math.max(0.25, selectedObject.userScaleFactor + delta)));
  };

  const handleSliderChange = (e) => {
    if (!selectedObject) return;
    updateObjectScale(selectedObject.id, parseFloat(e.target.value));
  };

  const handleModelPillClick = (modelId) => {
    if (selectedObject) replaceObjectModel(selectedObject.id, modelId);
    setSelectedModelId(modelId);
  };

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      <div style={{
        pointerEvents: 'auto',
        background: 'rgba(18,22,30,0.94)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px 24px',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedObject ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedModel.displayName}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
                  Drag to move · Two-finger rotate · {scalePercent}%
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Place model</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
                  Tap a surface to add {selectedModel.displayName}
                </p>
              </>
            )}
          </div>
          {selectedObject && (
            <button
              onClick={deleteSelected}
              style={{
                padding: '7px 14px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.25)',
                color: '#FF4D6A', fontSize: 12, fontWeight: 500,
              }}
            >
              Delete
            </button>
          )}
        </div>

        {/* Scale slider */}
        {selectedObject && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <ScaleBtn label="−" onClick={() => handleScaleChange(-0.1)} />
            <input
              type="range" min="0.25" max="4.0" step="0.05"
              value={selectedObject.userScaleFactor}
              onChange={handleSliderChange}
              style={{ flex: 1, height: 4, accentColor: ACCENT, cursor: 'pointer' }}
            />
            <ScaleBtn label="+" onClick={() => handleScaleChange(0.1)} />
            <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, width: 42, textAlign: 'right' }}>
              {scalePercent}%
            </span>
          </div>
        )}

        {/* Model pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {MODEL_CATALOG.map((model) => {
            const isActive = selectedObject ? selectedObject.modelId === model.id : selectedModelId === model.id;
            return (
              <button
                key={model.id}
                onClick={() => handleModelPillClick(model.id)}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: 20,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: isActive ? 'rgba(255,107,26,0.15)' : SURFACE,
                  border: `1px solid ${isActive ? 'rgba(255,107,26,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: isActive ? ACCENT : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s',
                }}
              >
                {model.displayName}
              </button>
            );
          })}
        </div>

        {/* Placed chips */}
        {placedObjects.length >= 2 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 4 }}>
            {placedObjects.map((obj, idx) => {
              const objModel = getModelById(obj.modelId);
              const isSelected = obj.id === selectedObjectId;
              return (
                <button
                  key={obj.id}
                  onClick={() => selectObject(obj.id)}
                  style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 12,
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: isSelected ? 'rgba(255,107,26,0.15)' : 'rgba(18,22,30,0.8)',
                    border: `1px solid ${isSelected ? 'rgba(255,107,26,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color: isSelected ? ACCENT : 'rgba(255,255,255,0.55)',
                  }}
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

function ScaleBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 34, height: 34, borderRadius: 10,
        background: SURFACE, border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.75)', fontSize: 18, fontWeight: 700, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
