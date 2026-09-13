import { supabase } from '../lib/supabase';

// CMS media uploads go to ImageKit (free tier, no card) via /api/upload.
// The ImageKit private key stays on the server (Vercel function); the caller
// must be an authenticated Supabase user (the admin).

/** Uploads a blob to ImageKit through the /api/upload function; returns its public URL. */
export async function uploadBlob(blob: Blob, ext: string): Promise<string> {
  const name = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext.toLowerCase()}`;

  let token: string | undefined;
  try {
    const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    token = data.session?.access_token;
  } catch {
    /* not signed in */
  }

  const headers: Record<string, string> = { 'x-file-name': name };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/upload', { method: 'POST', headers, body: blob });
  const contentType = res.headers.get('content-type') || '';

  // A non-JSON reply means we never reached the upload function at all. In
  // `npm run dev` there is no serverless runtime, so the route 404s and Vite
  // answers with HTML — which used to surface as an opaque "Upload failed".
  if (!contentType.includes('application/json')) {
    throw new Error(
      res.status === 404
        ? 'Upload endpoint not available here. It exists on the deployed site only — use the live /admin, or run `npx vercel dev`.'
        : `Upload failed (HTTP ${res.status}) — unexpected non-JSON response.`,
    );
  }

  const data = await res.json().catch(() => ({}) as { url?: string; error?: string });
  if (!res.ok) {
    throw new Error(
      data.error || (res.status === 401 ? 'Sign in required to upload' : `Upload failed (HTTP ${res.status})`),
    );
  }
  if (!data.url) throw new Error('Upload succeeded but no URL was returned.');
  return data.url;
}

/** Uploads an image file to ImageKit, returns its public URL. */
export function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  return uploadBlob(file, ext);
}

/** Uploads a video file to ImageKit, returns its public URL. */
export function uploadVideo(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'mp4';
  return uploadBlob(file, ext);
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
