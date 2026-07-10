import { useNavigate } from 'react-router-dom';

const pageStyle = {
  width: '100%', height: '100%',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  backgroundColor: '#07090F', padding: '0 1.5rem',
  fontFamily: "'DM Sans', sans-serif",
};

const iconBox = {
  width: 80, height: 80, borderRadius: 20,
  backgroundColor: 'rgba(255,107,26,0.08)',
  border: '1px solid rgba(255,107,26,0.18)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: 24,
};

const heading = {
  fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px',
};

const subtext = {
  fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center',
  maxWidth: 360, lineHeight: 1.6, marginBottom: 32,
};

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '100%', maxWidth: 320, padding: '0.85rem 1.5rem',
  borderRadius: 9999, border: 'none', cursor: 'pointer',
  fontSize: 15, fontWeight: 600,
  backgroundColor: '#FF6B1A', color: '#fff',
  boxShadow: '0 6px 24px rgba(255,107,26,0.3)',
  marginBottom: 16,
};

const hint = {
  fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center',
  maxWidth: 320, lineHeight: 1.55, marginBottom: 24,
};

const backLink = {
  fontSize: 13, color: 'rgba(255,107,26,0.75)', background: 'none',
  border: 'none', cursor: 'pointer', padding: 0,
};

export default function PermissionGate({ onRetry }) {
  const navigate = useNavigate();

  return (
    <div style={pageStyle}>
      <div style={iconBox}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 2l20 20" />
          <path d="M7 3h10a2 2 0 0 1 2 2v4.5" />
          <path d="M3.53 3.53A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.47-.63" />
          <path d="m14.5 4-1.3 1.67" />
          <path d="m9.5 4 1.3 1.67" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>

      <h2 style={heading}>Camera access required</h2>
      <p style={subtext}>
        Virtuar uses your camera to place 3D models in your space.
        Please allow camera access to continue.
      </p>

      <button onClick={onRetry} style={primaryBtn}>
        Grant access
      </button>

      <p style={hint}>
        If the prompt doesn&apos;t appear, check your browser settings:
        Settings → Site Settings → Camera → Allow for this site.
      </p>

      <button onClick={() => navigate('/')} style={backLink}>
        ← Back to home
      </button>
    </div>
  );
}
