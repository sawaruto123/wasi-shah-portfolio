import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import { ContentProvider } from './lib/content.tsx';
import { NotFound } from './components/NotFound.tsx';
import { PrivacyPolicy } from './components/PrivacyPolicy.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

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
        <AdminApp />
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
