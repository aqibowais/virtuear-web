import useSceneStore from '../store/useSceneStore.js';

const ACCENT = '#FF6B1A';

const pill = {
  padding: '6px 16px', borderRadius: 20,
  background: 'rgba(18,22,30,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(10px)',
};

const iconBtn = (active) => ({
  pointerEvents: 'auto',
  width: 42, height: 42, borderRadius: 12,
  background: active ? 'rgba(255,107,26,0.15)' : 'rgba(18,22,30,0.85)',
  border: `1px solid ${active ? 'rgba(255,107,26,0.35)' : 'rgba(255,255,255,0.08)'}`,
  backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: active ? ACCENT : 'rgba(255,255,255,0.7)',
  cursor: 'pointer', transition: 'all 0.2s',
});

export default function ArHud({ isArMode, onBack }) {
  const placedObjects = useSceneStore((s) => s.placedObjects);
  const showPlanes = useSceneStore((s) => s.showPlanes);
  const toggleShowPlanes = useSceneStore((s) => s.toggleShowPlanes);
  const clearScene = useSceneStore((s) => s.clearScene);
  const resetSession = useSceneStore((s) => s.resetSession);

  const hasObjects = placedObjects.length > 0;

  const handleBack = () => {
    resetSession();
    if (onBack) onBack();
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px', gap: 8 }}>
        {/* Back */}
        <button onClick={handleBack} style={iconBtn(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Grid toggle */}
        <button onClick={toggleShowPlanes} style={iconBtn(showPlanes)}>
          {showPlanes ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          )}
        </button>

        {/* Title pill */}
        <div style={{ ...pill, pointerEvents: 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.8)' }}>Virtuar</span>
        </div>

        {/* Clear */}
        <button
          onClick={hasObjects ? clearScene : undefined}
          style={{
            ...iconBtn(false),
            opacity: hasObjects ? 1 : 0.4,
            cursor: hasObjects ? 'pointer' : 'default',
            pointerEvents: hasObjects ? 'auto' : 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M8 6V4h8v2" />
            <path d="m19 6-.7 14a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L5 6" />
          </svg>
        </button>
      </div>

      {/* Hint */}
      {!hasObjects && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 0' }}>
          <div style={pill}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: 0 }}>
              {isArMode
                ? 'Scan a flat surface, then tap to place'
                : 'Tap the floor to place a model'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
