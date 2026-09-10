import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ContentProvider } from './lib/content.tsx';
import { NotFound } from './components/NotFound.tsx';
import { PrivacyPolicy } from './components/PrivacyPolicy.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { reportError } from './lib/errorLog';
import './index.css';

// Capture uncaught errors so they land in the client_errors table, not just the console.
window.addEventListener('error', (e) => reportError(e.error ?? e.message, 'window'));
window.addEventListener('unhandledrejection', (e) => reportError((e as PromiseRejectionEvent).reason, 'promise'));

// 只有到 /admin 才載入 CMS 的程式碼（大幅縮小首頁 bundle）
const AdminApp = lazy(() =>
  import('./admin/AdminApp.tsx').then((m) => ({ default: m.AdminApp }))
);

// Simple client-side routing:
//   /            → public portfolio
//   /admin/*     → CMS
//   /privacy     → privacy policy
//   anything else → 404
const path = window.location.pathname.replace(/\/+$/, '');

function render() {
  if (path === '/admin' || path.startsWith('/admin/')) {
    return (
      <StrictMode>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-surface-warm text-ink-muted font-mono text-sm">
              Loading admin…
            </div>
          }
        >
          <AdminApp />
        </Suspense>
      </StrictMode>
    );
  }
  if (path === '/privacy') {
    return (
      <StrictMode>
        <PrivacyPolicy />
      </StrictMode>
    );
  }
  if (path === '' || path === '/') {
    return (
      <StrictMode>
        <ContentProvider>
          <App />
        </ContentProvider>
      </StrictMode>
    );
  }
  return (
    <StrictMode>
      <NotFound />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<ErrorBoundary>{render()}</ErrorBoundary>);
