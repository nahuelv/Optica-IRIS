const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers['x-auth-token'];
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
  }

  let product;
  try {
    product = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Datos inválidos' }) };
  }

  if (!product.name || !product.cat) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Faltan campos requeridos' }) };
  }

  product.id = product.id || Date.now();

  try {
    const store = getStore({
      name: 'productos',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    await store.setJSON(String(product.id), product);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, product }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
