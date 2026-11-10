import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

// 自訂 fetch：強制 no-store，避免瀏覽器快取舊內容（例如更新肖像後看不到）。
// 之前設在「請求 header」上的 Cache-Control 對瀏覽器快取無效（那是回應 header），
// 所以改成 fetch 標準的 cache: 'no-store'，每次都會真正打到 Supabase 拿最新資料。
const noCacheFetch: typeof fetch = (input, init) => {
  return fetch(input, { ...init, cache: 'no-store' });
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
