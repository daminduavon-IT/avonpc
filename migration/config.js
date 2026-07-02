// Central config + credential loading for the migration scripts.
//
// SECRETS — these files are gitignored; YOU place them locally, they are never
// committed and never touch the frontend bundle:
//   migration/.secrets/firebase-service.json   (Firebase Admin SDK key)
//   migration/.env                              (Supabase URL + service_role key)
//
// The Supabase SERVICE_ROLE key bypasses RLS by design — it is required for the
// load step and must ONLY ever live here / in your shell, never in src/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const paths = {
  root: __dirname,
  secrets: path.join(__dirname, '.secrets'),
  firebaseKey: path.join(__dirname, '.secrets', 'firebase-service.json'),
  exportDir: path.join(__dirname, 'firestore-export'),   // raw Firestore JSON dumps
  transformDir: path.join(__dirname, 'supabase-rows'),   // transformed relational rows
};

// Collections we export, in a FK-safe load order (parents before children).
export const COLLECTIONS = [
  'brands',
  'categories',
  'industries',
  'products',
  'quotes',
  'inquiries',
  'users',
  'settings',
];

// --- Supabase config (from migration/.env) ---------------------------------
export function loadSupabaseConfig() {
  // Lazy dotenv-free loader so this file has zero deps. Reads migration/.env.
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Create migration/.env with:\n' +
      '  SUPABASE_URL=https://<project-ref>.supabase.co\n' +
      '  SUPABASE_SERVICE_ROLE_KEY=<service_role key from Dashboard > Project Settings > API>\n'
    );
  }
  return { url, serviceRoleKey };
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
