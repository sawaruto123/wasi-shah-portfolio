import { supabase } from '../lib/supabase';

/** Uploads an image file to the public Supabase Storage bucket, returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured');
  const ext = file.name.split('.').pop() || 'jpg';
  const name = `cms/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext.toLowerCase()}`;
  const { error } = await supabase.storage.from('images').upload(name, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('images').getPublicUrl(name);
  return data.publicUrl;
}

/** Generates a URL-safe id from a title. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `item-${Date.now()}`;
}
