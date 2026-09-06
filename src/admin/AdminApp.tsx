import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { ProjectsManager } from './ProjectsManager';
import { FilmsManager } from './FilmsManager';
import { StillsManager } from './StillsManager';
import { EngagementsManager } from './EngagementsManager';
import { SettingsManager } from './SettingsManager';
import { MessagesManager } from './MessagesManager';
import { Field, TextInput, Button } from './fields';

type Tab = 'messages' | 'projects' | 'films' | 'stills' | 'engagements' | 'settings';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'messages', label: 'Messages' },
  { id: 'projects', label: 'Projects' },
  { id: 'films', label: 'Films' },
  { id: 'stills', label: 'Stills' },
  { id: 'engagements', label: 'Engagements' },
  { id: 'settings', label: 'Settings' },
];

export const AdminApp: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<Tab>('messages');

  useEffect(() => {
    if (!supabase) {
      setBooting(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setBooting(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-warm text-ink-muted font-mono text-sm">
        Loading admin…
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-warm p-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-xl font-black uppercase text-ink mb-3">Supabase missing</h1>
          <p className="text-sm text-ink-muted">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
            <code>.env.local</code>, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-surface-warm text-ink flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-60 bg-ink text-white flex lg:flex-col items-center lg:items-stretch gap-1 p-3 lg:p-4 lg:sticky lg:top-0 lg:h-screen overflow-x-auto">
        <div className="hidden lg:flex items-center gap-2 px-2 py-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-mono font-bold text-xs">
            WS
          </div>
          <div className="leading-tight">
            <div className="font-display font-black text-sm tracking-tight">CMS</div>
            <div className="font-mono text-[10px] text-white/60">wasi-shah-portfolio</div>
          </div>
        </div>

        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 rounded-lg text-left font-mono text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}

        <div className="lg:mt-auto flex lg:flex-col gap-2 pt-2 lg:pt-4 lg:border-t lg:border-white/10">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2.5 rounded-lg text-left font-mono text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 whitespace-nowrap"
          >
            View site ↗
          </a>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-3 py-2.5 rounded-lg text-left font-mono text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-red-500/20 hover:text-red-300 whitespace-nowrap"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-black uppercase text-ink">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="font-mono text-xs text-ink-muted mt-0.5">
                Signed in as {session.user.email}
              </p>
            </div>
          </div>

          {tab === 'messages' && <MessagesManager />}
          {tab === 'projects' && <ProjectsManager />}
          {tab === 'films' && <FilmsManager />}
          {tab === 'stills' && <StillsManager />}
          {tab === 'engagements' && <EngagementsManager />}
          {tab === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-warm p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-border-crisp shadow-xl p-8">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center font-mono font-bold text-sm mb-4">
            WS
          </div>
          <h1 className="font-display text-xl font-black uppercase text-ink">Admin · Sign in</h1>
          <p className="font-mono text-xs text-ink-muted mt-1">Portfolio CMS</p>
        </div>

        <div className="space-y-4">
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full mt-6 py-3">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
