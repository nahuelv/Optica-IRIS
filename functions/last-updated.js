const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const store = getStore({
      name: 'meta',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    const data = await store.get('last_updated', { type: 'json' });
    const ts = data ? data.ts : 0;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ts }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ts: 0 }),
    };
  }
};
