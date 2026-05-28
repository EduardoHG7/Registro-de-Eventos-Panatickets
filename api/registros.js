export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL no configurada' });
  }

  try {
    const isPost = req.method === 'POST';
    const bodyStr = isPost ? JSON.stringify(req.body ?? {}) : undefined;

    const upstream = await fetch(url, {
      method: isPost ? 'POST' : 'GET',
      headers: isPost ? { 'Content-Type': 'application/json' } : undefined,
      body: bodyStr,
    });

    const text = await upstream.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (_) {
      return res.status(500).json({
        error: 'Apps Script no devolvió JSON',
        httpStatus: upstream.status,
        method: req.method,
        preview: text.slice(0, 800),
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
