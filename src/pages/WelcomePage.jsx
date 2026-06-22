import { useNavigate } from 'react-router-dom';
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
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/[0.12] blur-[80px] pointer-events-none" />

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
        {/* some height */}
        <div className="h-10" />
        {/* CTA Button */}
        <button
          onClick={() => navigate('/session')}
          className="w-full max-w-md h-[54px] rounded-2xl bg-accent text-background font-semibold text-[16px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform cursor-pointer"
        >
          <CameraIcon />
          Launch AR Experience
        </button>

        {/* Footer notes */}
        <p className="mt-5 text-[12px] text-white-60 text-center">
          Camera access is required for AR
        </p>
        <p className="mt-2 text-[11px] text-white-24 text-center max-w-xs">
          Full AR works best on Chrome (Android). Other devices use 3D preview.
        </p>
      </div>
    </div>
  );
}
