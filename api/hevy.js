// Vercel serverless proxy for Hevy API
// Keeps the api-key server-side; browser calls /api/hevy instead of api.hevyapp.com directly

const HEVY_BASE = 'https://api.hevyapp.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, apiKey, ...params } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'apiKey required' });
  }

  const headers = {
    'api-key': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    let url, method, body;

    switch (action) {
      case 'search-exercises':
        url = `${HEVY_BASE}/v1/exercise-templates?page=1&pageSize=20${params.query ? `&nameSearch=${encodeURIComponent(params.query)}` : ''}`;
        method = 'GET';
        break;

      case 'get-routine':
        url = `${HEVY_BASE}/v1/routines/${params.routineId}`;
        method = 'GET';
        break;

      case 'list-routines':
        url = `${HEVY_BASE}/v1/routines?page=1&pageSize=50`;
        method = 'GET';
        break;

      case 'update-routine':
        url = `${HEVY_BASE}/v1/routines/${params.routineId}`;
        method = 'PUT';
        body = JSON.stringify({ routine: params.routine });
        break;

      case 'create-routine':
        url = `${HEVY_BASE}/v1/routines`;
        method = 'POST';
        body = JSON.stringify({ routine: params.routine });
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    const upstream = await fetch(url, { method, headers, body });
    const data = await upstream.json().catch(() => ({}));

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
