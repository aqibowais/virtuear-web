import useSceneStore from '../store/useSceneStore.js';

export default function ArHud({ isArMode, onBack }) {
  const placedObjects = useSceneStore((s) => s.placedObjects);
  const showPlanes = useSceneStore((s) => s.showPlanes);
  const toggleShowPlanes = useSceneStore((s) => s.toggleShowPlanes);
  const clearScene = useSceneStore((s) => s.clearScene);
  const resetSession = useSceneStore((s) => s.resetSession);

  const hasObjects = placedObjects.length > 0;

  const handleBack = () => {
    resetSession();
    if (onBack) {
      onBack();
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            pointerEvents: 'auto',
            width: 40, height: 40,
            borderRadius: 12,
            background: 'rgba(20,27,36,0.8)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Grid toggle */}
        <button
          onClick={toggleShowPlanes}
          style={{
            pointerEvents: 'auto',
            width: 40, height: 40,
            borderRadius: 12,
            background: showPlanes ? 'rgba(0,229,255,0.2)' : 'rgba(20,27,36,0.8)',
            border: `1px solid ${showPlanes ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: showPlanes ? '#00E5FF' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {showPlanes ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          )}
        </button>

        {/* Center pill */}
        <div style={{
          pointerEvents: 'none',
          padding: '6px 16px',
          borderRadius: 20,
          background: 'rgba(20,27,36,0.8)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.8)' }}>Virtuar</span>
        </div>

        {/* Clear scene */}
        <button
          onClick={hasObjects ? clearScene : undefined}
          style={{
            pointerEvents: hasObjects ? 'auto' : 'none',
            width: 40, height: 40,
            borderRadius: 12,
            background: 'rgba(20,27,36,0.8)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: hasObjects ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
            cursor: hasObjects ? 'pointer' : 'default',
            opacity: hasObjects ? 1 : 0.5,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-.7 14a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L5 6" />
          </svg>
        </button>
      </div>

      {/* Scan hint */}
      {!hasObjects && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 0' }}>
          <div style={{
            pointerEvents: 'none',
            padding: '8px 16px',
            borderRadius: 12,
            background: 'rgba(20,27,36,0.8)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
          }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', margin: 0 }}>
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
