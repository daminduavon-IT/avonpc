// Pure transform helpers shared across scripts. No I/O, easy to unit-test.

// Slugify EXACTLY as the app matches category refs:
//   ProductListing.tsx: p.category.toLowerCase().replace(/\s+/g, '-')
// We must resolve products.category (a NAME) to a category row by comparing
// this slugified name against categories.slug. Keep this identical to the app.
export function slugifyCategoryName(name) {
  return String(name || '').toLowerCase().replace(/\s+/g, '-');
}

// Convert a Firestore Timestamp (or admin export shape) to an ISO string for
// timestamptz. Handles: {_seconds,_nanoseconds}, {seconds,...}, Date, ISO
// string, or null. Returns null when absent (lets Postgres default apply).
export function toIso(ts) {
  if (ts == null) return null;
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (ts instanceof Date) return ts.toISOString();
  const secs = ts._seconds ?? ts.seconds;
  const nanos = ts._nanoseconds ?? ts.nanoseconds ?? 0;
  if (typeof secs === 'number') {
    return new Date(secs * 1000 + Math.floor(nanos / 1e6)).toISOString();
  }
  // Firestore Admin Timestamp instance with toDate()
  if (typeof ts.toDate === 'function') {
    try { return ts.toDate().toISOString(); } catch { return null; }
  }
  return null;
}

// Base-product stockQty is stored as a STRING in Firestore; variants store a
// number. Coerce to integer or null.
export function toInt(v) {
  if (v == null || v === '') return null;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
}

export function toNumeric(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function asArray(v) {
  return Array.isArray(v) ? v : [];
}

// Deterministic empty->null for optional text.
export function orNull(v) {
  return v === undefined || v === '' ? (v === '' ? '' : null) : v;
}
