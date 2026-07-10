import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage.jsx';

const ArSessionPage = lazy(() => import('./pages/ArSessionPage.jsx'));

function LoadingFallback() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#07090F',
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid rgba(255,107,26,0.15)',
        borderTopColor: '#FF6B1A',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/session" element={<ArSessionPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
