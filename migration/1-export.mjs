// STEP 1 — EXPORT: dump every Firestore collection to JSON.
//
// Reads: migration/.secrets/firebase-service.json (Firebase Admin SDK key).
// Writes: migration/firestore-export/<collection>.json
//
// Read-only against Firestore. Safe to re-run (overwrites the dumps).
// Run:  node 1-export.mjs

import fs from 'node:fs';
import path from 'node:path';
import { paths, COLLECTIONS, ensureDir } from './config.js';

async function main() {
  if (!fs.existsSync(paths.firebaseKey)) {
    console.error(`\nMissing Firebase Admin key at:\n  ${paths.firebaseKey}\n` +
      'Download it from Firebase Console > Project Settings > Service accounts >\n' +
      '"Generate new private key", and save it there (it is gitignored).\n');
    process.exit(1);
  }

  // firebase-admin is ESM-interop; import the default and destructure.
  const { default: admin } = await import('firebase-admin');
  const serviceAccount = JSON.parse(fs.readFileSync(paths.firebaseKey, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  ensureDir(paths.exportDir);
  const summary = {};

  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).get();
    const docs = snap.docs.map(d => ({ __id: d.id, ...d.data() }));
    const outFile = path.join(paths.exportDir, `${col}.json`);
    // Custom replacer so Firestore Timestamps serialize with _seconds/_nanoseconds
    // (they already do via toJSON, but be explicit for anything exotic).
    fs.writeFileSync(outFile, JSON.stringify(docs, null, 2));
    summary[col] = docs.length;
    console.log(`  exported ${String(docs.length).padStart(5)}  ${col}  -> ${path.relative(paths.root, outFile)}`);
  }

  fs.writeFileSync(
    path.join(paths.exportDir, '_counts.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log('\nExport complete. Doc counts written to firestore-export/_counts.json');
}

main().catch(err => { console.error('EXPORT FAILED:', err); process.exit(1); });
