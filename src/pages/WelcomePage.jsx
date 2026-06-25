import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MODEL_CATALOG } from '../data/modelCatalog.js';
import FeatureTile from '../components/FeatureTile.jsx';

function ScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

function TapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2" />
      <path d="M15 16v-3" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h.01" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  );
}

function ResizeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <path d="m12 12 4 10 1.7-4.3L22 16Z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const modelCount = MODEL_CATALOG.length;
  const [showQr, setShowQr] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const getArUrl = () => {
    if (customUrl.trim()) return customUrl.trim();
    if (typeof window === 'undefined') return '/ar/index.html';
    const { hostname, port, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
    return `${protocol}//${hostname}${port ? ':' + port : ''}/ar/index.html`;
  };

  const arUrl = getArUrl();
  const isLocalhost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && !customUrl.trim();

  return (
    <div className="h-full w-full overflow-y-auto bg-background relative">
      {/* Cyan grid background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00E5FF 1px, transparent 1px),
            linear-gradient(to bottom, #00E5FF 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/12 blur-[80px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-10 min-h-full">
        {/* App Icon */}
        <div className="mb-6">
          <img
            src="/icon.png"
            alt="Virtuar"
            className="w-28 h-28 rounded-[28px] shadow-[0_0_40px_rgba(0,229,255,0.3)]"
          />
        </div>

        {/* Title */}
        <h1 className="text-[32px] font-bold tracking-[1.2px] text-white mb-2">
          Virtuar
        </h1>
        <p className="text-[15px] text-white-60 mb-10 text-center">
          Place 3D models in your real world
        </p>

        {/* Feature Tiles */}
        <div className="w-full max-w-md flex flex-col gap-4 mb-10">
          <FeatureTile
            icon={<ScanIcon />}
            title="Scan your space"
            description="Point at a flat surface to detect planes"
          />
          <FeatureTile
            icon={<TapIcon />}
            title="Tap to place"
            description={`Choose from ${modelCount} robot models and drop them in AR`}
          />
          <FeatureTile
            icon={<ResizeIcon />}
            title="Move & resize"
            description="Drag, rotate, and scale your placed models"
          />
        </div>
        <div className="h-10" />
        {/* CTA Button */}
        <button
          onClick={() => navigate('/session')}
          className="w-full max-w-md h-[54px] rounded-2xl bg-accent text-background font-semibold text-[16px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform cursor-pointer"
        >
          <CameraIcon />
          Launch AR Experience
        </button>

        {/* QR Code toggle */}
        <button
          onClick={() => setShowQr(!showQr)}
          className="mt-6 text-[13px] text-accent/80 underline underline-offset-4 cursor-pointer bg-transparent border-none"
        >
          {showQr ? 'Hide QR Code' : 'Scan QR to open AR on phone'}
        </button>

        {showQr && (
          <div className="mt-4 flex flex-col items-center gap-3 p-5 rounded-2xl bg-surface/80 border border-white-12 backdrop-blur-sm w-full max-w-md">
            {isLocalhost && (
              <div className="w-full flex flex-col gap-2">
                <p className="text-[12px] text-danger text-center">
                  You're on localhost — enter your network URL for the QR code to work on phone
                </p>
                <input
                  type="text"
                  placeholder="e.g. https://192.168.1.5:5173/ar/index.html"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-white-24 text-white text-[13px] outline-none focus:border-accent"
                />
              </div>
            )}
            {arUrl ? (
              <>
                <QRCodeSVG
                  value={arUrl}
                  size={180}
                  bgColor="transparent"
                  fgColor="#00E5FF"
                  level="M"
                />
                <p className="text-[11px] text-white-60 text-center max-w-[200px]">
                  Scan with your phone camera to launch AR directly
                </p>
              </>
            ) : (
              <p className="text-[11px] text-white-60 text-center">
                Enter a URL above to generate the QR code
              </p>
            )}
          </div>
        )}

        {/* Footer notes */}
        <p className="mt-5 text-[12px] text-white-60 text-center">
          Works on Chrome (Android) &amp; Safari (iOS)
        </p>
        <p className="mt-2 text-[11px] text-white-24 text-center max-w-xs">
          Powered by 8th Wall — no app install required
        </p>
      </div>
    </div>
  );
}
