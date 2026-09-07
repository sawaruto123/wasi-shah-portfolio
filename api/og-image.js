// Dynamic Open Graph image — always returns the current CMS portrait.
// This keeps link previews in sync when the portrait is updated in the CMS.
export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    let portrait = null;
    if (supabaseUrl && anonKey) {
      const r = await fetch(
        `${supabaseUrl}/rest/v1/site_settings?select=value&key=eq.profile`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const rows = await r.json();
      portrait = rows && rows[0] ? rows[0].value.portrait : null;
    }

    if (!portrait) {
      res.status(404).send('No portrait');
      return;
    }

    const img = await fetch(portrait);
    if (!img.ok) {
      res.status(404).send('Image not found');
      return;
    }
    const buf = Buffer.from(await img.arrayBuffer());
    res.setHeader('Content-Type', img.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).send('Error');
  }
}
