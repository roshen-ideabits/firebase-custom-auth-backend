# auth-backend

Simple Node backend that proxies Firebase Authentication to issue custom tokens.

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase project values:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (remember to keep escaped new lines `\n` inside quotes)
   - `FIREBASE_WEB_API_KEY`
   - optional `PORT`
2. Run `npm start` to boot the HTTP server (defaults to port 4000).

## API

- `POST /api/auth/register` – body `{ email, password, displayName? }`.
  - creates the Firebase user via the Identity Toolkit API.
  - returns `{ uid, customToken }`.
- `POST /api/auth/login` – body `{ email, password }`.
  - verifies the Firebase credentials via the Identity Toolkit API.
  - returns `{ uid, customToken }`.
- `GET /health` – basic readiness probe.

Responses include a Firebase custom token generated with your service account credentials.
