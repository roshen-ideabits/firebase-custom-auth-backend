import https from 'https';
import crypto from 'crypto';
import { config } from './config.js';

const FIREBASE_AUDIENCE = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function requestIdentityToolkit(path, payload) {
  const data = JSON.stringify(payload);

  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    method: 'POST',
    path: `/v1/${path}?key=${config.firebase.webApiKey}`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (res.statusCode && res.statusCode >= 400) {
            const message = parsed.error?.message || 'Firebase request failed';
            reject(new Error(message));
            return;
          }
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export function createCustomToken(uid, customClaims = {}) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: config.firebase.clientEmail,
    sub: config.firebase.clientEmail,
    aud: FIREBASE_AUDIENCE,
    iat,
    exp,
    uid,
    claims: customClaims,
  };

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(payload)
  )}`;

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signingInput)
    .sign(config.firebase.privateKey, 'base64');

  return `${signingInput}.${signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
}

export async function signUpWithEmail(email, password, displayName) {
  const result = await requestIdentityToolkit('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });

  if (displayName) {
    await requestIdentityToolkit('accounts:update', {
      idToken: result.idToken,
      displayName,
      returnSecureToken: false,
    });
  }

  return { uid: result.localId, email: result.email };
}

export async function signInWithEmail(email, password) {
  const result = await requestIdentityToolkit('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });

  return { uid: result.localId, email: result.email };
}
