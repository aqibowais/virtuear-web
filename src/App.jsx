import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage.jsx';

const ArSessionPage = lazy(() => import('./pages/ArSessionPage.jsx'));

function LoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
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
