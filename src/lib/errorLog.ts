import { supabase } from './supabase';

/**
 * Fire-and-forget client error reporter → Supabase `client_errors` table.
 * Never throws, never blocks; failures are swallowed so logging can't break the app.
 */
export function reportError(err: unknown, context?: string): void {
  try {
    if (!supabase) return;
    const e = err instanceof Error ? err : new Error(String(err));
    const message = (context ? `[${context}] ` : '') + (e.message || 'Unknown error');
    void supabase
      .from('client_errors')
      .insert({
        message: message.slice(0, 1000),
        stack: (e.stack || '').slice(0, 4000) || null,
        url: typeof location !== 'undefined' ? location.href.slice(0, 500) : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
      })
      .then(
        () => {},
        () => {}
      );
  } catch {
    /* never throw from the reporter */
  }
}
