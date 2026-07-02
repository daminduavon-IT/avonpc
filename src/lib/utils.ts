import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely convert a Firestore timestamp-ish value to a JS Date.
 * Handles Firestore Timestamps ({ toDate() } or { seconds }), JS Dates,
 * and unresolved/null server timestamps (returns null).
 */
export function toDateSafe(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    const v = value as { toDate?: () => Date; seconds?: number };
    if (typeof v.toDate === "function") {
      try { return v.toDate(); } catch { return null; }
    }
    if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
  }
  return null;
}
