const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const store = getStore('productos');
    const { blobs } = await store.list();

    const products = await Promise.all(
      blobs.map(async function (blob) {
        const data = await store.get(blob.key, { type: 'json' });
        return data;
      })
    );

    // Ordenar por fecha de creación (más nuevo primero)
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
