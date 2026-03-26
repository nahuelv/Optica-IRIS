const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers['x-auth-token'];
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Datos inválidos' }) };
  }

  if (!body.id) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Falta el ID' }) };
  }

  try {
    const store = getStore({
      name: 'resenas',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    await store.delete(String(body.id));


  // Actualizar timestamp de última modificación
  try {
    const meta = getStore({ name: 'meta', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });
    await meta.setJSON('last_updated', { ts: Date.now() });
  } catch(e) {}
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
