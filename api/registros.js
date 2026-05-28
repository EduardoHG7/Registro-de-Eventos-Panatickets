export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL no configurada' });
  }

  try {
    const upstream = await fetch(url, { method: 'GET' });
    const text = await upstream.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch (_) {
      res.status(500).json({
        error: 'Apps Script no devolvió JSON',
        httpStatus: upstream.status,
        preview: text.slice(0, 600)
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
