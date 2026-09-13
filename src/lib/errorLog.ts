import { supabase } from './supabase';

/**
 * Fire-and-forget client error reporter → Supabase `client_errors`.
 *
 * Goes through the `log_client_error` RPC rather than a direct insert: the table
 * is no longer writable by the anon role (that was floodable), and the function
 * applies length caps plus a global rate limit.
 *
 * Never throws, never blocks; failures are swallowed so logging can't break the app.
 */
export function reportError(err: unknown, context?: string): void {
  try {
    if (!supabase) return;
    const e = err instanceof Error ? err : new Error(String(err));
    const message = (context ? `[${context}] ` : '') + (e.message || 'Unknown error');
    void supabase
      .rpc('log_client_error', {
        p_message: message.slice(0, 500),
        p_stack: (e.stack || '').slice(0, 4000) || null,
        p_url: typeof location !== 'undefined' ? location.href.slice(0, 500) : null,
        p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
      })
      .then(
        () => {},
        () => {}
      );
  } catch {
    /* never throw from the reporter */
  }
}
