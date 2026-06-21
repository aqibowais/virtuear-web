import { useNavigate } from 'react-router-dom';

export default function PermissionGate({ onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background px-6">
      {/* Camera off icon */}
      <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
          <path d="M2 2l20 20" />
          <path d="M7 3h10a2 2 0 0 1 2 2v4.5" />
          <path d="M3.53 3.53A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.47-.63" />
          <path d="m14.5 4-1.3 1.67" />
          <path d="m9.5 4 1.3 1.67" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-2">Camera access required</h2>
      <p className="text-[14px] text-white-60 text-center max-w-sm mb-8 leading-relaxed">
        Virtuar uses your camera to place 3D models in your space.
        Please allow camera access to continue.
      </p>

      {/* Retry button */}
      <button
        onClick={onRetry}
        className="w-full max-w-xs h-12 rounded-2xl bg-accent text-background font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform cursor-pointer mb-4"
      >
        Grant access
      </button>

      {/* Instructions */}
      <p className="text-[12px] text-white-60 text-center max-w-xs mb-6">
        If the prompt doesn&apos;t appear, check your browser settings:
        Settings → Site Settings → Camera → Allow for this site.
      </p>

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        className="text-[13px] text-accent/80 hover:text-accent transition-colors cursor-pointer"
      >
        ← Back to home
      </button>
    </div>
  );
}
