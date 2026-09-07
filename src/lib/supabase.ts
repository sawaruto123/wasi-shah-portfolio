import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

// 自訂 fetch：加上 no-cache，避免瀏覽器快取舊內容（例如更新肖像後看不到）
const noCacheFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-cache');
  headers.set('Pragma', 'no-cache');
  return fetch(input, { ...init, headers });
};

/**
 * Public (anon) Supabase client. RLS allows reading published content only.
 * Returns null when env vars are missing so the site gracefully falls back
 * to bundled data (src/data.ts).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true },
      global: { fetch: noCacheFetch },
    })
  : null;
