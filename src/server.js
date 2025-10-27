import http from 'http';
import { config } from './config.js';
import { signInWithEmail, signUpWithEmail, createCustomToken } from './firebase.js';

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end();
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  if (req.url === '/health') {
    sendJson(res, 200, { status: 'ok', timestamp: Date.now() });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/auth/register') {
    try {
      const body = await readJson(req);
      const { email, password, displayName } = body;
      if (!email || !password) {
        sendJson(res, 422, { error: 'email and password are required' });
        return;
      }

      const user = await signUpWithEmail(email, password, displayName);
      const customToken = createCustomToken(user.uid);
      
      const redirectUrl = config.redirectUrl 
        ? `${config.redirectUrl}?customToken=${customToken}`
        : null;
      
      sendJson(res, 302, { redirectUrl });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/auth/login') {
    try {
      const body = await readJson(req);
      const { email, password } = body;
      if (!email || !password) {
        sendJson(res, 422, { error: 'email and password are required' });
        return;
      }

      const user = await signInWithEmail(email, password);
      const customToken = createCustomToken(user.uid);
      
      const redirectUrl = config.redirectUrl 
        ? `${config.redirectUrl}?customToken=${customToken}`
        : null;
      
      sendJson(res, 302, {redirectUrl });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(config.port, () => {
  console.log(`auth-backend listening on http://localhost:${config.port}`);
});
