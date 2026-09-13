// Vercel serverless function: issue a short-lived ImageKit upload signature so
// the browser can POST files straight to ImageKit's CDN.
//
// Why this exists: Vercel caps serverless request bodies at ~4.5 MB, so proxying
// photos through a function fails with HTTP 413 for any real camera image.
// Uploading directly from the browser removes the size limit entirely, while the
// ImageKit private key still never leaves the server.
//
// Auth: requires a valid Supabase session (signups are disabled, so any
// authenticated user is the site owner).
import crypto from 'node:crypto';

async function verifyAdmin(req) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  if (!supabaseUrl || !supabaseAnon) return { status: 500, error: 'Server not configured' };
  if (!token) return { status: 401, error: 'Unauthorized' };

  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnon, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { status: 401, error: 'Unauthorized' };

    const user = await r.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user?.email && user.email !== adminEmail) {
      return { status: 403, error: 'Forbidden' };
    }
    return { user };
  } catch {
    return { status: 401, error: 'Unauthorized' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const check = await verifyAdmin(req);
  if (check.error) {
    res.status(check.status).json({ error: check.error });
    return;
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    res.status(500).json({ error: 'ImageKit not configured (needs IMAGEKIT_PRIVATE_KEY + IMAGEKIT_PUBLIC_KEY)' });
    return;
  }

  // ImageKit's client-side upload scheme: signature = HMAC-SHA1(token + expire)
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 1800; // signature valid 30 minutes
  const signature = crypto.createHmac('sha1', privateKey).update(token + expire).digest('hex');

  res.status(200).json({
    token,
    expire,
    signature,
    publicKey,
    folder: process.env.IMAGEKIT_FOLDER || 'portfolio',
  });
}
