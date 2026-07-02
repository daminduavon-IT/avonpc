// ============================================================================
// MIGRATED TO SUPABASE.
//
// This module is now a thin re-export of the Supabase implementation so the ~23
// existing `@/lib/firestore-services` import sites keep working unchanged during
// and after the cutover. New code should import from '@/lib/supabase-services'
// directly. The Firebase implementation was removed here; Firebase itself stays
// live in parallel (per the migration plan) but the app no longer reads it.
// ============================================================================

export * from './supabase-services';
