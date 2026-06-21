import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArHud from '../components/ArHud.jsx';
import ModelDock from '../components/ModelDock.jsx';
import PreviewSession from '../ar/PreviewSession.jsx';
import WebXrSession from '../ar/WebXrSession.jsx';

export default function ArSessionPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [supportsAr, setSupportsAr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      let arSupported = false;
      try {
        if (navigator.xr) {
          arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        }
      } catch {
        arSupported = false;
      }

      if (cancelled) return;
      setSupportsAr(arSupported);
      setStatus('ready');
    };
    run();
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-white-60">Initializing...</p>
        </div>
      </div>
    );
  }

  // AR mode: WebXrSession handles its own HUD via XRDomOverlay
  if (supportsAr) {
    return (
      <div className="h-full w-full relative overflow-hidden bg-background">
        <WebXrSession />
      </div>
    );
  }

  // Preview mode: render HUD and ModelDock as regular overlays
  return (
    <div className="h-full w-full relative overflow-hidden bg-background">
      <PreviewSession />
      <ArHud isArMode={false} onBack={() => navigate('/')} />
      <ModelDock />

      <div className="absolute top-20 left-4 right-4 z-40 pointer-events-none flex justify-center">
        <div className="px-3 py-1.5 rounded-lg bg-accent-muted/20 border border-accent-muted/30 backdrop-blur-sm">
          <p className="text-[11px] text-accent/80 text-center">
            AR not supported on this browser — 3D preview mode. For full AR, use Chrome on Android.
          </p>
        </div>
      </div>
    </div>
  );
}
