import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MODEL_CATALOG } from '../data/modelCatalog.js';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'models', label: 'Models' },
];

const FEATURES = [
  {
    title: 'Surface Detection',
    desc: 'Point your camera at any flat surface. The AR engine maps it automatically.',
  },
  {
    title: 'Tap to Place',
    desc: `Choose from ${MODEL_CATALOG.length} robot models and drop them into your space with one tap.`,
  },
  {
    title: 'Rotate & Scale',
    desc: 'Pinch to resize, two-finger rotate, and tap again to move models freely.',
  },
  {
    title: 'Cross-Platform',
    desc: 'Works on Chrome and Safari — no app install, just open the link and go.',
  },
];

const STATS = [
  { value: `${MODEL_CATALOG.length}`, label: 'Models' },
  { value: 'Chrome + Safari', label: 'Mobile Browsers' },
  { value: 'Real-time', label: 'Placement & Controls' },
];

const cardStyle = {
  backgroundColor: '#12161E',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
  borderRadius: '1.25rem',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  padding: '0.75rem 1.75rem',
  borderRadius: '9999px',
  fontSize: '15px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#fff',
  color: '#07090F',
};

const btnOutline = {
  ...btnPrimary,
  backgroundColor: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const btnAccent = {
  ...btnPrimary,
  backgroundColor: '#FF6B1A',
  color: '#fff',
  boxShadow: '0 8px 28px rgba(255, 107, 26, 0.3)',
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [activeNav, setActiveNav] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const getArUrl = () => {
    if (customUrl.trim()) return customUrl.trim();
    if (typeof window === 'undefined') return '/session';
    const { hostname, port, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return '';
    return `${protocol}//${hostname}${port ? ':' + port : ''}/session`;
  };

  const arUrl = getArUrl();
  const isLocalhost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && !customUrl.trim();

  const scrollTo = (id) => {
    setActiveNav(id);
    setMenuOpen(false);
    const root = pageRef.current;
    if (!root) return;
    if (id === 'home') {
      root.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    root.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <div
      ref={pageRef}
      style={{ width: '100%', height: '100%', overflowY: 'auto', backgroundColor: '#07090F', color: '#fff' }}
    >
      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hero-grid" style={{ opacity: 0.5 }} />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(59,130,246,0.16) 0%, transparent 58%), radial-gradient(ellipse 55% 40% at 72% 65%, rgba(255,107,26,0.12) 0%, transparent 55%)',
        }}
      />

      {/* ── NAV ── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'rgba(7,9,15,0.82)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{
          maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem',
          height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
          >
            <img src="/icon.png" alt="" style={{ width: 36, height: 36, borderRadius: 12 }} />
            <span className="font-display" style={{ fontSize: 30, lineHeight: 1, letterSpacing: '0.04em' }}>Virtuar</span>
          </button>

          {/* Desktop nav pills — hidden on mobile via Tailwind, no inline display */}
          <nav style={{
            alignItems: 'center', gap: '0.5rem',
            borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.04)', padding: '5px',
          }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none',
                  fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
                  backgroundColor: activeNav === link.id ? '#FF6B1A' : 'transparent',
                  color: activeNav === link.id ? '#fff' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/session')}
              style={{ ...btnPrimary, display: undefined }}
              className="hidden sm:inline-flex"
            >
              Launch AR
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center md:hidden"
              style={{
                width: 44, height: 44, borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)',
                cursor: 'pointer', color: '#fff',
              }}
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="flex flex-col md:hidden" style={{
            borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(7,9,15,0.96)',
            padding: '1rem 1.5rem', gap: '0.5rem',
          }}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                style={{
                  textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 12, border: 'none',
                  fontSize: 15, fontWeight: 500, cursor: 'pointer',
                  backgroundColor: activeNav === link.id ? 'rgba(255,107,26,0.12)' : 'transparent',
                  color: activeNav === link.id ? '#FF6B1A' : 'rgba(255,255,255,0.55)',
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setMenuOpen(false); navigate('/session'); }}
              style={{ ...btnPrimary, width: '100%', marginTop: 4 }}
            >
              Launch AR
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>

        {/* HERO */}
        <section id="home" style={{ padding: '3rem 0 4rem' }}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14" style={{ display: 'grid', gap: '2.5rem', width: '100%' }}>
            {/* Text side */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF6B1A' }}>
                Web AR Experience
              </p>
              <h1 className="font-display text-hero-gradient" style={{ marginTop: '1rem', fontSize: 'clamp(3rem, 8vw, 6.2rem)', lineHeight: 0.9, letterSpacing: '0.03em' }}>
                PLACE 3D<br />MODELS<br />IN YOUR WORLD
              </h1>
              <p style={{ marginTop: '1.5rem', fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', maxWidth: '36rem' }}
                className="mx-auto lg:mx-0 lg:text-[18px]"
              >
                Launch your camera, detect a surface, then place and control interactive models in real-time.
                Built for Chrome and Safari on mobile.
              </p>

              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}
                className="justify-center lg:justify-start"
              >
                <button type="button" onClick={() => navigate('/session')} style={btnPrimary}>
                  Launch AR
                </button>
                <button type="button" onClick={() => setShowQr((v) => !v)} style={btnOutline}>
                  {showQr ? 'Hide QR' : 'Scan QR'}
                </button>
              </div>
            </div>

            {/* Image side */}
            <div className="order-1 flex justify-center lg:order-2">
              <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
                <div style={{ position: 'absolute', inset: -32, borderRadius: '50%', background: 'rgba(59,130,246,0.18)', filter: 'blur(80px)' }} />
                <img
                  src="/images/hero-closeup.jpg"
                  alt="Person using a headset"
                  style={{ position: 'relative', width: '100%', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover', boxShadow: '0 0 60px rgba(59,130,246,0.22)' }}
                />
              </div>
            </div>
          </div>

          {/* QR drawer */}
          {showQr && (
            <div style={{ ...cardStyle, maxWidth: 520, margin: '2rem auto 0', padding: '1.75rem' }}>
              {isLocalhost && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: 13, color: '#FF4D6A', textAlign: 'center', marginBottom: 8 }}>Localhost detected — paste your network URL</p>
                  <input
                    type="text"
                    placeholder="https://192.168.x.x:5173/session"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#07090F', color: '#fff', fontSize: 14, outline: 'none' }}
                  />
                </div>
              )}
              {arUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: 16, borderRadius: 16, backgroundColor: '#07090F' }}>
                    <QRCodeSVG value={arUrl} size={170} bgColor="transparent" fgColor="#FF6B1A" level="M" />
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Scan to open AR on your phone</p>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0.5rem 0' }}>Enter a URL above to generate QR</p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-3" style={{ display: 'grid', gap: '1.25rem', width: '100%', marginTop: '3rem' }}>
            {STATS.map((stat) => (
              <div key={stat.label} style={{ ...cardStyle, padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stat.value}</p>
                <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ padding: '3.5rem 0 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF6B1A' }}>How It Works</p>
            <h2 className="font-display" style={{ marginTop: 10, fontSize: 'clamp(2.2rem, 6vw, 4rem)', lineHeight: 1, letterSpacing: '0.03em' }}>
              Four Simple Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-2" style={{ display: 'grid', gap: '1.25rem', width: '100%' }}>
            {FEATURES.map((feature, i) => (
              <div key={feature.title} style={{ ...cardStyle, padding: '1.75rem' }}>
                <span className="font-display" style={{ fontSize: 34, lineHeight: 1, color: 'rgba(255,107,26,0.6)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 style={{ marginTop: 12, fontSize: 22, fontWeight: 600, lineHeight: 1.25 }}>{feature.title}</h3>
                <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MODELS */}
        <section id="models" style={{ paddingBottom: '4rem' }}>
          <div style={{ ...cardStyle, padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '1.5rem' }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF6B1A' }}>Model Catalog</p>
            <h2 className="font-display" style={{ marginTop: 10, fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1, letterSpacing: '0.03em' }}>
              {MODEL_CATALOG.length} Models Ready
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', maxWidth: '42rem', margin: '14px auto 0' }}>
              Switch between robots anytime inside the AR session without leaving the camera view.
            </p>
            <div style={{ marginTop: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
              {MODEL_CATALOG.map((model) => (
                <span
                  key={model.id}
                  style={{
                    display: 'inline-block', padding: '0.35rem 0.875rem', borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(7,9,15,0.6)',
                    fontSize: 14, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap',
                  }}
                >
                  {model.displayName}
                </span>
              ))}
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button type="button" onClick={() => navigate('/session')} style={btnAccent}>
                Start Placing Models
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ paddingBottom: '2.5rem' }}>
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: 13, color: 'rgba(255,255,255,0.22)', textAlign: 'center' }}>
            <p>Virtuar · Browser-based AR</p>
            <p>React · Three.js · 8th Wall</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
