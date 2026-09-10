import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'ws-cookie-consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable — leave hidden */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:right-auto md:max-w-md z-[60]">
      <div className="glass-card rounded-2xl border border-border-crisp shadow-xl p-5">
        <p className="font-mono text-xs text-ink leading-relaxed">
          This site sets <strong>no first-party tracking cookies</strong>. We store only small local
          preferences (this choice, theme, background opacity) and an admin session if you log in. Embedded
          YouTube/Vimeo videos may set their own cookies. See our{' '}
          <a href="/privacy" className="text-primary underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
        <button
          onClick={accept}
          className="mt-4 w-full px-4 py-2.5 rounded-xl bg-ink text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer border-none"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
