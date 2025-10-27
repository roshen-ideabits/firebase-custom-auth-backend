import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return null;
  const key = trimmed.slice(0, eqIndex).trim();
  let value = trimmed.slice(eqIndex + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

export function loadEnv(envFile = path.join(ROOT, '.env')) {
  if (!fs.existsSync(envFile)) {
    return;
  }

  const raw = fs.readFileSync(envFile, 'utf8');
  raw.split('\n').forEach((line) => {
    const parsed = parseLine(line);
    if (!parsed) return;
    const { key, value } = parsed;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}
