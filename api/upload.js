// Vercel serverless function: upload a file to ImageKit (free tier).
// The ImageKit private key stays server-side; the browser never sees it.
// Env: IMAGEKIT_PRIVATE_KEY, IMAGEKIT_FOLDER (optional)
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
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    res.status(500).json({ error: 'ImageKit not configured (IMAGEKIT_PRIVATE_KEY missing)' });
    return;
  }
  try {
    const buf = await readRaw(req);
    if (!buf.length) {
      res.status(400).json({ error: 'Empty body' });
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
