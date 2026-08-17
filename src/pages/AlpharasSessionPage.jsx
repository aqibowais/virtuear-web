import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ALPHARAS_TARGETS } from '../data/alpharasCatalog.js';

const PURPLE = '#A855F7';

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
  border: '3px solid rgba(147,51,234,0.15)',
  borderTopColor: PURPLE,
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const labelStyle = {
  fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif",
};

const cardStyle = {
  backgroundColor: '#12161E',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
  borderRadius: '1.25rem',
};

export default function AlpharasSessionPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [isMobile, setIsMobile] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    setIsMobile(isMobileDevice());
    setStatus('ready');
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const getAlpharasUrl = () => {
    if (customUrl.trim()) return customUrl.trim();
    if (typeof window === 'undefined') return '/alpharas';
    const { hostname, port, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return '';
    return `${protocol}//${hostname}${port ? ':' + port : ''}/alpharas`;
  };

  const alpharasUrl = getAlpharasUrl();
  const isLocalhost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && !customUrl.trim();

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
      <div style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        backgroundColor: '#07090F',
      }}>
        <iframe
          src="/ar-alpharas/index.html"
          title="Les Alpharas AR"
          allow="camera; microphone; gyroscope; accelerometer; xr-spatial-tracking; autoplay; fullscreen"
          allowFullScreen
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            border: 'none', backgroundColor: '#07090F',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      overflow: 'auto', backgroundColor: '#07090F', color: '#fff',
    }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden hero-grid" style={{ opacity: 0.5 }} />

      <div style={{
        maxWidth: '48rem', margin: '0 auto', padding: '2rem 1.5rem',
        position: 'relative', zIndex: 10,
      }}>
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 12,
            background: 'rgba(18,22,30,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            fontSize: 14, fontWeight: 500,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 9999,
            background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.25)',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: PURPLE, marginBottom: 16,
          }}>
            Image AR
          </span>
          <h1 className="font-display" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.95,
            letterSpacing: '0.03em',
            background: 'linear-gradient(180deg, #F5F5F5 18%, #A855F7 55%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            LES ALPHARAS
          </h1>
          <p style={{
            marginTop: '1rem', fontSize: 16, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.4)', maxWidth: '32rem', margin: '1rem auto 0',
          }}>
            Point your phone camera at a printed Alphara target image. The corresponding
            character video will play directly over the image in augmented reality.
          </p>
        </div>

        {/* Camera required notice */}
        <div style={{
          ...cardStyle, padding: '1.5rem', marginTop: '2rem',
          borderColor: 'rgba(147,51,234,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Camera Required</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.5 }}>
                This feature requires a mobile camera. Open this page on your phone to scan
                Alphara target images and see the AR video overlays.
              </p>
            </div>
          </div>
        </div>

        {/* QR code section */}
        <div style={{ ...cardStyle, padding: '1.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setShowQr((v) => !v)}
            style={{
              width: '100%', padding: '12px', borderRadius: 14, border: 'none',
              background: PURPLE, color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showQr ? 'Hide QR Code' : 'Show QR Code for Phone'}
          </button>

          {showQr && (
            <div style={{ marginTop: '1.25rem' }}>
              {isLocalhost && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: 13, color: '#FF4D6A', textAlign: 'center', marginBottom: 8 }}>
                    Localhost detected — paste your network URL
                  </p>
                  <input
                    type="text"
                    placeholder="https://192.168.x.x:5173/alpharas"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#07090F',
                      color: '#fff', fontSize: 14, outline: 'none',
                    }}
                  />
                </div>
              )}
              {alpharasUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: 16, borderRadius: 16, backgroundColor: '#07090F' }}>
                    <QRCodeSVG value={alpharasUrl} size={170} bgColor="transparent" fgColor={PURPLE} level="M" />
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    Scan to open Image AR on your phone
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0.5rem 0' }}>
                  Enter a URL above to generate QR
                </p>
              )}
            </div>
          )}
        </div>

        {/* Target images grid */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>
            {ALPHARAS_TARGETS.length} Target Images
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Print any of these target images and point your phone camera at them. The AR
            experience will detect the image and play its video overlay.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '0.75rem',
          }}>
            {ALPHARAS_TARGETS.map((target) => (
              <div key={target.id} style={{
                ...cardStyle, padding: '0.75rem', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 8,
                  backgroundColor: '#07090F',
                  backgroundImage: `url(/ar-alpharas/image-targets/imagesAR/${target.id}.png)`,
                  backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  Alphara {target.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ ...cardStyle, padding: '1.5rem', marginTop: '2rem', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>How It Works</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { step: '1', text: 'Print a target image from the grid above' },
              { step: '2', text: 'Open this page on your mobile phone' },
              { step: '3', text: 'Point your camera at the printed image' },
              { step: '4', text: 'Watch the Alphara character video play in AR' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: PURPLE, flexShrink: 0,
                }}>
                  {step}
                </span>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
