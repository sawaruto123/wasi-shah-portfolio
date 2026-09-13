import { supabase } from '../lib/supabase';

// CMS media uploads go straight from the browser to ImageKit.
//
// Why not through our own API: Vercel caps serverless request bodies at ~4.5 MB,
// so proxying photos through a function fails with HTTP 413 for any real camera
// image. Instead we ask /api/upload-auth (admin-only) for a short-lived
// signature, then POST the file directly to ImageKit — no size limit, and the
// private key still never leaves the server.

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

/** Vercel rejects serverless request bodies above ~4.5 MB with HTTP 413. */
const PROXY_BODY_LIMIT = 4.5 * 1024 * 1024;

/** Longest edge kept when storing an image (the lightbox shows up to 2400px). */
const MAX_EDGE = 2560;
/** JPEG/WebP files above this get downscaled in the browser first. */
const DOWNSCALE_ABOVE = 3 * 1024 * 1024;

async function accessToken(): Promise<string | undefined> {
  try {
    const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    return data.session?.access_token;
  } catch {
    return undefined;
  }
}

interface UploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folder: string;
}

async function uploadSignature(): Promise<UploadAuth | null> {
  const token = await accessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/upload-auth', { headers });
  const contentType = res.headers.get('content-type') || '';

  // A non-JSON reply means we never reached the function. In `npm run dev`
  // there is no serverless runtime, so the route 404s and Vite answers with HTML.
  if (!contentType.includes('application/json')) {
    throw new Error(
      res.status === 404
        ? 'Upload endpoint not available here. It exists on the deployed site only — use the live /admin, or run `npx vercel dev`.'
        : `Could not get an upload signature (HTTP ${res.status}).`,
    );
  }

  const data = (await res.json().catch(() => ({}))) as Partial<UploadAuth> & { error?: string };
  if (!res.ok) {
    // No public key configured yet → fall back to the server-side proxy below.
    if (res.status === 500 && /publicKey/i.test(data.error || '')) return null;
    throw new Error(
      data.error || (res.status === 401 ? 'Sign in required to upload' : `Upload auth failed (HTTP ${res.status})`),
    );
  }
  if (!data.token || !data.signature || !data.publicKey) return null;
  return data as UploadAuth;
}

/**
 * Shrink oversized JPEG/WebP photos before uploading: keeps uploads fast on
 * mobile data, keeps stored files sane, and keeps the fallback proxy under
 * Vercel's 4.5 MB body limit. Returns the original file on any failure.
 */
async function downscale(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|jpg|webp)$/i.test(file.type) || file.size < DOWNSCALE_ABOVE) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const encode = async (maxEdge: number, quality: number) => {
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    };

    // First attempt at full quality; if that's still too large for the proxy,
    // step down once more. Large originals are never useful at 2400px anyway.
    let out = await encode(MAX_EDGE, 0.88);
    if (out && out.size > PROXY_BODY_LIMIT) out = await encode(1920, 0.8);
    bitmap.close();
    return out && out.size < file.size ? out : file;
  } catch {
    return file;
  }
}

/** Uploads straight to ImageKit using a short-lived signature (no size limit). */
async function uploadDirect(blob: Blob, name: string, auth: UploadAuth): Promise<string> {
  const form = new FormData();
  form.append('file', blob, name);
  form.append('fileName', name);
  form.append('folder', `/${auth.folder}`);
  form.append('publicKey', auth.publicKey);
  form.append('token', auth.token);
  form.append('expire', String(auth.expire));
  form.append('signature', auth.signature);
  form.append('useUniqueFileName', 'true');

  const res = await fetch(IMAGEKIT_UPLOAD_URL, { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok) throw new Error(data.message || `ImageKit upload failed (HTTP ${res.status})`);
  if (!data.url) throw new Error('Upload succeeded but no URL was returned.');
  return data.url;
}

/**
 * Fallback: relay through our own function. Only works up to ~4.5 MB, which is
 * why images are downscaled first and why the direct path is preferred.
 */
async function uploadViaProxy(blob: Blob, name: string): Promise<string> {
  const token = await accessToken();
  const headers: Record<string, string> = { 'x-file-name': name };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/upload', { method: 'POST', headers, body: blob });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      res.status === 413
        ? 'This file is too large for the fallback upload path (Vercel caps request bodies at ~4.5 MB). Add IMAGEKIT_PUBLIC_KEY to enable unlimited direct uploads.'
        : `Upload failed (HTTP ${res.status}).`,
    );
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
  if (!data.url) throw new Error('Upload succeeded but no URL was returned.');
  return data.url;
}

/** Uploads a blob to ImageKit; returns its public URL. */
export async function uploadBlob(blob: Blob, ext: string): Promise<string> {
  const name = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext.toLowerCase()}`;
  const auth = await uploadSignature();
  return auth ? uploadDirect(blob, name, auth) : uploadViaProxy(blob, name);
}

/** Uploads an image file (downscaling large photos first); returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const blob = await downscale(file);
  const ext = blob === file ? file.name.split('.').pop() || 'jpg' : 'jpg';
  return uploadBlob(blob, ext);
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
