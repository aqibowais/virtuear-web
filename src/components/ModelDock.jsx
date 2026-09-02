import useSceneStore from '../store/useSceneStore.js';
import { MODEL_CATALOG, getModelById } from '../data/modelCatalog.js';

const ACCENT = '#FF6B1A';
const SURFACE = '#12161E';

export default function ModelDock() {
  const placedObjects = useSceneStore((s) => s.placedObjects);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const selectedModelId = useSceneStore((s) => s.selectedModelId);
  const placeMode = useSceneStore((s) => s.placeMode);
  const setSelectedModelId = useSceneStore((s) => s.setSelectedModelId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const updateObjectScale = useSceneStore((s) => s.updateObjectScale);
  const updateObjectRotation = useSceneStore((s) => s.updateObjectRotation);
  const setObjectClip = useSceneStore((s) => s.setObjectClip);
  const setObjectPaused = useSceneStore((s) => s.setObjectPaused);
  const deleteSelected = useSceneStore((s) => s.deleteSelected);

  const selectedObject = placedObjects.find((o) => o.id === selectedObjectId);
  const selectedModel = getModelById(selectedObject?.modelId ?? selectedModelId);
  const scalePercent = selectedObject ? Math.round(selectedObject.userScaleFactor * 100) : 100;
  const yawDeg = selectedObject ? Math.round((selectedObject.rotation[1] * 180) / Math.PI) : 0;

  const handleScaleChange = (delta) => {
    if (!selectedObject) return;
    updateObjectScale(selectedObject.id, Math.min(8.0, Math.max(0.15, selectedObject.userScaleFactor + delta)));
  };

  const handleSliderChange = (e) => {
    if (!selectedObject) return;
    updateObjectScale(selectedObject.id, parseFloat(e.target.value));
  };

  const handleRotate = (e) => {
    if (!selectedObject) return;
    const yaw = (parseFloat(e.target.value) * Math.PI) / 180;
    updateObjectRotation(selectedObject.id, [selectedObject.rotation[0], yaw, selectedObject.rotation[2]]);
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
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedObject && !placeMode ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedModel.displayName}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
                  Drag to move · click floor to relocate · {scalePercent}%
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Place model</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
                  Click an icon, then tap the floor to add {selectedModel.displayName}
                </p>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {selectedObject && selectedModel.animated && (
              <button
                onClick={() => setObjectPaused(selectedObject.id, !selectedObject.paused)}
                title={selectedObject.paused ? 'Play animation' : 'Pause animation'}
                style={{
                  width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
                  background: SURFACE, border: '1px solid rgba(255,255,255,0.08)',
                  color: ACCENT, fontSize: 13, fontWeight: 700,
                }}
              >
                {selectedObject.paused ? '▶' : '❚❚'}
              </button>
            )}
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
        </div>

        {selectedObject && selectedModel.clips?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 2 }}>
            {selectedModel.clips.map((clip) => {
              const active = (selectedObject.clip || selectedModel.clip) === clip;
              return (
                <button
                  key={clip}
                  onClick={() => setObjectClip(selectedObject.id, clip)}
                  style={{
                    flexShrink: 0, padding: '6px 10px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${active ? 'rgba(255,107,26,0.5)' : 'rgba(255,107,26,0.25)'}`,
                    background: active ? 'rgba(255,107,26,0.22)' : 'rgba(255,107,26,0.1)',
                    color: ACCENT, fontSize: 11, fontWeight: 600,
                  }}
                >
                  {clip}
                </button>
              );
            })}
          </div>
        )}

        {selectedObject && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <ScaleBtn label="−" onClick={() => handleScaleChange(-0.1)} />
              <input
                type="range" min="0.15" max="8.0" step="0.05"
                value={selectedObject.userScaleFactor}
                onChange={handleSliderChange}
                style={{ flex: 1, height: 4, accentColor: ACCENT, cursor: 'pointer' }}
              />
              <ScaleBtn label="+" onClick={() => handleScaleChange(0.1)} />
              <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, width: 42, textAlign: 'right' }}>
                {scalePercent}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', width: 44 }}>Rotate</span>
              <input
                type="range" min="-180" max="180" step="1"
                value={yawDeg}
                onChange={handleRotate}
                style={{ flex: 1, height: 4, accentColor: ACCENT, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, width: 42, textAlign: 'right' }}>
                {yawDeg}°
              </span>
            </div>
          </>
        )}

        {['animated', 'static'].map((group) => {
          const animated = group === 'animated';
          const models = MODEL_CATALOG.filter((m) => m.animated === animated);
          return (
            <div key={group} style={{ marginBottom: 10 }}>
              <p style={{
                margin: '0 0 6px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: animated ? ACCENT : 'rgba(255,255,255,0.45)',
              }}>
                {animated ? 'Animated' : 'Static'}
              </p>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {models.map((model) => {
                  const placingThis = placeMode && selectedModelId === model.id;
                  const isActive = placeMode
                    ? selectedModelId === model.id
                    : selectedObject?.modelId === model.id && selectedModelId === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      title={model.displayName}
                      style={{
                        flexShrink: 0, padding: 6, borderRadius: 14, cursor: 'pointer',
                        background: placingThis ? 'rgba(255,107,26,0.2)' : SURFACE,
                        border: 'none',
                        boxShadow: placingThis || isActive ? '0 0 0 2px #FF6B1A' : '0 0 0 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      <div style={{ position: 'relative', width: 56, height: 56 }}>
                        {model.thumb ? (
                          <img
                            src={model.thumb}
                            alt={model.displayName}
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, display: 'block' }}
                          />
                        ) : (
                          <div style={{
                            width: 56, height: 56, borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: ACCENT, fontWeight: 700, fontSize: 20, background: '#1a2433',
                          }}>
                            {model.displayName.slice(0, 1)}
                          </div>
                        )}
                        {model.animated && (
                          <span style={{
                            position: 'absolute', right: 2, bottom: 2, fontSize: 9,
                            background: 'rgba(255,107,26,0.9)', color: '#fff',
                            borderRadius: 4, padding: '1px 4px', lineHeight: 1.2,
                          }}>
                            ▶
                          </span>
                        )}
                      </div>
                      <span style={{
                        display: 'block', marginTop: 4, fontSize: 10, fontWeight: 600,
                        color: 'rgba(255,255,255,0.75)', maxWidth: 64,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {model.displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

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
