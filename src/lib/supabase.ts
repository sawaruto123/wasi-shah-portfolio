import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

/**
 * Public (anon) Supabase client. RLS allows reading published content only.
 * Returns null when env vars are missing so the site gracefully falls back
 * to bundled data (src/data.ts).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: true } })
  : null;
