import React from 'react';

export const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F6FAFF] px-6 text-center">
    <div className="max-w-md">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-border-crisp font-mono text-[11px] font-bold text-ink mb-8">
        <span className="w-2 h-2 rounded-full bg-accent-orange" />
        ERROR · 404
      </div>
      <h1 className="font-display text-6xl sm:text-7xl font-black uppercase text-ink tracking-tight leading-none mb-4">
        Lost in the
        <br />
        corridor
      </h1>
      <p className="font-body text-lg text-ink-muted mb-10">
        This world position doesn't exist. The coordinates you're looking for may have drifted out of range.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ink text-white font-mono text-sm font-bold uppercase tracking-widest hover:bg-primary transition-colors"
      >
        Return to World
      </a>
    </div>
  </div>
);
