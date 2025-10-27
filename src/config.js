import { loadEnv } from './env.js';

loadEnv();

const required = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_WEB_API_KEY',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

export const config = {
  port: Number(process.env.PORT) || 4000,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: firebasePrivateKey,
    webApiKey: process.env.FIREBASE_WEB_API_KEY,
  },
};
