const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const store = getStore({
      name: 'productos',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    const { blobs } = await store.list();

    const products = await Promise.all(
      blobs.map(function (blob) {
        return store.get(blob.key, { type: 'json' });
      })
    );

    products.sort(function (a, b) { return b.id - a.id; });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, products: products }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
