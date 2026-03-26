const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const store = getStore({
      name: 'resenas',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    const { blobs } = await store.list();

    const resenas = await Promise.all(
      blobs.map(function (blob) {
        return store.get(blob.key, { type: 'json' });
      })
    );

    resenas.sort(function (a, b) {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return b.id - a.id;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, resenas }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
