// Deterministic UUIDv5 so re-running transform+load produces the SAME uuids
// for the same Firestore doc id -> upserts are stable and idempotent.
//
// Uses Node's built-in crypto (no deps). Implements RFC 4122 v5 (SHA-1 based).

import { createHash } from 'node:crypto';

// A fixed namespace for this project (any constant UUID works; keep it stable).
const NAMESPACE = 'a7f3c1d2-4b8e-5f6a-9c0d-1e2f3a4b5c6d';

function hexToBytes(hex) {
  const clean = hex.replace(/-/g, '');
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
  return bytes;
}

function bytesToUuid(bytes) {
  const h = bytes.map(b => b.toString(16).padStart(2, '0'));
  return (
    h[0] + h[1] + h[2] + h[3] + '-' +
    h[4] + h[5] + '-' +
    h[6] + h[7] + '-' +
    h[8] + h[9] + '-' +
    h[10] + h[11] + h[12] + h[13] + h[14] + h[15]
  );
}

// Deterministic UUIDv5(namespace, name). `name` should be unique per entity,
// e.g. `products:<firestoreDocId>`.
export function uuidv5(name) {
  const nsBytes = hexToBytes(NAMESPACE);
  const nameBytes = Buffer.from(String(name), 'utf8');
  const hash = createHash('sha1').update(Buffer.from(nsBytes)).update(nameBytes).digest();
  const bytes = Array.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  return bytesToUuid(bytes);
}

// Convenience: stable uuid for a given collection + firestore doc id.
export function idFor(collection, firestoreId) {
  return uuidv5(`${collection}:${firestoreId}`);
}
