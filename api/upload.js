// Vercel serverless function: upload a file to ImageKit (free tier).
// The ImageKit private key stays server-side; the browser never sees it.
// Auth: requires a valid Supabase session (the admin). Signups are disabled,
// so any authenticated user is the site owner.
// Env: IMAGEKIT_PRIVATE_KEY, IMAGEKIT_FOLDER, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL (optional)
export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ── 1. Require an authenticated Supabase user before doing any work ──
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!supabaseUrl || !supabaseAnon) {
    res.status(500).json({ error: 'Server not configured' });
    return;
  }
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const ures = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnon, Authorization: `Bearer ${token}` },
    });
    if (!ures.ok) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await ures.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user?.email && user.email !== adminEmail) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // ── 2. Upload to ImageKit ──
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    res.status(500).json({ error: 'ImageKit not configured (IMAGEKIT_PRIVATE_KEY missing)' });
    return;
  }
  try {
    const buf = await readRaw(req);
    if (!buf.length || buf.length > 100 * 1024 * 1024) {
      res.status(400).json({ error: 'Empty or oversized body (max 100 MB)' });
      return;
    }
    const fileName = String(req.headers['x-file-name'] || `upload-${Date.now()}`);
    const folder = String(process.env.IMAGEKIT_FOLDER || 'portfolio');

    const form = new FormData();
    form.append('file', new Blob([buf]), fileName);
    form.append('fileName', fileName);
    form.append('folder', '/' + folder);
    form.append('useUniqueFileName', 'true');

    const auth = Buffer.from(privateKey + ':').toString('base64');
    const up = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + auth },
      body: form,
    });
    const data = await up.json();
    if (!up.ok) {
      res.status(up.status).json({ error: data.message || 'ImageKit upload failed' });
      return;
    }
    res.status(200).json({ url: data.url, filePath: data.filePath });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload error' });
  }
}
