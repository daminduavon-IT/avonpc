// ============================================================================
// Firebase client — REMOVED after the Supabase migration.
//
// The app now uses src/lib/supabase.ts + supabase-services.ts. This stub remains
// only to make any stray `@/lib/firebase` import fail loudly instead of silently
// initializing a second backend. Firebase the PROJECT stays live in parallel per
// the cutover plan, but the app no longer connects to it.
// ============================================================================

const removed = () => {
  throw new Error(
    '@/lib/firebase has been removed. The app migrated to Supabase — import from ' +
    '@/lib/supabase or @/lib/supabase-services instead.'
  );
};

export const auth = new Proxy({}, { get: removed }) as never;
export const db = new Proxy({}, { get: removed }) as never;
export const storage = new Proxy({}, { get: removed }) as never;
export default new Proxy({}, { get: removed });
