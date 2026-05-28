export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return res.status(500).json({ error: 'APPS_SCRIPT_URL no configurada' });

  try {
    // Leer body crudo del stream (más confiable que req.body en Vercel)
    let rawBody = '';
    if (req.method === 'POST') {
      rawBody = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk.toString(); });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
    }

    const fetchOptions = { method: req.method };
    if (req.method === 'POST') {
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body = rawBody || '{}';
    }

    const upstream = await fetch(url, fetchOptions);
    const text = await upstream.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (_) {
      return res.status(500).json({
        error: 'Apps Script no devolvió JSON',
        httpStatus: upstream.status,
        method: req.method,
        bodyLength: rawBody.length,
        preview: text.slice(0, 800),
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
