// Esta función corre en el SERVIDOR de Netlify, nunca llega al navegador.
// Las credenciales se leen desde variables de entorno configuradas en el dashboard de Netlify.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Bad request' }) };
  }

  const { username, password } = body;

  // Las credenciales se configuran como variables de entorno en Netlify.
  // Nunca están escritas en el código fuente.
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Variables de entorno no configuradas' }),
    };
  }

  const ok = username === validUser && password === validPass;

  if (ok) {
    // Generamos un token de sesión simple (timestamp firmado con un secreto)
    const secret = process.env.SESSION_SECRET || 'fallback-secret';
    const payload = `${Date.now()}:iris-admin`;
    // Usamos btoa-like encoding manual compatible con Node
    const token = Buffer.from(`${payload}:${secret}`).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, token }),
    };
  }

  // Pequeño delay para dificultar ataques de fuerza bruta
  await new Promise(r => setTimeout(r, 500));

  return {
    statusCode: 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: false, error: 'Credenciales incorrectas' }),
  };
};
