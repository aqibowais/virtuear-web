import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ArHud from '../components/ArHud.jsx';
import ModelDock from '../components/ModelDock.jsx';
import PreviewSession from '../ar/PreviewSession.jsx';

const ACCENT = '#FF6B1A';

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)
    || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
}

const loadingStyle = {
  width: '100%', height: '100%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backgroundColor: '#07090F', flexDirection: 'column', gap: 16,
};

const spinnerStyle = {
  width: 44, height: 44,
  border: '3px solid rgba(255,107,26,0.15)',
  borderTopColor: ACCENT,
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const labelStyle = {
  fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif",
};

const backBtnStyle = {
  position: 'absolute', top: 16, left: 16, zIndex: 60,
  width: 42, height: 42, borderRadius: 12,
  background: 'rgba(18,22,30,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
};

const bannerStyle = {
  position: 'absolute', top: 80, left: 16, right: 16, zIndex: 40,
  pointerEvents: 'none', display: 'flex', justifyContent: 'center',
};

const bannerInner = {
  padding: '8px 18px', borderRadius: 14,
  backgroundColor: 'rgba(255,107,26,0.1)',
  border: '1px solid rgba(255,107,26,0.2)',
  backdropFilter: 'blur(8px)',
};

const bannerText = {
  fontSize: 12, color: 'rgba(255,107,26,0.8)', textAlign: 'center', margin: 0,
};

export default function ArSessionPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    setStatus('ready');
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
        <p style={labelStyle}>Initializing...</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#07090F' }}>
        <iframe
          src="/ar/index.html"
          title="Virtuar AR"
          allow="camera; microphone; gyroscope; accelerometer; xr-spatial-tracking"
          allowFullScreen
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            border: 'none', backgroundColor: '#07090F',
          }}
        />
        <button onClick={handleBack} style={backBtnStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#07090F' }}>
      <PreviewSession />
      <ArHud isArMode={false} onBack={handleBack} />
      <ModelDock />

      <div style={bannerStyle}>
        <div style={bannerInner}>
          <p style={bannerText}>
            No camera detected — showing 3D preview mode. Open on your phone for full AR.
          </p>
        </div>
      </div>
    </div>
  );
}
